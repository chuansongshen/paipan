export const ALLOWED_GEMINI_MODELS = Object.freeze([
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview'
]);

export const PRIMARY_GEMINI_MODEL = ALLOWED_GEMINI_MODELS[0];

function ensureAllowedModel(model) {
  if (!ALLOWED_GEMINI_MODELS.includes(model)) {
    throw new Error(`[ModelPolicy] 不允许使用模型: ${model}`);
  }
}

function normalizeFallbackModels(preferredModel, fallbackModels = []) {
  const uniqueModels = [];

  [preferredModel, ...fallbackModels].forEach((model) => {
    ensureAllowedModel(model);

    if (!uniqueModels.includes(model)) {
      uniqueModels.push(model);
    }
  });

  return uniqueModels.slice(1);
}

export function resolveModelSelection(
  preferredModel = PRIMARY_GEMINI_MODEL,
  fallbackModels = ALLOWED_GEMINI_MODELS.slice(1)
) {
  ensureAllowedModel(preferredModel);

  return {
    model: preferredModel,
    fallbackModels: normalizeFallbackModels(preferredModel, fallbackModels)
  };
}

export function resolveReportModelSelection(env = {}) {
  const preferredModel = env.geminiReportModel || PRIMARY_GEMINI_MODEL;

  return resolveModelSelection(
    preferredModel,
    ALLOWED_GEMINI_MODELS.filter((model) => model !== preferredModel)
  );
}

export function resolveFollowUpModelSelection(env = {}) {
  const preferredModel = env.geminiFollowUpModel || PRIMARY_GEMINI_MODEL;

  return resolveModelSelection(
    preferredModel,
    ALLOWED_GEMINI_MODELS.filter((model) => model !== preferredModel)
  );
}
