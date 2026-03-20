import { describe, expect, it } from 'vitest';
import {
  createReportTemplateCatalog,
  getReportTemplate
} from '../../server/services/reportTemplateCatalog.js';

const REPORT_MODES = ['bazi', 'qimen', 'daliuren', 'liuyao', 'ziwei'];

describe('reportTemplateCatalog', () => {
  it('为五种报告模式都提供完整模板', () => {
    const catalog = createReportTemplateCatalog();

    expect(Object.keys(catalog).sort()).toEqual(REPORT_MODES.slice().sort());

    for (const mode of REPORT_MODES) {
      const template = getReportTemplate(mode);

      expect(template).toHaveProperty('model');
      expect(template).toHaveProperty('systemInstruction');
      expect(template).toHaveProperty('generationConfig');
      expect(template.generationConfig).toHaveProperty('temperature');
      expect(template.generationConfig).toHaveProperty('maxOutputTokens');
      expect(template.systemInstruction).toContain('传统文化');
    }
  });

  it('保留 bazi 的原始解读侧重点并复用现有模型选择逻辑', () => {
    const template = getReportTemplate('bazi', {
      geminiReportModel: 'gemini-3.1-pro-preview'
    });

    expect(template.model).toBe('gemini-3.1-pro-preview');
    expect(template.fallbackModels).toEqual(['gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview']);
    expect(template.systemInstruction).toContain('命局结构');
  });

  it('对未知模式抛出明确错误', () => {
    expect(() => getReportTemplate('unknown')).toThrow(
      '[Prompt] 未找到 unknown 对应的报告模板'
    );
  });
});
