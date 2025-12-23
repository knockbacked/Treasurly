import { useState } from "react";
import {
  createTransaction,
  getTransaction,
  updateTransaction,
  type Transaction,
} from "../services/transaction";
import { getStoredUser } from "../lib/storage";

// Category constants
const CATEGORY = {
  FOOD: "6906fc0e38c5d65f23f4d9b5",
  TRANSPORT: "6906fc0e38c5d65f23f4d9b6",
  SHOPPING: "6906fc0e38c5d65f23f4d9b7",
  ENTERTAINMENT: "6906fc0e38c5d65f23f4d9b8",
  HEALTHCARE: "6906fc0e38c5d65f23f4d9b9",
  UTILITIES: "6906fc0e38c5d65f23f4d9ba",
  HOUSING: "6906fc0e38c5d65f23f4d9bb",
  EDUCATION: "6906fc0e38c5d65f23f4d9bc",
  TRAVEL: "6906fc0e38c5d65f23f4d9bd",
  SALARY: "6906fc0e38c5d65f23f4d9be",
  FREELANCE: "6906fc0e38c5d65f23f4d9bf",
  INVESTMENT: "6906fc0e38c5d65f23f4d9c0",
};


// Helper to offset dates
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export default function SeedTransactionsPage() {
  const [seeding, setSeeding] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const logMsg = (msg: string) => setLog((prev) => [...prev, msg]);

  const handleSeed = async () => {
    setSeeding(true);
    setLog([]);
    logMsg(" Starting deterministic seeding...");

    const user = getStoredUser();
    if (!user?.id) {
      alert("No logged-in user found. Please log in before seeding.");
      return;
    }
    const userId = user.id;

    const seeds: Omit<Transaction, "transactionId" | "created">[] = [
      // ---- Income ----
      {
        userId,
        target: "Company Payroll",
        description: "Monthly salary payment",
        amount: 5500,
        type: "INCOME",
        category: CATEGORY.SALARY,
        recurring: true,
        recurringRate: 30,
      },
      {
        userId,
        target: "Upwork Client",
        description: "Freelance project payment",
        amount: 1200,
        type: "INCOME",
        category: CATEGORY.FREELANCE,
        recurring: false,
        recurringRate: null,
      },
      {
        userId,
        target: "CommBank Dividends",
        description: "Quarterly stock dividend",
        amount: 320,
        type: "INCOME",
        category: CATEGORY.INVESTMENT,
        recurring: false,
        recurringRate: null,
      },

      // ---- Expenses ----
      {
        userId,
        target: "Woolworths",
        description: "Groceries & snacks",
        amount: 180,
        type: "EXPENSE",
        category: CATEGORY.FOOD,
        recurring: true,
        recurringRate: 7,
      },
      {
        userId,
        target: "Spotify",
        description: "Music subscription",
        amount: 12.99,
        type: "EXPENSE",
        category: CATEGORY.ENTERTAINMENT,
        recurring: true,
        recurringRate: 30,
      },
      {
        userId,
        target: "Netflix",
        description: "Video streaming subscription",
        amount: 19.99,
        type: "EXPENSE",
        category: CATEGORY.ENTERTAINMENT,
        recurring: true,
        recurringRate: 30,
      },
      {
        userId,
        target: "Sydney Trains",
        description: "Opal top-up",
        amount: 50,
        type: "EXPENSE",
        category: CATEGORY.TRANSPORT,
        recurring: false,
        recurringRate: null,
      },
      {
        userId,
        target: "Electric Company",
        description: "Monthly electricity bill",
        amount: 120,
        type: "EXPENSE",
        category: CATEGORY.UTILITIES,
        recurring: true,
        recurringRate: 30,
      },
      {
        userId,
        target: "Landlord",
        description: "Monthly rent payment",
        amount: 2200,
        type: "EXPENSE",
        category: CATEGORY.HOUSING,
        recurring: true,
        recurringRate: 30,
      },
      {
        userId,
        target: "Chemist Warehouse",
        description: "Health supplements & medication",
        amount: 75,
        type: "EXPENSE",
        category: CATEGORY.HEALTHCARE,
        recurring: false,
        recurringRate: null,
      },
      {
        userId,
        target: "UNSW Short Course",
        description: "Online professional development course",
        amount: 300,
        type: "EXPENSE",
        category: CATEGORY.EDUCATION,
        recurring: false,
        recurringRate: null,
      },
      {
        userId,
        target: "Qantas Airways",
        description: "Flight to Melbourne",
        amount: 280,
        type: "EXPENSE",
        category: CATEGORY.TRAVEL,
        recurring: false,
        recurringRate: null,
      },
      {
        userId,
        target: "Amazon AU",
        description: "New headphones",
        amount: 120,
        type: "EXPENSE",
        category: CATEGORY.SHOPPING,
        recurring: false,
        recurringRate: null,
      },
    ];

    try {
      const createdRecords: Transaction[] = [];

      // 1️⃣ Create all transactions
      for (const seed of seeds) {
        const tx = await createTransaction(seed);
        createdRecords.push(tx);
        logMsg(`✅ Created: ${seed.description}`);
      }

      // 2️⃣ Backdate them for realism (using updateTransaction)
      const backdateOffsets = [
        3, 7, 14, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 100,
      ];

      for (let i = 0; i < createdRecords.length; i++) {
        const record = createdRecords[i];
        const offset = backdateOffsets[i % backdateOffsets.length];
        const date = daysAgo(offset);
      
        // Fetch full record and send complete data with new created date
        const full = await getTransaction(record.transactionId);
        await updateTransaction(record.transactionId, { ...full, created: date });
      
        logMsg(`🕓 Backdated ${record.description} → ${date.split("T")[0]}`);
      }

      logMsg("🎉 Deterministic seeding complete!");
    } catch (err) {
      console.error("❌ Seeding failed:", err);
      logMsg("❌ Seeding failed — check console for details.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] p-8">
      <h1 className="text-2xl font-bold mb-4">🧩 Deterministic Transaction Seeder</h1>

      <div className="border border-[var(--color-line)] rounded-xl bg-[var(--color-panel)] p-6 space-y-3">
        <p className="text-[var(--color-soft)]">
          This will create <b>reproducible, meaningful transactions</b> across all categories.
          Each transaction is timestamped to simulate realistic past activity.
        </p>

        <button
          disabled={seeding}
          onClick={handleSeed}
          className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-ink)] rounded font-semibold disabled:opacity-50 hover:opacity-90"
        >
          {seeding ? "Seeding..." : "Seed Deterministic Data"}
        </button>

        <div className="mt-4 h-64 overflow-y-auto text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-line)] rounded p-3">
          {log.length === 0 ? (
            <p className="text-[var(--color-soft)]">Logs will appear here...</p>
          ) : (
            log.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">{l}</div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
