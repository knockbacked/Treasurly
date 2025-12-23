import { useMemo, useState } from "react";
import { z, ZodError } from "zod";
import { createBudget, type BudgetItem } from "../../services/budget";
import type { Category } from "../../services/category";
import type { Budget } from "../../services/budget";
import { getCategory } from "../../services/category"; // ✅ NEW

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  frequency: z.number().int().optional(), // 1=Weekly, 2=Monthly, 3=Yearly
  items: z.array(
    z.object({
      categoryId: z.string().min(1, "Category is required"),
      amount: z.number().positive("Amount must be > 0"),
    })
  ).min(1, "Add at least one category allocation"),
});

type FormData = z.infer<typeof FormSchema>;

function toCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function BudgetForm({
  categories,
  userId,
  onCreated,
}: {
  categories: Category[];
  userId: string;
  onCreated: (budget: Budget) => void;
}) {
  const [data, setData] = useState<FormData>({
    name: "",
    description: "",
    frequency: 2,
    items: [],
  });
  const [row, setRow] = useState<{ categoryId: string; amount: string }>({
    categoryId: "",
    amount: "",
  });
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => data.items.reduce((s, it) => s + (Number(it.amount) || 0), 0),
    [data.items]
  );

  const rowAmountNum = useMemo(() => {
    const n = Number(row.amount);
    return Number.isFinite(n) ? n : NaN;
  }, [row.amount]);

  const categoryAlreadyUsed = useMemo(
    () => !!data.items.find(i => i.categoryId === row.categoryId),
    [data.items, row.categoryId]
  );

  const canAddRow =
    !!row.categoryId &&
    !!row.amount &&
    Number.isFinite(rowAmountNum) &&
    rowAmountNum > 0 &&
    !categoryAlreadyUsed;

  const addItem = () => {
    if (!canAddRow) return;
    setData((d) => ({
      ...d,
      items: [...d.items, { categoryId: row.categoryId, amount: rowAmountNum }],
    }));
    setRow({ categoryId: "", amount: "" });
  };

  const removeItem = (categoryId: string) => {
    setData((d) => ({ ...d, items: d.items.filter((i) => i.categoryId !== categoryId) }));
  };

  // ✅ Use full Category objects when creating the payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      const parsed = FormSchema.parse(data);
      setLoading(true);

      // Build items with full Category. Prefer the categories prop; fall back to API.
      const itemsWithCategory = await Promise.all(
        parsed.items.map(async (it) => {
          const local = categories.find(c => c.id === it.categoryId);
          const category = local ?? await getCategory(it.categoryId);
          return {
            category,               // <- full object {id,name,color,icon}
            amount: it.amount,
            frequency: parsed.frequency ?? 0,
          };
        })
      );

      const payload: Omit<Budget, "id" | "createdAt" | "updatedAt"> = {
        userId,
        name: parsed.name,
        description: parsed.description,
        items: itemsWithCategory as unknown as BudgetItem[], // type aligns with service schema
        // frequency is per-item in backend; we’ve injected it above
      };

      const created = await createBudget(payload);
      onCreated(created);

      // reset after success
      setData({ name: "", description: "", frequency: 2, items: [] });
      setRow({ categoryId: "", amount: "" });
    } catch (err) {
      console.error(err);
      if (err instanceof ZodError) {
        const fe: Record<string, string> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".") || "form";
          fe[path] = issue.message;
        }
        setFieldErrors(fe);
        setError(fe["form"] ?? "Please fix the highlighted errors.");
      } else {
        setError("Failed to create budget.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-soft)]">Name</label>
          <input
            className={`w-full rounded-lg border bg-[var(--color-ink)] px-3 py-2 outline-none ${
              fieldErrors["name"]
                ? "border-red-500"
                : "border-[var(--color-line)]"
            }`}
            placeholder="e.g., Monthly Essentials"
            value={data.name}
            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          />
          {fieldErrors["name"] && (
            <p className="text-xs text-red-400">{fieldErrors["name"]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-soft)]">Frequency</label>
          <select
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2 outline-none"
            value={data.frequency ?? 2}
            onChange={(e) => setData((d) => ({ ...d, frequency: Number(e.target.value) }))}
          >
            <option value={7}>Weekly</option>
            <option value={30}>Monthly</option>
            <option value={365}>Yearly</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs text-[var(--color-soft)]">Description (optional)</label>
          <input
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2 outline-none"
            placeholder="Add a short note…"
            value={data.description ?? ""}
            onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-[var(--color-soft)]">Category</label>
            <select
              className={`w-full rounded-lg border bg-[var(--color-ink)] px-3 py-2 outline-none ${
                fieldErrors["items"]
                  ? "border-red-500"
                  : "border-[var(--color-line)]"
              }`}
              value={row.categoryId}
              onChange={(e) => setRow((r) => ({ ...r, categoryId: e.target.value }))}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="text-xs text-[var(--color-soft)]">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2 outline-none"
              placeholder="0.00"
              value={row.amount}
              onChange={(e) => setRow((r) => ({ ...r, amount: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={!canAddRow}
            className="rounded-lg bg-[var(--color-gold)] px-3 py-2 text-[var(--color-ink)] font-medium shadow hover:opacity-90 transition disabled:opacity-60"
            title={
              categoryAlreadyUsed
                ? "Category already added"
                : !row.categoryId
                ? "Select a category"
                : !row.amount
                ? "Enter an amount"
                : ""
            }
          >
            Add
          </button>
        </div>

        {/* Items list */}
        {data.items.length > 0 && (
          <div className="divide-y divide-[var(--color-line)] rounded-lg border border-[var(--color-line)]">
            {data.items.map((it) => {
              const c = categories.find((x) => x.id === it.categoryId);
              return (
                <div key={it.categoryId} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <i
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: c?.color ?? "#888" }}
                    />
                    <span className="text-sm">{c?.name ?? it.categoryId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{toCurrency(it.amount)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(it.categoryId)}
                      className="text-xs text-[var(--color-soft)] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-soft)]">Total allocation</span>
          <span className="font-medium">{toCurrency(total)}</span>
        </div>

        {fieldErrors["items"] && (
          <p className="text-xs text-red-400">{fieldErrors["items"]}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--color-gold)] px-4 py-2 text-[var(--color-ink)] font-medium shadow hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Budget"}
        </button>
      </div>
    </form>
  );
}
