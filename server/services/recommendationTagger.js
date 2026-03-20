const TAG_RULES = [
  {
    tag: 'career_anxiety',
    keywords: ['事业', '工作', '职业', '职场', '升职', '跳槽', '求职', '创业', '收入', '财运', '发展']
  },
  {
    tag: 'relationship_confusion',
    keywords: ['感情', '恋爱', '婚姻', '关系', '复合', '桃花', '对象', '伴侣', '相处', '结婚', '离婚']
  }
];

function includesKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function deriveRecommendationTags({ question = '', content = '', summary = '' } = {}) {
  const text = `${question}\n${summary}\n${content}`;

  if (!text.trim()) {
    return [];
  }

  return TAG_RULES
    .filter((rule) => includesKeyword(text, rule.keywords))
    .map((rule) => rule.tag);
}
