// إعدادات ربط Microsoft Graph (Outlook Calendar)
// لازم تسجل تطبيق جديد في Azure Active Directory (Entra ID) وتحط الـ Client ID هنا.
// الخطوات:
// 1. افتح https://entra.microsoft.com -> App registrations -> New registration
// 2. النوع: Single-page application (SPA)
// 3. Redirect URI: ضع رابط موقعك (مثلاً https://your-app.vercel.app)
// 4. من صفحة API permissions أضف Microsoft Graph -> Delegated -> Calendars.Read
// 5. انسخ "Application (client) ID" وحطه تحت في clientId

const MSAL_CONFIG = {
  clientId: "YOUR_AZURE_APP_CLIENT_ID", // استبدل هذا بالـ Client ID الخاص بك
  authority: "https://login.microsoftonline.com/common",
  redirectUri: window.location.origin + window.location.pathname,
};

const GRAPH_SCOPES = ["Calendars.Read"];
