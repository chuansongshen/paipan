import { randomUUID } from 'crypto';

const ORDER_PRODUCT_CONFIG = {
  report_unlock: {
    description: 'AI完整报告解锁',
    entitlementValue: 1
  },
  follow_up_pack: {
    description: 'AI追问次数包',
    entitlementValue: 10
  }
};

export function createOrderService({ orderRepository, wechatPayClient }) {
  return {
    async createOrder({ amountFen, payerOpenId, productType, userId }) {
      const productConfig = ORDER_PRODUCT_CONFIG[productType];

      if (!productConfig) {
        throw new Error(`[Order] 不支持的商品类型: ${productType}`);
      }

      const orderId = `ord_${randomUUID().replace(/-/g, '')}`;

      if (orderRepository?.insertOrder) {
        await orderRepository.insertOrder({
          id: orderId,
          userId,
          orderType: productType,
          amountFen,
          paymentChannel: 'wechat_jsapi',
          paymentStatus: 'pending',
          entitlementValue: productConfig.entitlementValue
        });
      }

      const paymentResult = await wechatPayClient.createJsapiOrder({
        amountFen,
        description: productConfig.description,
        outTradeNo: orderId,
        payerOpenId
      });

      return {
        orderId,
        ...paymentResult
      };
    }
  };
}
