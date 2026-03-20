import { describe, expect, it } from 'vitest';
import { composeReportPrompt } from '../../server/services/promptComposer.js';

describe('composeReportPrompt', () => {
  it('按模板拼装报告 Prompt', () => {
    const result = composeReportPrompt({
      env: {
        genAiBackend: 'vertex'
      },
      mode: 'bazi',
      question: '我想看事业方向',
      payload: {
        summary: {
          core: '甲子 乙丑 丙寅 丁卯，日主 丙'
        },
        promptText: '完整排盘内容'
      }
    });

    expect(result.model).toBe('gemini-3.1-flash-lite-preview');
    expect(result.fallbackModels).toEqual([
      'gemini-3.1-pro-preview',
      'gemini-3-flash-preview'
    ]);
    expect(result.systemInstruction).toContain('传统文化');
    expect(result.prompt).toContain('我想看事业方向');
    expect(result.prompt).toContain('甲子 乙丑 丙寅 丁卯');
    expect(result.prompt).toContain('完整排盘内容');
  });

  it('在 studio 联调时默认切到 flash 模型', () => {
    const result = composeReportPrompt({
      env: {
        genAiBackend: 'studio'
      },
      mode: 'bazi',
      question: '我想看事业方向',
      payload: {
        summary: {
          core: '甲子 乙丑 丙寅 丁卯，日主 丙'
        },
        promptText: '完整排盘内容'
      }
    });

    expect(result.model).toBe('gemini-3.1-flash-lite-preview');
  });

  it('对不完整载荷抛出明确错误', () => {
    expect(() => composeReportPrompt({
      env: {
        genAiBackend: 'vertex'
      },
      mode: 'bazi',
      question: '',
      payload: {
        summary: {
          core: ''
        },
        promptText: ''
      }
    })).toThrow('[Prompt] AI 载荷不完整，无法组装 Prompt');
  });
});
