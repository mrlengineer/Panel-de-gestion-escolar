"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
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
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 w-64"
          />
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={15} />
            Add Student
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <p className="text-text-muted text-sm py-8 text-center">Loading...</p>
        ) : (
          <Table
            headers={["Name", "Email", "Status", "Joined", "Actions"]}
            isEmpty={students.length === 0}
            emptyMessage="No students found."
          >
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                <td className="py-3 px-4 first:pl-0">
                  <p className="font-medium text-text-primary">
                    {s.firstName} {s.lastName}
                  </p>
                  {s.phone && <p className="text-xs text-text-muted">{s.phone}</p>}
                </td>
                <td className="py-3 px-4 text-text-muted">{s.email}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === "ACTIVE" ? "success" : "default"}>
                    {s.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-text-muted text-xs">{formatDate(s.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/students/${s.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={13} />
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => { setEditTarget(s); setShowForm(true); }}>
                        <Pencil size={13} />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={13} className="text-danger" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
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
