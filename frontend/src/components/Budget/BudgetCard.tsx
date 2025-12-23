import { useState } from "react";
import { deleteBudget } from "../../services/budget";
import type { Budget } from "../../services/budget";
import type { Category } from "../../services/category";

type ItemWithSpent = {
  category: Category | null;
  amount: number;
  spent: number;
  frequency?: number;
};

export default function BudgetCard({
  budget,
  items = [],               // ✅ default
  total = 0,                 // ✅ default
  spent = 0,                 // ✅ default
  onDeleted,
}: {
  budget: Budget;
  items?: ItemWithSpent[];   // ✅ optional in type to allow default
  total?: number;
  spent?: number;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete budget "${budget.name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      await deleteBudget(budget.id);
      onDeleted(budget.id);
    } catch (err) {
      console.error("Failed to delete budget:", err);
      alert("Failed to delete budget. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const freqLabel = (() => {
    const f = (budget as any).frequency ?? undefined;
    if (f === 1) return "Weekly";
    if (f === 2) return "Monthly";
    if (f === 3) return "Yearly";
    return undefined;
  })();

  return (
    <article className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg truncate">{budget.name}</h3>
          <p className="text-sm text-[var(--color-soft)]">{budget.description || "No description."}</p>
          {freqLabel && (
            <span className="mt-1 inline-block text-[10px] rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[var(--color-soft)]">
              {freqLabel}
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-[var(--color-soft)] hover:text-red-400 transition disabled:opacity-60"
          aria-label={`Delete budget ${budget.name}`}
        >
          {loading ? "Deleting…" : "✖"}
        </button>
      </header>

      <div className="mt-1 text-xs text-[var(--color-soft)]">
        <span>Spent ${spent.toFixed(2)} / ${total.toFixed(2)}</span>
        {total > spent ? (
          <span className="ml-1">· Remaining ${Math.max(total - spent, 0).toFixed(2)}</span>
        ) : total > 0 ? (
          <span className="ml-1 text-red-400">· Over by ${(spent - total).toFixed(2)}</span>
        ) : null}
      </div>

      <div className="mt-1 rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)]">
        {(items ?? []).map((x, idx) => {
          const icon = x.category?.icon ?? "🏷️";
          const color = x.category?.color ?? "#999";
          const name = x.category?.name ?? "Uncategorized";
          const pct = x.amount > 0 ? Math.min((x.spent / x.amount) * 100, 100) : 0;
          const over = x.amount > 0 ? Math.max(x.spent - x.amount, 0) : 0;
          const remaining = Math.max(x.amount - x.spent, 0);

          return (
            <div key={`${x.category?.id ?? "nil"}-${idx}`} className="px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{icon}</span>
                  <i className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-sm truncate">{name}</span>
                </div>
                <div className="text-sm tabular-nums">
                  ${x.spent.toFixed(2)} / ${x.amount.toFixed(2)}
                </div>
              </div>

              <div className="mt-2">
                <div className="h-2 w-full rounded-full overflow-hidden bg-[var(--color-line)]">
                  <div
                    className={`h-2 transition-all ${over > 0 ? "bg-red-400" : "bg-[var(--color-gold)]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px]">
                  <span className="text-[var(--color-soft)]">{Math.round(pct)}%</span>
                  {over > 0 ? (
                    <span className="text-red-400">Over by ${over.toFixed(2)}</span>
                  ) : (
                    <span className="text-[var(--color-soft)]">Remaining ${remaining.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
