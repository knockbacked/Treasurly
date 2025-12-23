
// Generate stable IDs for rendering
export function txId(t: any) {
  return t.id ?? t.transactionId ?? crypto.randomUUID();
}

// Format ISO date → DD/MM/YYYY
export function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("en-AU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
}

// Prefix + or – and format to 2 decimals
export function formatAmount(t: any) {
  const amt = Number(t.amount ?? 0);
  const isExpense = String(t.type ?? "").toUpperCase() === "EXPENSE";
  const v = Math.abs(amt).toFixed(2);
  return (isExpense ? "-" : "+") + "$" + v;
}