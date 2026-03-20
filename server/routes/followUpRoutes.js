import { parseFollowUpRequest } from '../validators/followUpSchemas.js';
import { createRequireAuthMiddleware } from '../middleware/requireAuth.js';

export function createFollowUpHandler({ followUpService }) {
  if (!followUpService) {
    throw new Error('[FollowUpRoute] 缺少 followUpService 依赖');
  }

  return async (request, response, next) => {
    try {
      const input = parseFollowUpRequest(request.body);
      const result = await followUpService.answerQuestion({
        ...input,
        currentUserId: request.user?.id,
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

  const requireAuth = createRequireAuthMiddleware();

  app.post(
    '/api/reports/:reportId/follow-up',
    requireAuth,
    createFollowUpHandler({
      followUpService: services.followUpService
    })
  );
}
