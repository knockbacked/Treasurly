// -----------------------------------------------------------------------------
// FILE: src/components/Reports/TrendLineChart.tsx
// -----------------------------------------------------------------------------
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Transaction } from "../../services/transaction";
import { getMonthlyTrend } from "../../lib/analytics";

type Props = { transactions: Transaction[] };

export default function TrendLineChart({ transactions }: Props) {
  const data = useMemo(() => getMonthlyTrend(transactions), [transactions]);

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center text-[var(--color-soft)]">
        No transaction data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-2 text-sm font-medium text-[var(--color-soft)]">
        Income vs Expenses (Monthly)
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--text-dim)" }}
              tickMargin={8}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--text-dim)" }}
              tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-line)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--text-strong)" }}
              formatter={(val: any, name: string) => [
                `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                name === "income" ? "Income" : "Expenses",
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 12, color: "var(--text-soft)" }}
            />

            {/* Distinct styling so lines never look merged */}
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="var(--chart-income, #22c55e)" // green
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="var(--chart-expense, #ef4444)" // red
              strokeDasharray="6 4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
