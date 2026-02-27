import { NextRequest } from "next/server";

import { createSessionForUser, setAuthCookies, verifyPassword } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { getUserByEmail, toPublicUser } from "@/lib/data-access";
import { trackEvent } from "@/lib/integrations/analytics";
import { authLoginSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 30, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const validated = await validateBody(request, authLoginSchema);

  if (!validated.success) {
    return validated.response;
  }

  const user = await getUserByEmail(validated.data.email);

  if (!user) {
    return error("بيانات الدخول غير صحيحة.", 401);
  }

  const passwordValid = await verifyPassword(validated.data.password, user.passwordHash);

  if (!passwordValid) {
    return error("بيانات الدخول غير صحيحة.", 401);
  }

  const publicUser = toPublicUser(user);
  const sessionToken = await createSessionForUser(publicUser, request);

  const response = json({
    ok: true,
    data: {
      user: publicUser
    }
  });

  setAuthCookies(response, sessionToken, publicUser.role);

  await trackEvent({
    event: "auth_login",
    userId: publicUser.id
  });

  return response;
}
