import { GoogleGenAI } from '@google/genai';

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

  return {
    async generateText({ model, prompt, systemInstruction, generationConfig = {} }) {
      try {
        const client = getSdkClient();
        const response = await client.models.generateContent({
          model,
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
            model,
            usageMetadata: response.usageMetadata || null
          },
          '[GoogleGenAI] 文本生成完成'
        );

        return {
          text,
          usageMetadata: response.usageMetadata || null
        };
      } catch (error) {
        logger?.error?.(
          {
            err: error,
            backend,
            model
          },
          '[GoogleGenAI] 文本生成失败'
        );
        throw error;
      }
    }
  };
}
