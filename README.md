# يومي — مهامك ومواعيدك في مكان واحد

تطبيق ويب بسيط يجمع بين:
- **قائمة مهام يومية** (إضافة، تعديل، حذف، تحديد كمكتملة) — تُخزَّن محليًا في المتصفح.
- **مواعيد Outlook Calendar** — تُجلب تلقائيًا (قراءة فقط) عبر Microsoft Graph API.

## التشغيل محليًا

الموقع ثابت (Static Site) بدون خطوة بناء. يكفي تشغيله عبر أي خادم ثابت، مثلًا:

```bash
npx serve .
# أو
python3 -m http.server 8080
```

ثم افتح `http://localhost:8080`.

## إعداد ربط Outlook (Microsoft Graph)

المصادقة تتم بالكامل من المتصفح (SPA + PKCE) بدون أي سيرفر خلفي أو أسرار.

> هذا المشروع مُعد للعمل مع حساب Microsoft **شخصي** (Outlook.com / Hotmail / Live) — بدون حاجة لحساب عمل أو مؤسسة.

1. اذهب إلى [Microsoft Entra admin center](https://entra.microsoft.com) → **App registrations** → **New registration**.
2. في **Supported account types** اختر: **Personal Microsoft accounts only**.
3. اختر نوع التطبيق: **Single-page application (SPA)**.
4. أضف **Redirect URI** برابط موقعك بعد النشر (مثلاً `https://your-app.vercel.app`)، وأضف أيضًا `http://localhost:8080` للتجربة المحلية.
5. من **API permissions** أضف **Microsoft Graph → Delegated permissions → Calendars.Read** فقط.
6. انسخ **Application (client) ID** من صفحة **Overview**.
7. افتح `js/config.js` وضع القيمة في `clientId` (الـ `authority` مضبوط مسبقًا على `consumers` للحسابات الشخصية).

بعد ذلك، افتح الموقع واضغط "تسجيل الدخول بـ Outlook" لمنح الإذن، وستظهر مواعيد اليوم تلقائيًا.

> الصلاحية المطلوبة هي `Calendars.Read` فقط — لا يمكن للتطبيق تعديل أو حذف أي موعد.

## النشر

يمكن نشر المشروع مباشرة على **Vercel** أو **Netlify** (بدون إعدادات بناء، فقط "static site"):

- Vercel: اربط المستودع من GitHub واختر Framework: **Other**.
- Netlify: اربط المستودع واترك Build command فارغًا و Publish directory = `.`

لا تنسَ إضافة رابط النشر النهائي كـ Redirect URI في تسجيل التطبيق على Azure (الخطوة 3 أعلاه).

## البنية

```
index.html        الصفحة الرئيسية
css/style.css      التنسيق
js/config.js       إعدادات Microsoft Graph (Client ID)
js/tasks.js        منطق تخزين وإدارة المهام (localStorage)
js/calendar.js     تسجيل الدخول وجلب المواعيد عبر MSAL + Graph API
js/app.js          ربط الواجهة بالمنطق
manifest.json      إعداد PWA أساسي
```

## خارج نطاق المرحلة الأولى

- تطبيق جوال حقيقي (iOS/Android)
- ربط المهام بـ Microsoft To Do
- الإشعارات (Notifications)
- مزامنة المهام بين أكثر من جهاز
