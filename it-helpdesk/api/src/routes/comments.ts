import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export const commentsRouter = Router({ mergeParams: true });

const createCommentSchema = z.object({
  body: z.string().min(1),
  isInternal: z.boolean().optional(),
});

/** POST /tickets/:ticketId/comments */
commentsRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

  const isAgentOrAbove = ["AGENT", "TEAM_LEAD", "ADMIN"].includes(req.auth!.role);
  // الملاحظات الداخلية (isInternal) لا يمكن أن يضيفها إلا فريق الدعم
  const isInternal = isAgentOrAbove ? parsed.data.isInternal ?? false : false;

  const comment = await prisma.comment.create({
    data: {
      ticketId: req.params.ticketId,
      authorId: req.auth!.dbUserId,
      body: parsed.data.body,
      isInternal,
    },
    include: { author: true },
  });

  res.status(201).json(comment);
});
