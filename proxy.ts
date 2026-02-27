import { NextRequest, NextResponse } from "next/server";

import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/auth";

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/settings",
  "/admin",
  "/catalog",
  "/products",
  "/sections",
  "/pages",
  "/customers",
  "/employees"
];

const ADMIN_ONLY_PATH_PREFIXES = ["/admin", "/products", "/sections", "/pages", "/customers", "/employees"];

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (isProtectedPath(pathname) && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isAdminOnlyPath(pathname) && role !== "admin") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/catalog/:path*",
    "/products/:path*",
    "/sections/:path*",
    "/pages/:path*",
    "/customers/:path*",
    "/employees/:path*"
  ]
};
