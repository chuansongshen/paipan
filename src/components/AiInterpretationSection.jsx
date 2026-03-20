import AiFollowUpPanel from './AiFollowUpPanel.jsx';
import AiReportPanel from './AiReportPanel.jsx';
import ComplianceNotice from './ComplianceNotice.jsx';
import RecommendationPanel from './RecommendationPanel.jsx';

export default function AiInterpretationSection({ disabledReason, flow }) {
  if (!flow || typeof flow !== 'object') {
    console.error('[AiInterpretationSection] 缺少有效的 flow 参数', {
      flow
    });
    return null;
  }

  const enabled = !disabledReason;

  return (
    <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
      <ComplianceNotice />
      <AiReportPanel
        disabledReason={disabledReason}
        enabled={enabled}
        error={flow.reportError}
        loading={flow.reportLoading}
        onQuestionChange={flow.setQuestion}
        onSubmit={flow.submitReport}
        question={flow.question}
        reportUnlockPriceLabel={flow.reportUnlockPriceLabel}
        report={flow.report}
      />
      <AiFollowUpPanel
        error={flow.followUpError}
        followUpPackError={flow.followUpPackError}
        followUpPackLoading={flow.followUpPackLoading}
        followUpPackPriceLabel={flow.followUpPackPriceLabel}
        followUpInput={flow.followUpInput}
        followUps={flow.followUps}
        loading={flow.followUpLoading}
        onChange={flow.setFollowUpInput}
        onPurchasePack={flow.purchaseFollowUpPack}
        onSubmit={flow.submitFollowUp}
        report={flow.report}
      />
      <RecommendationPanel
        loading={flow.recommendationLoading}
        recommendations={flow.recommendations}
      />
    </div>
  );
}
