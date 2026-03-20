import { parseFollowUpRequest } from '../validators/followUpSchemas.js';

export function createFollowUpHandler({ followUpService }) {
  if (!followUpService) {
    throw new Error('[FollowUpRoute] 缺少 followUpService 依赖');
  }

  return async (request, response, next) => {
    try {
      const input = parseFollowUpRequest(request.body);
      const result = await followUpService.answerQuestion({
        ...input,
        reportId: request.params.reportId
      });

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function registerFollowUpRoutes(app, services = {}) {
  if (!services.followUpService) {
    return;
  }

  app.post(
    '/api/reports/:reportId/follow-up',
    createFollowUpHandler({
      followUpService: services.followUpService
    })
  );
}
