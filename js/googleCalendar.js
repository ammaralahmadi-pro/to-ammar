// ربط Google Calendar API لجلب مواعيد اليوم (قراءة فقط)

const GoogleCalendarService = (() => {
  const TOKEN_STORAGE_KEY = "yawmi.google.accessToken";
  const TOKEN_EXPIRY_KEY = "yawmi.google.tokenExpiry";

  let tokenClient = null;

  function isConfigured() {
    return (
      GOOGLE_CONFIG.clientId &&
      GOOGLE_CONFIG.clientId !== "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com"
    );
  }

  function getStoredToken() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0);
    if (token && Date.now() < expiry) return token;
    return null;
  }

  function storeToken(token, expiresInSeconds) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1000 - 60000));
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  function init() {
    if (!isConfigured()) return false;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.clientId,
      scope: GOOGLE_SCOPES,
      callback: () => {}, // يُستبدل عند كل طلب في requestToken
    });
    return true;
  }

  function isSignedIn() {
    return !!getStoredToken();
  }

  function requestToken({ prompt } = {}) {
    return new Promise((resolve, reject) => {
      if (!tokenClient) return reject(new Error("google token client not initialized"));
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        storeToken(response.access_token, response.expires_in);
        resolve(response.access_token);
      };
      tokenClient.requestAccessToken({ prompt: prompt || "" });
    });
  }

  async function signIn() {
    await requestToken({ prompt: "consent" });
  }

  function signOut() {
    const token = getStoredToken();
    clearToken();
    if (token && window.google && google.accounts && google.accounts.oauth2) {
      google.accounts.oauth2.revoke(token, () => {});
    }
  }

  async function getAccessToken() {
    const existing = getStoredToken();
    if (existing) return existing;
    return requestToken({ prompt: "" });
  }

  async function getTodayEvents() {
    const token = await getAccessToken();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const params = new URLSearchParams({
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      clearToken();
      throw new Error("Google Calendar API unauthorized");
    }
    if (!res.ok) {
      throw new Error(`Google Calendar API error: ${res.status}`);
    }

    const data = await res.json();
    return (data.items || []).map((ev) => ({
      id: ev.id,
      title: ev.summary || "(بدون عنوان)",
      start: ev.start && (ev.start.dateTime || ev.start.date),
      end: ev.end && (ev.end.dateTime || ev.end.date),
      isAllDay: !!(ev.start && ev.start.date && !ev.start.dateTime),
      location: ev.location,
      source: "google",
    }));
  }

  return { init, isConfigured, isSignedIn, signIn, signOut, getTodayEvents };
})();
