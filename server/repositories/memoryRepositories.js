function cloneRecord(record) {
  return record ? structuredClone(record) : record;
}

export function createMemoryRepositories({ logger } = {}) {
  const users = new Map();
  const reports = new Map();
  const orders = new Map();
  const followUps = [];

  return {
    userRepository: {
      async insertUser(user) {
        const storedRecord = {
          id: user.id,
          identity_provider: user.identityProvider,
          provider_subject: user.providerSubject || null,
          display_name: user.displayName,
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        };

        users.set(user.id, storedRecord);
        logger?.debug?.({ userId: user.id }, '[MemoryRepository] 已写入用户');

        return cloneRecord(storedRecord);
      },

      async findUserById(userId) {
        return cloneRecord(users.get(userId) || null);
      },

      async findUserByProvider(identityProvider, providerSubject) {
        const matchedUser = [...users.values()].find(
          (user) => (
            user.identity_provider === identityProvider
            && user.provider_subject === providerSubject
          )
        );

        return cloneRecord(matchedUser || null);
      },

      async touchUserLastSeen(userId) {
        const existing = users.get(userId);

        if (!existing) {
          return null;
        }

        existing.last_seen_at = new Date().toISOString();
        users.set(userId, existing);

        return cloneRecord(existing);
      }
    },

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
      },

      async incrementRemainingCredits(reportId, incrementBy) {
        const existing = reports.get(reportId);

        if (!existing) {
          return null;
        }

        existing.remaining_credits += incrementBy;
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
          order_type: order.orderType,
          amount_fen: order.amountFen,
          payment_channel: order.paymentChannel,
          payment_status: order.paymentStatus,
          provider_order_id: order.providerOrderId || null,
          entitlement_value: order.entitlementValue || 0,
          target_report_id: order.targetReportId || null,
          entitlement_status: order.entitlementStatus || 'pending',
          payment_payload: order.paymentPayload || null,
          paid_at: null
        };

        orders.set(order.id, storedRecord);
        logger?.debug?.({ orderId: order.id }, '[MemoryRepository] 已写入订单');

        return cloneRecord(storedRecord);
      },

      async findOrderById(orderId) {
        return cloneRecord(orders.get(orderId) || null);
      },

      async markOrderPaid(orderId, paymentPayload = null) {
        const existing = orders.get(orderId);

        if (!existing) {
          return null;
        }

        existing.payment_status = 'paid';
        existing.payment_payload = paymentPayload || existing.payment_payload;
        existing.paid_at = existing.paid_at || new Date().toISOString();

        if (existing.order_type === 'report_unlock' && existing.entitlement_status === 'pending') {
          existing.entitlement_status = 'available';
        }

        orders.set(orderId, existing);
        return cloneRecord(existing);
      },

      async markEntitlementConsumed(orderId, { reportId } = {}) {
        const existing = orders.get(orderId);

        if (!existing) {
          return null;
        }

        existing.entitlement_status = 'consumed';
        existing.target_report_id = reportId || existing.target_report_id;
        orders.set(orderId, existing);

        return cloneRecord(existing);
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
