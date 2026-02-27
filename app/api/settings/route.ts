import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { listSettings, updateSetting } from "@/lib/data-access";
import { updateSettingSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 60, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["user", "supervisor", "admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const settings = await listSettings();

  return json({
    ok: true,
    data: settings
  });
}

export async function PUT(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 20, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, updateSettingSchema);

  if (!validated.success) {
    return validated.response;
  }

  const updated = await updateSetting(validated.data.key, validated.data.value);

  if (!updated) {
    return error("مفتاح الإعداد غير موجود.", 404);
  }

  return json({
    ok: true,
    data: updated
  });
}
