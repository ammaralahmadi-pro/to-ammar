// ربط Microsoft Graph API لجلب مواعيد Outlook (قراءة فقط)

const CalendarService = (() => {
  let msalInstance = null;
  let account = null;

  function isConfigured() {
    return MSAL_CONFIG.clientId && MSAL_CONFIG.clientId !== "YOUR_AZURE_APP_CLIENT_ID";
  }

  async function init() {
    if (!isConfigured()) return false;
    msalInstance = new msal.PublicClientApplication({
      auth: {
        clientId: MSAL_CONFIG.clientId,
        authority: MSAL_CONFIG.authority,
        redirectUri: MSAL_CONFIG.redirectUri,
      },
      cache: { cacheLocation: "localStorage" },
    });
    await msalInstance.initialize();

    const response = await msalInstance.handleRedirectPromise().catch(() => null);
    if (response && response.account) {
      account = response.account;
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) account = accounts[0];
    }
    return true;
  }

  function isSignedIn() {
    return !!account;
  }

  async function signIn() {
    if (!msalInstance) return;
    await msalInstance.loginRedirect({ scopes: GRAPH_SCOPES });
  }

  async function signOut() {
    if (!msalInstance || !account) return;
    await msalInstance.logoutRedirect({ account });
  }

  async function getAccessToken() {
    if (!msalInstance || !account) throw new Error("not signed in");
    try {
      const result = await msalInstance.acquireTokenSilent({
        scopes: GRAPH_SCOPES,
        account,
      });
      return result.accessToken;
    } catch (e) {
      const result = await msalInstance.acquireTokenPopup({ scopes: GRAPH_SCOPES });
      return result.accessToken;
    }
  }

  async function getTodayEvents() {
    const token = await getAccessToken();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const params = new URLSearchParams({
      startDateTime: startOfDay.toISOString(),
      endDateTime: endOfDay.toISOString(),
      $orderby: "start/dateTime",
      $top: "50",
    });

    const url = `https://graph.microsoft.com/v1.0/me/calendarView?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: `outlook.timezone="${Intl.DateTimeFormat().resolvedOptions().timeZone}"`,
      },
    });

    if (!res.ok) {
      throw new Error(`Graph API error: ${res.status}`);
    }

    const data = await res.json();
    return (data.value || []).map((ev) => ({
      id: ev.id,
      title: ev.subject || "(بدون عنوان)",
      start: ev.start && ev.start.dateTime,
      end: ev.end && ev.end.dateTime,
      isAllDay: ev.isAllDay,
      location: ev.location && ev.location.displayName,
    }));
  }

  return { init, isConfigured, isSignedIn, signIn, signOut, getTodayEvents };
})();
