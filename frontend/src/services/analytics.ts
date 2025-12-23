import { z } from "zod";
import apiClient from "../lib/apiClient";

/* ----------------------------- 🔹 SCHEMAS ----------------------------- */

export const AnalyticsSummarySchema = z.object({
  income: z.coerce.number(),             // BigDecimal → number
  expenses: z.coerce.number(),
  net: z.coerce.number(),
  projectedSpending: z.coerce.number(),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;

/* ----------------------------- 🔹 SERVICES ----------------------------- */

/**
 * Fetches the summary (income, expenses, net, projected spending)
 * for a given userId.
 */
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await apiClient.get("/analytics/summary", { withCredentials: true });
  return AnalyticsSummarySchema.parse(res.data);
};



