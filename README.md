# SchoolDesk — School Management Dashboard

A full-stack web app for managing students, courses, enrollments, payments, and attendance. Built as a portfolio project using Next.js, TypeScript, Prisma, and TailwindCSS.

---

## Features

- **Authentication** with role-based access (Admin, Teacher, Finance)
- **Dashboard** with live stats: total students, active courses, monthly revenue, pending payments
- **Students** — full CRUD with profile page, payment history, and enrollment summary
- **Courses** — create/edit courses, assign teachers, set capacity and pricing
- **Enrollments** — enroll students in courses, track status (pending / paid / cancelled)
- **Payments** — record manual payments, filter by status, mark as complete
- **Attendance** — mark present/absent/late per class per day, edit any session
- **Reports** — monthly revenue bar chart, top courses by enrollment, students with pending balance

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 15, React 19, TypeScript  |
| Styling   | TailwindCSS, Lucide icons         |
| Charts    | Recharts                          |
| Backend   | Next.js API Routes                |
| Database  | PostgreSQL                        |
| ORM       | Prisma 5                          |
| Auth      | NextAuth.js v5 (JWT strategy)     |
| Validation| Zod                               |

---

## Screenshots

> Add screenshots to `/public/screenshots/` and update the paths below.

| Dashboard | Students | Payments |
|-----------|----------|----------|
| ![Dashboard](public/screenshots/dashboard.png) | ![Students](public/screenshots/students.png) | ![Payments](public/screenshots/payments.png) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted, e.g. [Neon](https://neon.tech), Supabase, Railway)

### Installation

```bash
git clone https://github.com/your-username/Panel-de-gestion-escolar.git
cd Panel-de-gestion-escolar
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/school_db"
NEXTAUTH_SECRET="a-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
```

> For `NEXTAUTH_SECRET` you can run `openssl rand -base64 32` to generate one.

### Database Setup

```bash
# Push the schema to your database
npm run db:push

# Seed with demo data (users, courses, students)
npm run db:seed
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page.

**Demo accounts** (password: `admin123`):

| Role    | Email                  |
|---------|------------------------|
| Admin   | admin@school.com       |
| Teacher | teacher@school.com     |
| Finance | finance@school.com     |

---

## API Routes

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/students`             | List students (search + filter)    |
| POST   | `/api/students`             | Create student                     |
| GET    | `/api/students/:id`         | Get student profile with history   |
| PATCH  | `/api/students/:id`         | Update student                     |
| DELETE | `/api/students/:id`         | Delete student                     |
| GET    | `/api/courses`              | List all courses                   |
| POST   | `/api/courses`              | Create course                      |
| PATCH  | `/api/courses/:id`          | Update course                      |
| DELETE | `/api/courses/:id`          | Delete course                      |
| GET    | `/api/enrollments`          | List enrollments (filter by status)|
| POST   | `/api/enrollments`          | Enroll student in course           |
| PATCH  | `/api/enrollments/:id`      | Update enrollment status           |
| DELETE | `/api/enrollments/:id`      | Remove enrollment                  |
| GET    | `/api/payments`             | List payments (filter by status)   |
| POST   | `/api/payments`             | Record a payment                   |
| PATCH  | `/api/payments/:id`         | Update payment status              |
| DELETE | `/api/payments/:id`         | Delete payment                     |
| GET    | `/api/attendance`           | Get attendance (by course + date)  |
| POST   | `/api/attendance`           | Mark/update attendance             |
| GET    | `/api/reports`              | Revenue, top courses, debtors      |
| GET    | `/api/users`                | List users (optional role filter)  |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Login page
│   ├── (dashboard)/dashboard/  # All dashboard pages
│   │   ├── students/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   ├── payments/
│   │   ├── attendance/
│   │   └── reports/
│   └── api/                    # API route handlers
├── components/
│   ├── ui/                     # Button, Input, Badge, Card, Modal, Table, Select
│   ├── layout/                 # Sidebar, Header
│   ├── dashboard/              # StatCard, RecentEnrollments
│   ├── students/               # StudentForm
│   └── courses/                # CourseForm
├── lib/                        # prisma.ts, auth.ts, utils.ts
├── types/                      # Shared TypeScript types
└── middleware.ts               # Auth route protection
prisma/
├── schema.prisma
└── seed.ts
```

---

## Known Limitations

- No email notifications or reminders
- No file uploads (student photos, receipts)
- Roles are enforced at the UI level; API routes don't validate user role yet
- No pagination on large lists

---

## Future Improvements

- API-level role authorization
- PDF export for reports and invoices
- Email reminders for pending payments
- Student portal (separate role/view)
- Dark/light theme toggle

---

## Author

Built by **MrL** — [GitHub](https://github.com/mrlengineer) · [Portfolio](https://mrlengineer.github.io/MrLDev/)
Ft by **x1yzl** — [GitHub](https://github.com/x1yzl) · [Portfolio](https://x1yzl.github.io/)