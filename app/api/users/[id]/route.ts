import { NextRequest } from "next/server";

import { hashPassword, requireAuth } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { countAdmins, deleteUserByAdmin, getUserByEmail, getUserById, updateUserByAdmin } from "@/lib/data-access";
import { adminUpdateUserSchema } from "@/lib/schemas";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export function OPTIONS() {
  return preflight();
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const rate = checkRateLimit(request, { limit: 30, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, adminUpdateUserSchema);

  if (!validated.success) {
    return validated.response;
  }

  const { id } = await params;
  const target = await getUserById(id);

  if (!target) {
    return error("المستخدم غير موجود.", 404);
  }

  if (validated.data.email && validated.data.email.toLowerCase() !== target.email.toLowerCase()) {
    const existing = await getUserByEmail(validated.data.email);

    if (existing) {
      return error("البريد الإلكتروني مستخدم من حساب آخر.", 409);
    }
  }

  if (validated.data.role && target.role === "ADMIN" && validated.data.role !== "admin") {
    const adminsCount = await countAdmins();

    if (adminsCount <= 1) {
      return error("لا يمكن خفض صلاحية آخر حساب مدير.", 400);
    }
  }

  const updated = await updateUserByAdmin(id, {
    ...(validated.data.name !== undefined ? { name: validated.data.name } : {}),
    ...(validated.data.email !== undefined ? { email: validated.data.email } : {}),
    ...(validated.data.phone !== undefined ? { phone: validated.data.phone } : {}),
    ...(validated.data.role !== undefined ? { role: validated.data.role } : {}),
    ...(validated.data.avatarUrl !== undefined ? { avatarUrl: validated.data.avatarUrl } : {}),
    ...(validated.data.password !== undefined
      ? { passwordHash: await hashPassword(validated.data.password) }
      : {})
  });

  if (!updated) {
    return error("المستخدم غير موجود.", 404);
  }

  return json({
    ok: true,
    data: updated
  });
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const rate = checkRateLimit(request, { limit: 20, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  if (auth.auth.user.id === id) {
    return error("لا يمكنك حذف حسابك الحالي من هذه الصفحة.", 400);
  }

  const target = await getUserById(id);

  if (!target) {
    return error("المستخدم غير موجود.", 404);
  }

  if (target.role === "ADMIN") {
    const adminsCount = await countAdmins();

    if (adminsCount <= 1) {
      return error("لا يمكن حذف آخر حساب مدير.", 400);
    }
  }

  const deleted = await deleteUserByAdmin(id);

  if (!deleted) {
    return error("المستخدم غير موجود.", 404);
  }

  return json({
    ok: true,
    data: {
      id,
      deleted: true
    }
  });
}
