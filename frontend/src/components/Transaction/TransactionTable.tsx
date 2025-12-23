import type { Transaction } from "../../services/transaction";
import { formatAmount, formatDate, txId } from "./util";

type Props = {
  transactions: Transaction[];
  getCategoryName?: (id: string) => string;
  displayCurrency?: string; // optional active currency
};

export default function TransactionTable({
  transactions,
  getCategoryName,
  displayCurrency = "AUD",
}: Props) {
  const rows = [...(transactions ?? [])].sort((a, b) => {
    const da = new Date((a as any).created ?? 0).getTime();
    const db = new Date((b as any).created ?? 0).getTime();
    return db - da; // newest first
  });

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--color-surface-2)] text-[var(--text-soft)]">
          <tr>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Description</th>
            <th className="p-3 font-medium">Category</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 text-right font-medium">Amount</th>
          </tr>
        </thead>

        <tbody className="text-[var(--text-dim)]">
          {rows.length === 0 ? (
            <tr>
              <td
                className="p-4 text-center text-sm text-[var(--color-soft)]"
                colSpan={5}
              >
                No transactions.
              </td>
            </tr>
          ) : (
            rows.map((t) => {
              const type = String(t.type ?? "").toUpperCase();
              const isExpense = type === "EXPENSE";
              const badgeClass = isExpense
                ? "bg-red-900/30 text-red-300 border-red-700/40"
                : "bg-emerald-900/30 text-emerald-300 border-emerald-700/40";

              const desc =
                (t as any).description?.trim?.() ||
                (t as any).target?.trim?.() ||
                "-";

              const categoryId = (t as any).category ?? "";
              const categoryLabel = getCategoryName
                ? getCategoryName(categoryId)
                : categoryId || "-";

              // Pick correct amount (converted or base)
              const amount =
                "convertedAmount" in t && typeof (t as any).convertedAmount === "number"
                  ? (t as any).convertedAmount
                  : t.amount;

              return (
                <tr key={txId(t)} className="border-t border-[var(--color-line)]">
                  {/* Date */}
                  <td className="p-3">{formatDate((t as any).created)}</td>

                  {/* Description */}
                  <td className="p-3 text-[var(--text-strong)]">
                    <span className="line-clamp-1">{desc}</span>
                  </td>

                  {/* Category */}
                  <td className="p-3">{categoryLabel}</td>

                  {/* Type Badge */}
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${badgeClass}`}
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          isExpense ? "bg-red-400" : "bg-emerald-400"
                        }`}
                      />
                      {type || "-"}
                    </span>
                  </td>

                  {/* Amount (dual-line, no double sign) */}
                  <td className="p-3 text-right tabular-nums">
                    {"convertedAmount" in t && t.convertedAmount !== undefined ? (
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-[var(--text-strong)]">
                          {amount.toLocaleString(undefined, {
                            style: "currency",
                            currency: displayCurrency,
                          })}
                        </span>
                        <span className="text-xs text-[var(--text-soft)]">
                          {formatAmount(t)} AUD
                        </span>
                      </div>
                    ) : (
                      <span>{formatAmount(t)}</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
