"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/du-an", label: "Dự án" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/tuyen-dung", label: "Tuyển dụng" },
  { href: "/lien-he", label: "Liên hệ" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-surface/95 backdrop-blur-md shadow-sm border-b border-border-soft"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="1992 Land — Trang chủ"
            >
              <div className="flex flex-col leading-none">
                <span
                  className={`text-xl font-bold tracking-widest transition-colors ${
                    scrolled || mobileOpen ? "text-navy-900" : "text-surface"
                  } group-hover:text-gold-500`}
                >
                  1992
                </span>
                <span
                  className={`text-xs font-medium tracking-[0.3em] transition-colors ${
                    scrolled || mobileOpen ? "text-navy-500" : "text-surface/80"
                  } group-hover:text-gold-500`}
                >
                  LAND
                </span>
              </div>
              <div className="w-px h-8 bg-gold-500 ml-1" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md group ${
                      isActive
                        ? scrolled
                          ? "text-navy-900"
                          : "text-surface"
                        : scrolled
                        ? "text-navy-500 hover:text-navy-900"
                        : "text-surface/80 hover:text-surface"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gold-500 transition-transform origin-left ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
              <Link
                href="/lien-he"
                className="ml-4 px-5 py-2.5 text-sm font-semibold bg-navy-900 text-surface rounded-full hover:bg-navy-700 transition-colors"
              >
                Nhận tư vấn
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`lg:hidden p-2 rounded-md transition-colors ${
                scrolled || mobileOpen
                  ? "text-navy-900 hover:bg-navy-50"
                  : "text-surface hover:bg-white/10"
              }`}
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-16 left-0 right-0 bg-surface border-b border-border-soft shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <nav className="flex flex-col px-6 py-6 gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-navy-50 text-navy-900"
                      : "text-navy-700 hover:bg-navy-50 hover:text-navy-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                  )}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-border-soft">
              <Link
                href="/lien-he"
                className="flex items-center justify-center w-full py-3 px-6 bg-navy-900 text-surface text-base font-semibold rounded-full hover:bg-navy-700 transition-colors"
              >
                Nhận tư vấn miễn phí
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
