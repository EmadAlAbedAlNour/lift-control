import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { checkRateLimit, json, preflight, validateBody } from "@/lib/api-utils";
import { createContent, searchContent } from "@/lib/data-access";
import { contentInputSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request);

  if (rate) {
    return rate;
  }

  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const type = request.nextUrl.searchParams.get("type") ?? undefined;

  const results = await searchContent({ q, status, type });

  return json({
    ok: true,
    data: results
  });
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 30, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["supervisor", "admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, contentInputSchema);

  if (!validated.success) {
    return validated.response;
  }

  const created = await createContent(validated.data);

  return json(
    {
      ok: true,
      data: created
    },
    201
  );
}
