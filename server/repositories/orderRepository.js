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
            entitlement_value,
            target_report_id,
            entitlement_status,
            payment_payload
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          returning
            id,
            order_type,
            amount_fen,
            payment_channel,
            payment_status,
            entitlement_value,
            target_report_id,
            entitlement_status
        `,
        [
          order.id,
          order.userId || null,
          order.orderType,
          order.amountFen,
          order.paymentChannel,
          order.paymentStatus,
          order.providerOrderId || null,
          order.entitlementValue || 0,
          order.targetReportId || null,
          order.entitlementStatus || 'pending',
          order.paymentPayload || null
        ]
      );

      return result.rows[0];
    },

    async findOrderById(orderId) {
      const result = await db.query(
        `
          select
            id,
            user_id,
            order_type,
            amount_fen,
            payment_channel,
            payment_status,
            provider_order_id,
            entitlement_value,
            target_report_id,
            entitlement_status,
            payment_payload,
            paid_at
          from orders
          where id = $1
          limit 1
        `,
        [orderId]
      );

      return result.rows[0] || null;
    },

    async markOrderPaid(orderId, paymentPayload = null) {
      const result = await db.query(
        `
          update orders
          set
            payment_status = 'paid',
            entitlement_status = case
              when order_type = 'report_unlock' then 'available'
              else entitlement_status
            end,
            payment_payload = coalesce($2, payment_payload),
            paid_at = coalesce(paid_at, now()),
            updated_at = now()
          where id = $1
          returning
            id,
            order_type,
            amount_fen,
            payment_channel,
            payment_status,
            entitlement_value,
            target_report_id,
            entitlement_status,
            paid_at
        `,
        [orderId, paymentPayload]
      );

      return result.rows[0] || null;
    },

    async markEntitlementConsumed(orderId, { reportId } = {}) {
      const result = await db.query(
        `
          update orders
          set
            entitlement_status = 'consumed',
            target_report_id = coalesce($2, target_report_id),
            updated_at = now()
          where id = $1
          returning
            id,
            order_type,
            amount_fen,
            payment_channel,
            payment_status,
            entitlement_value,
            target_report_id,
            entitlement_status,
            paid_at
        `,
        [orderId, reportId || null]
      );

      return result.rows[0] || null;
    }
  };
}
