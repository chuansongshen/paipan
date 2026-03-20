import { describe, expect, it } from 'vitest';
import { createRecommendationService } from '../services/recommendationService.js';

describe('createRecommendationService', () => {
  it('根据标签返回去重后的咨询位和商品位', () => {
    const service = createRecommendationService({
      catalog: {
        career_anxiety: {
          advisors: [{ id: 'advisor_1' }],
          products: [{ id: 'product_1' }]
        },
        relationship_confusion: {
          advisors: [{ id: 'advisor_2' }],
          products: [{ id: 'product_1' }, { id: 'product_2' }]
        }
      }
    });

    const result = service.resolveSlots(['career_anxiety', 'relationship_confusion']);

    expect(result.advisors).toEqual([{ id: 'advisor_1' }, { id: 'advisor_2' }]);
    expect(result.products).toEqual([{ id: 'product_1' }, { id: 'product_2' }]);
  });
});
