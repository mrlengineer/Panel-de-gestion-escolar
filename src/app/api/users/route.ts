import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, ADMIN_ONLY } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const a = await requireAuth(...ADMIN_ONLY);
  if (!a.ok) return a.response;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: role ? { role: role as "ADMIN" | "TEACHER" | "FINANCE" } : {},
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
