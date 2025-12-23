
// -----------------------------------------------------------------------------
// FILE: src/components/Reports/SummaryCards.tsx
// -----------------------------------------------------------------------------
import type { AnalyticsSummary } from "../../services/analytics";

export default function SummaryCards({
  income,
  expenses,
  net,
  projected,
}: {
  income: number;
  expenses: number;
  net: number;
  projected: number;
}) {
  const items = [
    { label: "Income", value: income },
    { label: "Expenses", value: expenses },
    { label: "Net", value: net },
    { label: "Projected (selected)", value: projected },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-card)]">
          <div className="text-sm text-[var(--color-soft)]">{it.label}</div>
          <div className="mt-1 text-2xl font-semibold">${it.value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
