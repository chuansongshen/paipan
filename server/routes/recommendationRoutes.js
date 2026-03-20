function normalizeTags(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function createRecommendationHandler({ recommendationService }) {
  if (!recommendationService) {
    throw new Error('[RecommendationRoute] 缺少 recommendationService 依赖');
  }

  return (request, response) => {
    const tags = normalizeTags(request.query.tags);
    const result = recommendationService.resolveSlots(tags);

    response.status(200).json(result);
  };
}

export function registerRecommendationRoutes(app, services = {}) {
  if (!services.recommendationService) {
    return;
  }

  app.get(
    '/api/recommendations',
    createRecommendationHandler({
      recommendationService: services.recommendationService
    })
  );
}
