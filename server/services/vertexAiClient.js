import { GoogleGenAI } from '@google/genai';

function createSdkClient(env) {
  if (!env.vertexProjectId) {
    throw new Error('[VertexAI] 缺少 VERTEX_PROJECT_ID 配置');
  }

  return new GoogleGenAI({
    vertexai: true,
    project: env.vertexProjectId,
    location: env.vertexLocation,
    apiVersion: env.vertexApiVersion
  });
}

export function createVertexAiClient({ ai, env, logger }) {
  const sdkClient = ai || createSdkClient(env);

  return {
    async generateText({ model, prompt, systemInstruction, generationConfig = {} }) {
      try {
        const response = await sdkClient.models.generateContent({
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
            model,
            usageMetadata: response.usageMetadata || null
          },
          '[VertexAI] 文本生成完成'
        );

        return {
          text,
          usageMetadata: response.usageMetadata || null
        };
      } catch (error) {
        logger?.error?.(
          {
            err: error,
            model
          },
          '[VertexAI] 文本生成失败'
        );
        throw error;
      }
    }
  };
}
