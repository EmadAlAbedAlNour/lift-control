import { NextRequest } from "next/server";

import { hashPassword, hashValue } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { consumePasswordResetToken, invalidateUserSessions, updateUserPassword } from "@/lib/data-access";
import { resetPasswordConfirmSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 10, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const validated = await validateBody(request, resetPasswordConfirmSchema);

  if (!validated.success) {
    return validated.response;
  }

  const consumed = await consumePasswordResetToken(hashValue(validated.data.token));

  if (!consumed) {
    return error("رمز إعادة التعيين غير صالح أو منتهي.", 400);
  }

  const passwordHash = await hashPassword(validated.data.password);
  await updateUserPassword(consumed.userId, passwordHash);
  await invalidateUserSessions(consumed.userId);

  return json({
    ok: true,
    data: {
      message: "تم تحديث كلمة المرور بنجاح."
    }
  });
}
