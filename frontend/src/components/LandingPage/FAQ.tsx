import React from "react";
import Background from "./Background";

interface FAQItem { q: string; a: string; }

const faqs: FAQItem[] = [
  { q: "What does Treasurly do?", a: "We help you track spending, set budgets, and reach your financial goals with ease. We combine smart insights with simple tools to make budgeting stress-free. We focus on helping you save money by reminding you about free trials, recurring expenses and subscriptions tracking." },
  { q: "What makes Treasurly unique?", a: "Treasurly is designed specifically for young adults and students who want to manage their finances without the complexity of traditional budgeting apps. Our focus on simplicity, automation, and user-friendly design sets us apart." },
  { q: "Is Treasurly free?", a: "Yes — the core experience is free. Pro unlocks advanced suggestions, heatmaps and exports." },
];

const FAQ = () => {
  return (
    <section id="faq" className="relative py-20 bg-[var(--color-ink)] text-[var(--text-strong)] overflow-hidden">
      {/* Background with glowing blobs - softer for FAQ section */}
      <Background count={4} seed={303} strength="soft" blendMode="screen" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-gold)]">
          Questions, answered
        </h2>
        <p className="mt-3 text-[var(--text-weak)]">Everything you need to know about Treasurly.</p>

        {/* One-row layout; items keep independent heights */}
        <div className="mt-12 mb-10 overflow-x-auto">
          <div className="flex gap-4 items-start flex-nowrap min-w-[800px]"> 
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group flex-1 min-w-0 rounded-xl
                          border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm
                          shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-gold)]
                          hover:shadow-[0_0_30px_rgba(255,228,51,0.1)]"
              >
                <summary className="list-none cursor-pointer">
                  <div className="p-6 flex items-start justify-between gap-3">
                    <span className="font-semibold">{item.q}</span>
                    <span
                      className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                                text-[var(--color-gold)] text-2xl md:text-3xl leading-none transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </div>
                </summary>

                {/* Only the opened item turns into a square; others stay compact */}
                <div className="px-3 pb-5 pt-0 group-open:pt-3 group-open:aspect-square overflow-hidden">
                  <div className="h-full overflow-y-auto pr-1">
                    <p className="text-[var(--text-weak)]">{item.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;