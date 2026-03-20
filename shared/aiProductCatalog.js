export const AI_PRODUCT_CATALOG = Object.freeze({
  report_unlock: {
    productType: 'report_unlock',
    title: 'AI 完整报告解锁',
    description: '解锁 1 次完整命理报告生成资格。',
    amountFen: 490,
    priceLabel: '¥4.9',
    entitlementValue: 1
  },
  follow_up_pack: {
    productType: 'follow_up_pack',
    title: 'AI 追问次数包',
    description: '为当前报告补充 10 次追问额度。',
    amountFen: 990,
    priceLabel: '¥9.9',
    entitlementValue: 10
  }
});

export function getAiProductConfig(productType) {
  return AI_PRODUCT_CATALOG[productType] || null;
}

export function listAiProducts() {
  return Object.values(AI_PRODUCT_CATALOG);
}
