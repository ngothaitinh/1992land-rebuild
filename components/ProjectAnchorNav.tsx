"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Phone, ArrowLeft } from "lucide-react";

const ALL_SECTIONS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "vi-tri", label: "Vị trí" },
  { id: "tien-ich", label: "Tiện ích" },
  { id: "mat-bang", label: "Mặt bằng" },
  { id: "thiet-ke", label: "Thiết kế" },
  { id: "gia-ban", label: "Giá bán" },
  { id: "phap-ly", label: "Pháp lý" },
  { id: "chinh-sach", label: "Chính sách" },
  { id: "diem-noi-bat", label: "Nổi bật" },
  { id: "dang-ky", label: "Đăng ký" },
];

type Props = { sections: string[]; title: string };

export default function ProjectAnchorNav({ sections, title }: Props) {
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const visible = ALL_SECTIONS.filter((s) => sections.includes(s.id));

  useEffect(() => {
    const obs: IntersectionObserver[] = [];
    visible.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach((o) => o.disconnect());
  }, [visible]);

  useEffect(() => {
    if (!mobileOpen) return;
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [mobileOpen]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
    setMobileOpen(false);
  }

  const activeLabel = visible.find((s) => s.id === active)?.label ?? "Điều hướng";

  return (
    <div className="sticky top-0 z-[60] bg-white border-b border-border-soft shadow-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-2 h-14">

          {/* Back link */}
          <Link
            href="/du-an"
            className="flex items-center gap-1.5 text-muted hover:text-navy-900 transition-colors shrink-0 pr-4 border-r border-border-soft mr-1"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline text-sm font-medium">Dự án</span>
          </Link>

          {/* Mobile: dropdown */}
          <div className="flex-1 min-w-0 lg:hidden relative" ref={dropRef}>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex items-center gap-2 w-full text-left min-h-[44px]"
            >
              <span className="text-navy-900 font-semibold text-base truncate flex-1">{activeLabel}</span>
              <ChevronDown size={16} className={`text-muted transition-transform shrink-0 ${mobileOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-soft rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-soft">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Điều hướng</span>
                </div>
                {visible.map(({ id, label }, i) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-base transition-colors text-left ${i > 0 ? "border-t border-border-soft" : ""} ${
                      active === id
                        ? "bg-gold-50 text-gold-600 font-semibold"
                        : "text-navy-700 hover:bg-navy-50"
                    }`}
                  >
                    <span className="text-[11px] text-muted/50 w-5 font-numeric shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {label}
                    {active === id && <span className="ml-auto w-2 h-2 rounded-full bg-gold-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: underline tabs */}
          <div className="hidden lg:flex flex-1 items-center overflow-hidden">
            {visible.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`shrink-0 px-5 h-14 text-[15px] font-medium transition-all border-b-2 whitespace-nowrap ${
                  active === id
                    ? "text-gold-500 border-gold-500"
                    : "text-muted border-transparent hover:text-navy-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Phone CTA */}
          <a
            href="tel:+84909474123"
            className="shrink-0 ml-auto flex items-center gap-2 px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-full hover:bg-navy-700 transition-colors"
          >
            <Phone size={13} />
            <span className="hidden sm:inline">0909 474 123</span>
            <span className="sm:hidden">Gọi</span>
          </a>
        </div>
      </div>
    </div>
  );
}
