


// -----------------------------------------------------------------------------
// FILE: src/pages/ReportsPage.tsx
// -----------------------------------------------------------------------------
import React, { useEffect, useMemo, useState } from "react";
import { listUserTransactions, type Transaction } from "../services/transaction";
import { listBudgetsByUser, type Budget } from "../services/budget";
import { getAnalyticsSummary } from "../services/analytics";
import { getProjectedSpending, getTotals } from "../lib/analytics";
import SummaryCards from "../components/Reports/SummaryCards";
import CategoryBreakdownChart from "../components/Reports/CategoryBreakdownChart";
import TrendLineChart from "../components/Reports/TrendlineChart";
import BudgetVsActualTable from "../components/Reports/BudgetVsActualTable";
import UpcomingRecurringList from "../components/Reports/UpcomingRecurringList";
import { getStoredUser } from "../lib/storage";


export default function ReportsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<{ income: number; expenses: number; net: number; projectedSpending: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [horizon, setHorizon] = useState<number>(30); // days ahead for projection

  useEffect(() => {
    (async () => {
      try {
        // Resolve user

        const user = getStoredUser();
        const uid = user.id;
        setUserId(uid);

        const [txs, buds] = await Promise.all([
          uid ? listUserTransactions() : Promise.resolve([]),
          uid ? listBudgetsByUser(uid) : Promise.resolve([] as Budget[]),
        ]);
        setTransactions(txs);
        setBudgets(buds);

        if (uid) {
          const s = await getAnalyticsSummary(uid);
          setSummary(s as any);
        }
      } finally {
        setSummaryLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => getTotals(transactions), [transactions]);
  const projectedLocal = useMemo(() => getProjectedSpending(transactions, horizon), [transactions, horizon]);

  if (summaryLoading) {
    return <div className="p-6 text-[var(--color-soft)]">Loading reports…</div>;
  }

  return (
  <main className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] p-6">
    <div className="flex-1 flex flex-col space-y-8">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex items-center gap-2">
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
      </div>

      {/* ---------------- SUMMARY CARDS ---------------- */}
      <SummaryCards
        income={summary?.income ?? totals.income}
        expenses={summary?.expenses ?? totals.expenses}
        net={summary?.net ?? totals.net}
        projected={projectedLocal}
      />

      {/* ---------------- CHARTS ---------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart transactions={transactions} />
        <TrendLineChart transactions={transactions} />
      </section>

      {/* ---------------- BUDGET TABLE ---------------- */}
      <BudgetVsActualTable budgets={budgets} transactions={transactions} />

      {/* ---------------- UPCOMING RECURRING ---------------- */}
      <UpcomingRecurringList transactions={transactions} daysAhead={horizon} />
    </div>
  </main>
);

}
