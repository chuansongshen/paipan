import { describe, expect, it, vi } from 'vitest';
import { createVertexAiClient } from '../services/vertexAiClient.js';

describe('createVertexAiClient', () => {
  it('归一化 Gemini 文本结果和使用量信息', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: '  报告正文  ',
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 200
      }
    });
    const logger = {
      info: vi.fn(),
      error: vi.fn()
    };
    const client = createVertexAiClient({
      ai: {
        models: {
          generateContent
        }
      },
      logger
    });

    const result = await client.generateText({
      model: 'gemini-2.5-pro',
      prompt: 'test prompt',
      systemInstruction: 'test instruction',
      generationConfig: {
        temperature: 0.2
      }
    });

    expect(generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-pro',
      contents: 'test prompt',
      config: {
        systemInstruction: 'test instruction',
        temperature: 0.2
      }
    });
    expect(result).toEqual({
      text: '报告正文',
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 200
      }
    });
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('对空文本结果抛出明确错误', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: '   '
    });

    const client = createVertexAiClient({
      ai: {
        models: {
          generateContent
        }
      },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    });

    await expect(
      client.generateText({
        model: 'gemini-2.5-pro',
        prompt: 'test prompt',
        systemInstruction: 'test instruction'
      })
    ).rejects.toThrow('Gemini 返回空文本');
  });
});
