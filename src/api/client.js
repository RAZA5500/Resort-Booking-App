const BASE = '/api';

// The access token is held in memory only. The long-lived refresh token lives in
// an httpOnly cookie the JS can never read, which is why a page reload calls
// refresh() instead of reading a token out of localStorage.
let accessToken = null;
let onUnauthenticated = null;

export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const setUnauthenticatedHandler = (fn) => {
  onUnauthenticated = fn;
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

// Concurrent 401s share a single refresh round-trip instead of stampeding.
let refreshing = null;

const refreshSession = async () => {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new ApiError(res.status, 'Session expired');
        const data = await res.json();
        accessToken = data.accessToken;
        return data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

const send = async (path, { method = 'GET', body, signal, headers = {} } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    signal,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || res.statusText, data?.error?.details);
  }
  return data;
};

export const request = async (path, options = {}) => {
  try {
    return await send(path, options);
  } catch (err) {
    // One transparent retry after refreshing an expired access token.
    const isExpired = err instanceof ApiError && err.status === 401 && accessToken;
    if (!isExpired || options._retried) {
      if (err instanceof ApiError && err.status === 401 && accessToken) {
        accessToken = null;
        onUnauthenticated?.();
      }
      throw err;
    }

    try {
      await refreshSession();
    } catch {
      accessToken = null;
      onUnauthenticated?.();
      throw err;
    }
    return send(path, { ...options, _retried: true });
  }
};

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
  refresh: refreshSession,
};

export const qs = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      search.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });
  const str = search.toString();
  return str ? `?${str}` : '';
};
