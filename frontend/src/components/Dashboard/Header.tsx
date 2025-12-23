import { useNavigate } from "react-router-dom";
import Logo from "@/assets/treasurely-coin.svg"; // ← auto handled by Vite

export default function Header({ onLogout }: { onLogout: () => void }) {
    const navigate = useNavigate();
  
    const navLinks = [
      { label: "Dashboard", path: "/app/dashboard" },
      { label: "Transactions", path: "/app/transactions" },
      { label: "Budgets", path: "/app/budgets" },
      { label: "Reports", path: "/app/reports" },
    ];
  
    return (
      <header className="border-b border-[var(--color-line)] bg-[var(--color-ink)]/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between relative">
          {/* -------- Left: Logo -------- */}
          <div
            onClick={() => navigate("/app/dashboard")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={Logo}
              alt="Treasurly Logo"
              className="h-8 w-auto select-none"
            />
          </div>
  
          {/* -------- Center: Navigation -------- */}
          <nav className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3 bg-[var(--color-gold)] rounded-full px-3 py-1 text-sm text-[var(--color-ink)] font-medium shadow-[var(--shadow-card)]">
            {navLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="px-3 py-1 rounded-full hover:bg-black/10 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
  
          {/* -------- Right: Logout -------- */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="border border-[var(--color-gold)] text-[var(--color-gold)] px-4 py-1.5 rounded-md font-medium hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    );
  }