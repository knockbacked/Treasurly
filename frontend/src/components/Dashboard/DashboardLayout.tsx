import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function DashboardLayout() {
  const handleLogout = () => {
    console.log("Handling logout...");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-ink)] text-[var(--text-strong)] font-sans overflow-hidden">
      {/* --- Decorative gold glows (match landing page) --- */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-20 -left-32 h-72 w-72 rounded-full bg-[var(--color-gold)]/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
      </div>

      {/* --- Header stays exactly as is --- */}
      <Header onLogout={handleLogout} />

      {/* --- Main content --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
