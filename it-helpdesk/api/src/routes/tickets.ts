import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { computeSlaDueDates } from "../services/slaService";
import { notifyAgentOnTeams } from "../services/graphService";
import { AuthenticatedRequest, requireRole } from "../middleware/auth";

export const ticketsRouter = Router();

const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  priorityId: z.string().uuid().optional(), // اختياري: إن لم تُحدَّد تُستخدم أولوية التصنيف الافتراضية
});

/** POST /tickets — يفتحها الموظف عبر بوت Teams أو لوحة التحكم. */
ticketsRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = createTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.flatten() });
  }
  const { title, description, categoryId } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return res.status(404).json({ error: "التصنيف غير موجود" });

  const priorityId = parsed.data.priorityId ?? category.defaultPriorityId;
  if (!priorityId) return res.status(400).json({ error: "لا يوجد أولوية افتراضية لهذا التصنيف، حدّدها يدويًا" });

  const priority = await prisma.priority.findUnique({ where: { id: priorityId } });
  const newStatus = await prisma.ticketStatus.findFirst({ where: { name: "جديدة" } });
  if (!priority || !newStatus) return res.status(500).json({ error: "بيانات الإعداد الأولي غير مكتملة (شغّل seed)" });

  const now = new Date();
  const { responseDueAt, resolutionDueAt } = computeSlaDueDates(
    now,
    priority.responseSlaMinutes,
    priority.resolutionSlaMinutes
  );

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      categoryId,
      priorityId,
      statusId: newStatus.id,
      requesterId: req.auth!.dbUserId,
      responseDueAt,
      resolutionDueAt,
    },
    include: { category: true, priority: true, status: true },
  });

  await prisma.auditLog.create({
    data: { entityType: "Ticket", entityId: ticket.id, action: "CREATED", performedById: req.auth!.dbUserId },
  });

  // محاولة إشعار وكيل (best-effort — لا يفشل إنشاء التذكرة إن تعذّر الإشعار)
  try {
    const anyAgent = await prisma.user.findFirst({ where: { role: "AGENT" } });
    if (anyAgent) {
      await notifyAgentOnTeams(
        anyAgent.entraObjectId,
        `تذكرة جديدة #${ticket.id.slice(0, 8)} — ${ticket.title} (أولوية: ${priority.name})`
      );
    }
  } catch (e) {
    console.error("تعذّر إرسال إشعار Teams:", e);
  }

  res.status(201).json(ticket);
});

/** GET /tickets — قائمة التذاكر (الموظف يرى تذاكره فقط؛ الوكيل/المشرف يرى الكل). */
ticketsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const isAgentOrAbove = ["AGENT", "TEAM_LEAD", "ADMIN"].includes(req.auth!.role);
  const { status, priority, categoryId } = req.query;

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(isAgentOrAbove ? {} : { requesterId: req.auth!.dbUserId }),
      ...(status ? { status: { name: String(status) } } : {}),
      ...(priority ? { priority: { name: String(priority) } } : {}),
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
    },
    include: { category: true, priority: true, status: true, requester: true, assignedAgent: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(tickets);
});

/** GET /tickets/:id — تفاصيل تذكرة مع المحادثة والمرفقات. */
ticketsRouter.get("/:id", async (req: AuthenticatedRequest, res) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      priority: true,
      status: true,
      requester: true,
      assignedAgent: true,
      comments: { orderBy: { createdAt: "asc" }, include: { author: true } },
      attachments: true,
    },
  });
  if (!ticket) return res.status(404).json({ error: "التذكرة غير موجودة" });

  const isOwner = ticket.requesterId === req.auth!.dbUserId;
  const isAgentOrAbove = ["AGENT", "TEAM_LEAD", "ADMIN"].includes(req.auth!.role);
  if (!isOwner && !isAgentOrAbove) return res.status(403).json({ error: "لا تملك صلاحية عرض هذه التذكرة" });

  res.json(ticket);
});

const updateStatusSchema = z.object({
  statusId: z.string().uuid(),
});

/** PATCH /tickets/:id/status — تحديث حالة التذكرة (وكيل الدعم فأعلى). */
ticketsRouter.patch(
  "/:id/status",
  requireRole("AGENT", "TEAM_LEAD", "ADMIN"),
  async (req: AuthenticatedRequest, res) => {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

    const status = await prisma.ticketStatus.findUnique({ where: { id: parsed.data.statusId } });
    if (!status) return res.status(404).json({ error: "الحالة غير موجودة" });

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        statusId: status.id,
        resolvedAt: status.name === "تم الحل" ? new Date() : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: "Ticket",
        entityId: ticket.id,
        action: `STATUS_CHANGED:${status.name}`,
        performedById: req.auth!.dbUserId,
      },
    });

    res.json(ticket);
  }
);

const assignSchema = z.object({ agentId: z.string().uuid() });

/** PATCH /tickets/:id/assign — إسناد التذكرة لوكيل (قائد الفريق فأعلى). */
ticketsRouter.patch(
  "/:id/assign",
  requireRole("TEAM_LEAD", "ADMIN"),
  async (req: AuthenticatedRequest, res) => {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { assignedAgentId: parsed.data.agentId },
    });

    await prisma.auditLog.create({
      data: {
        entityType: "Ticket",
        entityId: ticket.id,
        action: `ASSIGNED:${parsed.data.agentId}`,
        performedById: req.auth!.dbUserId,
      },
    });

    res.json(ticket);
  }
);
