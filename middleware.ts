import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  REGISTRATION_COOKIE,
  isRegistrationAllowed,
  registrationCountryFromHeaders,
} from "@/lib/registration";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/courses",
  "/contact",
  "/blog",
  "/teach",
  "/registration-unavailable",
];
const AUTH_PATHS = ["/login", "/signup", "/register", "/forgot-password"];
const REGISTRATION_PATHS = ["/signup", "/register"];
const REGISTRATION_API_PATHS = ["/api/auth/register", "/api/auth/otp/verify"];

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin: "/super-admin/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  support: "/support/transcripts",
};

const ROLE_PATHS: Record<string, RegExp[]> = {
  super_admin: [/^\/super-admin(\/|$)/, /^\/admin(\/|$)/, /^\/support(\/|$)/],
  admin: [/^\/admin(\/|$)/, /^\/support(\/|$)/],
  support: [/^\/support(\/|$)/],
  teacher: [/^\/teacher(\/|$)/],
  student: [
    /^\/student(\/|$)/,
    /^\/student-dashboard(\/|$)/,
    /^\/schedule(\/|$)/,
    /^\/teachers(\/|$)/,
  ],
};

function getRoleFromCookie(req: NextRequest): string | null {
  return req.cookies.get("user-role")?.value ?? null;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const country =
    registrationCountryFromHeaders(req.headers) ??
    (process.env.NODE_ENV === "development" ? "US" : null);

  const withCountry = (response: NextResponse) => {
    if (country) {
      response.cookies.set(REGISTRATION_COOKIE, country, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return response;
  };

  // Keep the API's registration check anchored to the hosting geo header,
  // overwriting any client-supplied value.
  if (REGISTRATION_API_PATHS.includes(pathname)) {
    const headers = new Headers(req.headers);
    if (country) headers.set("x-registration-country", country);
    else headers.delete("x-registration-country");
    return NextResponse.next({ request: { headers } });
  }

  // Hide the registration page itself for countries outside the allowlist.
  if (
    REGISTRATION_PATHS.includes(pathname) &&
    country &&
    !isRegistrationAllowed(country)
  ) {
    return withCountry(
      NextResponse.redirect(new URL("/registration-unavailable", req.url))
    );
  }

  const token = req.cookies.get("academy-auth")?.value;
  const role = getRoleFromCookie(req);

  // 1. Always allow public and auth pages. Auth pages must stay reachable even
  // when a stale cookie exists; the AuthProvider redirects to the role
  // dashboard only after /api/auth/me validates the session. Redirecting here
  // on cookie presence alone can loop /login -> /dashboard -> /login.
  if (isPublicPath(pathname) || AUTH_PATHS.includes(pathname)) {
    return withCountry(NextResponse.next());
  }

  // 2. Reject if not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. Validate role-based path access
  if (role) {
    const allowedPatterns = ROLE_PATHS[role];
    if (
      allowedPatterns &&
      allowedPatterns.some((pattern) => pattern.test(pathname))
    ) {
      return NextResponse.next();
    }
  }

  // Fallback: if user doesn't have access to this route, redirect to their dashboard or login
  if (role) {
    const dashboard = ROLE_DASHBOARDS[role];
    if (dashboard && pathname !== dashboard) {
      return NextResponse.redirect(new URL(dashboard, req.url));
    }
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/courses",
    "/contact",
    "/blog",
    "/blog/:path*",
    "/teach",
    "/registration-unavailable",
    "/super-admin/:path*",
    "/admin/:path*",
    "/support/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/student-dashboard/:path*",
    "/teachers",
    "/teachers/:path*",
    "/schedule",
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/api/auth/register",
    "/api/auth/otp/verify",
  ],
};
