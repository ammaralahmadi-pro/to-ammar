const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100';
const TOKEN_KEY = 'salary_app_token';

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
    const err = new Error(body.error || `request_failed_${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  loginUrl: () => `${API_URL}/auth/google/login`,
  setToken,
  hasToken: () => Boolean(getToken()),
  logout: () => {
    clearToken();
    return request('/auth/logout', { method: 'POST' }).catch(() => {});
  },
  me: () => request('/auth/me'),
  updateSettings: (data) => request('/auth/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  listCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  applyBudgetTemplate: (data) => request('/categories/apply-template', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getSalary: (year, month) => request(`/salary/${year}/${month}`),
  setSalary: (year, month, data) => request(`/salary/${year}/${month}`, { method: 'PUT', body: JSON.stringify(data) }),
  getExtraIncomeSummary: () => request('/salary/summary/extra-income'),

  listExpenses: (year, month, categoryId) =>
    request(`/expenses?year=${year}&month=${month}${categoryId ? `&categoryId=${categoryId}` : ''}`),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  getDashboard: (year, month) => request(`/dashboard/${year}/${month}`),
  getTrend: (months = 6) => request(`/dashboard/trend?months=${months}`),
};
