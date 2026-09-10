const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'family_calendar_token';

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* لو المتصفح يحجب localStorage، الجلسة ما راح تُحفظ بين الزيارات */
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 401) {
    clearToken();
    const err = new Error('not_authenticated');
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `request_failed_${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  loginUrl: () => `${API_URL}/auth/google/login`,
  setToken,
  getToken,
  hasToken: () => Boolean(getToken()),
  logout: () => clearToken(),
  me: () => request('/api/me'),
  listEvents: (start, end) => request(`/api/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
  createEvent: (event) => request('/api/events', { method: 'POST', body: JSON.stringify(event) }),
  updateEvent: (id, event) => request(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(event) }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE' }),
};
