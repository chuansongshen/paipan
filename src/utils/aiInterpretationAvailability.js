import { isAiInterpretationSupportedMode } from './fortunePayload.js';

export function buildAiDisabledReason({
  aiPayload,
  appMode,
  panData,
  sessionBootstrap,
  ziweiLoading = false
}) {
  if (sessionBootstrap?.loading) {
    return '正在初始化当前会话，请稍后再试。';
  }

  if (sessionBootstrap?.error) {
    return `当前会话初始化失败：${sessionBootstrap.error}`;
  }

  if (!sessionBootstrap?.session?.authenticated) {
    return '当前会话未登录，请刷新页面后重试。';
  }

  if (!isAiInterpretationSupportedMode(appMode)) {
    return '当前模式暂不支持 AI 解读。';
  }

  if (appMode === 'ziwei' && ziweiLoading) {
    return '紫微斗数排盘加载中，请稍后再试。';
  }

  if (!panData) {
    return '请先完成排盘。';
  }

  if (panData.error) {
    return `排盘失败：${panData.error}`;
  }

  if (!aiPayload) {
    return 'AI 解读载荷构建失败。';
  }

  return '';
}
