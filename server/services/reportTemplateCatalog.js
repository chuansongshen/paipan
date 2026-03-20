import { resolveReportModelSelection } from './modelPolicy.js';

const BASE_SYSTEM_INSTRUCTION = [
  '你是一名严谨的传统文化命理解读助手。',
  '你的任务是依据提供的排盘数据进行结构化解读。',
  '不要承诺改命、转运、化煞、治病等现实功效。',
  '结论应清晰、具体、避免空泛套话。',
  '输出内容仅供传统文化研究与娱乐参考。'
].join('\n');

export function createReportTemplateCatalog(env = {}) {
  const modelSelection = resolveReportModelSelection(env);

  return {
    bazi: {
      model: modelSelection.model,
      fallbackModels: modelSelection.fallbackModels,
      systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n请重点分析命局结构、大运流年、阶段风险与现实建议。`,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 4096
      }
    }
  };
}

export const REPORT_TEMPLATE_CATALOG = createReportTemplateCatalog();

export function getReportTemplate(mode, env) {
  const template = createReportTemplateCatalog(env)[mode];

  if (!template) {
    throw new Error(`[Prompt] 未找到 ${mode} 对应的报告模板`);
  }

  return template;
}
