import { describe, expect, it } from 'vitest';
import { buildAiDisabledReason } from '../../../src/utils/aiInterpretationAvailability.js';

const authenticatedSession = {
  loading: false,
  error: '',
  session: {
    authenticated: true,
    user: {
      id: 'usr_guest_001'
    }
  }
};

describe('aiInterpretationAvailability', () => {
  it('五种盘型在条件满足时都可启用 AI 解读', () => {
    ['qimen', 'daliuren', 'liuyao', 'bazi', 'ziwei'].forEach((mode) => {
      const reason = buildAiDisabledReason({
        appMode: mode,
        panData: { ok: true },
        aiPayload: { promptText: 'ok' },
        sessionBootstrap: authenticatedSession,
        ziweiLoading: false
      });

      expect(reason).toBe('');
    });
  });

  it('紫微加载中时返回明确禁用原因', () => {
    const reason = buildAiDisabledReason({
      appMode: 'ziwei',
      panData: null,
      aiPayload: null,
      sessionBootstrap: authenticatedSession,
      ziweiLoading: true
    });

    expect(reason).toBe('紫微斗数排盘加载中，请稍后再试。');
  });

  it('未登录时返回统一禁用原因', () => {
    const reason = buildAiDisabledReason({
      appMode: 'qimen',
      panData: { ok: true },
      aiPayload: { promptText: 'ok' },
      sessionBootstrap: {
        loading: false,
        error: '',
        session: {
          authenticated: false,
          user: null
        }
      },
      ziweiLoading: false
    });

    expect(reason).toBe('当前会话未登录，请刷新页面后重试。');
  });
});
