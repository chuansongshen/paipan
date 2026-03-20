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
      model: 'gemini-3.1-flash-lite-preview',
      prompt: 'test prompt',
      systemInstruction: 'test instruction',
      generationConfig: {
        temperature: 0.2
      }
    });

    expect(generateContent).toHaveBeenCalledWith({
      model: 'gemini-3.1-flash-lite-preview',
      contents: 'test prompt',
      config: {
        systemInstruction: 'test instruction',
        temperature: 0.2
      }
    });
    expect(result).toEqual({
      model: 'gemini-3.1-flash-lite-preview',
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
        model: 'gemini-3.1-flash-lite-preview',
        prompt: 'test prompt',
        systemInstruction: 'test instruction'
      })
    ).rejects.toThrow('Gemini 返回空文本');
  });

  it('在开发环境按 AI Studio 配置初始化 SDK', async () => {
    const sdkFactory = vi.fn().mockReturnValue({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: '开发联调结果'
        })
      }
    });
    const client = createVertexAiClient({
      env: {
        genAiBackend: 'studio',
        geminiApiKey: 'studio-key'
      },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      },
      sdkFactory
    });

    await client.generateText({
      model: 'gemini-3.1-flash-lite-preview',
      prompt: 'prompt body',
      systemInstruction: 'system instruction'
    });

    expect(sdkFactory).toHaveBeenCalledWith({
      apiKey: 'studio-key'
    });
  });

  it('在生产环境按 Vertex 配置初始化 SDK', async () => {
    const sdkFactory = vi.fn().mockReturnValue({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: '生产结果'
        })
      }
    });
    const client = createVertexAiClient({
      env: {
        genAiBackend: 'vertex',
        vertexProjectId: 'demo-project',
        vertexLocation: 'asia-east2',
        vertexApiVersion: 'v1'
      },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      },
      sdkFactory
    });

    await client.generateText({
      model: 'gemini-3.1-flash-lite-preview',
      prompt: 'prompt body',
      systemInstruction: 'system instruction'
    });

    expect(sdkFactory).toHaveBeenCalledWith({
      vertexai: true,
      project: 'demo-project',
      location: 'asia-east2',
      apiVersion: 'v1'
    });
  });

  it('在首选模型失败时按优先级回退到后续模型', async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('quota exceeded'), { status: 429 }))
      .mockResolvedValueOnce({
        text: '回退成功'
      });
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
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
      model: 'gemini-3.1-flash-lite-preview',
      fallbackModels: ['gemini-3.1-pro-preview', 'gemini-3-flash-preview'],
      prompt: 'prompt body',
      systemInstruction: 'system instruction'
    });

    expect(generateContent).toHaveBeenNthCalledWith(1, {
      model: 'gemini-3.1-flash-lite-preview',
      contents: 'prompt body',
      config: {
        systemInstruction: 'system instruction'
      }
    });
    expect(generateContent).toHaveBeenNthCalledWith(2, {
      model: 'gemini-3.1-pro-preview',
      contents: 'prompt body',
      config: {
        systemInstruction: 'system instruction'
      }
    });
    expect(result.model).toBe('gemini-3.1-pro-preview');
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});
