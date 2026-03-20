function cloneRecord(record) {
  return record ? structuredClone(record) : record;
}

export function createMemoryRepositories({ logger } = {}) {
  const reports = new Map();
  const orders = new Map();
  const followUps = [];

  return {
    reportRepository: {
      async insertReport(report) {
        const storedRecord = {
          id: report.id,
          user_id: report.userId || null,
          mode: report.mode,
          question: report.question || '',
          summary: report.summary,
          full_report_markdown: report.fullReportMarkdown,
          model_name: report.modelName,
          remaining_credits: report.remainingCredits,
          usage_metadata: report.usageMetadata || null
        };

        reports.set(report.id, storedRecord);
        logger?.debug?.({ reportId: report.id }, '[MemoryRepository] 已写入报告');

        return {
          id: storedRecord.id,
          summary: storedRecord.summary,
          remaining_credits: storedRecord.remaining_credits
        };
      },

      async findReportById(reportId) {
        return cloneRecord(reports.get(reportId) || null);
      },

      async updateRemainingCredits(reportId, remainingCredits) {
        const existing = reports.get(reportId);

        if (!existing) {
          return null;
        }

        existing.remaining_credits = remainingCredits;
        reports.set(reportId, existing);

        return {
          id: existing.id,
          remaining_credits: existing.remaining_credits
        };
      }
    },

    orderRepository: {
      async insertOrder(order) {
        const storedRecord = {
          id: order.id,
          user_id: order.userId || null,
          product_type: order.productType,
          amount_fen: order.amountFen,
          status: order.status,
          entitlement_count: order.entitlementCount
        };

        orders.set(order.id, storedRecord);
        logger?.debug?.({ orderId: order.id }, '[MemoryRepository] 已写入订单');

        return cloneRecord(storedRecord);
      }
    },

    followUpRepository: {
      async insertFollowUp(record) {
        const storedRecord = {
          id: record.id,
          report_id: record.reportId,
          user_id: record.userId || null,
          user_message: record.userMessage,
          assistant_message: record.assistantMessage,
          remaining_credits_after: record.remainingCreditsAfter
        };

        followUps.push(storedRecord);
        logger?.debug?.({ followUpId: record.id }, '[MemoryRepository] 已写入追问记录');

        return {
          id: storedRecord.id,
          remaining_credits_after: storedRecord.remaining_credits_after
        };
      }
    }
  };
}
