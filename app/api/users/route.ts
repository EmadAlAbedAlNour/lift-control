import { NextRequest } from "next/server";

import { hashPassword, requireAuth } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { createUser, getUserByEmail, listUsers, toPublicUser } from "@/lib/data-access";
import { adminCreateUserSchema } from "@/lib/schemas";
import { ensureImageUrl } from "@/lib/utils/image";

export function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 60, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const users = await listUsers();

  return json({
    ok: true,
    data: users
  });
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 25, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, adminCreateUserSchema);

  if (!validated.success) {
    return validated.response;
  }

  const existing = await getUserByEmail(validated.data.email);

  if (existing) {
    return error("هذا البريد مستخدم مسبقا.", 409);
  }

  const passwordHash = await hashPassword(validated.data.password);
  const user = await createUser({
    name: validated.data.name,
    email: validated.data.email,
    phone: validated.data.phone,
    passwordHash,
    role: validated.data.role,
    avatarUrl: ensureImageUrl(validated.data.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar)
  });

  return json(
    {
      ok: true,
      data: toPublicUser(user)
    },
    201
  );
}
