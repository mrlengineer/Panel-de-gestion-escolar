import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, ADMIN_ONLY, ADMIN_FINANCE } from "@/lib/rbac";

const updateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = await requireAuth(...ADMIN_FINANCE);
  if (!a.ok) return a.response;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(enrollment);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = await requireAuth(...ADMIN_ONLY);
  if (!a.ok) return a.response;

  const { id } = await params;

  await prisma.enrollment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
