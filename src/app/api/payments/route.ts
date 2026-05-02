import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const paymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(["CASH", "CARD", "ZELLE", "PAYPAL"]),
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const studentId = searchParams.get("studentId");

  const payments = await prisma.payment.findMany({
    where: {
      ...(status ? { status: status as "PENDING" | "COMPLETED" | "REFUNDED" } : {}),
      ...(studentId ? { studentId } : {}),
    },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      ...parsed.data,
      paidAt: parsed.data.status === "COMPLETED" ? new Date() : undefined,
    },
    include: { student: true },
  });

  return NextResponse.json(payment, { status: 201 });
}
