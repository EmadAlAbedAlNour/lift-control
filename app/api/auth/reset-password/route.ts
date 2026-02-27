import { NextRequest } from "next/server";

import { issueResetToken } from "@/lib/auth";
import { checkRateLimit, json, preflight, validateBody } from "@/lib/api-utils";
import { createPasswordResetToken, getUserByEmail, invalidateUserSessions } from "@/lib/data-access";
import { trackEvent } from "@/lib/integrations/analytics";
import { sendPasswordResetEmail } from "@/lib/integrations/email";
import { resetPasswordSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 10, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const validated = await validateBody(request, resetPasswordSchema);

  if (!validated.success) {
    return validated.response;
  }

  const user = await getUserByEmail(validated.data.email);

  if (user) {
    await invalidateUserSessions(user.id);

    const { token, tokenHash } = issueResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt
    });

    const resetUrl = `${request.nextUrl.origin}/auth/reset-password/confirm?token=${token}`;

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl
    });

    await trackEvent({
      event: "password_reset_requested",
      userId: user.id
    });
  }

  return json({
    ok: true,
    data: {
      message: "If the email exists, a reset link has been sent."
    }
  });
}
