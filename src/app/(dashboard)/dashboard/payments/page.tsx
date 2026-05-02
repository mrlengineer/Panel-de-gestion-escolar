"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, CreditCard } from "lucide-react";
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

const METHOD_STYLES: Record<string, { label: string; cls: string }> = {
  CASH:   { label: "Cash",   cls: "bg-success/10 text-success border border-success/20" },
  CARD:   { label: "Card",   cls: "bg-accent/10 text-accent border border-accent/20" },
  ZELLE:  { label: "Zelle",  cls: "bg-warning/10 text-warning border border-warning/20" },
  PAYPAL: { label: "PayPal", cls: "bg-info/10 text-accent border border-accent/20" },
};

const TABS: { value: TabType; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
];

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
      setFormError("Please check all required fields.");
    }
    setFormLoading(false);
  };

  const statusVariant = (status: string) => {
    if (status === "COMPLETED") return "success";
    if (status === "PENDING") return "warning";
    return "default";
  };

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const completedAmount = payments.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      {/* Summary row */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              {tab === "ALL" ? "Total" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </p>
            <p className="text-lg font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-text-muted mt-0.5">{payments.length} records</p>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-xl px-4 py-3">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Pending</p>
            <p className="text-lg font-bold text-warning">{formatCurrency(pendingAmount)}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {payments.filter((p) => p.status === "PENDING").length} records
            </p>
          </div>
          <div className="bg-success/5 border border-success/20 rounded-xl px-4 py-3">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Collected</p>
            <p className="text-lg font-bold text-success">{formatCurrency(completedAmount)}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {payments.filter((p) => p.status === "COMPLETED").length} records
            </p>
          </div>
        </div>
      )}

      {/* Tabs + action */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`tab-item ${tab === t.value ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={15} />
          Record Payment
        </Button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-4 border-b border-border/50 last:border-0">
                <div className="skeleton h-3.5 w-32" />
                <div className="skeleton h-3.5 w-20" />
                <div className="skeleton h-5 w-14 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-3 w-20" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-6 rounded-md" />
                  <div className="skeleton h-6 w-6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <CreditCard size={22} className="text-text-muted" />
            </div>
            <p className="font-medium text-text-primary">No payments found</p>
            <p className="text-sm text-text-muted mt-1">
              {tab !== "ALL" ? `No ${tab.toLowerCase()} payments.` : "Record your first payment to get started."}
            </p>
          </div>
        ) : (
          <Table
            headers={["Student", "Amount", "Method", "Status", "Date", "Actions"]}
            isEmpty={false}
          >
            {payments.map((p) => {
              const method = METHOD_STYLES[p.method] ?? { label: p.method, cls: "bg-surface-2 text-text-muted border border-border" };
              return (
                <tr key={p.id} className="border-b border-border/30 hover:bg-surface-2/40 transition-colors">
                  <td className="py-3 px-4 first:pl-0 font-medium text-text-primary">
                    {p.student.firstName} {p.student.lastName}
                  </td>
                  <td className="py-3 px-4 text-text-primary font-semibold">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${method.cls}`}>
                      {method.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariant(p.status)}>{p.status.toLowerCase()}</Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs">{formatDate(p.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {p.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkComplete(p.id)}
                          title="Mark as completed"
                        >
                          <CheckCircle size={13} className="text-success" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} title="Delete">
                        <Trash2 size={13} className="text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
              {formLoading ? "Saving…" : "Save Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
