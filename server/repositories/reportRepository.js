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
    },

    async findReportById(reportId) {
      const result = await db.query(
        `
          select
            id,
            summary,
            full_report_markdown,
            remaining_credits
          from reports
          where id = $1
          limit 1
        `,
        [reportId]
      );

      return result.rows[0] || null;
    },

    async updateRemainingCredits(reportId, remainingCredits) {
      const result = await db.query(
        `
          update reports
          set remaining_credits = $2
          where id = $1
          returning id, remaining_credits
        `,
        [reportId, remainingCredits]
      );

      return result.rows[0] || null;
    },

    async incrementRemainingCredits(reportId, incrementBy) {
      const result = await db.query(
        `
          update reports
          set remaining_credits = remaining_credits + $2
          where id = $1
          returning id, remaining_credits
        `,
        [reportId, incrementBy]
      );

      return result.rows[0] || null;
    }
  };
}
