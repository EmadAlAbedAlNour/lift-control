import { NextRequest } from "next/server";

import { requireAuth, rotateSessionToken, setAuthCookies } from "@/lib/auth";
import { checkRateLimit, error, json, preflight } from "@/lib/api-utils";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 20, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request);

  if (!auth.ok) {
    return auth.response;
  }

  const rotated = await rotateSessionToken(auth.auth.token, request);

  if (!rotated) {
    return error("Session could not be refreshed.", 401);
  }

  const response = json({
    ok: true,
    data: {
      refreshedAt: new Date().toISOString()
    }
  });

  setAuthCookies(response, rotated, auth.auth.user.role);

  return response;
}
