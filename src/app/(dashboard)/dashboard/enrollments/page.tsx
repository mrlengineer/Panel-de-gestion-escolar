"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import SearchInput from "@/components/ui/SearchInput";
import { EnrollmentWithDetails } from "@/types";
import { formatDate } from "@/lib/utils";

type StatusFilter = "" | "PENDING" | "PAID" | "CANCELLED";

interface Student { id: string; firstName: string; lastName: string; }
interface Course { id: string; name: string; }

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function EnrollmentsPage() {
  const { data: session } = useSession();
  const canWrite = ["ADMIN", "FINANCE"].includes(session?.user?.role ?? "");
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newEnrollment, setNewEnrollment] = useState({ studentId: "", courseId: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchEnrollments = async () => {
    setLoading(true);
    const res = await fetch(`/api/enrollments${statusFilter ? `?status=${statusFilter}` : ""}`);
    setEnrollments(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchEnrollments(); }, [statusFilter]);

  useEffect(() => {
    if (showForm) {
      Promise.all([
        fetch("/api/students").then((r) => r.json()),
        fetch("/api/courses").then((r) => r.json()),
      ]).then(([s, c]) => { setStudents(s); setCourses(c); });
    }
  }, [showForm]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this enrollment?")) return;
    await fetch(`/api/enrollments/${id}`, { method: "DELETE" });
    fetchEnrollments();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchEnrollments();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEnrollment),
    });

    if (res.ok) {
      setShowForm(false);
      setNewEnrollment({ studentId: "", courseId: "" });
      fetchEnrollments();
    } else {
      const data = await res.json();
      setFormError(data?.error ?? "Something went wrong.");
    }
    setFormLoading(false);
  };

  const statusBadge = (status: string) => {
    if (status === "PAID") return "success";
    if (status === "PENDING") return "warning";
    return "danger";
  };

  const q = search.toLowerCase();
  const filtered = search
    ? enrollments.filter(
        (e) =>
          `${e.student.firstName} ${e.student.lastName}`.toLowerCase().includes(q) ||
          e.course.name.toLowerCase().includes(q)
      )
    : enrollments;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter tabs */}
        <div className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatusFilter(t.value)}
              className={`tab-item ${statusFilter === t.value ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by student or course…"
          className="w-56"
        />
        {canWrite && (
          <div className="ml-auto">
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} />
              Enroll Student
            </Button>
          </div>
        )}
      </div>

      <Card>
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-4 border-b border-border/50 last:border-0">
                <div className="skeleton h-3.5 w-32" />
                <div className="skeleton h-3 w-44" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-6 w-6 rounded-md" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={22} className="text-text-muted" />
            </div>
            <p className="font-medium text-text-primary">No enrollments found</p>
            <p className="text-sm text-text-muted mt-1">
              {statusFilter ? `No ${statusFilter.toLowerCase()} enrollments.` : "Start by enrolling a student in a course."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-muted mb-3">
              <span className="font-semibold text-text-primary">{filtered.length}</span> enrollment{filtered.length !== 1 ? "s" : ""}
              {search && ` for “${search}”`}
            </p>
            <Table
              headers={["Student", "Course", "Status", "Enrolled", "Actions"]}
              isEmpty={false}
            >
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-text-muted">No results for &ldquo;{search}&rdquo;</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/30 hover:bg-surface-2/40 transition-colors">
                  <td className="py-3 px-4 first:pl-0 text-text-primary font-medium">
                    {e.student.firstName} {e.student.lastName}
                  </td>
                  <td className="py-3 px-4 text-text-muted text-sm">{e.course.name}</td>
                  <td className="py-3 px-4">
                    {canWrite ? (
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                        className="bg-surface-2 text-xs border border-border rounded-md px-2 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : (
                      <Badge variant={statusBadge(e.status)}>
                        {e.status.toLowerCase()}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs">{formatDate(e.enrolledAt)}</td>
                  <td className="py-3 px-4">
                    {canWrite && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
                        <Trash2 size={13} className="text-danger" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </>
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Enroll Student">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Student"
            id="studentId"
            value={newEnrollment.studentId}
            onChange={(e) => setNewEnrollment((p) => ({ ...p, studentId: e.target.value }))}
            options={[
              { label: "Select student", value: "" },
              ...students.map((s) => ({
                label: `${s.firstName} ${s.lastName}`,
                value: s.id,
              })),
            ]}
          />
          <Select
            label="Course"
            id="courseId"
            value={newEnrollment.courseId}
            onChange={(e) => setNewEnrollment((p) => ({ ...p, courseId: e.target.value }))}
            options={[
              { label: "Select course", value: "" },
              ...courses.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
          {formError && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Enrolling…" : "Enroll"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
