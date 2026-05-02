"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { EnrollmentWithDetails } from "@/types";
import { formatDate } from "@/lib/utils";

type StatusFilter = "" | "PENDING" | "PAID" | "CANCELLED";

interface Student { id: string; firstName: string; lastName: string; }
interface Course { id: string; name: string; }

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(["", "PENDING", "PAID", "CANCELLED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                statusFilter === s
                  ? "bg-accent text-white border-accent"
                  : "text-text-muted border-border hover:border-accent/50"
              }`}
            >
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={15} />
          Enroll Student
        </Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-text-muted text-sm py-8 text-center">Loading...</p>
        ) : (
          <Table
            headers={["Student", "Course", "Status", "Date", "Actions"]}
            isEmpty={enrollments.length === 0}
            emptyMessage="No enrollments found."
          >
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                <td className="py-3 px-4 first:pl-0 text-text-primary font-medium">
                  {e.student.firstName} {e.student.lastName}
                </td>
                <td className="py-3 px-4 text-text-muted">{e.course.name}</td>
                <td className="py-3 px-4">
                  <select
                    value={e.status}
                    onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                    className="bg-transparent text-xs border border-border rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-text-muted text-xs">{formatDate(e.enrolledAt)}</td>
                <td className="py-3 px-4">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
                    <Trash2 size={13} className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
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
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Enrolling..." : "Enroll"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
