const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();

function buildApiUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

async function parseErrorResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await response.json();

    return payload?.detail || payload?.message || '接口请求失败';
  }

  const text = await response.text();

  return text || '接口请求失败';
}

async function requestJson(path, options = {}) {
  let response;

  try {
    response = await fetch(buildApiUrl(path), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    console.error('[ApiClient] 网络请求失败', {
      path,
      error
    });
    throw new Error('网络请求失败，请确认本地 API 服务已启动');
  }

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createAiReport({ mode, question, payload, unlockOrderId }) {
  return requestJson('/api/report/create', {
    method: 'POST',
    body: JSON.stringify({
      unlockOrderId,
      mode,
      question,
      payload
    })
  });
}

export async function createAiFollowUp({ reportId, message }) {
  return requestJson(`/api/reports/${reportId}/follow-up`, {
    method: 'POST',
    body: JSON.stringify({
      message
    })
  });
}

export async function getRecommendations(tags = []) {
  const normalizedTags = [...new Set(tags.filter(Boolean))];

  if (!normalizedTags.length) {
    return {
      advisors: [],
      products: []
    };
  }

  const searchParams = new URLSearchParams({
    tags: normalizedTags.join(',')
  });

  return requestJson(`/api/recommendations?${searchParams.toString()}`, {
    method: 'GET'
  });
}

export async function createOrder({ productType, reportId }) {
  return requestJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      productType,
      reportId
    })
  });
}

export async function confirmMockOrder(orderId) {
  return requestJson(`/api/orders/${orderId}/mock-confirm`, {
    method: 'POST'
  });
}

export async function getAuthSession() {
  return requestJson('/api/auth/session', {
    method: 'GET'
  });
}

export async function createDevSession() {
  return requestJson('/api/auth/dev-session', {
    method: 'POST'
  });
}
