function uniqueById(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function createRecommendationService({ catalog }) {
  return {
    resolveSlots(tags = []) {
      const result = tags.reduce(
        (accumulator, tag) => {
          const matched = catalog[tag];

          if (!matched) {
            return accumulator;
          }

          accumulator.advisors.push(...(matched.advisors || []));
          accumulator.products.push(...(matched.products || []));
          return accumulator;
        },
        {
          advisors: [],
          products: []
        }
      );

      return {
        advisors: uniqueById(result.advisors),
        products: uniqueById(result.products)
      };
    }
  };
}
