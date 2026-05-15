// File: client/src/components/trips/ExpensePanel.jsx
import { useState, useEffect } from "react";
import { expenseService } from "../../services/expenseService.js";
import { fmtCurrency } from "../../utils/helpers.js";
import { Alert, PageLoader } from "../ui/index.jsx";

const CATS = ["accommodation", "transport", "food", "activity", "other"];
const CAT_ICONS = { accommodation: "🏨", transport: "🚗", food: "🍜", activity: "🎭", other: "📦" };

export default function ExpensePanel({ trip }) {
  const [expenses, setExpenses]   = useState([]);
  const [balances, setBalances]   = useState([]);
  const [total,    setTotal]      = useState(0);
  const [loading,  setLoading]    = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState("");
  const [form,     setForm]       = useState({ title: "", amount: "", category: "other" });

  // All members including creator
  const members = [
    trip.creator,
    ...(trip.members?.filter((m) => m.status === "accepted").map((m) => m.user) || []),
  ].filter(Boolean);

  useEffect(() => { loadExpenses(); }, [trip._id]);

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getTripExpenses(trip._id);
      setExpenses(data.expenses);
      setBalances(data.balances);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await expenseService.createExpense({
        tripId: trip._id,
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        splitBetween: members.map((m) => m._id || m),
        currency: trip.currency || "USD",
      });
      setForm({ title: "", amount: "", category: "other" });
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <Alert type="error" message={error} />

      {/* Summary bar */}
      <div className="flex items-center justify-between p-4 bg-ink rounded-2xl text-white">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Total Spent</p>
          <p className="font-display font-bold text-2xl">{fmtCurrency(total, trip.currency)}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary bg-coral text-sm py-2">
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {/* Add expense form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card border-coral/20 bg-coral/5 space-y-4">
          <h4 className="font-display font-bold text-ink">Add Expense</h4>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Hotel at Kyoto"
            className="input-field"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="Amount"
              min="0.01"
              step="0.01"
              className="input-field"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="input-field"
            >
              {CATS.map((c) => (
                <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-ink/50">
            Split equally among {members.length} member{members.length !== 1 ? "s" : ""}
            {members.length > 0 && form.amount
              ? ` · ${fmtCurrency(Number(form.amount) / members.length, trip.currency)} each`
              : ""}
          </p>
          <button type="submit" disabled={saving} className="btn-teal w-full">
            {saving ? "Adding…" : "Add Expense"}
          </button>
        </form>
      )}

      {/* Balances */}
      {balances.length > 0 && (
        <div className="card bg-gold/10 border-gold/30 space-y-2">
          <p className="font-display font-bold text-ink text-sm">💸 Outstanding Balances</p>
          {balances.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-ink/70">User owes</span>
              <span className="font-bold text-gold-dark">
                {fmtCurrency(b.amount, trip.currency)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="text-center py-8 text-ink/40">
          <p className="text-3xl mb-2">💳</p>
          <p className="text-sm">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp._id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-mist hover:shadow-card transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-xl flex-shrink-0">
                {CAT_ICONS[exp.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm">{exp.title}</p>
                <p className="text-xs text-ink/50">
                  Paid by {exp.paidBy?.name} · {exp.splits?.length} people
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-ink">{fmtCurrency(exp.amount, exp.currency)}</p>
                <p className="text-xs text-ink/40 capitalize">{exp.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
