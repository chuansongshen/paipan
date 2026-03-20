import { describe, expect, it, vi } from 'vitest';
import { createOrderService } from '../services/orderService.js';

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
      userId: 'user_001'
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

  it('mock 确认追问包支付后发放追问次数', async () => {
    const orderRepository = {
      findOrderById: vi.fn()
        .mockResolvedValueOnce({
          id: 'ord_pack_001',
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

    const result = await service.confirmMockOrder('ord_pack_001');

    expect(orderRepository.markOrderPaid).toHaveBeenCalledTimes(1);
    expect(reportRepository.incrementRemainingCredits).toHaveBeenCalledWith('rpt_001', 10);
    expect(orderRepository.markEntitlementConsumed).toHaveBeenCalledWith('ord_pack_001', {
      reportId: 'rpt_001'
    });
    expect(result.remainingCredits).toBe(12);
    expect(result.paymentStatus).toBe('paid');
  });
});
