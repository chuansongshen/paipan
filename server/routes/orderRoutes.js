import { parseCreateOrderRequest } from '../validators/orderSchemas.js';

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
}
