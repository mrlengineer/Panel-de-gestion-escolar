"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import { AttendanceWithDetails } from "@/types";
import { formatShortDate } from "@/lib/utils";

type AttStatus = "PRESENT" | "ABSENT" | "LATE";

interface Course { id: string; name: string; }
interface Student { id: string; firstName: string; lastName: string; }

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
    ]).then(([c, s]) => {
      setCourses(c);
      setStudents(s);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`/api/attendance?courseId=${selectedCourse}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => { setAttendance(data); setLoading(false); });
  }, [selectedCourse, selectedDate]);

  const getStatus = (studentId: string): AttStatus | undefined => {
    return attendance.find((a) => a.studentId === studentId)?.status as AttStatus | undefined;
  };

  const markAttendance = async (studentId: string, status: AttStatus) => {
    setSaving(studentId);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId: selectedCourse,
        date: selectedDate,
        status,
      }),
    });

    const updated = await fetch(
      `/api/attendance?courseId=${selectedCourse}&date=${selectedDate}`
    ).then((r) => r.json());
    setAttendance(updated);
    setSaving(null);
  };

  const statusVariant = (status?: AttStatus) => {
    if (status === "PRESENT") return "success";
    if (status === "LATE") return "warning";
    if (status === "ABSENT") return "danger";
    return "default";
  };

  const courseOptions = [
    { label: "Select a course", value: "" },
    ...courses.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-end gap-4 flex-wrap">
          <Select
            label="Course"
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            options={courseOptions}
            className="w-56"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium text-text-primary">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>
      </Card>

      {selectedCourse && (
        <Card>
          {loading ? (
            <p className="text-text-muted text-sm py-6 text-center">Loading...</p>
          ) : (
            <Table
              headers={["Student", "Status", "Mark Present", "Mark Absent", "Mark Late"]}
              isEmpty={students.length === 0}
              emptyMessage="No students found."
            >
              {students.map((s) => {
                const status = getStatus(s.id);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 px-4 first:pl-0 font-medium text-text-primary">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(status)}>
                        {status ? status.toLowerCase() : "—"}
                      </Badge>
                    </td>
                    {(["PRESENT", "ABSENT", "LATE"] as AttStatus[]).map((att) => (
                      <td key={att} className="py-3 px-4">
                        <button
                          onClick={() => markAttendance(s.id, att)}
                          disabled={saving === s.id}
                          className={`w-7 h-7 rounded-full border text-xs font-bold transition-all ${
                            status === att
                              ? att === "PRESENT"
                                ? "bg-success text-white border-success"
                                : att === "ABSENT"
                                ? "bg-danger text-white border-danger"
                                : "bg-warning text-white border-warning"
                              : "border-border text-text-muted hover:border-accent/60"
                          }`}
                        >
                          {att === "PRESENT" ? "P" : att === "ABSENT" ? "A" : "L"}
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
