import { z } from "zod";
import apiClient from "../lib/apiClient";
import { CategorySchema } from "./category";

// ----------------------------------------------------
// 🔹 Sub-schemas
// ----------------------------------------------------

export const BudgetItemSchema = z.object({
  category: CategorySchema.nullable().optional(), // full object from backend
  amount: z.number(),
  frequency: z.number().int().optional(), // backend expects int
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export const BudgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  items: z.array(BudgetItemSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Budget = z.infer<typeof BudgetSchema>;

// ----------------------------------------------------
// 🔹 Base endpoint
// ----------------------------------------------------
const BASE = "/budgets";

// ----------------------------------------------------
// 🔹 CRUD Services
// ----------------------------------------------------

// ✅ Create Budget — expects full category objects already populated in payload
export const createBudget = async (
  payload: Omit<Budget, "id" | "createdAt" | "updatedAt">
): Promise<Budget> => {
  const res = await apiClient.post(BASE, payload);
  return BudgetSchema.parse(res.data);
};

// ✅ Get Budget by ID
export const getBudget = async (budgetId: string): Promise<Budget> => {
  const res = await apiClient.get(`${BASE}/${budgetId}`);
  return BudgetSchema.parse(res.data);
};

// ✅ Update Budget (partial update)
export const updateBudget = async (
  budgetId: string,
  payload: Partial<Omit<Budget, "id">>
): Promise<Budget> => {
  const res = await apiClient.put(`${BASE}/${budgetId}`, payload);
  return BudgetSchema.parse(res.data);
};

// ✅ Delete Budget
export const deleteBudget = async (budgetId: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${budgetId}`);
};

// ----------------------------------------------------
// 🔹 Extended Routes
// ----------------------------------------------------

// ✅ List budgets by user
export const listBudgetsByUser = async (userId: string): Promise<Budget[]> => {
  const res = await apiClient.get(`${BASE}/user/${userId}`);
  return z.array(BudgetSchema).parse(res.data);
};

// ✅ Add item to existing budget
// Note: backend signature → addItemToBudget(String budgetId, String categoryId, BigDecimal amount, int frequency)
export const addItemToBudget = async (
  budgetId: string,
  categoryId: string,
  amount: number,
  frequency: number
): Promise<Budget> => {
  const res = await apiClient.post(`${BASE}/${budgetId}/items`, null, {
    params: { categoryId, amount, frequency },
  });
  return BudgetSchema.parse(res.data);
};

// ✅ Remove an item from a budget
export const removeItemFromBudget = async (
  budgetId: string,
  categoryId: string
): Promise<Budget> => {
  const res = await apiClient.delete(`${BASE}/${budgetId}/items/${categoryId}`);
  return BudgetSchema.parse(res.data);
};
