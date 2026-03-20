import { parseCreateOrderRequest, parseOrderIdParams } from '../validators/orderSchemas.js';
import { createRequireAuthMiddleware } from '../middleware/requireAuth.js';

export function createOrderHandler({ orderService }) {
  if (!orderService) {
    throw new Error('[OrderRoute] 缺少 orderService 依赖');
  }

  return async (request, response, next) => {
    try {
      const input = parseCreateOrderRequest(request.body);
      const result = await orderService.createOrder({
        ...input,
        currentUserId: request.user?.id,
        payerOpenId: request.user?.providerSubject || undefined
      });

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function createGetOrderHandler({ orderService }) {
  if (!orderService) {
    throw new Error('[OrderRoute] 缺少 orderService 依赖');
  }

  return async (request, response, next) => {
    try {
      const { orderId } = parseOrderIdParams(request.params);
      const result = await orderService.getOrder({
        currentUserId: request.user?.id,
        orderId
      });

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function createMockConfirmOrderHandler({ orderService }) {
  if (!orderService) {
    throw new Error('[OrderRoute] 缺少 orderService 依赖');
  }

  return async (request, response, next) => {
    try {
      const { orderId } = parseOrderIdParams(request.params);
      const result = await orderService.confirmMockOrder({
        currentUserId: request.user?.id,
        orderId
      });

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function registerOrderRoutes(app, services = {}) {
  if (!services.orderService) {
    return;
  }

  const requireAuth = createRequireAuthMiddleware();

  app.post(
    '/api/orders',
    requireAuth,
    createOrderHandler({
      orderService: services.orderService
    })
  );
  app.get(
    '/api/orders/:orderId',
    requireAuth,
    createGetOrderHandler({
      orderService: services.orderService
    })
  );
  app.post(
    '/api/orders/:orderId/mock-confirm',
    requireAuth,
    createMockConfirmOrderHandler({
      orderService: services.orderService
    })
  );
}
