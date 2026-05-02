import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, ADMIN_FINANCE, ALL_ROLES } from "@/lib/rbac";

const enrollmentSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
});

export async function GET(req: NextRequest) {
  const a = await requireAuth(...ALL_ROLES);
  if (!a.ok) return a.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const enrollments = await prisma.enrollment.findMany({
    where: status ? { status: status as "PENDING" | "PAID" | "CANCELLED" } : {},
    include: {
      student: true,
      course: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json(enrollments);
}

export async function POST(req: NextRequest) {
  const a = await requireAuth(...ADMIN_FINANCE);
  if (!a.ok) return a.response;

  const body = await req.json();
  const parsed = enrollmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parsed.data.studentId,
        courseId: parsed.data.courseId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Student is already enrolled in this course." },
      { status: 409 }
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: parsed.data,
    include: { student: true, course: true },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
