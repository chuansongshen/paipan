import { parseCreateOrderRequest, parseOrderIdParams } from '../validators/orderSchemas.js';

export function createOrderHandler({ orderService }) {
  if (!orderService) {
    throw new Error('[OrderRoute] 缺少 orderService 依赖');
  }

  return async (request, response, next) => {
    try {
      const input = parseCreateOrderRequest(request.body);
      const result = await orderService.createOrder(input);

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
      const result = await orderService.getOrder(orderId);

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
      const result = await orderService.confirmMockOrder(orderId);

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

  app.post(
    '/api/orders',
    createOrderHandler({
      orderService: services.orderService
    })
  );
  app.get(
    '/api/orders/:orderId',
    createGetOrderHandler({
      orderService: services.orderService
    })
  );
  app.post(
    '/api/orders/:orderId/mock-confirm',
    createMockConfirmOrderHandler({
      orderService: services.orderService
    })
  );
}
