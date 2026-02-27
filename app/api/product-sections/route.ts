import { NextRequest } from "next/server";

import { mapKnownPrismaError } from "@/lib/api-prisma";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error as apiError, json, preflight, validateBody } from "@/lib/api-utils";
import { createProductSection, listProductSectionsWithProducts } from "@/lib/data-access";
import { productSectionInputSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request);

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["supervisor", "admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const sections = await listProductSectionsWithProducts();

  return json({
    ok: true,
    data: sections
  });
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

  const validated = await validateBody(request, productSectionInputSchema);

  if (!validated.success) {
    return validated.response;
  }

  try {
    const created = await createProductSection(validated.data);

    return json(
      {
        ok: true,
        data: created
      },
      201
    );
  } catch (error) {
    const mapped = mapKnownPrismaError(error, {
      P2002: () => apiError("اسم القسم مستخدم بالفعل.", 409)
    });

    if (mapped) {
      return mapped;
    }

    throw error;
  }
}
