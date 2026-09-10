# توزيع الراتب الشهري

تطبيق ويب مستقل (منفصل عن تطبيق "مواعيدنا" في هذا المستودع) لتوزيع الراتب الشهري على فئات
مصروفات قابلة للتعديل، وتسجيل المصروفات الفعلية، ومتابعة الالتزام بالخطة عبر مقارنة
"المخطط" مقابل "الفعلي" لكل فئة.

هذا هو **الإصدار الأول (MVP)** فقط: تسجيل دخول/حساب، إدخال الراتب، فئات قابلة للتعديل
(نسبة أو مبلغ ثابت)، توزيع تلقائي، تسجيل المصروفات، ولوحة متابعة شهرية بالألوان الدلالية
(أخضر/أصفر/أحمر). الأرشيف، التقرير السنوي، تصدير PDF/Excel، والالتزامات المتكررة تُترك
لمرحلة لاحقة.

## البنية

```
salary-app/server/   خادم Node.js/Express + Prisma (PostgreSQL) — مصادقة، فئات، رواتب، مصروفات
salary-app/web/      واجهة Next.js 14 + Tailwind CSS — RTL بالكامل
```

## التشغيل محليًا

### 1) الخادم

```bash
cd salary-app/server
cp .env.example .env
# املأ DATABASE_URL (رابط PostgreSQL) وولّد JWT_SECRET:
openssl rand -hex 32

npm install
npx prisma migrate dev --name init
npm run dev
```

يعمل الخادم على `http://localhost:4100`.

### 2) الواجهة

```bash
cd salary-app/web
cp .env.local.example .env.local
npm install
npm run dev
```

افتح `http://localhost:3100`، أنشئ حسابًا جديدًا (بريد إلكتروني + كلمة مرور)، ثم أدخل راتبك
الأول من لوحة التحكم.

## النشر (بنفس طريقة نشر "مواعيدنا" — مستودع واحد، مشروعان منفصلان)

هذا مشروع مستقل داخل نفس المستودع، لذا يُنشر كـ **مشروعَين منفصلين جديدين** على نفس
المنصّات المستخدمة لتطبيق "مواعيدنا"، مع تحديد مجلد الجذر (Root Directory) لكل منهما:

### 1) قاعدة البيانات

أنشئ قاعدة بيانات PostgreSQL مجانية (مثل [Neon](https://neon.tech) أو
[Supabase](https://supabase.com)) وانسخ رابط الاتصال (`DATABASE_URL`).

### 2) الخادم — Render أو Railway أو Fly.io

1. أنشئ **خدمة جديدة (New Web Service)** من نفس مستودع GitHub هذا.
2. **مهم:** اضبط **Root Directory** على `salary-app/server` (حتى لا يتعارض مع خادم
   "مواعيدنا" في نفس المستودع).
3. Build Command: `npm install && npm run build` — Start Command: `npm start`.
4. أضف متغيرات البيئة: `DATABASE_URL`، `JWT_SECRET` (أنشئه بـ `openssl rand -hex 32`)،
   `FRONTEND_URL` (رابط الواجهة بعد نشرها في الخطوة التالية)، و`NODE_ENV=production`.
5. بعد أول نشر ناجح انسخ رابط الخادم (مثل `https://salary-app-server.onrender.com`).

### 3) الواجهة — Vercel

1. **Add New Project** من نفس مستودع GitHub هذا (مشروع Vercel جديد، منفصل عن مشروع
   "مواعيدنا").
2. **مهم:** اضبط **Root Directory** على `salary-app/web`.
3. Framework Preset: Next.js (يُكتشف تلقائيًا بفضل `vercel.json`).
4. أضف متغيّر البيئة `NEXT_PUBLIC_API_URL` = رابط الخادم من الخطوة السابقة.
5. ارجع لإعدادات الخادم وحدّث `FRONTEND_URL` إلى رابط Vercel النهائي (مثل
   `https://salary-app-web.vercel.app`) ثم أعد نشر الخادم.

بعد ذلك يكون رابط التطبيق النهائي هو رابط مشروع Vercel (خطوة 2 أعلاه) — وهو ما تدخل عليه.

## نموذج البيانات (Prisma)

- `User`: id, name, email, passwordHash, currency, createdAt
- `Category`: id, userId, name, type(percentage/fixed), value, sortOrder — تُنشأ فئات
  افتراضية تلقائيًا عند إنشاء الحساب، وقابلة للتعديل/الحذف/الإضافة بالكامل من `/setup`.
- `MonthlySalary`: id, userId, month, year, amount, extraIncome (فريد لكل مستخدم/شهر/سنة)
- `Expense`: id, userId, categoryId, month, year, amount, description, date

## منطق التوزيع

عند فتح لوحة أي شهر: `المخطط لكل فئة = (الراتب + الدخل الإضافي) × النسبة`، أو المبلغ الثابت
إن كان نوع الفئة "مبلغ ثابت". يُقارَن الفعلي (مجموع مصروفات الفئة لذلك الشهر) بالمخطط، وتُصنَّف
الحالة: **أخضر** (ضمن الحد)، **أصفر** (تجاوز 80% من المخطط)، **أحمر** (تجاوز المخطط بالكامل).

## خارج نطاق هذا الإصدار

- الأرشيف الشهري (Snapshot) ومقارنة الأشهر
- التقرير السنوي (رسم بياني للدخل/الصرف/الادخار)
- تصدير PDF/Excel
- الالتزامات المتكررة (اشتراكات/أقساط تُخصم تلقائيًا)
- تذكيرات البريد الإلكتروني
- PWA / دعم Offline
