import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import type { Transaction } from "../../services/transaction";
import { useCategories } from "../../hooks/useCategories";
import { getCategoryBreakdown } from "../../lib/analytics";

// 🎨 Consistent pastel palette with your table
const palette = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#38bdf8", // sky
  "#818cf8", // indigo
  "#c084fc", // purple
  "#f472b6", // pink
  "#94a3b8", // slate
];

export default function CategoryBreakdownChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { categories } = useCategories();

  // Map category IDs to names
  const nameById = useMemo(
    () => new Map(categories.map((c: any) => [c.id, c.name])),
    [categories]
  );

  // Build chart data from transactions
  const data = useMemo(() => {
    const slices = getCategoryBreakdown(transactions);
    return slices.map((s, i) => ({
      name: nameById.get(s.categoryId) || "Unknown",
      value: s.amount,
      color: palette[i % palette.length],
    }));
  }, [transactions, nameById]);

  // Skip empty chart
  if (!data.length)
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center text-[var(--text-soft)]">
        No spending data available.
      </div>
    );

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 text-sm font-medium text-white tracking-wide">
        Spending by Category
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              stroke="var(--color-line)"
              strokeWidth={1}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}

              {/* Label inside slices */}
              <LabelList
                dataKey="name"
                position="outside"
                style={{
                  fill: "#ffffff", // white label text
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  textShadow: "0 0 3px rgba(0,0,0,0.5)",
                }}
              />
            </Pie>

            {/* Tooltip */}
            <Tooltip
              formatter={(v: any, _n, p: any) =>
                [`$${Number(v).toFixed(2)}`, p?.payload?.name]
              }
              contentStyle={{
                backgroundColor: "rgba(20,20,25,0.95)",
                border: "1px solid var(--color-line)",
                borderRadius: "0.5rem",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#fff", fontWeight: 600 }}
            />

            {/* Legend */}
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                color: "#fff",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
