import { PrismaClient, Role, PaymentMethod, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@school.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@school.com" },
    update: {},
    create: {
      name: "Maria Lopez",
      email: "teacher@school.com",
      password: hashedPassword,
      role: Role.TEACHER,
    },
  });

  await prisma.user.upsert({
    where: { email: "finance@school.com" },
    update: {},
    create: {
      name: "Carlos Ruiz",
      email: "finance@school.com",
      password: hashedPassword,
      role: Role.FINANCE,
    },
  });

  const course1 = await prisma.course.upsert({
    where: { id: "seed-course-1" },
    update: {},
    create: {
      id: "seed-course-1",
      name: "Mathematics",
      description: "Basic and intermediate algebra",
      monthlyPrice: 80,
      schedule: "Mon/Wed 9:00 AM - 11:00 AM",
      maxCapacity: 20,
      teacherId: teacher.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: "seed-course-2" },
    update: {},
    create: {
      id: "seed-course-2",
      name: "English",
      description: "Conversational and written English",
      monthlyPrice: 75,
      schedule: "Tue/Thu 2:00 PM - 4:00 PM",
      maxCapacity: 15,
      teacherId: admin.id,
    },
  });

  const student1 = await prisma.student.upsert({
    where: { email: "juan.perez@email.com" },
    update: {},
    create: {
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@email.com",
      phone: "+1-555-0101",
    },
  });

  const student2 = await prisma.student.upsert({
    where: { email: "ana.garcia@email.com" },
    update: {},
    create: {
      firstName: "Ana",
      lastName: "Garcia",
      email: "ana.garcia@email.com",
      phone: "+1-555-0102",
    },
  });

  const student3 = await prisma.student.upsert({
    where: { email: "luis.torres@email.com" },
    update: {},
    create: {
      firstName: "Luis",
      lastName: "Torres",
      email: "luis.torres@email.com",
      phone: "+1-555-0103",
    },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student1.id, courseId: course1.id } },
    update: {},
    create: { studentId: student1.id, courseId: course1.id, status: "PAID" },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student2.id, courseId: course1.id } },
    update: {},
    create: { studentId: student2.id, courseId: course1.id, status: "PENDING" },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student3.id, courseId: course2.id } },
    update: {},
    create: { studentId: student3.id, courseId: course2.id, status: "PAID" },
  });

  await prisma.payment.createMany({
    data: [
      {
        studentId: student1.id,
        amount: 80,
        method: PaymentMethod.CASH,
        status: "COMPLETED",
        paidAt: new Date(),
      },
      {
        studentId: student2.id,
        amount: 80,
        method: PaymentMethod.ZELLE,
        status: "PENDING",
      },
      {
        studentId: student3.id,
        amount: 75,
        method: PaymentMethod.PAYPAL,
        status: "COMPLETED",
        paidAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  const today = new Date();
  await prisma.attendance.createMany({
    data: [
      { studentId: student1.id, courseId: course1.id, date: today, status: AttendanceStatus.PRESENT },
      { studentId: student2.id, courseId: course1.id, date: today, status: AttendanceStatus.LATE },
      { studentId: student3.id, courseId: course2.id, date: today, status: AttendanceStatus.PRESENT },
    ],
    skipDuplicates: true,
  });

  console.log("Done! Seeded users, courses, students, enrollments, payments, attendance.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
