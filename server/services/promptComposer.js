import { getReportTemplate } from './reportTemplateCatalog.js';

export function composeReportPrompt({ env, mode, question, payload }) {
  if (!payload?.summary?.core || !payload?.promptText) {
    throw new Error('[Prompt] AI 载荷不完整，无法组装 Prompt');
  }

  const template = getReportTemplate(mode, env);
  const normalizedQuestion = question?.trim() || '用户未提供具体问题，请先做整体分析，再补充重点提醒。';

  const prompt = [
    `术数类型：${mode}`,
    `用户问题：${normalizedQuestion}`,
    `排盘摘要：${payload.summary.core}`,
    '',
    '以下是排盘展开文本：',
    payload.promptText
  ].join('\n');

  return {
    model: template.model,
    fallbackModels: template.fallbackModels || [],
    systemInstruction: template.systemInstruction,
    generationConfig: template.generationConfig,
    prompt
  };
}
