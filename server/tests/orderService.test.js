import { describe, expect, it, vi } from 'vitest';
import { createOrderService } from '../services/orderService.js';

describe('createOrderService', () => {
  it('创建待支付订单并返回微信调起参数', async () => {
    const orderRepository = {
      insertOrder: vi.fn().mockResolvedValue(undefined)
    };
    const wechatPayClient = {
      createJsapiOrder: vi.fn().mockResolvedValue({
        prepayId: 'wx_prepay_001',
        paymentParams: {
          appId: 'wx_demo',
          timeStamp: '123',
          nonceStr: 'nonce',
          package: 'prepay_id=wx_prepay_001',
          signType: 'RSA',
          paySign: 'signed'
        }
      })
    };
    const service = createOrderService({
      orderRepository,
      wechatPayClient
    });

    const result = await service.createOrder({
      amountFen: 490,
      payerOpenId: 'openid_001',
      productType: 'report_unlock',
      userId: 'user_001'
    });

    expect(orderRepository.insertOrder).toHaveBeenCalledTimes(1);
    expect(wechatPayClient.createJsapiOrder).toHaveBeenCalledWith({
      amountFen: 490,
      description: 'AI完整报告解锁',
      outTradeNo: expect.stringMatching(/^ord_/),
      payerOpenId: 'openid_001'
    });
    expect(result.prepayId).toBe('wx_prepay_001');
    expect(result.paymentParams.paySign).toBe('signed');
  });
});
