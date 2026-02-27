import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { deleteContent, getContentById, updateContent } from "@/lib/data-access";
import { contentUpdateSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const rate = checkRateLimit(request);

  if (rate) {
    return rate;
  }

  const { id } = await params;
  const item = await getContentById(id);

  if (!item) {
    return error("Content item not found.", 404);
  }

  return json({
    ok: true,
    data: item
  });
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const rate = checkRateLimit(request, { limit: 30, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["supervisor", "admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, contentUpdateSchema);

  if (!validated.success) {
    return validated.response;
  }

  const { id } = await params;
  const updated = await updateContent(id, validated.data);

  if (!updated) {
    return error("Content item not found.", 404);
  }

  return json({
    ok: true,
    data: updated
  });
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
  const deleted = await deleteContent(id);

  if (!deleted) {
    return error("Content item not found.", 404);
  }

  return json({
    ok: true,
    data: {
      id,
      deleted: true
    }
  });
}
