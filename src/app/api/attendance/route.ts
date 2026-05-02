import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const attendanceSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  date: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const date = searchParams.get("date");

  const attendance = await prisma.attendance.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(date ? { date: { gte: new Date(date), lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) } } : {}),
    },
    include: { student: true, course: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(attendance);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = attendanceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;

  const record = await prisma.attendance.upsert({
    where: {
      studentId_courseId_date: {
        studentId: rest.studentId,
        courseId: rest.courseId,
        date: new Date(date),
      },
    },
    update: { status: rest.status },
    create: { ...rest, date: new Date(date) },
    include: { student: true },
  });

  return NextResponse.json(record);
}
