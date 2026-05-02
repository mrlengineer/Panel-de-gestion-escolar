import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

type AuthOk = { ok: true; userId: string; role: Role };
type AuthFail = { ok: false; response: NextResponse };
type AuthResult = AuthOk | AuthFail;

/**
 * Call inside an API route handler.
 * Pass allowed roles; omit to allow any authenticated user.
 * Returns { ok: true, userId, role } or { ok: false, response } (401/403).
 */
export async function requireAuth(...roles: Role[]): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (roles.length > 0 && !roles.includes(session.user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.user.id, role: session.user.role };
}

/** Convenience constants */
export const ADMIN_ONLY: Role[] = ["ADMIN"];
export const ADMIN_FINANCE: Role[] = ["ADMIN", "FINANCE"];
export const ADMIN_TEACHER: Role[] = ["ADMIN", "TEACHER"];
export const ALL_ROLES: Role[] = ["ADMIN", "TEACHER", "FINANCE"];
