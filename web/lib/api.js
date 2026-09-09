const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 401) {
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
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/api/me'),
  listEvents: (start, end) => request(`/api/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
  createEvent: (event) => request('/api/events', { method: 'POST', body: JSON.stringify(event) }),
  updateEvent: (id, event) => request(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(event) }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE' }),
};
