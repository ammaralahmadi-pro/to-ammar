import { NextFunction, Request, Response } from "express";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { env } from "../config/env";
import { prisma } from "../services/prisma";

// يتحقق من توكن Bearer الصادر فعليًا من مستأجر Entra ID الخاص بالمؤسسة —
// لا محاكاة: يجلب مفاتيح التوقيع من نقطة اكتشاف Microsoft الحقيقية (JWKS) ويتحقق من التوقيع والجمهور والمُصدر.
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${env.entraTenantId}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid as string, (err, key) => {
    if (err || !key) return callback(err ?? new Error("مفتاح توقيع غير موجود"));
    callback(null, key.getPublicKey());
  });
}

export interface AuthenticatedRequest extends Request {
  auth?: {
    oid: string;
    name: string;
    email: string;
    dbUserId: string;
    role: string;
  };
}

export async function requireEntraAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "مطلوب رمز دخول Bearer صادر من Entra ID" });
  }
  const token = header.slice("Bearer ".length);

  jwt.verify(
    token,
    getSigningKey,
    {
      audience: env.entraApiClientId,
      issuer: `https://login.microsoftonline.com/${env.entraTenantId}/v2.0`,
      algorithms: ["RS256"],
    },
    async (err, decoded) => {
      if (err || !decoded || typeof decoded === "string") {
        return res.status(401).json({ error: "رمز الدخول غير صالح", detail: err?.message });
      }

      const oid = decoded.oid as string;
      const name = (decoded.name as string) ?? "";
      const email = (decoded.preferred_username as string) ?? (decoded.upn as string) ?? "";

      // ربط تلقائي (Just-In-Time provisioning): أول مرة يدخل فيها الموظف يُنشأ سجله تلقائيًا
      const user = await prisma.user.upsert({
        where: { entraObjectId: oid },
        update: { displayName: name, email },
        create: { entraObjectId: oid, displayName: name, email, role: "END_USER" },
      });

      req.auth = { oid, name, email, dbUserId: user.id, role: user.role };
      next();
    }
  );
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "لا تملك الصلاحية الكافية لهذا الإجراء" });
    }
    next();
  };
}
