import { Router } from "express";
import { prisma } from "../services/prisma";

// بيانات مرجعية للنماذج (بوت Teams ولوحة التحكم): التصنيفات، الأولويات، الحالات
export const lookupsRouter = Router();

lookupsRouter.get("/categories", async (_req, res) => {
  res.json(await prisma.category.findMany({ include: { defaultPriority: true } }));
});

lookupsRouter.get("/priorities", async (_req, res) => {
  res.json(await prisma.priority.findMany());
});

lookupsRouter.get("/statuses", async (_req, res) => {
  res.json(await prisma.ticketStatus.findMany());
});
