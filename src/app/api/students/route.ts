import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, ADMIN_ONLY, ALL_ROLES } from "@/lib/rbac";

const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function GET(req: NextRequest) {
  const a = await requireAuth(...ALL_ROLES);
  if (!a.ok) return a.response;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");

  const students = await prisma.student.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status: status as "ACTIVE" | "INACTIVE" } : {},
      ],
    },
    include: {
      _count: { select: { enrollments: true, payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const a = await requireAuth(...ADMIN_ONLY);
  if (!a.ok) return a.response;

  const body = await req.json();
  const parsed = studentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { birthDate, ...rest } = parsed.data;

  const student = await prisma.student.create({
    data: {
      ...rest,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    },
  });

  return NextResponse.json(student, { status: 201 });
}
