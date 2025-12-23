import { z } from "zod";
import apiClient from "../lib/apiClient";
;

// ---------- Schema ----------
export const CategorySchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
  });
  
export type Category = z.infer<typeof CategorySchema>;

// ---------- Services (/api/categories) ----------
const BASE = "/categories";

export const listCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get(BASE);
  return z.array(CategorySchema).parse(res.data);
};

export const getCategory = async (id: string): Promise<Category> => {
  const res = await apiClient.get(`${BASE}/${id}`);
  return CategorySchema.parse(res.data);
};

export const createCategory = async (payload: Omit<Category, "id">): Promise<Category> => {
  const res = await apiClient.post(BASE, payload);
  return CategorySchema.parse(res.data);
};

export const updateCategory = async (id: string, payload: Partial<Omit<Category, "id">>): Promise<Category> => {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return CategorySchema.parse(res.data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};


