import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, ADMIN_ONLY, ALL_ROLES } from "@/lib/rbac";

const courseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  monthlyPrice: z.number().positive(),
  schedule: z.string().min(1),
  maxCapacity: z.number().int().positive(),
  teacherId: z.string().min(1),
});

export async function GET() {
  const a = await requireAuth(...ALL_ROLES);
  if (!a.ok) return a.response;

  const courses = await prisma.course.findMany({
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const a = await requireAuth(...ADMIN_ONLY);
  if (!a.ok) return a.response;

  const body = await req.json();
  const parsed = courseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const course = await prisma.course.create({ data: parsed.data });

  return NextResponse.json(course, { status: 201 });
}
