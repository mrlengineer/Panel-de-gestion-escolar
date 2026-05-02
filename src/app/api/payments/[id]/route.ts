import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "REFUNDED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  return NextResponse.json(payment);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.payment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
