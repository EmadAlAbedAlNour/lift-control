import { NextRequest } from "next/server";

import { clearAuthCookies, revokeSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit, json, preflight } from "@/lib/api-utils";
import { trackEvent } from "@/lib/integrations/analytics";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 40, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  await revokeSessionToken(token);

  const response = json({
    ok: true,
    data: {
      message: "Logged out"
    }
  });

  clearAuthCookies(response);

  await trackEvent({
    event: "auth_logout"
  });

  return response;
}
