import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/about", "/courses", "/contact"];
const AUTH_PATHS = ["/login", "/signup", "/register", "/forgot-password"];

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin: "/super-admin/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

const ROLE_PATHS: Record<string, RegExp[]> = {
  super_admin: [/^\/super-admin(\/|$)/, /^\/admin(\/|$)/],
  admin: [/^\/admin(\/|$)/],
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

  const token = req.cookies.get("academy-auth")?.value;
  const role = getRoleFromCookie(req);

  // 1. Always allow public and auth pages. Auth pages must stay reachable even
  // when a stale cookie exists; the AuthProvider redirects to the role
  // dashboard only after /api/auth/me validates the session. Redirecting here
  // on cookie presence alone can loop /login -> /dashboard -> /login.
  if (PUBLIC_PATHS.includes(pathname) || AUTH_PATHS.includes(pathname)) {
    return NextResponse.next();
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
    "/super-admin/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/student-dashboard/:path*",
    "/teachers",
    "/teachers/:path*",
    "/schedule",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
