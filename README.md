# مواعيدنا — تطبيق التقويم العائلي المشترك

تطبيق ويب متجاوب (Mobile-First) لإدارة مواعيد أسرتين في مكان واحد، بتسجيل دخول حقيقي عبر
Google OAuth 2.0 لكل طرف، وتزامن ثنائي مباشر مع Google Calendar: أي موعد يُضاف من الموقع
يُكتب في تقويم كل من الطرفين المعنيَّين تلقائيًا.

## البنية

```
server/   خادم Node.js/Express — OAuth، تخزين الرموز المشفّرة، والتزامن مع Google Calendar API
web/      واجهة Next.js + Tailwind CSS — تسجيل الدخول ولوحة المواعيد
```

## كيف يعمل التزامن الثنائي

1. عند تسجيل الدخول، يمنح كل طرف صلاحية `calendar.events` عبر Google OAuth، ويُخزَّن
   `access_token` و`refresh_token` مشفّرين (AES-256-GCM) في قاعدة البيانات.
2. عند إضافة موعد "لكما معًا"، يكتبه الخادم مباشرة — عبر Google Calendar API — في التقويم
   الأساسي (`primary`) لكل من الحسابين، ويحفظ معرّف كل نسخة (`EventCopy`) لتتبعها.
3. تعديل الموعد أو حذفه من الموقع يُحدّث أو يحذف كل نسخة في تقويمي Google تلقائيًا.
4. عرض لوحة المواعيد يجلب البيانات مباشرة من Google Calendar API لكلا الحسابين في كل تحميل،
   فتظهر أيضًا أي مواعيد أُضيفت مباشرة من تطبيق Google Calendar نفسه.

## المواصفات التقنية

| الطبقة | التقنية |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express |
| المصادقة | Google Identity / OAuth 2.0 + Google Calendar API |
| قاعدة البيانات | PostgreSQL عبر Prisma ORM |

## هوية التصميم

| الاستخدام | اللون |
|---|---|
| أساسي (أزرار، هيدر) | Apricot Orange `#ffa369` |
| خلفيات | White `#ffffff` |
| نصوص | Rich Black `#000000` |
| تمييز/تنبيهات | Glaze Orange `#fee7d9`, Warm Yellow `#fdb940` |

## التشغيل محليًا

### 1) قاعدة البيانات

أنشئ قاعدة بيانات PostgreSQL مجانية (مثل [Neon](https://neon.tech) أو
[Supabase](https://supabase.com)) وانسخ رابط الاتصال (`DATABASE_URL`).

### 2) إعداد Google Cloud (OAuth + Calendar API)

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com) وأنشئ مشروعًا جديدًا.
2. من **APIs & Services → Library** فعّل **Google Calendar API**.
3. من **APIs & Services → OAuth consent screen**: نوع External، أضف نطاقي
   `.../auth/calendar.events` و`.../auth/calendar.readonly`، وأضف بريدَي العائلة كـ **Test users**.
4. من **APIs & Services → Credentials → Create Credentials → OAuth client ID**، نوع **Web application**.
5. أضف تحت **Authorized redirect URIs**: `http://localhost:4000/auth/google/callback`
   (وبعد النشر، أضف رابط الخادم المنشور أيضًا).
6. انسخ **Client ID** و**Client Secret**.

### 3) الخادم (server)

```bash
cd server
cp .env.example .env
# املأ DATABASE_URL و GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET و ALLOWED_EMAILS
# ولّد المفاتيح السرية:
openssl rand -hex 32   # ضعها في JWT_SECRET
openssl rand -hex 32   # ضعها في TOKEN_ENCRYPTION_KEY

npm install
npx prisma migrate dev --name init
npm run dev
```

يعمل الخادم على `http://localhost:4000`.

### 4) الواجهة (web)

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

افتح `http://localhost:3000`، وسجّل الدخول بحساب Google — يجب أن يكون من ضمن
`ALLOWED_EMAILS` في إعدادات الخادم.

> **مهم:** أول من يسجّل دخوله من البريدين يُعتبر تلقائيًا الحساب "الأساسي" (Apricot Orange)،
> والثاني "الثانوي" (Warm Yellow). سجّل دخول الطرفين مرة واحدة على الأقل بعد الإعداد.

## النشر

- **الخادم**: أي منصة تدعم Node.js طويل التشغيل (Railway، Render، Fly.io). أضف نفس متغيرات
  `.env` هناك، وحدّث `GOOGLE_REDIRECT_URI` و`FRONTEND_URL` إلى الروابط النهائية، وأضف رابط
  الاستدعاء الجديد في Google Cloud Console.
- **الواجهة**: Vercel (الخيار الطبيعي لـ Next.js) — أضف `NEXT_PUBLIC_API_URL` مشيرًا إلى رابط
  الخادم المنشور.

## الأمان

- لا يُطلب من المستخدم كلمة مرور — المصادقة بالكامل عبر Google OAuth 2.0.
- `access_token` و`refresh_token` يُخزَّنان مشفّرين بـ AES-256-GCM، لا كنص صريح أبدًا.
- الوصول مقصور على البريدين المدرَجين في `ALLOWED_EMAILS` فقط.
- جلسة الموقع نفسها عبارة عن JWT في كوكي `httpOnly` + `secure` (في الإنتاج) + `sameSite=lax`.

## خارج نطاق المرحلة الأولى

- تطبيق جوال حقيقي (iOS/Android)
- إشعارات فورية (Push) خارج تنبيهات Google Calendar الافتراضية
- دعم أكثر من طرفين في نفس التقويم العائلي
