# نظام الدعم الفني الداخلي — IT Helpdesk

تنفيذ فعلي للمرحلة الأولى (Phase 1 / MVP) الموضّحة في وثيقة المتطلبات، مبني بالكامل بـ
**Node.js + TypeScript**، ومتكامل مع منظومة Microsoft (Microsoft Entra ID + Microsoft Graph API +
Microsoft Teams).

## بنية المشروع

```
it-helpdesk/
├── api/     ← الباك-إند (Express + TypeScript + Prisma + Azure SQL)
└── bot/     ← بوت Teams (Bot Framework SDK + Adaptive Cards + SSO)
```

كلا المشروعين مستقل (package.json خاص به) ويتصلان ببعضهما عبر HTTP: البوت يستدعي الـ API لإنشاء
التذاكر وقراءتها، والـ API يستدعي Microsoft Graph لإرسال إشعارات Teams/بريد.

## المتطلبات المسبقة على مستوى Azure / Microsoft 365 (تحتاج صلاحية مدير المستأجر)

هذه الخطوات **يجب إنجازها من طرفكم في Microsoft Entra admin center** قبل تشغيل الكود — لا يمكن
لأي كود إنشاءها نيابة عنكم:

1. **تسجيل تطبيق API** في Entra ID (App registrations → New registration):
   - `Application ID URI`: `api://<your-domain>/<api-client-id>`
   - Expose an API → أضف scope باسم `access_as_user`
   - احتفظ بـ `Tenant ID`, `Client ID`, وأنشئ `Client Secret`

2. **تسجيل بوت Teams** عبر Azure Bot Service:
   - احصل على `Microsoft App ID` و`App Password`
   - فعّل قناة Microsoft Teams
   - أضف Single Sign-On في إعدادات القناة، وأشِر إلى الـ scope الذي أنشأته في الخطوة ١

3. **صلاحيات Microsoft Graph (Application permissions)** — راجع القسم ١٤ من وثيقة المتطلبات:
   `User.Read.All`, `Chat.Create`, `ChatMessage.Send`, `Mail.Send` — ثم **Grant admin consent**.

4. **قاعدة بيانات Azure SQL**: أنشئ خادم/قاعدة بيانات فارغة واحصل على connection string.

## التشغيل المحلي

### الـ API

```bash
cd api
cp .env.example .env       # عبّي القيم من الخطوات أعلاه
npm install
npx prisma migrate dev --name init
npm run dev                # يعمل على http://localhost:3000
```

### البوت

```bash
cd bot
cp .env.example .env       # عبّي App ID / Password / API_BASE_URL
npm install
npm run dev                # يعمل على http://localhost:3978
```

استخدم [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator) للاختبار
المحلي قبل رفع البوت إلى Teams، ثم استخدم `manifest/manifest.json` لتغليف التطبيق ورفعه في
Teams Admin Center أو مباشرة للمستخدمين عبر "Upload a custom app".

## ما هو مُنفَّذ فعليًا في هذه النسخة (Phase 1)

- مخطط قاعدة بيانات كامل (Prisma) يطابق نموذج البيانات في الوثيقة.
- API حقيقي: إنشاء/عرض/تحديث التذاكر، التعليقات، التصنيفات، الأولويات، مع حساب SLA تلقائيًا.
- طبقة تحقق من هوية Entra ID على كل طلب API (JWT bearer validation عبر JWKS الحقيقي لمستأجركم).
- خدمة تكامل حقيقية مع Microsoft Graph لإرسال رسالة Teams تلقائية للوكيل عند إنشاء تذكرة.
- بوت Teams فعلي بنموذج Adaptive Card لفتح تذكرة، مع تسجيل دخول أحادي (SSO) عبر Entra ID.

## ما لم يُنفَّذ بعد (يحتاج قرار/بيانات منكم أولًا)

- لوحة تحكم الويب (Agent/Team Lead/Admin) — تحتاج توضيح: React أو Blazor، ومتصفح تصميم محدد.
- التصعيد الآلي وقاعدة المعرفة (Phase 2/3 حسب الوثيقة).
- بيانات الإنتاج الفعلية (أسماء التصنيفات، الوكلاء، الأقسام) — حاليًا Seed تجريبي فقط.
