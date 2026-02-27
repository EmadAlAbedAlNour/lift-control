import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { error } from "@/lib/api-utils";
import { createSession, deleteSessionByHash, getSessionWithUser, roleAllows, toPublicUser } from "@/lib/data-access";
import { PlatformUser, UserRole } from "@/lib/types";

export const SESSION_COOKIE = "lift_session";
export const ROLE_COOKIE = "lift_role";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const RESET_TOKEN_BYTES = 32;

interface SessionPayload {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
  jti: string;
  exp?: number;
  iat?: number;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set with at least 32 characters in production.");
  }

  return "dev-only-lift-control-secret-please-change-this";
}

function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");

  if (!forwarded) {
    return undefined;
  }

  return forwarded.split(",")[0]?.trim();
}

function tokenExpiryDate(): Date {
  return new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
}

function signSessionToken(user: PlatformUser): string {
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    jti: randomBytes(10).toString("hex")
  };

  return jwt.sign(payload, jwtSecret(), {
    expiresIn: SESSION_TTL_SECONDS
  });
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function setAuthCookies(response: NextResponse, token: string, role: UserRole): void {
  const baseConfig = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    ...baseConfig
  });

  response.cookies.set({
    name: ROLE_COOKIE,
    value: role,
    ...baseConfig
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0
  });

  response.cookies.set({
    name: ROLE_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0
  });
}

export async function createSessionForUser(user: PlatformUser, request: NextRequest): Promise<string> {
  const token = signSessionToken(user);

  await createSession({
    tokenHash: hashValue(token),
    userId: user.id,
    expiresAt: tokenExpiryDate(),
    ipAddress: getClientIp(request),
    userAgent: request.headers.get("user-agent") ?? undefined
  });

  return token;
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (!token) {
    return;
  }

  await deleteSessionByHash(hashValue(token));
}

export async function rotateSessionToken(currentToken: string, request: NextRequest): Promise<string | null> {
  const auth = await validateSessionToken(currentToken);

  if (!auth) {
    return null;
  }

  await deleteSessionByHash(hashValue(currentToken));
  const publicUser = toPublicUser(auth.user);
  return createSessionForUser(publicUser, request);
}

export async function validateSessionToken(token: string): Promise<
  | {
      user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: "USER" | "SUPERVISOR" | "ADMIN";
        avatarUrl: string;
        createdAt: Date;
      };
      payload: SessionPayload;
    }
  | null
> {
  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const record = await getSessionWithUser(hashValue(token));

  if (!record) {
    return null;
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await deleteSessionByHash(record.tokenHash);
    return null;
  }

  if (record.user.id !== payload.sub) {
    return null;
  }

  return {
    user: {
      id: record.user.id,
      name: record.user.name,
      email: record.user.email,
      phone: record.user.phone,
      role: record.user.role,
      avatarUrl: record.user.avatarUrl,
      createdAt: record.user.createdAt
    },
    payload
  };
}

export async function getAuthContext(request: NextRequest): Promise<
  | {
      user: PlatformUser;
      token: string;
    }
  | null
> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const validated = await validateSessionToken(token);

  if (!validated) {
    return null;
  }

  return {
    token,
    user: toPublicUser(validated.user)
  };
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<
  | {
      ok: true;
      auth: {
        user: PlatformUser;
        token: string;
      };
    }
  | {
      ok: false;
      response: NextResponse;
    }
> {
  const auth = await getAuthContext(request);

  if (!auth) {
    return {
      ok: false,
      response: error("Unauthorized", 401)
    };
  }

  if (allowedRoles && !roleAllows(auth.user.role, allowedRoles)) {
    return {
      ok: false,
      response: error("Forbidden", 403)
    };
  }

  return {
    ok: true,
    auth
  };
}

export async function getServerSessionUser(): Promise<PlatformUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const validated = await validateSessionToken(token);

  if (!validated) {
    return null;
  }

  return toPublicUser(validated.user);
}

export function issueResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(RESET_TOKEN_BYTES).toString("hex");

  return {
    token,
    tokenHash: hashValue(token)
  };
}
