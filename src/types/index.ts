import {
  Student,
  Course,
  Enrollment,
  Payment,
  Attendance,
  User,
  EnrollmentStatus,
  PaymentMethod,
  PaymentStatus,
  AttendanceStatus,
  StudentStatus,
  Role,
} from "@prisma/client";

export type {
  Student,
  Course,
  Enrollment,
  Payment,
  Attendance,
  User,
  EnrollmentStatus,
  PaymentMethod,
  PaymentStatus,
  AttendanceStatus,
  StudentStatus,
  Role,
};

export type StudentWithEnrollments = Student & {
  enrollments: (Enrollment & { course: Course })[];
  payments: Payment[];
};

export type CourseWithTeacher = Course & {
  teacher: Pick<User, "id" | "name" | "email">;
  _count: { enrollments: number };
};

export type EnrollmentWithDetails = Enrollment & {
  student: Student;
  course: Course;
};

export type PaymentWithStudent = Payment & {
  student: Student;
};

export type AttendanceWithDetails = Attendance & {
  student: Student;
  course: Course;
};

export type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  pendingPayments: number;
  monthlyRevenue: number;
  activeCourses: number;
  recentEnrollments: EnrollmentWithDetails[];
};
