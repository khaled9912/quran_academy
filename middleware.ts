import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/",
  "/about",
  "/courses",
  "/contact",
];

const ROLE_PATHS: Record<string, RegExp[]> = {
  admin: [/^\/admin(\/|$)/],
  teacher: [/^\/teacher(\/|$)/],
  student: [
    /^\/student-dashboard(\/|$)/,
    /^\/courses(\/|$)/,
    /^\/schedule(\/|$)/,
    /^\/assignments(\/|$)/,
  ],
  parent: [/^\/parent(\/|$)/],
};

function getRoleFromCookie(req: NextRequest): string | null {
  const role = req.cookies.get("user-role")?.value;
  return role ?? null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get("sb-access-token")?.value ??
    req.cookies.get("sb-refresh-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = getRoleFromCookie(req);
  if (role) {
    const allowedPaths = ROLE_PATHS[role];
    if (
      allowedPaths &&
      allowedPaths.some((pattern) => pattern.test(pathname))
    ) {
      return NextResponse.next();
    }
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student-dashboard/:path*",
    "/schedule/:path*",
    "/courses/:path*",
    "/assignments/:path*",
    "/parent/:path*",
  ],
};
