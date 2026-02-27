import { NextRequest } from "next/server";

import { mapKnownPrismaError } from "@/lib/api-prisma";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error as apiError, json, preflight, validateBody } from "@/lib/api-utils";
import {
  countProjectsByClientName,
  deleteCustomer,
  getCustomerNameById,
  updateCustomer
} from "@/lib/data-access";
import { customerUpdateSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

interface RouteProps {
  params: Promise<{ id: string }>;
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

  const validated = await validateBody(request, customerUpdateSchema);

  if (!validated.success) {
    return validated.response;
  }

  const { id } = await params;

  try {
    const updated = await updateCustomer(id, validated.data);

    if (!updated) {
      return apiError("العميل غير موجود.", 404);
    }

    return json({
      ok: true,
      data: updated
    });
  } catch (error) {
    const mapped = mapKnownPrismaError(error, {
      P2002: () => apiError("اسم العميل مستخدم بالفعل.", 409)
    });

    if (mapped) {
      return mapped;
    }

    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const rate = checkRateLimit(request, { limit: 30, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const customerName = await getCustomerNameById(id);

  if (!customerName) {
    return apiError("العميل غير موجود.", 404);
  }

  const linkedProjects = await countProjectsByClientName(customerName);

  if (linkedProjects > 0) {
    return apiError(`لا يمكن حذف العميل لأنه مرتبط بعدد ${linkedProjects} من المشاريع.`, 400);
  }

  const deleted = await deleteCustomer(id);

  if (!deleted) {
    return apiError("العميل غير موجود.", 404);
  }

  return json({
    ok: true,
    data: {
      id,
      deleted: true
    }
  });
}
