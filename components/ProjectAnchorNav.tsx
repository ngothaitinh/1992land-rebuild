"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Phone, ArrowLeft } from "lucide-react";
import { contact } from "@/lib/site-config";
import { maiaHead, NARROW } from "@/components/maia/ui";

const ALL_SECTIONS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "vi-tri", label: "Vị trí" },
  { id: "thu-vien-anh", label: "Thư viện ảnh" },
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
    <div className="sticky top-0 z-[60] border-b border-gold-300/30 bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-2 h-14">

          {/* Back link */}
          <Link
            href="/du-an"
            className="flex items-center gap-1.5 mr-1 shrink-0 border-r border-gold-300/30 pr-4 text-navy-50 transition-colors hover:text-gold-300"
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
              <span className="flex-1 truncate text-base font-semibold text-white">{activeLabel}</span>
              <ChevronDown size={16} className={`text-navy-50 transition-transform shrink-0 ${mobileOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-navy-950 border border-gold-300/40 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gold-300/30">
                  <span style={NARROW} className={`${maiaHead.className} text-base font-bold uppercase tracking-wide text-gold-300`}>Điều hướng</span>
                </div>
                {visible.map(({ id, label }, i) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-base transition-colors text-left ${i > 0 ? "border-t border-gold-300/30" : ""} ${
                      active === id
                        ? "bg-navy-900 text-gold-300 font-semibold"
                        : "text-white hover:bg-navy-900"
                    }`}
                  >
                    <span className="w-5 shrink-0 font-numeric text-sm tabular-nums text-navy-100">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {label}
                    {active === id && <span className="ml-auto size-2 bg-gold-300" />}
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
                className={`shrink-0 px-5 h-14 text-[15px] font-medium transition-colors border-b-2 whitespace-nowrap ${
                  active === id
                    ? "text-gold-300 border-gold-300"
                    : "text-navy-50 border-transparent hover:text-gold-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Phone CTA */}
          <a
            href={`tel:${contact.phoneIntl}`}
            className="ml-auto flex min-h-12 shrink-0 items-center gap-2 bg-gold-300 px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-100"
          >
            <Phone size={13} />
            <span className="hidden sm:inline">{contact.phoneDisplay}</span>
            <span className="sm:hidden">Gọi</span>
          </a>
        </div>
      </div>
    </div>
  );
}
