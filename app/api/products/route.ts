import { NextRequest } from "next/server";

import { mapKnownPrismaError } from "@/lib/api-prisma";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error as apiError, json, preflight, validateBody } from "@/lib/api-utils";
import { createProduct } from "@/lib/data-access";
import { productInputSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 30, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, productInputSchema);

  if (!validated.success) {
    return validated.response;
  }

  try {
    const created = await createProduct(validated.data);

    return json(
      {
        ok: true,
        data: created
      },
      201
    );
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
