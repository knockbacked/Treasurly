
// -----------------------------------------------------------------------------
// FILE: src/components/Reports/UpcomingRecurringList.tsx
// -----------------------------------------------------------------------------
import React, { useMemo } from "react";
import type { Transaction } from "../../services/transaction";
import { listUpcomingRecurring } from "../../lib/analytics";


export default function UpcomingRecurringList({ transactions, daysAhead }: { transactions: Transaction[]; daysAhead: number }) {
  const items = useMemo(() => listUpcomingRecurring(transactions, daysAhead), [transactions, daysAhead]);
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
        <div className="text-sm text-[var(--color-soft)]">Upcoming Recurring</div>
        <div className="mt-2 text-[var(--color-soft)]">No recurring expenses in the next {daysAhead} days.</div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-2 text-sm text-[var(--color-soft)]">Upcoming Recurring (next {daysAhead} days)</div>
      <ul className="divide-y divide-[var(--color-line)]">
        {items.map((it) => (
          <li key={it.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.description}</div>
              <div className="text-xs text-[var(--color-soft)]">
                Every {it.intervalDays} days • Due {new Date(it.nextDate).toLocaleDateString("en-AU")}
              </div>
            </div>
            <div className="font-semibold">${it.amount.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}