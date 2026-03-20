/* @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSessionBootstrap } from '../../../src/hooks/useSessionBootstrap.js';

describe('useSessionBootstrap', () => {
  it('开发环境未登录时自动创建访客会话', async () => {
    const getSession = vi.fn()
      .mockResolvedValueOnce({
        authenticated: false,
        user: null
      })
      .mockResolvedValueOnce({
        authenticated: true,
        user: {
          id: 'usr_guest_001',
          identityProvider: 'guest',
          displayName: '访客用户'
        }
      });
    const createDevSession = vi.fn().mockResolvedValue({
      authenticated: true
    });

    const { result } = renderHook(() => useSessionBootstrap({
      envMode: 'development',
      api: {
        getSession,
        createDevSession
      }
    }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(createDevSession).toHaveBeenCalledTimes(1);
    expect(result.current.session.user.id).toBe('usr_guest_001');
    expect(result.current.error).toBe('');
  });
});
