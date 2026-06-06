import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth-token";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { canAccessRoute } from "@/config/permissions";
import {
  isManagementUser,
  isProjectOnlyAllowedPath,
  isProjectOnlyUser,
} from "@/lib/project-access";
import { AUTH_ROUTES, PROTECTED_PATHS } from "@/routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isLogin = AUTH_ROUTES.includes(pathname);
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isLogin && session) {
    const target = isProjectOnlyUser(session)
      ? "/projects/check"
      : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isProtected && session && isProjectOnlyUser(session)) {
    if (!isProjectOnlyAllowedPath(pathname)) {
      return NextResponse.redirect(new URL("/projects/check", request.url));
    }
    return NextResponse.next();
  }

  if (isProtected && session && !canAccessRoute(session.role, pathname)) {
    const target = isManagementUser(session) ? "/dashboard" : "/projects/check";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard",
    "/dashboard/:path*",
    "/client-management",
    "/client-management/:path*",
    "/client-login",
    "/client-login/:path*",
    "/parent-modules",
    "/parent-modules/:path*",
    "/sub-modules",
    "/sub-modules/:path*",
    "/child-modules",
    "/child-modules/:path*",
    "/plans",
    "/plans/:path*",
    "/plans-tracker",
    "/plans-tracker/:path*",
    "/projects",
    "/projects/:path*",
    "/portal",
    "/portal/:path*",
    "/role-master",
    "/role-master/:path*",
    "/payment-type-master",
    "/payment-type-master/:path*",
    "/transaction-master",
    "/transaction-master/:path*",
    "/permission-master",
    "/permission-master/:path*",
    "/project-permission-master",
    "/project-permission-master/:path*",
    "/project-role-master",
    "/project-role-master/:path*",
    "/employee-master",
    "/employee-master/:path*",
    "/restaurant-master",
    "/restaurant-master/:path*",
  ],
};
