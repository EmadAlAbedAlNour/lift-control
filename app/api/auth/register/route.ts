import { NextRequest } from "next/server";

import { createSessionForUser, setAuthCookies, hashPassword } from "@/lib/auth";
import { checkRateLimit, error, json, preflight, validateBody } from "@/lib/api-utils";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { createUser, getUserByEmail, toPublicUser } from "@/lib/data-access";
import { trackEvent } from "@/lib/integrations/analytics";
import { authRegisterSchema } from "@/lib/schemas";

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 20, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const validated = await validateBody(request, authRegisterSchema);

  if (!validated.success) {
    return validated.response;
  }

  const existing = await getUserByEmail(validated.data.email);

  if (existing) {
    return error("هذا البريد مستخدم مسبقا.", 409);
  }

  const passwordHash = await hashPassword(validated.data.password);
  const user = await createUser({
    name: validated.data.name,
    email: validated.data.email,
    phone: validated.data.phone,
    passwordHash,
    avatarUrl: DEFAULT_IMAGE_URLS.employeeAvatar
  });

  const publicUser = toPublicUser(user);
  const sessionToken = await createSessionForUser(publicUser, request);

  const response = json(
    {
      ok: true,
      data: {
        user: publicUser
      }
    },
    201
  );

  setAuthCookies(response, sessionToken, publicUser.role);

  await trackEvent({
    event: "auth_register",
    userId: publicUser.id,
    metadata: {
      role: publicUser.role
    }
  });

  return response;
}
