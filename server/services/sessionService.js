import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function base64UrlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signValue(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookieHeader(headerValue = '') {
  return headerValue
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((cookies, segment) => {
      const separatorIndex = segment.indexOf('=');

      if (separatorIndex <= 0) {
        return cookies;
      }

      const key = segment.slice(0, separatorIndex).trim();
      const value = segment.slice(separatorIndex + 1).trim();

      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function serializeCookie({ name, value, secure }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`
  ];

  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function createSessionService({ env, logger }) {
  if (!env?.sessionCookieName) {
    throw new Error('[Session] 缺少 sessionCookieName 配置');
  }

  if (!env?.sessionCookieSecret) {
    throw new Error('[Session] 缺少 sessionCookieSecret 配置');
  }

  function readSessionCookie(headerValue) {
    const cookies = parseCookieHeader(headerValue);
    const rawValue = cookies[env.sessionCookieName];

    if (!rawValue) {
      return null;
    }

    const [encodedPayload, signature] = rawValue.split('.');

    if (!encodedPayload || !signature) {
      logger?.warn?.('[Session] 当前会话 cookie 格式非法');
      return null;
    }

    const expectedSignature = signValue(encodedPayload, env.sessionCookieSecret);

    if (!safeCompare(expectedSignature, signature)) {
      logger?.warn?.('[Session] 当前会话 cookie 验签失败');
      return null;
    }

    try {
      return JSON.parse(base64UrlDecode(encodedPayload));
    } catch (error) {
      logger?.warn?.({ err: error }, '[Session] 解析会话 cookie 失败');
      return null;
    }
  }

  function createSessionCookie({ userId }) {
    const payload = {
      userId,
      issuedAt: new Date().toISOString()
    };
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = signValue(encodedPayload, env.sessionCookieSecret);
    const cookieValue = `${encodedPayload}.${signature}`;

    return {
      cookieValue,
      setCookieHeader: serializeCookie({
        name: env.sessionCookieName,
        value: cookieValue,
        secure: Boolean(env.sessionCookieSecure)
      })
    };
  }

  return {
    readSessionCookie,
    createSessionCookie
  };
}
