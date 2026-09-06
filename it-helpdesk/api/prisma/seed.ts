// بيانات تجريبية أولية فقط — استبدلها ببياناتكم الفعلية (تصنيفات/أقسام حقيقية) قبل الإنتاج
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [urgent, high, medium, low] = await Promise.all([
    prisma.priority.create({ data: { name: "عاجلة", responseSlaMinutes: 15, resolutionSlaMinutes: 240 } }),
    prisma.priority.create({ data: { name: "مرتفعة", responseSlaMinutes: 60, resolutionSlaMinutes: 480 } }),
    prisma.priority.create({ data: { name: "متوسطة", responseSlaMinutes: 240, resolutionSlaMinutes: 1440 } }),
    prisma.priority.create({ data: { name: "منخفضة", responseSlaMinutes: 1440, resolutionSlaMinutes: 4320 } }),
  ]);

  await prisma.category.createMany({
    data: [
      { name: "الشبكة والاتصال", defaultPriorityId: high.id },
      { name: "الأجهزة (Hardware)", defaultPriorityId: medium.id },
      { name: "البرمجيات والتطبيقات", defaultPriorityId: medium.id },
      { name: "الحسابات وكلمات المرور", defaultPriorityId: urgent.id },
      { name: "طلب معلومة / أخرى", defaultPriorityId: low.id },
    ],
  });

  await prisma.ticketStatus.createMany({
    data: [
      { name: "جديدة", isFinal: false },
      { name: "قيد المعالجة", isFinal: false },
      { name: "بانتظار رد الموظف", isFinal: false },
      { name: "تم الحل", isFinal: false },
      { name: "مغلقة", isFinal: true },
    ],
  });

  console.log("تم إدخال البيانات التجريبية بنجاح.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
