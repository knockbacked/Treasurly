import VaultShowcase from "../components/Auth/VaultShowcase";
import AuthCard from "../components/Auth/AuthCard";
import AuthHeader from "../components/Auth/AuthHeader";
import LoginForm from "../components/Auth/LoginForm";
import AuthFooter from "../components/Auth/AuthFooter";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function SigninPage() {
  const [isActive, setIsActive] = useState(false);
  const [wobble, setWobble] = useState(false);

  // 🎚️ Manual tweak variables
  const vaultOffsetY = 2;
  const vaultTitleOffset = -5;
  const vaultContentOffsetY = 0;

  // Optional smooth-scroll behavior (even if this page doesn’t scroll to sections)
  const handleNavClick = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="relative min-h-screen flex flex-col bg-[var(--color-bg)] text-text overflow-hidden">
      {/* 🔹 Navbar at top */}
      <Navbar variant="auth" onNavClick={handleNavClick} />

      {/* 🔹 Auth layout */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Background layers */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#090B10] via-[#0F1117] to-[#13161C]" />
        <div className="absolute -top-40 -left-40 h-[35rem] w-[35rem] rounded-full bg-gold/10 blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 h-[45rem] w-[45rem] rounded-full bg-[var(--color-line)]/5 blur-[180px]" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Main content */}
        <div className="relative w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-16 px-6 py-20">
          <VaultShowcase
            offsetY={vaultOffsetY}
            titleOffset={vaultTitleOffset}
            isActive={isActive}
            wobble={wobble}
            contentOffsetY={vaultContentOffsetY}
          />

          {/* Auth section */}
          <div
            className="flex-1 max-w-md relative z-10"
            onFocusCapture={() => setIsActive(true)}
            onBlurCapture={() => setIsActive(false)}
          >
            <AuthCard>
              <AuthHeader title="Sign in to Treasurly" />
              <LoginForm
                onSubmitStart={() => setWobble(true)}
                onSubmitEnd={() => setTimeout(() => setWobble(false), 1200)}
              />
              <AuthFooter />
            </AuthCard>

            {/* Accent under-glow */}
            <div className="absolute inset-x-0 bottom-[-2rem] mx-auto h-32 w-3/4 bg-gradient-to-t from-gold/10 to-transparent blur-2xl opacity-70" />
          </div>
        </div>
      </div>
    </main>
  );
}
