import { randomUUID } from 'crypto';
import { getAiProductConfig } from '../../shared/aiProductCatalog.js';
import { createAppError } from '../errors/appError.js';

function normalizeOrderView(order, paymentBackend) {
  if (!order) {
    return null;
  }

  return {
    orderId: order.id,
    orderType: order.order_type,
    amountFen: order.amount_fen,
    paymentStatus: order.payment_status,
    paymentChannel: order.payment_channel,
    paymentBackend,
    entitlementStatus: order.entitlement_status,
    entitlementValue: order.entitlement_value,
    targetReportId: order.target_report_id || null,
    paidAt: order.paid_at || null
  };
}

export function createOrderService({ orderRepository, paymentClient, reportRepository }) {
  if (!orderRepository) {
    throw new Error('[Order] 缺少 orderRepository 依赖');
  }

  if (!paymentClient) {
    throw new Error('[Order] 缺少 paymentClient 依赖');
  }

  return {
    async createOrder({ payerOpenId, productType, reportId, userId }) {
      const productConfig = getAiProductConfig(productType);

      if (!productConfig) {
        throw createAppError(`[Order] 不支持的商品类型: ${productType}`, {
          code: 'UNSUPPORTED_PRODUCT',
          statusCode: 400
        });
      }

      if (productType === 'follow_up_pack' && !reportId) {
        throw createAppError('[Order] 购买追问包时必须指定 reportId', {
          code: 'REPORT_ID_REQUIRED',
          statusCode: 400
        });
      }

      if (paymentClient.paymentBackend === 'wechat' && !payerOpenId) {
        throw createAppError('[Order] 微信支付场景必须提供 payerOpenId', {
          code: 'PAYER_OPEN_ID_REQUIRED',
          statusCode: 400
        });
      }

      if (productType === 'follow_up_pack' && reportRepository?.findReportById) {
        const report = await reportRepository.findReportById(reportId);

        if (!report) {
          throw createAppError('[Order] 指定的报告不存在，无法购买追问包', {
            code: 'REPORT_NOT_FOUND',
            statusCode: 404
          });
        }
      }

      const orderId = `ord_${randomUUID().replace(/-/g, '')}`;

      await orderRepository.insertOrder({
        id: orderId,
        userId,
        orderType: productType,
        amountFen: productConfig.amountFen,
        paymentChannel: paymentClient.paymentBackend === 'mock' ? 'mock_jsapi' : 'wechat_jsapi',
        paymentStatus: 'pending',
        entitlementValue: productConfig.entitlementValue,
        targetReportId: reportId || null,
        entitlementStatus: 'pending'
      });

      const paymentResult = await paymentClient.createJsapiOrder({
        amountFen: productConfig.amountFen,
        description: productConfig.title,
        outTradeNo: orderId,
        payerOpenId
      });

      return {
        orderId,
        productType,
        amountFen: productConfig.amountFen,
        paymentStatus: 'pending',
        ...paymentResult
      };
    },

    async getOrder(orderId) {
      const order = await orderRepository.findOrderById(orderId);

      if (!order) {
        throw createAppError('[Order] 订单不存在', {
          code: 'ORDER_NOT_FOUND',
          statusCode: 404
        });
      }

      return normalizeOrderView(order, paymentClient.paymentBackend);
    },

    async confirmMockOrder(orderId) {
      if (paymentClient.paymentBackend !== 'mock') {
        throw createAppError('[Order] 当前支付后端不支持 mock 确认', {
          code: 'MOCK_PAYMENT_DISABLED',
          statusCode: 400
        });
      }

      const existing = await orderRepository.findOrderById(orderId);

      if (!existing) {
        throw createAppError('[Order] 订单不存在', {
          code: 'ORDER_NOT_FOUND',
          statusCode: 404
        });
      }

      if (existing.payment_status !== 'paid') {
        await orderRepository.markOrderPaid(orderId, {
          backend: 'mock',
          confirmedAt: new Date().toISOString()
        });
      }

      if (
        existing.order_type === 'follow_up_pack'
        && existing.entitlement_status !== 'consumed'
        && existing.target_report_id
      ) {
        const updatedReport = await reportRepository.incrementRemainingCredits(
          existing.target_report_id,
          existing.entitlement_value
        );

        await orderRepository.markEntitlementConsumed(orderId, {
          reportId: existing.target_report_id
        });

        return {
          ...normalizeOrderView(
            await orderRepository.findOrderById(orderId),
            paymentClient.paymentBackend
          ),
          remainingCredits: updatedReport?.remaining_credits ?? null
        };
      }

      return normalizeOrderView(
        await orderRepository.findOrderById(orderId),
        paymentClient.paymentBackend
      );
    },

    async assertReportUnlockAvailable(orderId) {
      const order = await orderRepository.findOrderById(orderId);

      if (!order) {
        throw createAppError('[Order] 解锁订单不存在', {
          code: 'ORDER_NOT_FOUND',
          statusCode: 404
        });
      }

      if (order.order_type !== 'report_unlock') {
        throw createAppError('[Order] 当前订单不是报告解锁订单', {
          code: 'INVALID_UNLOCK_ORDER',
          statusCode: 400
        });
      }

      if (order.payment_status !== 'paid') {
        throw createAppError('[Order] 当前订单尚未支付完成', {
          code: 'ORDER_NOT_PAID',
          statusCode: 409
        });
      }

      if (order.entitlement_status === 'consumed') {
        throw createAppError('[Order] 当前解锁资格已被使用', {
          code: 'ORDER_ALREADY_CONSUMED',
          statusCode: 409
        });
      }

      return order;
    },

    async consumeReportUnlock({ orderId, reportId }) {
      const order = await this.assertReportUnlockAvailable(orderId);
      const consumedOrder = await orderRepository.markEntitlementConsumed(order.id, {
        reportId
      });

      return normalizeOrderView(consumedOrder, paymentClient.paymentBackend);
    }
  };
}
