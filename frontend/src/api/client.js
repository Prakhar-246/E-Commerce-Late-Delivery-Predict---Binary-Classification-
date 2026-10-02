const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://localhost:8000';
  }
  return '';
};

const BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { detail: res.statusText || 'Network response was not ok' };
      }
      throw { status: res.status, ...errorData };
    }

    return await res.json();
  } catch (error) {
    if (error.status) throw error;
    // Network or server unreachable
    throw {
      status: 0,
      detail: 'Prediction service unavailable. Make sure the Python ML backend is running.',
      isNetworkError: true,
    };
  }
}

export const api = {
  checkHealth: () => request('/health'),
  getModelInfo: () => request('/model-info'),
  predict: (data) =>
    request('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.outcome) searchParams.append('outcome', params.outcome);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.offset !== undefined) searchParams.append('offset', params.offset);

    const qs = searchParams.toString();
    return request(`/history${qs ? `?${qs}` : ''}`);
  },
  clearHistory: () =>
    request('/history', {
      method: 'DELETE',
    }),
  getAnalytics: () => request('/analytics'),
};
