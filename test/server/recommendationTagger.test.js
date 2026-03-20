import { describe, expect, it } from 'vitest';
import { deriveRecommendationTags } from '../../server/services/recommendationTagger.js';

describe('deriveRecommendationTags', () => {
  it('识别事业类标签', () => {
    const result = deriveRecommendationTags({
      question: '最近适合换工作和升职吗？'
    });

    expect(result).toEqual(['career_anxiety']);
  });

  it('识别关系类标签并去重', () => {
    const result = deriveRecommendationTags({
      question: '我和对象最近总是争执，感情还有机会修复吗？',
      content: '关系里需要先修复沟通边界。'
    });

    expect(result).toEqual(['relationship_confusion']);
  });
});
