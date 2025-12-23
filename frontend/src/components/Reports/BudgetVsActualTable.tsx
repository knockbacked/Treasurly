

// -----------------------------------------------------------------------------
// FILE: src/components/Reports/BudgetVsActualTable.tsx
// -----------------------------------------------------------------------------
import React, { useMemo } from "react";
import type { Transaction } from "../../services/transaction";
import type { Budget } from "../../services/budget";

import { useCategories } from "../../hooks/useCategories";
import { getBudgetComparison } from "../../lib/analytics";

export default function BudgetVsActualTable({ budgets, transactions }: { budgets: Budget[]; transactions: Transaction[] }) {
  const { categories } = useCategories();
  const nameById = useMemo(() => new Map(categories.map((c: any) => [c.id, c.name])), [categories]);

  const rows = useMemo(() => getBudgetComparison(budgets, transactions), [budgets, transactions]);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 text-sm font-medium text-[var(--color-soft)]">Budget vs Actual</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-[var(--color-soft)] text-sm">
            <tr>
              <th className="p-2">Category</th>
              <th className="p-2 text-right">Budget</th>
              <th className="p-2 text-right">Spent</th>
              <th className="p-2 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-dim)]">
            {rows.map((r) => (
              <tr key={r.categoryId} className="border-t border-[var(--color-line)]">
                <td className="p-2">{nameById.get(r.categoryId) || "Unknown"}</td>
                <td className="p-2 text-right">${r.budgetAmount.toFixed(2)}</td>
                <td className="p-2 text-right">${r.actualSpent.toFixed(2)}</td>
                <td className={`p-2 text-right ${r.remaining < 0 ? "text-[var(--color-error)]" : ""}`}>
                  ${r.remaining.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}