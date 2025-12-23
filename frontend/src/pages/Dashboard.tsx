// -----------------------------------------------------------------------------
// FILE: src/pages/DashboardPage.tsx
// PURPOSE: Main dashboard that stitches together Transactions, Reports, Budgets
// DEPENDENCIES: services (transactions, budgets, categories, analytics), lib helpers,
//               existing report/transaction components.
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";

// ---- Services & Types -------------------------------------------------------
import { listUserTransactions, type Transaction } from "../services/transaction";
import { listBudgetsByUser, type Budget } from "../services/budget";
import { listCategories, type Category } from "../services/category";
import { getAnalyticsSummary } from "../services/analytics";

// ---- Local analytics helpers (fallbacks) ------------------------------------
import { getProjectedSpending, getTotals } from "../lib/analytics";
import { getStoredUser } from "../lib/storage";

// ---- Reused UI components ---------------------------------------------------
import SummaryCards from "../components/Reports/SummaryCards";
import CategoryBreakdownChart from "../components/Reports/CategoryBreakdownChart";

import UpcomingRecurringList from "../components/Reports/UpcomingRecurringList";
import TransactionTable from "../components/Transaction/TransactionTable";
import TrendLineChart from "../components/Reports/TrendlineChart";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<{
    income: number;
    expenses: number;
    net: number;
    projectedSpending: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<number>(30); // default 30 days

  // -------------- Resolve user and fetch data --------------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const user = getStoredUser();
        const uid = user?.id ?? null;
        setUserId(uid);

        if (!uid) {
          // Not logged in or no cached session
          setTransactions([]);
          setBudgets([]);
          setCategories([]);
          setSummary(null);
          return;
        }

        const [txs, buds, cats] = await Promise.all([
          listUserTransactions(),
          listBudgetsByUser(uid),
          listCategories(),
        ]);
        setTransactions(txs);
        setBudgets(buds);
        setCategories(cats);

        // Prefer backend summary; fall back handled below
        const s = await getAnalyticsSummary(uid);
        setSummary(s as any);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------------- Fallback local totals/projection ---------------------------
  const totals = useMemo(() => getTotals(transactions), [transactions]);
  const projectedLocal = useMemo(
    () => getProjectedSpending(transactions, horizon),
    [transactions, horizon]
  );

  // -------------- Category helpers ------------------------------------------
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name ?? "Unnamed");
    return m;
  }, [categories]);

  const categoryNameToId = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      if (c.name) map.set(c.name.toLowerCase().trim(), c.id);
      map.set(c.id.toLowerCase().trim(), c.id);
    });
    return map;
  }, [categories]);

  function normalizeTxCategoryId(tx: Transaction): string | null {
    const id = (tx as any).categoryId as string | undefined;
    if (id && nameById.has(id)) return id;
    const raw = (tx as any).category as string | undefined; // legacy string
    if (!raw) return null;
    return categoryNameToId.get(raw.toLowerCase().trim()) ?? null;
  }

  // -------------- Expenses by category (for budget utilisation) --------------
  const expenseByCat = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const tx of transactions) {
      const isExpense = String((tx as any).type ?? "").toUpperCase() === "EXPENSE";
      if (!isExpense) continue;
      const catId = normalizeTxCategoryId(tx);
      if (!catId) continue;
      const value = Number((tx as any).amount ?? 0); // amounts assumed positive
      byCat.set(catId, (byCat.get(catId) ?? 0) + value);
    }
    return byCat;
  }, [transactions, categoryNameToId, nameById]);

  // -------------- Build Top Budgets (by utilisation) -------------------------
  const topBudgets = useMemo(() => {
    const rows = budgets.map((b) => {
      const items = (b.items ?? []).map((it: any) => {
        const catId = it.category?.id ?? "";
        const spent = catId ? (expenseByCat.get(catId) ?? 0) : 0;
        const limit = Number(it.amount ?? 0);
        return { label: it.category?.name ?? "Uncategorised", spent, limit };
      });
      const totalLimit = items.reduce((s, x) => s + x.limit, 0);
      const totalSpent = items.reduce((s, x) => s + x.spent, 0);
      const pct = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;
      return { id: (b as any).id ?? (b as any).budgetId ?? crypto.randomUUID(), name: (b as any).name ?? "Budget", pct, totalSpent, totalLimit };
    });

    return rows.sort((a, b) => b.pct - a.pct).slice(0, 3);
  }, [budgets, expenseByCat]);

  // -------------- Guard: no user --------------------------------------------
  if (!userId) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-[var(--color-soft)] text-sm">You're not signed in. Please sign in to view your dashboard.</p>
        </div>
      </main>
    );
  }

  // -------------- Loading ----------------------------------------------------
  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-[var(--color-soft)]">Loading dashboard…</div>
      </main>
    );
  }

  // -------------- Render -----------------------------------------------------
  // -------------- Render -----------------------------------------------------
  return (
    <main className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <div className="mx-auto w-full max-w-7xl px-8 py-10 space-y-10">
        {/* ---------------- HEADER ---------------- */}
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm text-[var(--color-soft)]">Projection</label>
            <select
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
            >
              <option value={7}>Next 7 days</option>
              <option value={30}>Next 30 days</option>
              <option value={90}>Next 3 months</option>
              <option value={365}>Next 12 months</option>
            </select>
          </div>
        </header>

        {/* ---------------- SUMMARY CARDS ---------------- */}
        <div className="pt-2 pb-4">
          <SummaryCards
            income={summary?.income ?? totals.income}
            expenses={summary?.expenses ?? totals.expenses}
            net={summary?.net ?? totals.net}
            projected={summary?.projectedSpending ?? projectedLocal}
          />
        </div>

        {/* ---------------- BUDGETS SNAPSHOT ---------------- */}
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div className="mb-4 text-sm font-medium text-[var(--color-soft)]">Top Budgets (by utilisation)</div>
          {topBudgets.length === 0 ? (
            <p className="text-sm text-[var(--color-soft)]">No budgets yet.</p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {topBudgets.map((b) => (
                <li key={b.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-1)] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-xs text-[var(--color-soft)]">{b.pct}%</div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded bg-[var(--color-surface-2)]">
                    <div className="h-2 rounded bg-[var(--color-gold)]" style={{ width: `${b.pct}%` }} />
                  </div>
                  <div className="mt-3 text-xs text-[var(--color-soft)]">
                    ${b.totalSpent.toFixed(2)} / ${b.totalLimit.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------------- RECENT TRANSACTIONS ---------------- */}
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <div className="mb-4 text-sm font-medium text-[var(--color-soft)]">
          Recent Transactions
        </div>
        <TransactionTable
          transactions={[...transactions]
            .filter(t => t.created) // only include ones with a timestamp
            .sort((a, b) => {
              const da = new Date((a as any).created).getTime();
              const db = new Date((b as any).created).getTime();
              return db - da; // newest first
            })
            .slice(0, 10)}
          getCategoryName={(id: string) => nameById.get(id ?? "") ?? "—"}
        />
      </section>


        {/* ---------------- UPCOMING RECURRING ---------------- */}
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div className="mb-4 text-sm font-medium text-[var(--color-soft)]">Upcoming Recurring</div>
          <UpcomingRecurringList transactions={transactions} daysAhead={horizon} />
        </section>
      </div>
    </main>
  );
}
