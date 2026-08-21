// components/dashboard/FormNav.tsx
"use client";

import { useState, useEffect } from "react";

type Section = { id: string; label: string };

export default function FormNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
      );
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
  }

  return (
    <nav className="sticky top-0 z-20 -mx-1 mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border-soft bg-surface p-1.5">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => go(id)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            active === id ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
