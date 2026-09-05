# يومي — مهامك ومواعيدك في مكان واحد

تطبيق ويب بسيط للاستخدام الشخصي (مش موقع عام)، مصمم عشان تستخدمه من جوالين بتوعك ويجمع بين:
- **قائمة مهام يومية** (إضافة، تعديل، حذف، تحديد كمكتملة) — تُخزَّن محليًا، ومع إعداد بسيط (اختياري) تتزامن أول بأول بين جوالينك.
- **مواعيد Outlook Calendar و/أو Google Calendar** — تُجلب تلقائيًا (قراءة فقط) وتُعرض مجمّعة في قائمة واحدة، كل موعد عليه علامة تدل على مصدره. المواعيد بطبيعتها متزامنة بين أي جهاز تسجّل دخول فيه بنفس الحساب.
- **مواعيد شخصية تضيفها بنفسك** — من غير ما تحتاج حساب Outlook/Google، تقدر تضيف موعد من أي جهاز وهيظهر (بعلامة "شخصي") في قائمة المواعيد على الجهاز التاني كمان، بنفس آلية مزامنة المهام.

تقدر تفعّل مصدر واحد بس (Google أو Outlook) أو الاثنين مع بعض — حسب الحسابات اللي تسجّل دخول فيها. المواعيد الشخصية شغالة دايمًا بدون أي إعداد إضافي، وتتزامن بين الجهازين لو فعّلت رمز المزامنة (راجع "إعداد مزامنة المهام بين جهازين" تحت).

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

## إعداد ربط Google Calendar

المصادقة تتم بالكامل من المتصفح عبر Google Identity Services (OAuth2 Implicit Flow) بدون أي سيرفر خلفي أو أسرار.

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com) وأنشئ مشروعًا جديدًا (أو استخدم مشروعًا موجودًا).
2. من **APIs & Services → Library** فعّل **Google Calendar API**.
3. من **APIs & Services → OAuth consent screen** اضبط شاشة الموافقة (نوع External كافٍ لحساب Gmail شخصي)، وأضف نطاق `.../auth/calendar.readonly`.
4. من **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
5. نوع التطبيق: **Web application**.
6. أضف تحت **Authorized JavaScript origins** رابط موقعك بعد النشر (مثلاً `https://your-app.vercel.app`) وأيضًا `http://localhost:8080` للتجربة المحلية.
7. انسخ **Client ID** وضعه في `js/config.js` داخل `GOOGLE_CONFIG.clientId`.

بعد ذلك، افتح الموقع واضغط "تسجيل الدخول بـ Google" لمنح الإذن، وستظهر مواعيد اليوم من Google Calendar تلقائيًا بجانب مواعيد Outlook (لو مفعّل).

> الصلاحية المطلوبة هي `calendar.readonly` فقط — قراءة فقط، بدون أي تعديل أو حذف.

> ملاحظة: طالما شاشة الموافقة (OAuth consent screen) في وضع "Testing"، لازم تضيف إيميلك كـ **Test user** من نفس الصفحة حتى يعمل تسجيل الدخول.

## إعداد مزامنة المهام والمواعيد الشخصية بين جهازين (اختياري)

المهام والمواعيد الشخصية بشكل افتراضي مخزّنة محليًا في متصفح كل جهاز لوحده. عشان تظهر نفس المهام والمواعيد على جوالك التاني أول بأول، محتاج قاعدة بيانات سحابية بسيطة ومجانية (Firebase Firestore):

1. اذهب إلى [Firebase console](https://console.firebase.google.com) → **Add project** (أي اسم).
2. من القائمة الجانبية: **Build → Firestore Database → Create database** (اختر أي منطقة قريبة منك، ووضع production).
3. من **Build → Authentication → Sign-in method** فعّل مزوّد **Anonymous**.
4. من إعدادات المشروع (⚙️ بجانب Project Overview) → **Your apps** → اضغط أيقونة الويب `</>` لإضافة تطبيق ويب، وانسخ كائن `firebaseConfig` اللي هيظهر لك.
5. افتح `js/config.js` وضع القيم في `FIREBASE_CONFIG`.
6. من **Firestore Database → Rules** استبدل القواعد بالتالي (تسمح فقط لمستخدم مسجّل دخول حتى لو بشكل مجهول):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /syncGroups/{syncCode} {
      allow read, write: if request.auth != null;
    }
  }
}
```

7. افتح الموقع من الجهازين، واضغط زر 🔗 في أعلى الصفحة، واكتب **نفس رمز المزامنة** (أي كلمة/عبارة تختارها إنت، مثلاً `ammar-tasks-2026`) في الاتنين واضغط "حفظ وربط".

من هذه اللحظة، أي مهمة أو موعد شخصي تضيفه أو تعدّله في أي جهاز يظهر تلقائيًا في الجهاز التاني.

> ملاحظة أمان: رمز المزامنة بيشتغل كأنه "كلمة سر" بسيطة — أي حد يعرف الرمز ده يقدر يشوف نفس المهام. بما إن الاستخدام شخصي بينك وبين جوالينك بس، ده كافٍ، لكن اختر رمز مش سهل التخمين ومتشاركوش مع حد.

> لو مش عايز تفعّل المزامنة، سيبه فاضي — التطبيق هيشتغل عادي والمهام هتفضل محلية في كل جهاز لوحده.

## النشر

يمكن نشر المشروع مباشرة على **Vercel** أو **Netlify** (بدون إعدادات بناء، فقط "static site"):

- Vercel: اربط المستودع من GitHub واختر Framework: **Other**.
- Netlify: اربط المستودع واترك Build command فارغًا و Publish directory = `.`

لا تنسَ إضافة رابط النشر النهائي كـ Redirect URI في تسجيل التطبيق على Azure، وكـ Authorized JavaScript origin في Google Cloud Console (الخطوات أعلاه).

## البنية

```
index.html          الصفحة الرئيسية
css/style.css        التنسيق
js/config.js         إعدادات Microsoft Graph و Google Calendar و Firebase (Client IDs)
js/tasks.js          منطق تخزين وإدارة المهام (localStorage) + خطاف رفعها للمزامنة
js/appointments.js   منطق تخزين وإدارة المواعيد الشخصية (localStorage) + خطاف رفعها للمزامنة
js/sync.js           مزامنة المهام والمواعيد الشخصية بين جهازين عبر Firebase Firestore (اختياري)
js/calendar.js       تسجيل الدخول وجلب المواعيد عبر MSAL + Microsoft Graph API
js/googleCalendar.js تسجيل الدخول وجلب المواعيد عبر Google Identity Services + Calendar API
js/app.js            ربط الواجهة بالمنطق ودمج مواعيد المصدرين وربط المزامنة
manifest.json        إعداد PWA أساسي
```

## خارج نطاق المرحلة الأولى

- تطبيق جوال حقيقي (iOS/Android)
- ربط المهام بـ Microsoft To Do
- الإشعارات (Notifications)
