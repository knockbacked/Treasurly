// -----------------------------------------------------------------------------
// FILE: src/utils/analytics.ts
// Purpose: Pure, typed helpers for reports (frontend analytics engine)
// -----------------------------------------------------------------------------
import type { Transaction } from "../services/transaction";
import type { Budget } from "../services/budget";

export type Totals = { income: number; expenses: number; net: number };

export function getTotals(transactions: Transaction[]): Totals {
  const totals = transactions.reduce(
    (acc, t) => {
      const amt = Number(t.amount || 0);
      if (String(t.type).toUpperCase() === "INCOME") acc.income += amt;
      else acc.expenses += amt;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 }
  );
  totals.net = totals.income - totals.expenses;
  return totals;
}

export type CategorySlice = { categoryId: string; amount: number };

export function getCategoryBreakdown(transactions: Transaction[]): CategorySlice[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (String(t.type).toUpperCase() !== "EXPENSE") continue;
    const cid = t.category ?? "unknown";
    map.set(cid, (map.get(cid) || 0) + Number(t.amount || 0));
  }
  return Array.from(map.entries()).map(([categoryId, amount]) => ({ categoryId, amount }));
}

export type MonthlyPoint = { month: string; income: number; expenses: number };

export function getMonthlyTrend(transactions: Transaction[]): MonthlyPoint[] {
  const buckets = new Map<string, { income: number; expenses: number }>();
  for (const t of transactions) {
    const d = new Date(t.created);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    const bucket = buckets.get(key) || { income: 0, expenses: 0 };
    if (String(t.type).toUpperCase() === "INCOME") bucket.income += Number(t.amount || 0);
    else bucket.expenses += Number(t.amount || 0);
    buckets.set(key, bucket);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, v]) => ({ month: key, income: v.income, expenses: v.expenses }));
}

// --- Recurring projection helpers ------------------------------------------------

/** Returns the number of occurrences within the given horizon (inclusive lower bound). */
function occurrencesWithin(from: Date, horizonDays: number, start: Date, intervalDays: number): number {
  if (!intervalDays || intervalDays <= 0) return 0;
  // Find first occurrence >= from
  const startTime = start.getTime();
  const fromTime = from.getTime();
  let firstTime = startTime;
  if (startTime < fromTime) {
    const diffDays = Math.ceil((fromTime - startTime) / (1000 * 60 * 60 * 24));
    const steps = Math.ceil(diffDays / intervalDays);
    firstTime = startTime + steps * intervalDays * 86400000;
  }
  const endTime = fromTime + horizonDays * 86400000;
  if (firstTime > endTime) return 0;
  const remainingDays = Math.floor((endTime - firstTime) / 86400000);
  return 1 + Math.floor(remainingDays / intervalDays);
}

export function getProjectedSpending(transactions: Transaction[], daysAhead: number): number {
  const now = new Date();
  let total = 0;
  for (const t of transactions) {
    if (!t.recurring || !t.recurringRate) continue;
    if (String(t.type).toUpperCase() !== "EXPENSE") continue;
    const start = new Date(t.created);
    if (isNaN(start.getTime())) continue;
    const n = occurrencesWithin(now, daysAhead, start, t.recurringRate);
    total += n * Number(t.amount || 0);
  }
  return total;
}

export type UpcomingRecurringItem = {
  id: string;
  description: string;
  amount: number;
  nextDate: string; // ISO
  intervalDays: number;
};

export function listUpcomingRecurring(transactions: Transaction[], daysAhead: number): UpcomingRecurringItem[] {
  const now = new Date();
  const end = new Date(now.getTime() + daysAhead * 86400000);
  const items: UpcomingRecurringItem[] = [];
  for (const t of transactions) {
    if (!t.recurring || !t.recurringRate) continue;
    if (String(t.type).toUpperCase() !== "EXPENSE") continue;
    const start = new Date(t.created);
    if (isNaN(start.getTime())) continue;

    // Find next occurrence >= now
    let next = start;
    while (next.getTime() < now.getTime()) {
      next = new Date(next.getTime() + t.recurringRate * 86400000);
    }
    if (next.getTime() <= end.getTime()) {
      items.push({
        id: t.transactionId,
        description: t.description || t.target || "Recurring expense",
        amount: Number(t.amount || 0),
        nextDate: next.toISOString(),
        intervalDays: t.recurringRate,
      });
    }
  }
  // Sort soonest first
  return items.sort((a, b) => a.nextDate.localeCompare(b.nextDate));
}

export type BudgetRow = {
  categoryId: string;
  budgetAmount: number;
  actualSpent: number;
  remaining: number;
};

export function getBudgetComparison(budgets: Budget[], transactions: Transaction[]): BudgetRow[] {
  // Aggregate actuals by category (expenses only)
  const actuals = new Map<string, number>();
  for (const t of transactions) {
    if (String(t.type).toUpperCase() !== "EXPENSE") continue;
    const cid = t.category ?? "unknown";
    actuals.set(cid, (actuals.get(cid) || 0) + Number(t.amount || 0));
  }

  // Aggregate budget amounts by category across all budgets
  const budgetByCat = new Map<string, number>();
  for (const b of budgets) {
    for (const it of b.items || []) {
      const cid = (it.category as any)?.id ?? (it as any).categoryId ?? "unknown";
      const amt = Number(it.amount || 0);
      budgetByCat.set(cid, (budgetByCat.get(cid) || 0) + amt);
    }
  }

  const categoryIds = new Set<string>([...actuals.keys(), ...budgetByCat.keys()]);
  const rows: BudgetRow[] = [];
  for (const cid of categoryIds) {
    const budgetAmount = budgetByCat.get(cid) || 0;
    const actualSpent = actuals.get(cid) || 0;
    rows.push({ categoryId: cid, budgetAmount, actualSpent, remaining: budgetAmount - actualSpent });
  }
  return rows.sort((a, b) => b.actualSpent - a.actualSpent);
}

