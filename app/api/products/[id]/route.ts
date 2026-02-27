import { NextRequest } from "next/server";

import { mapKnownPrismaError } from "@/lib/api-prisma";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error as apiError, json, preflight, validateBody } from "@/lib/api-utils";
import { deleteProduct, updateProduct } from "@/lib/data-access";
import { productUpdateSchema } from "@/lib/schemas";

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

  const validated = await validateBody(request, productUpdateSchema);

  if (!validated.success) {
    return validated.response;
  }

  const { id } = await params;

  try {
    const updated = await updateProduct(id, validated.data);

    if (!updated) {
      return apiError("المنتج غير موجود.", 404);
    }

    return json({
      ok: true,
      data: updated
    });
  } catch (error) {
    const mapped = mapKnownPrismaError(error, {
      P2002: () => apiError("اسم المنتج مستخدم داخل القسم المحدد.", 409),
      P2003: () => apiError("القسم المحدد غير موجود.", 400)
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
  const deleted = await deleteProduct(id);

  if (!deleted) {
    return apiError("المنتج غير موجود.", 404);
  }

  return json({
    ok: true,
    data: {
      id,
      deleted: true
    }
  });
}
