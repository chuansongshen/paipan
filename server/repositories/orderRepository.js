export function createOrderRepository(db) {
  return {
    async insertOrder(order) {
      const result = await db.query(
        `
          insert into orders (
            id,
            user_id,
            order_type,
            amount_fen,
            payment_channel,
            payment_status,
            provider_order_id,
            entitlement_value
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
          returning id, payment_status, entitlement_value
        `,
        [
          order.id,
          order.userId || null,
          order.orderType,
          order.amountFen,
          order.paymentChannel,
          order.paymentStatus,
          order.providerOrderId || null,
          order.entitlementValue || 0
        ]
      );

      return result.rows[0];
    }
  };
}
