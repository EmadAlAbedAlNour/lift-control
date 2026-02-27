import { NextRequest } from "next/server";

import { mapKnownPrismaError } from "@/lib/api-prisma";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error as apiError, json, preflight, validateBody } from "@/lib/api-utils";
import { createCustomer, listCustomers } from "@/lib/data-access";
import { customerInputSchema } from "@/lib/schemas";

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

  const customers = await listCustomers();

  return json({
    ok: true,
    data: customers
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

  const validated = await validateBody(request, customerInputSchema);

  if (!validated.success) {
    return validated.response;
  }

  try {
    const created = await createCustomer(validated.data);

    return json(
      {
        ok: true,
        data: created
      },
      201
    );
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
