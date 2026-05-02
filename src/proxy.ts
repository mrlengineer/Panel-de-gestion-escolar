import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

/** Pages restricted to specific roles — everyone else is redirected to /dashboard */
const PAGE_ROLES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/payments",   roles: ["ADMIN", "FINANCE"] },
  { prefix: "/dashboard/attendance", roles: ["ADMIN", "TEACHER"] },
  { prefix: "/dashboard/reports",    roles: ["ADMIN", "FINANCE"] },
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isLoggedIn) {
    const role = req.auth?.user?.role as Role | undefined;
    for (const { prefix, roles } of PAGE_ROLES) {
      if (pathname.startsWith(prefix) && role && !roles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
