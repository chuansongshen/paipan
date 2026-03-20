import { useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import {
  createAiFollowUp,
  createAiReport,
  getRecommendations
} from '../services/apiClient';

const EMPTY_RECOMMENDATIONS = Object.freeze({
  advisors: [],
  products: []
});

function mergeTags(...tagLists) {
  return [...new Set(tagLists.flat().filter(Boolean))];
}

function buildPayloadKey(mode, payload) {
  return [
    mode,
    payload?.summary?.core,
    payload?.meta?.solarDate,
    payload?.meta?.lunarDate
  ]
    .filter(Boolean)
    .join('|');
}

export function useAiReportFlow({ enabled, mode, payload }) {
  const [question, setQuestion] = useState('');
  const [report, setReport] = useState(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUps, setFollowUps] = useState([]);
  const [recommendations, setRecommendations] = useState(EMPTY_RECOMMENDATIONS);
  const [reportLoading, setReportLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [followUpError, setFollowUpError] = useState('');

  const payloadKey = useMemo(() => buildPayloadKey(mode, payload), [mode, payload]);

  useEffect(() => {
    setQuestion('');
    setReport(null);
    setFollowUpInput('');
    setFollowUps([]);
    setRecommendations(EMPTY_RECOMMENDATIONS);
    setReportError('');
    setFollowUpError('');
  }, [enabled, payloadKey]);

  async function refreshRecommendations(tags) {
    const normalizedTags = mergeTags(tags);

    if (!normalizedTags.length) {
      setRecommendations(EMPTY_RECOMMENDATIONS);
      return normalizedTags;
    }

    setRecommendationLoading(true);

    try {
      const slots = await getRecommendations(normalizedTags);

      setRecommendations(slots);
      return normalizedTags;
    } catch (error) {
      console.error('[AiReportFlow] 拉取推荐位失败', error);
      message.warning(error instanceof Error ? error.message : '推荐位加载失败');
      setRecommendations(EMPTY_RECOMMENDATIONS);
      return normalizedTags;
    } finally {
      setRecommendationLoading(false);
    }
  }

  async function submitReport() {
    if (!enabled || !payload) {
      const nextError = '当前排盘暂不支持 AI 解读，请先切换到可用模式。';

      setReportError(nextError);
      message.warning(nextError);
      return;
    }

    setReportLoading(true);
    setReportError('');
    setFollowUpError('');

    try {
      const result = await createAiReport({
        mode,
        question,
        payload
      });
      const recommendationTags = mergeTags(result.recommendationTags || []);

      setReport({
        ...result,
        recommendationTags
      });
      setFollowUps([]);
      await refreshRecommendations(recommendationTags);
      message.success('AI 解读已生成');
    } catch (error) {
      const nextError = error instanceof Error ? error.message : 'AI 解读生成失败';

      console.error('[AiReportFlow] 生成报告失败', error);
      setReportError(nextError);
      message.error(nextError);
    } finally {
      setReportLoading(false);
    }
  }

  async function submitFollowUp() {
    if (!report?.reportId) {
      const nextError = '请先生成完整报告，再继续追问。';

      setFollowUpError(nextError);
      message.warning(nextError);
      return;
    }

    if (!followUpInput.trim()) {
      const nextError = '请输入追问内容。';

      setFollowUpError(nextError);
      message.warning(nextError);
      return;
    }

    setFollowUpLoading(true);
    setFollowUpError('');

    try {
      const result = await createAiFollowUp({
        reportId: report.reportId,
        message: followUpInput.trim()
      });
      const recommendationTags = mergeTags(
        report.recommendationTags || [],
        result.recommendationTags || []
      );

      setFollowUps((current) => [
        ...current,
        {
          id: `fu_local_${Date.now()}`,
          question: followUpInput.trim(),
          answer: result.answer
        }
      ]);
      setReport((current) => ({
        ...current,
        remainingCredits: result.remainingCredits,
        recommendationTags
      }));
      setFollowUpInput('');
      await refreshRecommendations(recommendationTags);
      message.success('追问回答已生成');
    } catch (error) {
      const nextError = error instanceof Error ? error.message : '追问失败';

      console.error('[AiReportFlow] 生成追问失败', error);
      setFollowUpError(nextError);
      message.error(nextError);
    } finally {
      setFollowUpLoading(false);
    }
  }

  return {
    question,
    setQuestion,
    report,
    followUps,
    followUpInput,
    setFollowUpInput,
    recommendations,
    reportLoading,
    followUpLoading,
    recommendationLoading,
    reportError,
    followUpError,
    submitReport,
    submitFollowUp
  };
}
