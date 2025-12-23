import React from "react";
import Background from "./Background";

const features = [
  {
    id: "B",
    title: "Budgeting",
    desc: "Budgeting made easy.",
    list: ["Budget by category", "Expense tracking & insights", "Easy summary charts"],
  },
  {
    id: "T",
    title: "Transactions",
    desc: "Track Transactions.",
    list: ["Easy categorisation", "Transaction history", "Search & filters"],
  },
  {
    id: "R",
    title: "Recurring Expenses",
    desc: "Manage Recurring Expenses.",
    list: ["Identify subscriptions", "Manage renewals", "Set reminders (weekly/fortnightly/monthly)"],
  },
];

const OurProducts = () => {
  return (
    <section id="features" className="relative py-20 bg-[var(--color-ink)] text-[var(--text-strong)] overflow-hidden">
      {/* Background with glowing blobs */}
      <Background count={4} seed={22} strength="strong" blendMode="screen" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-gold)]">
          Everything you need to handle your finances effortlessly.
        </h2>
        <p className="mt-3 text-[var(--text-weak)]">
          Set targets, track spendings, manage subscriptions — Treasurly keeps every decision aligned to your plan.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm
                         shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-gold)] 
                         hover:shadow-[0_0_30px_rgba(255,228,51,0.15)] p-6"
            >
              {/* Themed badge */}
              <div className="h-10 w-10 rounded-lg bg-[var(--color-gold)]/15 text-[var(--color-gold)]
                              flex items-center justify-center font-bold">
                {f.id}
              </div>

              <h3 className="mt-4 text-xl text-[var(--color-gold)]/90 font-semibold">{f.title}</h3>
              <p className="mt-2 text-[var(--text-weak)]">{f.desc}</p>

              <ul className="mt-3 text-sm text-[var(--text-weak)] list-disc marker:text-[var(--color-gold)] pl-5 space-y-1">
                {f.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurProducts;