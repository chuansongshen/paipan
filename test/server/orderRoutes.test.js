import { describe, expect, it, vi } from 'vitest';
import {
  createGetOrderHandler,
  createMockConfirmOrderHandler,
  createOrderHandler
} from '../../server/routes/orderRoutes.js';

function createMockResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

describe('createOrderHandler', () => {
  it('校验入参并返回订单结果', async () => {
    const orderService = {
      createOrder: vi.fn().mockResolvedValue({
        orderId: 'ord_001',
        prepayId: 'wx_prepay_001',
        paymentParams: {
          appId: 'wx_demo'
        }
      })
    };
    const next = vi.fn();
    const response = createMockResponse();
    const handler = createOrderHandler({ orderService });

    await handler(
      {
        user: {
          id: 'user_001',
          providerSubject: 'openid_001'
        },
        body: {
          productType: 'report_unlock'
        }
      },
      response,
      next
    );

    expect(orderService.createOrder).toHaveBeenCalledWith({
      productType: 'report_unlock',
      currentUserId: 'user_001',
      payerOpenId: 'openid_001'
    });
    expect(response.statusCode).toBe(200);
    expect(response.payload.orderId).toBe('ord_001');
    expect(next).not.toHaveBeenCalled();
  });

  it('在参数错误时交给错误处理中间件', async () => {
    const handler = createOrderHandler({
      orderService: {
        createOrder: vi.fn()
      }
    });
    const next = vi.fn();

    await handler(
      {
        body: {
          productType: 'unknown_product'
        }
      },
      createMockResponse(),
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('读取订单详情时透传当前用户', async () => {
    const response = createMockResponse();
    const next = vi.fn();
    const orderService = {
      getOrder: vi.fn().mockResolvedValue({
        orderId: 'ord_001',
        paymentStatus: 'paid'
      })
    };
    const handler = createGetOrderHandler({
      orderService
    });

    await handler(
      {
        user: {
          id: 'user_001'
        },
        params: {
          orderId: 'ord_001'
        }
      },
      response,
      next
    );

    expect(orderService.getOrder).toHaveBeenCalledWith({
      currentUserId: 'user_001',
      orderId: 'ord_001'
    });
    expect(response.payload.orderId).toBe('ord_001');
    expect(next).not.toHaveBeenCalled();
  });

  it('执行 mock 支付确认', async () => {
    const response = createMockResponse();
    const next = vi.fn();
    const orderService = {
      confirmMockOrder: vi.fn().mockResolvedValue({
        orderId: 'ord_001',
        paymentStatus: 'paid'
      })
    };
    const handler = createMockConfirmOrderHandler({
      orderService
    });

    await handler(
      {
        user: {
          id: 'user_001'
        },
        params: {
          orderId: 'ord_001'
        }
      },
      response,
      next
    );

    expect(orderService.confirmMockOrder).toHaveBeenCalledWith({
      currentUserId: 'user_001',
      orderId: 'ord_001'
    });
    expect(response.payload.paymentStatus).toBe('paid');
    expect(next).not.toHaveBeenCalled();
  });
});
