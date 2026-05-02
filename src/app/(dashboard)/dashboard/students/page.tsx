"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import SearchInput from "@/components/ui/SearchInput";
import StudentForm from "@/components/students/StudentForm";
import { Student } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StudentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch(`/api/students?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditTarget(null);
    fetchStudents();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="w-64"
        />
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={15} />
            Add Student
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-4 border-b border-border/50 last:border-0">
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-36" />
                  <div className="skeleton h-2.5 w-24" />
                </div>
                <div className="skeleton h-3 w-44" />
                <div className="skeleton h-5 w-14 rounded-full" />
                <div className="skeleton h-3 w-20" />
                <div className="flex items-center gap-2">
                  <div className="skeleton h-6 w-6 rounded-md" />
                  <div className="skeleton h-6 w-6 rounded-md" />
                  <div className="skeleton h-6 w-6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <Users size={22} className="text-text-muted" />
            </div>
            <p className="font-medium text-text-primary">
              {search ? "No students match your search" : "No students yet"}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {search ? "Try a different name or email." : "Add your first student to get started."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-xs text-text-muted">
              <span>
                <span className="font-semibold text-text-primary">{students.length}</span> student{students.length !== 1 ? "s" : ""}
                {search && " found"}
              </span>
            </div>
            <Table
              headers={["Name", "Email", "Status", "Joined", "Actions"]}
              isEmpty={false}
            >
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-surface-2/40 transition-colors">
                  <td className="py-3 px-4 first:pl-0">
                    <p className="font-medium text-text-primary">
                      {s.firstName} {s.lastName}
                    </p>
                    {s.phone && <p className="text-xs text-text-muted">{s.phone}</p>}
                  </td>
                  <td className="py-3 px-4 text-text-muted text-sm">{s.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "default"}>
                      {s.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs">{formatDate(s.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/students/${s.id}`}>
                        <Button variant="ghost" size="sm" title="View profile">
                          <Eye size={13} />
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() => { setEditTarget(s); setShowForm(true); }}
                        >
                          <Pencil size={13} />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 size={13} className="text-danger" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </>
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        title={editTarget ? "Edit Student" : "Add Student"}
      >
        <StudentForm
          student={editTarget}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
}
