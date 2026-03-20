export function createReportRepository(db) {
  return {
    async insertReport(report) {
      const result = await db.query(
        `
          insert into reports (
            id,
            user_id,
            mode,
            question,
            summary,
            full_report_markdown,
            model_name,
            remaining_credits,
            usage_metadata
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          returning id, summary, remaining_credits
        `,
        [
          report.id,
          report.userId || null,
          report.mode,
          report.question || '',
          report.summary,
          report.fullReportMarkdown,
          report.modelName,
          report.remainingCredits,
          report.usageMetadata || null
        ]
      );

      return result.rows[0];
    }
  };
}
