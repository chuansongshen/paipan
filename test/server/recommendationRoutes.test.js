import { describe, expect, it } from 'vitest';
import { createRecommendationHandler } from '../../server/routes/recommendationRoutes.js';

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

describe('createRecommendationHandler', () => {
  it('读取标签并返回推荐结果', () => {
    const response = createMockResponse();
    const handler = createRecommendationHandler({
      recommendationService: {
        resolveSlots(tags) {
          return {
            advisors: tags.map((tag) => ({ id: `advisor_${tag}` })),
            products: tags.map((tag) => ({ id: `product_${tag}` }))
          };
        }
      }
    });

    handler(
      {
        query: {
          tags: 'career_anxiety,relationship_confusion'
        }
      },
      response
    );

    expect(response.statusCode).toBe(200);
    expect(response.payload.advisors).toEqual([
      { id: 'advisor_career_anxiety' },
      { id: 'advisor_relationship_confusion' }
    ]);
    expect(response.payload.products).toEqual([
      { id: 'product_career_anxiety' },
      { id: 'product_relationship_confusion' }
    ]);
  });
});
