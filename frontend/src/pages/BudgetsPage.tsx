import { useEffect, useMemo, useState } from "react";
import { listBudgetsByUser, type Budget } from "../services/budget";
import { listCategories, type Category } from "../services/category";
import { getStoredUser } from "../lib/storage";
import { listUserTransactions, type Transaction } from "../services/transaction";
import BudgetForm from "../components/Budget/BudgetForm";
import BudgetCard from "../components/Budget/BudgetCard";

type ItemWithSpent = {
  category: Category | null;
  amount: number;   // budgeted limit for this category in this budget
  spent: number;    // computed from transactions (EXPENSE)
  frequency?: number;
};

export default function BudgetsPage() {
  const user = getStoredUser();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!user?.id) throw new Error("No authenticated user found.");
        const [b, c, t] = await Promise.all([
          listBudgetsByUser(user.id),
          listCategories(),
          listUserTransactions(),
        ]);
        setBudgets(b);
        setCategories(c);
        setTransactions(t);
      } catch (e) {
        console.error(e);
        setError("Failed to load budgets.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const handleCreated = (newBudget: Budget) => {
    setBudgets((prev) => [newBudget, ...prev]);
    setShowForm(false);
  };

  const handleDeleted = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // ---------- Category maps ----------
  const categoryNameToId = useMemo(() => {
    const map = new Map<string, string>(); // name -> id (also allow id passthrough)
    categories.forEach((c) => {
      if (c.name) map.set(c.name.toLowerCase().trim(), c.id);
      map.set(c.id.toLowerCase().trim(), c.id);
    });
    return map;
  }, [categories]);

  // Normalize a transaction's category string to a known categoryId
  function normalizeTxCategoryId(tx: Transaction): string | null {
    const raw = tx.category?.toLowerCase().trim();
    if (!raw) return null;
    return categoryNameToId.get(raw) ?? null;
  }

  // ---------- Expenses by category (from transactions) ----------
  const expenseByCat = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const tx of transactions) {
      const isExpense = tx.type?.toUpperCase?.() === "EXPENSE";
      if (!isExpense) continue;
      const catId = normalizeTxCategoryId(tx);
      if (!catId) continue;
      const value = Number(tx.amount); // if your backend sends negatives for expenses, use Math.abs()
      byCat.set(catId, (byCat.get(catId) ?? 0) + value);
    }
    return byCat;
  }, [transactions, categoryNameToId]);

  return (
    <main className="min-h-screen bg-[var(--color-ink)] text-[var(--color-fg)]">
      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Budgets</h1>
            <p className="text-sm text-[var(--color-soft)]">
              Track allocations by category and see progress at a glance.
            </p>
          </div>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-full bg-[var(--color-gold)] px-4 py-2 text-[var(--color-ink)] font-medium shadow hover:opacity-90 transition"
          >
            {showForm ? "Close" : "➕ New Budget"}
          </button>
        </header>

        {/* Collapsible Form */}
        {showForm && (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <BudgetForm
              categories={categories}
              userId={user?.id!}
              onCreated={handleCreated}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-sm text-[var(--color-soft)]">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : budgets.length === 0 ? (
          <div className="text-sm text-[var(--color-soft)]">
            No budgets yet. Create your first one to get started.
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              // Build per-category item lines with computed spend
              const items: ItemWithSpent[] = (b.items ?? []).map((it) => {
                const catId = it.category?.id ?? "";
                const spent = catId ? (expenseByCat.get(catId) ?? 0) : 0;
                return {
                  category: it.category ?? null,
                  amount: Number(it.amount ?? 0),
                  frequency: it.frequency ?? (b as any).frequency ?? 0,
                  spent,
                };
              });

              const total = items.reduce((s, x) => s + x.amount, 0);
              const spent = items.reduce((s, x) => s + x.spent, 0);

              return (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  items={items}      // ✅ per-item lines with spent/limit
                  total={total}
                  spent={spent}
                  onDeleted={handleDeleted}
                />
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
