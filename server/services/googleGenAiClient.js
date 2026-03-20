import { GoogleGenAI } from '@google/genai';
import { resolveModelSelection } from './modelPolicy.js';

function buildSdkConfig(env) {
  if (env.genAiBackend === 'studio') {
    if (!env.geminiApiKey) {
      throw new Error('[GoogleGenAI] GENAI_BACKEND=studio 时缺少 GEMINI_API_KEY 配置');
    }

    return {
      backend: 'studio',
      config: {
        apiKey: env.geminiApiKey
      }
    };
  }

  if (!env.vertexProjectId) {
    throw new Error('[GoogleGenAI] GENAI_BACKEND=vertex 时缺少 VERTEX_PROJECT_ID 配置');
  }

  return {
    backend: 'vertex',
    config: {
      vertexai: true,
      project: env.vertexProjectId,
      location: env.vertexLocation,
      apiVersion: env.vertexApiVersion
    }
  };
}

export function createGoogleGenAiClient({
  ai,
  env,
  logger,
  sdkFactory = (config) => new GoogleGenAI(config)
}) {
  let sdkClient = ai || null;
  let backend = ai ? 'injected' : null;

  function getSdkClient() {
    if (sdkClient) {
      return sdkClient;
    }

    const resolved = buildSdkConfig(env);

    backend = resolved.backend;
    sdkClient = sdkFactory(resolved.config);

    logger?.info?.(
      {
        backend
      },
      '[GoogleGenAI] 已完成 SDK 初始化'
    );

    return sdkClient;
  }

  function shouldFallback(error) {
    const status = Number(error?.status || error?.code);
    const message = String(error?.message || '');

    if ([404, 408, 409, 429, 500, 502, 503, 504].includes(status)) {
      return true;
    }

    return (
      message.includes('RESOURCE_EXHAUSTED') ||
      message.includes('quota') ||
      message.includes('retry') ||
      message.includes('temporarily unavailable') ||
      message.includes('not found')
    );
  }

  return {
    async generateText({
      fallbackModels = [],
      model,
      prompt,
      systemInstruction,
      generationConfig = {}
    }) {
      const client = getSdkClient();
      const modelSelection = resolveModelSelection(model, fallbackModels);
      const candidateModels = [modelSelection.model, ...modelSelection.fallbackModels];
      let lastError = null;

      for (const [index, candidateModel] of candidateModels.entries()) {
        try {
          const response = await client.models.generateContent({
            model: candidateModel,
            contents: prompt,
            config: {
              systemInstruction,
              ...generationConfig
            }
          });
          const text = response.text?.trim();

          if (!text) {
            throw new Error('Gemini 返回空文本');
          }

          logger?.info?.(
            {
              backend,
              model: candidateModel,
              usageMetadata: response.usageMetadata || null,
              attempt: index + 1
            },
            '[GoogleGenAI] 文本生成完成'
          );

          return {
            text,
            model: candidateModel,
            usageMetadata: response.usageMetadata || null
          };
        } catch (error) {
          lastError = error;

          if (index === candidateModels.length - 1 || !shouldFallback(error)) {
            logger?.error?.(
              {
                err: error,
                backend,
                model: candidateModel
              },
              '[GoogleGenAI] 文本生成失败'
            );
            throw error;
          }

          logger?.warn?.(
            {
              err: error,
              backend,
              failedModel: candidateModel,
              nextModel: candidateModels[index + 1]
            },
            '[GoogleGenAI] 当前模型不可用，准备回退'
          );
        }
      }

      throw lastError || new Error('[GoogleGenAI] 所有候选模型均不可用');
    }
  };
}
