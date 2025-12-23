
// src/hooks/useCategories.ts
import { useEffect, useState } from "react";
import { listCategories, type Category } from "../services/category";

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await listCategories();
        if (alive) setData(cats);
      } catch (e) {
        if (alive) setError("Failed to load categories");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const byId = new Map(data.map(c => [c.id, c]));
  return { categories: data, byId, loading, error };
}