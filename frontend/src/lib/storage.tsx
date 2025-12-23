// src/lib/storage.ts
export function getStoredUser() {

  const raw = localStorage.getItem('user');
  console.log(raw)
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
