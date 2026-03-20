import { useEffect, useState } from 'react';
import { createDevSession, getAuthSession } from '../services/apiClient';

function resolveEnvMode() {
  return import.meta.env.PROD ? 'production' : 'development';
}

export function useSessionBootstrap(options = {}) {
  const envMode = options.envMode || resolveEnvMode();
  const getSession = options.api?.getSession || getAuthSession;
  const createDevGuestSession = options.api?.createDevSession || createDevSession;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState({
    authenticated: false,
    user: null
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      setLoading(true);
      setError('');

      try {
        let nextSession = await getSession();

        if (!nextSession?.authenticated && envMode === 'development') {
          await createDevGuestSession();
          nextSession = await getSession();
        }

        if (!cancelled) {
          setSession(nextSession || {
            authenticated: false,
            user: null
          });
        }
      } catch (nextError) {
        console.error('[SessionBootstrap] 初始化当前会话失败', nextError);

        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : '当前会话初始化失败');
          setSession({
            authenticated: false,
            user: null
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [createDevGuestSession, envMode, getSession]);

  return {
    loading,
    error,
    session
  };
}
