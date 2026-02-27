import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

interface RateState {
  count: number;
  windowStart: number;
}

const rateMap = new Map<string, RateState>();

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${ip}:${request.nextUrl.pathname}`;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export function json<T>(payload: T, status = 200): NextResponse {
  return applySecurityHeaders(NextResponse.json(payload, { status }));
}

export function error(message: string, status = 400, details?: unknown): NextResponse {
  return json(
    {
      ok: false,
      error: {
        message,
        details
      }
    },
    status
  );
}

export function preflight(): NextResponse {
  return applySecurityHeaders(new NextResponse(null, { status: 204 }));
}

export async function validateBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      response: NextResponse;
    }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: error("Invalid JSON payload.", 400)
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      response: error("Validation failed.", 422, parsed.error.flatten())
    };
  }

  return {
    success: true,
    data: parsed.data
  };
}

export function checkRateLimit(
  request: NextRequest,
  options: { limit?: number; windowMs?: number } = {}
): NextResponse | null {
  const limit = options.limit ?? 80;
  const windowMs = options.windowMs ?? 60_000;
  const key = getClientIdentifier(request);
  const now = Date.now();
  const current = rateMap.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    rateMap.set(key, { count: 1, windowStart: now });
    return null;
  }

  if (current.count >= limit) {
    return error("Rate limit exceeded. Try again in a minute.", 429);
  }

  current.count += 1;
  rateMap.set(key, current);
  return null;
}
