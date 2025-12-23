// components/Transaction/TransactionForm.tsx
import { useEffect, useMemo, useState } from "react";
import { createTransaction, type Transaction } from "../../services/transaction";
import { useCategories } from "../../hooks/useCategories";
import { makeTransactionSchema, type TransactionInput } from "../../services/transaction";
import { me } from "../../services/auth_service";
import { getStoredUser } from "../../lib/storage";


interface Props { onAdd: (tx: Transaction) => void; }

export default function TransactionForm({ onAdd }: Props) {
  const { categories, loading: catsLoading } = useCategories();


  const schema = useMemo(() => {
    const allowed = new Set(categories.map(c => c.id));
    return makeTransactionSchema(allowed);
  }, [categories]);

  const [form, setForm] = useState<TransactionInput>({
    target: "",
    description: "",
    amount: 0,
    type: "EXPENSE",
    categoryId: "",
    isRecurring: false,
    recurringRate: "", // keep as string for <select>
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, type, value, checked } = el;

    setForm(prev => {
      // If toggling recurring OFF, clear the rate:
      if (name === "isRecurring") {
        const nextIsRecurring = type === "checkbox" ? checked : value === "true";
        return { ...prev, isRecurring: nextIsRecurring, ...(nextIsRecurring ? {} : { recurringRate: "" }) };
      }

      if (name === "amount") return { ...prev, amount: Number(value) };
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = schema.parse(form); // client-side validation
      const user = getStoredUser();

      // Map client form to backend DTO
      const apiPayload: Omit<Transaction, "transactionId" | "created"> = {
        userId: user.id, // <-- pass it (can be null if fetch failed)
        target: payload.target,
        description: payload.description ?? "",
        amount: payload.amount,
        type: payload.type,
        category: payload.categoryId,   // backend expects category ID here
        recurring: !!payload.isRecurring,
        recurringRate: payload.isRecurring
          ? Number(payload.recurringRate) // "1" | "2" | "3" -> 1 | 2 | 3
          : null,
      };

      setLoading(true);
      const tx = await createTransaction(apiPayload);
      onAdd(tx);

      // reset
      setForm({
        target: "",
        description: "",
        amount: 0,
        type: "EXPENSE",
        categoryId: "",
        isRecurring: false,
        recurringRate: "",
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to add transaction");
      console.error("❌ Failed to add transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !catsLoading &&
    form.target.trim() !== "" &&
    form.amount > 0 &&
    form.categoryId !== ""

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-[var(--color-panel)] p-5 rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)]"
    >
      <h2 className="text-lg font-semibold text-[var(--color-fg)]">Add Transaction</h2>

      {error && <p className="text-[var(--color-error)] text-sm">{error}</p>}

      <input
        name="target"
        value={form.target}
        onChange={handleChange}
        placeholder="Target"
        className="w-full p-2 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
      />

      <input
        name="description"
        value={form.description ?? ""}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
      />

      <input
        name="amount"
        value={form.amount}
        onChange={handleChange}
        placeholder="Amount"
        type="number"
        step="0.01"
        className="w-full p-2 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
      />

      {/* Category (locked to provided list) */}
      <select
        name="categoryId"
        value={form.categoryId}
        onChange={handleChange}
        disabled={catsLoading}
        className="w-full p-2 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
      >
        <option value="">{catsLoading ? "Loading categories..." : "Select category"}</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name ?? "Unnamed"}</option>
        ))}
      </select>

      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-2 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
      >
        <option value="EXPENSE">Expense</option>
        <option value="INCOME">Income</option>
      </select>

      {/* Recurring toggle */}
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="isRecurring" className="text-sm text-[var(--color-soft)]">Recurring</label>
        <input
          type="checkbox"
          id="isRecurring"
          name="isRecurring"
          checked={form.isRecurring}
          onChange={handleChange}
          className="h-4 w-4"
        />
      </div>

      {/* Recurring Rate — only enabled when Recurring is checked */}
      <div className={`transition-opacity ${form.isRecurring ? "opacity-100" : "opacity-50"}`}>
        <select
          name="recurringRate"
          value={form.recurringRate ?? ""}
          onChange={handleChange}
          disabled={!form.isRecurring}
          className="w-full p-2 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
        >
          <option value="">{form.isRecurring ? "Select frequency" : "Disabled"}</option>
          <option value="7">Weekly</option>
          <option value="30">Monthly</option>
          <option value="365">Yearly</option>
        </select>
        {form.isRecurring && !form.recurringRate && (
          <p className="mt-1 text-xs text-[var(--color-soft)]">Choose how often this recurs.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full py-2 bg-[var(--color-gold)] text-[var(--color-ink)] rounded font-semibold disabled:opacity-50 hover:opacity-90 transition"
      >
        {loading ? "Adding..." : "Add Transaction"}
      </button>
    </form>
  );
}
