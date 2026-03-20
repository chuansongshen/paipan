import { describe, expect, it, vi } from 'vitest';
import { createOrderService } from '../../server/services/orderService.js';

describe('createOrderService', () => {
  it('创建待支付订单并返回 mock 支付参数', async () => {
    const orderRepository = {
      insertOrder: vi.fn().mockResolvedValue(undefined)
    };
    const paymentClient = {
      paymentBackend: 'mock',
      createJsapiOrder: vi.fn().mockResolvedValue({
        paymentBackend: 'mock',
        paymentParams: {
          mockOrderId: 'ord_001'
        }
      })
    };
    const service = createOrderService({
      orderRepository,
      paymentClient,
      reportRepository: {
        findReportById: vi.fn()
      }
    });

    const result = await service.createOrder({
      productType: 'report_unlock',
      currentUserId: 'user_001'
    });

    expect(orderRepository.insertOrder).toHaveBeenCalledTimes(1);
    expect(paymentClient.createJsapiOrder).toHaveBeenCalledWith({
      amountFen: 490,
      description: 'AI 完整报告解锁',
      outTradeNo: expect.stringMatching(/^ord_/),
      payerOpenId: undefined
    });
    expect(result.amountFen).toBe(490);
    expect(result.paymentBackend).toBe('mock');
  });

  it('拒绝为其他用户的报告购买追问包', async () => {
    const service = createOrderService({
      orderRepository: {
        insertOrder: vi.fn(),
        findOrderById: vi.fn()
      },
      paymentClient: {
        paymentBackend: 'mock',
        createJsapiOrder: vi.fn()
      },
      reportRepository: {
        findReportById: vi.fn().mockResolvedValue({
          id: 'rpt_001',
          user_id: 'user_other_001'
        })
      }
    });

    await expect(service.createOrder({
      currentUserId: 'user_001',
      productType: 'follow_up_pack',
      reportId: 'rpt_001'
    })).rejects.toThrow('[Order] 指定的报告不存在，无法购买追问包');
  });

  it('mock 确认追问包支付后发放追问次数', async () => {
    const orderRepository = {
      findOrderById: vi.fn()
        .mockResolvedValueOnce({
          id: 'ord_pack_001',
          user_id: 'user_001',
          order_type: 'follow_up_pack',
          amount_fen: 990,
          payment_channel: 'mock_jsapi',
          payment_status: 'pending',
          entitlement_value: 10,
          target_report_id: 'rpt_001',
          entitlement_status: 'pending',
          paid_at: null
        })
        .mockResolvedValueOnce({
          id: 'ord_pack_001',
          user_id: 'user_001',
          order_type: 'follow_up_pack',
          amount_fen: 990,
          payment_channel: 'mock_jsapi',
          payment_status: 'paid',
          entitlement_value: 10,
          target_report_id: 'rpt_001',
          entitlement_status: 'consumed',
          paid_at: '2026-03-20T12:00:00.000Z'
        }),
      markOrderPaid: vi.fn().mockResolvedValue(undefined),
      markEntitlementConsumed: vi.fn().mockResolvedValue(undefined)
    };
    const reportRepository = {
      findReportById: vi.fn().mockResolvedValue({
        id: 'rpt_001',
        user_id: 'user_001'
      }),
      incrementRemainingCredits: vi.fn().mockResolvedValue({
        id: 'rpt_001',
        remaining_credits: 12
      })
    };
    const service = createOrderService({
      orderRepository,
      paymentClient: {
        paymentBackend: 'mock',
        createJsapiOrder: vi.fn()
      },
      reportRepository
    });

    const result = await service.confirmMockOrder({
      currentUserId: 'user_001',
      orderId: 'ord_pack_001'
    });

    expect(orderRepository.markOrderPaid).toHaveBeenCalledTimes(1);
    expect(reportRepository.findReportById).toHaveBeenCalledWith('rpt_001');
    expect(reportRepository.incrementRemainingCredits).toHaveBeenCalledWith('rpt_001', 10);
    expect(orderRepository.markEntitlementConsumed).toHaveBeenCalledWith('ord_pack_001', {
      reportId: 'rpt_001'
    });
    expect(result.remainingCredits).toBe(12);
    expect(result.paymentStatus).toBe('paid');
  });
});
