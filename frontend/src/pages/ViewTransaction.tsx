import { useEffect, useMemo, useState } from "react";
import { listUserTransactions, type Transaction } from "../services/transaction";
import TransactionTable from "../components/Transaction/TransactionTable";
import TransactionForm from "../components/Transaction/TransactionForm";
import { useCategories } from "../hooks/useCategories";
import { exportTransactionsToCSV, exportTransactionsToColoredExcel } from "../services/TransactionExport";

export default function ViewTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Categories for ID→name join
  const { categories, loading: catsLoading, error: catsError } = useCategories();
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name ?? "Unnamed");
    return m;
  }, [categories]);

  const getCategoryName = (id: string) =>
    nameById.get(id ?? "") ?? (catsLoading ? "Loading…" : "Unknown / Deleted");

  useEffect(() => {
    (async () => {
      try {
        const data = await listUserTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("❌ Error loading transactions:", err);
      }
    })();
  }, []);

  const handleAdd = (tx: Transaction) => setTransactions((prev) => [tx, ...prev]);

  const handleExportCSV = () => {
    exportTransactionsToCSV({
      transactions,
      getCategoryName,
    });
    setShowExportMenu(false);
  };

  const handleExportColored = () => {
    exportTransactionsToColoredExcel({
      transactions,
      getCategoryName,
    });
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
      <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          
          <div className="flex items-center gap-3">
            {/* Export Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((s) => !s)}
                className="px-4 py-2 rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] font-medium hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition flex items-center gap-2"
                disabled={transactions.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>

              {/* Dropdown Menu */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--color-panel)] border border-[var(--color-line)] shadow-lg z-10">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--color-gold)]/10 transition-colors rounded-t-lg"
                  >
                    <div className="font-medium">Standard CSV</div>
                    <div className="text-xs text-[var(--color-soft)] mt-0.5">
                      Plain text format
                    </div>
                  </button>
                  <button
                    onClick={handleExportColored}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--color-gold)]/10 transition-colors rounded-b-lg border-t border-[var(--color-line)]"
                  >
                    <div className="font-medium">Excel with Colors</div>
                    <div className="text-xs text-[var(--color-soft)] mt-0.5">
                      <span className="text-green-500">Income</span> / <span className="text-red-500">Expense</span> colored
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Add Transaction Button */}
            <button
              onClick={() => setShowForm((s) => !s)}
              className="px-4 py-2 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] font-medium hover:opacity-90 transition"
            >
              {showForm ? "Close" : "Add Transaction"}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="animate-fade-in">
            <TransactionForm onAdd={handleAdd} />
          </div>
        )}

        {catsError && <p className="text-[var(--color-error)] text-sm">{catsError}</p>}

        <TransactionTable
          transactions={transactions}
          getCategoryName={getCategoryName}
        />
      </main>

      <footer className="bg-[var(--color-panel)] border-t border-[var(--color-line)] p-4 text-center text-sm text-[var(--color-soft)]">
        © 2025 Treasurly
      </footer>
    </div>
  );
}