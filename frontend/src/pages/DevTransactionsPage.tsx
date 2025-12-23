import { useEffect, useState, useMemo } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
  makeTransactionSchema,
  listUserTransactions,
} from "../services/transaction";
import { useCategories } from "../hooks/useCategories";
import { getStoredUser } from "../lib/storage";

export default function DevTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    target: "",
    description: "",
    amount: 0,
    type: "EXPENSE",
    categoryId: "",
  });

  const { categories, loading: catsLoading } = useCategories();
  const allowed = useMemo(() => new Set(categories.map((c) => c.id)), [categories]);
  const schema = useMemo(() => makeTransactionSchema(allowed), [allowed]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await listUserTransactions();
      setTransactions(res);
    } catch (err) {
      console.error("❌ Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ---------------- CREATE ----------------
  const handleCreate = async () => {
    setError("");
    try {
      const payload = schema.parse({
        ...form,
        isRecurring: false,
        recurringRate: null,
      });
      const user = getStoredUser();
      const txPayload: Omit<Transaction, "transactionId" | "created"> = {
        userId: user?.id ?? "dev-user",
        target: payload.target,
        description: payload.description ?? "",
        amount: payload.amount,
        type: payload.type,
        category: payload.categoryId,
        recurring: false,
        recurringRate: null,
      };
      const tx = await createTransaction(txPayload);
      setTransactions((prev) => [...prev, tx]);
      setForm({ target: "", description: "", amount: 0, type: "EXPENSE", categoryId: "" });
    } catch (err: any) {
      setError(err.message ?? "Failed to create transaction");
      console.error("❌ Failed to create:", err);
    }
  };

  // ---------------- UPDATE ----------------
  const handleUpdate = async (
    id: string,
    field: keyof Transaction,
    value: any
  ) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.transactionId === id ? { ...t, [field]: value } : t
      )
    ); // optimistic

    try {
      const updated = await updateTransaction(id, { [field]: value });
      setTransactions((prev) =>
        prev.map((t) => (t.transactionId === id ? updated : t))
      );
    } catch (err) {
      console.error("❌ Update failed:", err);
      await fetchAll(); // rollback to server state
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.transactionId !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  // ---------------- SEED ----------------
  const handleSeed = async (count = 10) => {
    if (categories.length === 0) {
      alert("Load categories first before seeding.");
      return;
    }
    const user = getStoredUser();
    const fake = Array.from({ length: count }, () => {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const type = Math.random() > 0.5 ? "EXPENSE" : "INCOME";
      const descs = ["Groceries", "Rent", "Salary", "Gym", "Coffee", "Utilities"];
      const desc = descs[Math.floor(Math.random() * descs.length)];
      const amount = Math.round(Math.random() * 400 + 20);
      return {
        userId: user?.id ?? "dev-user",
        target: "Dev Seed",
        description: desc,
        amount,
        type,
        category: cat.id,
        recurring: false,
        recurringRate: null,
      };
    });

    for (const tx of fake) await createTransaction(tx as any);
    await fetchAll();
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] p-8 space-y-6">
      <h1 className="text-2xl font-bold"> Developer Transactions Panel</h1>

      {/* ---------------- CREATE FORM ---------------- */}
      <div className="p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] space-y-3">
        <h2 className="text-lg font-semibold">Add Transaction</h2>
        {error && <p className="text-[var(--color-error)]">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Target"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
            className="px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            className="px-2 py-1 w-28 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            disabled={catsLoading}
            className="px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-line)]"
          >
            <option value="">
              {catsLoading ? "Loading..." : "Select Category"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={!form.categoryId || !form.target || form.amount <= 0}
            className="px-3 py-1 bg-[var(--color-gold)] text-[var(--color-ink)] rounded font-medium hover:opacity-90 disabled:opacity-50"
          >
            Add
          </button>

        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border-collapse border border-[var(--color-line)] text-sm">
            <thead className="bg-[var(--color-panel)]">
              <tr>
                {["ID", "Target", "Description", "Category", "Amount", "Type", "Recurring", "Actions"].map(
                  (h) => (
                    <th key={h} className="p-2 border border-[var(--color-line)] text-left">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transactionId} className="border border-[var(--color-line)]">
                  <td className="p-2 text-xs">{t.transactionId}</td>
                  <td className="p-2">
                    <input
                      className="bg-transparent border-b border-dotted border-[var(--color-line)] w-full"
                      value={t.target ?? ""}
                      onChange={(e) =>
                        handleUpdate(t.transactionId, "target", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="bg-transparent border-b border-dotted border-[var(--color-line)] w-full"
                      value={t.description ?? ""}
                      onChange={(e) =>
                        handleUpdate(t.transactionId, "description", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={t.category ?? ""}
                      onChange={(e) =>
                        handleUpdate(t.transactionId, "category", e.target.value)
                      }
                      className="bg-transparent border-b border-dotted border-[var(--color-line)]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="bg-transparent border-b border-dotted border-[var(--color-line)] w-20"
                      value={t.amount}
                      onChange={(e) =>
                        handleUpdate(t.transactionId, "amount", Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={t.type}
                      onChange={(e) =>
                        handleUpdate(t.transactionId, "type", e.target.value)
                      }
                      className="bg-transparent border-b border-dotted border-[var(--color-line)]"
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={t.recurring}
                      onChange={(e) =>
                        handleUpdate(t.transactionId, "recurring", e.target.checked)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(t.transactionId)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
