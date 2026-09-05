// إعدادات ربط Microsoft Graph (Outlook Calendar)
// لازم تسجل تطبيق جديد في Azure Active Directory (Entra ID) وتحط الـ Client ID هنا.
// الخطوات (للحسابات الشخصية مثل Outlook.com / Hotmail / Live):
// 1. افتح https://entra.microsoft.com -> App registrations -> New registration
// 2. Supported account types: اختر "Personal Microsoft accounts only"
// 3. النوع: Single-page application (SPA)
// 4. Redirect URI: ضع رابط موقعك (مثلاً https://your-app.vercel.app)
// 5. من صفحة API permissions أضف Microsoft Graph -> Delegated -> Calendars.Read
// 6. انسخ "Application (client) ID" وحطه تحت في clientId

const MSAL_CONFIG = {
  clientId: "YOUR_AZURE_APP_CLIENT_ID", // استبدل هذا بالـ Client ID الخاص بك
  authority: "https://login.microsoftonline.com/consumers", // للحسابات الشخصية فقط (Outlook/Hotmail/Live)
  redirectUri: window.location.origin + window.location.pathname,
};

const GRAPH_SCOPES = ["Calendars.Read"];

// إعدادات ربط Google Calendar
// الخطوات:
// 1. افتح https://console.cloud.google.com -> أنشئ مشروع جديد (أو استخدم موجود)
// 2. من "APIs & Services" -> Library فعّل "Google Calendar API"
// 3. من "APIs & Services" -> Credentials -> Create Credentials -> OAuth client ID
// 4. نوع التطبيق: Web application
// 5. أضف "Authorized JavaScript origins" برابط موقعك (مثلاً https://your-app.vercel.app)
//    وأضف أيضًا http://localhost:8080 للتجربة المحلية
// 6. انسخ "Client ID" وحطه تحت في clientId
// 7. من "OAuth consent screen" أضف نطاق (scope) القراءة فقط لـ Calendar (calendar.readonly)

const GOOGLE_CONFIG = {
  clientId: "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com", // استبدل هذا بالـ Client ID الخاص بك
};

const GOOGLE_SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
