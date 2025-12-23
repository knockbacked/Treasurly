import { Link } from "react-router-dom";
import Logo from "@/assets/treasurely-coin.svg";
interface NavbarProps {
    onNavClick?: (targetId: string) => (e: React.MouseEvent) => void;
    variant?: "default" | "auth";
  }
  
  export default function Navbar({ onNavClick, variant = "default" }: NavbarProps) {
    const navItems = [
      { label: "Home", id: "home" },
      { label: "Features", id: "features" },
      { label: "FAQs", id: "faq" },
      { label: "Contact Us", id: "contact" },
    ];
  
    return (
      <header className="border-b border-[var(--color-line)] bg-[var(--color-ink)]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Treasurly Logo" className="h-12 w-auto" />
          </div>
  
          {/* Hide center nav if variant=auth */}
          {variant === "default" && (
            <nav className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3 bg-[var(--color-gold)] rounded-full px-3 py-1 text-sm text-[var(--color-ink)] font-medium shadow-[var(--shadow-card)]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={onNavClick?.(item.id)}
                  className="px-3 py-1 rounded-full hover:bg-black/10 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
  
          <div className="flex items-center gap-2">
            {variant === "auth" ? (
              <Link
                to="/"
                className="border border-[var(--color-gold)] text-[var(--color-gold)] px-4 py-1.5 rounded-md font-medium hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
              >
                Back to Home
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="border border-[var(--color-gold)] text-[var(--color-gold)] px-4 py-1.5 rounded-md font-medium hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/signin"
                  className="bg-[var(--color-gold)] text-[var(--color-ink)] px-4 py-1.5 rounded-md font-semibold hover:opacity-90 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }
  