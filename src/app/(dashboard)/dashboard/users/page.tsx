"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import SearchInput from "@/components/ui/SearchInput";
import UserForm, { PublicUser } from "@/components/users/UserForm";
import { formatDate } from "@/lib/utils";

const roleBadge: Record<string, "success" | "warning" | "info" | "default"> = {
  ADMIN: "success",
  TEACHER: "info",
  FINANCE: "warning",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  FINANCE: "Finance",
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<PublicUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PublicUser | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search, status, session]);

  const handleDelete = async (user: PublicUser) => {
    if (!confirm(`¿Eliminar la cuenta de ${user.name}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data?.error ?? "Error al eliminar el usuario.");
      return;
    }
    fetchUsers();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditTarget(null);
    fetchUsers();
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
    return null;
  }

  const currentUserId = session?.user?.id;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="w-64"
        />
        <Button onClick={() => setShowForm(true)}>
          <Plus size={15} />
          New account
        </Button>
      </div>

      <Card>
        {loading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-4 border-b border-border/50 last:border-0">
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-36" />
                  <div className="skeleton h-2.5 w-44" />
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-3 w-20" />
                <div className="flex items-center gap-2">
                  <div className="skeleton h-6 w-6 rounded-md" />
                  <div className="skeleton h-6 w-6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={22} className="text-text-muted" />
            </div>
            <p className="font-medium text-text-primary">
              {search ? "No accounts match your search" : "No accounts yet"}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {search ? "Try a different name or email." : "Create the first account to get started."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-xs text-text-muted">
              <span>
                <span className="font-semibold text-text-primary">{users.length}</span>{" "}
                account{users.length !== 1 ? "s" : ""}
                {search && " found"}
              </span>
            </div>
            <Table headers={["Name", "Email", "Role", "Created", "Actions"]} isEmpty={false}>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-surface-2/40 transition-colors">
                  <td className="py-3 px-4 first:pl-0">
                    <p className="font-medium text-text-primary">
                      {u.name}
                      {u.id === currentUserId && (
                        <span className="ml-2 text-[10px] text-text-muted font-normal">(you)</span>
                      )}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-sm">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={roleBadge[u.role] ?? "default"}>
                      {roleLabel[u.role] ?? u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit"
                        onClick={() => { setEditTarget(u); setShowForm(true); }}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        disabled={u.id === currentUserId}
                        onClick={() => handleDelete(u)}
                      >
                        <Trash2 size={13} className={u.id === currentUserId ? "text-text-muted" : "text-danger"} />
                      </Button>
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
        title={editTarget ? "Edit account" : "Create account"}
      >
        <UserForm
          user={editTarget}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
}
