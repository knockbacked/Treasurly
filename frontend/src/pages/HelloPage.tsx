import React from "react";

import ContactUs from "../components/LandingPage/ContactUs";
import FAQ from "../components/LandingPage/FAQ";
import OurProducts from "../components/LandingPage/OurProducts";
import Home from "../components/LandingPage/Home";
import Navbar from "../components/NavBar";

export default function HelloPage() {
  const handleNavClick = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="flex flex-col min-h-screen bg-[var(--color-ink)] text-[var(--text-strong)] font-sans">
      <Navbar onNavClick={handleNavClick} />

      <div className="space-y-24 md:space-y-32">
        <section id="home" className="scroll-mt-24">
          <Home />
        </section>

        <section id="features" className="scroll-mt-24">
          <OurProducts />
        </section>

        <section id="faq" className="scroll-mt-24">
          <FAQ />
        </section>

        <section id="contact" className="scroll-mt-24">
          <ContactUs />
        </section>
      </div>
    </main>
  );
}
