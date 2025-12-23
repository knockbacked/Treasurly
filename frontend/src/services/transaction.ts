import { z } from "zod";
import apiClient from "../lib/apiClient";
import { getStoredUser } from "../lib/storage";


export type TransactionInput = z.infer<ReturnType<typeof makeTransactionSchema>>;

export const TransactionSchema = z.object({
    transactionId: z.string(),
    userId: z.string().nullable(), // some records may be null
    target: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    amount: z.number(),
    type: z.enum(["INCOME", "EXPENSE"]),
    category: z.string().optional(), // ← category **ID** from backend
    created: z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Invalid datetime" }
    ),
    recurringRate: z.number().int().nullable().optional(),
    recurring: z.boolean().default(false),
  });
export type Transaction = z.infer<typeof TransactionSchema>;

// ---------- Services (/api/transactions) ----------
const BASE = "/transactions";

export const listTransactions = async (): Promise<Transaction[]> => {
  const res = await apiClient.get(BASE);
  return z.array(TransactionSchema).parse(res.data);
};

export const listUserTransactions = async (): Promise<Transaction[]> => {
  const res = await apiClient.get(`${BASE}/user/${getStoredUser().id}`);
  return z.array(TransactionSchema).parse(res.data);
};



export const getTransaction = async (id: string): Promise<Transaction> => {
  const res = await apiClient.get(`${BASE}/${id}`);
  return TransactionSchema.parse(res.data);
};

export const createTransaction = async (
  payload: Omit<Transaction, "transactionId" | "created">
): Promise<Transaction> => {
  const res = await apiClient.post(BASE, payload);
  return TransactionSchema.parse(res.data);
};

export const updateTransaction = async (
  id: string,
  payload: Partial<Omit<Transaction, "transactionId" | "userId">>
): Promise<Transaction> => {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return TransactionSchema.parse(res.data);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};

// ---- Optional helpers (non-CRUD, available in your endpoints) ----
export const listTransactionsByType = async (type: string) => {
  const res = await apiClient.get(`${BASE}/type/${encodeURIComponent(type)}`);
  return z.array(TransactionSchema).parse(res.data);
};

export const listTransactionsByCategory = async (category: string) => {
  const res = await apiClient.get(`${BASE}/category/${encodeURIComponent(category)}`);
  return z.array(TransactionSchema).parse(res.data);
};



// ---------- Schema ----------

export function makeTransactionSchema(allowedCategoryIds: Set<string>) {
  return z
    .object({
      target: z.string().min(1, "Target is required"),
      description: z.string().optional(),
      amount: z.coerce.number().positive("Amount must be > 0"),
      type: z.enum(["EXPENSE", "INCOME"]),
      categoryId: z.string().refine(id => allowedCategoryIds.has(id), {
        message: "Invalid category",
      }),
      isRecurring: z.boolean().default(false),
      recurringRate: z.coerce.number().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      // Only warn when recurring is on but rate missing
      if (data.isRecurring && (data.recurringRate == null || isNaN(data.recurringRate))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recurringRate"],
          message: "Please specify a recurring rate when 'Recurring' is enabled.",
        });
      }
    });
}


const FrankfurterResponse = z.object({
  amount: z.number(),
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
});

export const convertCurrency = async (
  amount: number,
  to: string,
  from = "AUD"
): Promise<number> => {
  if (from === to) return amount;

  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${from}&to=${to}`
    );
    const data = FrankfurterResponse.parse(await res.json());
    return data.rates[to] ?? amount;
  } catch (err) {
    console.error("Currency conversion failed:", err);
    return amount; // fallback to AUD amount if API fails
  }
};