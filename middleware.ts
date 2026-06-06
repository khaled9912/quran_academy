import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/about", "/courses", "/teachers", "/contact"];
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

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
  student: [/^\/student(\/|$)/, /^\/student-dashboard(\/|$)/],
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

  const token = req.cookies.get("sb-access-token")?.value;
  const role = getRoleFromCookie(req);

  // 1. If trying to access login/register while logged in, redirect to dashboard
  if (token && role && AUTH_PATHS.includes(pathname)) {
    const dashboard = ROLE_DASHBOARDS[role] || "/";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // 2. Allow public paths without auth
  if (PUBLIC_PATHS.includes(pathname) || AUTH_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Reject if not logged in
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
    "/login",
    "/register",
    "/forgot-password",
  ],
};
