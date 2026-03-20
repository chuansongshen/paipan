export function createFollowUpRepository(db) {
  return {
    async insertFollowUp(record) {
      const result = await db.query(
        `
          insert into follow_ups (
            id,
            report_id,
            user_id,
            user_message,
            assistant_message,
            remaining_credits_after
          )
          values ($1, $2, $3, $4, $5, $6)
          returning id, remaining_credits_after
        `,
        [
          record.id,
          record.reportId,
          record.userId || null,
          record.userMessage,
          record.assistantMessage,
          record.remainingCreditsAfter
        ]
      );

      return result.rows[0];
    }
  };
}
