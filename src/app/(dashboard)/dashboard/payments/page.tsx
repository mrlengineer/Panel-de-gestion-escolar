"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { PaymentWithStudent } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type TabType = "ALL" | "PENDING" | "COMPLETED";

interface Student { id: string; firstName: string; lastName: string; }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    method: "CASH",
    status: "COMPLETED",
    note: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    const status = tab === "ALL" ? "" : tab;
    const res = await fetch(`/api/payments${status ? `?status=${status}` : ""}`);
    setPayments(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [tab]);

  useEffect(() => {
    if (showForm) {
      fetch("/api/students").then((r) => r.json()).then(setStudents);
    }
  }, [showForm]);

  const handleMarkComplete = async (id: string) => {
    await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    fetchPayments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment record?")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    fetchPayments();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({ studentId: "", amount: "", method: "CASH", status: "COMPLETED", note: "" });
      fetchPayments();
    } else {
      setFormError("Check all fields.");
    }
    setFormLoading(false);
  };

  const methodBadge = (method: string) => {
    const map: Record<string, string> = {
      CASH: "💵", CARD: "💳", ZELLE: "📲", PAYPAL: "🅿",
    };
    return map[method] ?? method;
  };

  const statusVariant = (status: string) => {
    if (status === "COMPLETED") return "success";
    if (status === "PENDING") return "warning";
    return "default";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["ALL", "PENDING", "COMPLETED"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                tab === t
                  ? "bg-accent text-white border-accent"
                  : "text-text-muted border-border hover:border-accent/50"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={15} />
          Record Payment
        </Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-text-muted text-sm py-8 text-center">Loading...</p>
        ) : (
          <Table
            headers={["Student", "Amount", "Method", "Status", "Date", "Actions"]}
            isEmpty={payments.length === 0}
            emptyMessage="No payments found."
          >
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                <td className="py-3 px-4 first:pl-0 font-medium text-text-primary">
                  {p.student.firstName} {p.student.lastName}
                </td>
                <td className="py-3 px-4 text-text-primary font-semibold">
                  {formatCurrency(p.amount)}
                </td>
                <td className="py-3 px-4 text-text-muted text-xs">
                  {methodBadge(p.method)} {p.method.toLowerCase()}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusVariant(p.status)}>{p.status.toLowerCase()}</Badge>
                </td>
                <td className="py-3 px-4 text-text-muted text-xs">{formatDate(p.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {p.status === "PENDING" && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkComplete(p.id)} title="Mark as completed">
                        <CheckCircle size={13} className="text-success" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={13} className="text-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Student"
            id="studentId"
            value={form.studentId}
            onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
            options={[
              { label: "Select student", value: "" },
              ...students.map((s) => ({
                label: `${s.firstName} ${s.lastName}`,
                value: s.id,
              })),
            ]}
          />
          <Input
            label="Amount ($)"
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Method"
              id="method"
              value={form.method}
              onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
              options={[
                { label: "Cash", value: "CASH" },
                { label: "Card", value: "CARD" },
                { label: "Zelle", value: "ZELLE" },
                { label: "PayPal", value: "PAYPAL" },
              ]}
            />
            <Select
              label="Status"
              id="status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              options={[
                { label: "Completed", value: "COMPLETED" },
                { label: "Pending", value: "PENDING" },
              ]}
            />
          </div>
          <Input
            label="Note (optional)"
            id="note"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
          />
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Saving..." : "Save payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
