import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { updateSettingsBatch } from "@/lib/data-access";
import { updateSettingsBatchSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 12, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["admin"]);

  if (!auth.ok) {
    return auth.response;
  }

  const validated = await validateBody(request, updateSettingsBatchSchema);

  if (!validated.success) {
    return validated.response;
  }

  const dedupedCount = new Set(validated.data.settings.map((item) => item.key)).size;
  const updated = await updateSettingsBatch(validated.data.settings);

  if (updated.length !== dedupedCount) {
    const updatedKeys = new Set(updated.map((item) => item.key));
    const missingKeys = [...new Set(validated.data.settings.map((item) => item.key))].filter(
      (key) => !updatedKeys.has(key)
    );

    return error("تعذر تحديث بعض المفاتيح.", 404, { missingKeys });
  }

  return json({
    ok: true,
    data: updated
  });
}
