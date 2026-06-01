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

  const isHome = pathname === "/";
  // transparent only on homepage before scroll
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/98 backdrop-blur-md shadow-[0_1px_0_0_#E4DDD3]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="1992 Land — Trang chủ"
            >
              <div className="flex flex-col leading-none">
                <span
                  className={`text-xl font-bold tracking-widest transition-colors ${
                    isTransparent ? "text-white" : "text-navy-900"
                  } group-hover:text-gold-500`}
                >
                  1992
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-[0.4em] transition-colors ${
                    isTransparent ? "text-white/70" : "text-gold-500"
                  }`}
                >
                  LAND
                </span>
              </div>
              <div className={`w-px h-8 transition-colors ${isTransparent ? "bg-white/30" : "bg-gold-400"}`} />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
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
                      isTransparent
                        ? isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                        : isActive
                        ? "text-navy-900"
                        : "text-navy-400 hover:text-navy-900"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0.5 left-4 right-4 h-0.5 bg-gold-500 rounded-full transition-transform origin-left ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
              <Link
                href="/lien-he"
                className={`ml-4 px-5 py-2.5 text-sm font-semibold rounded-full transition-colors ${
                  isTransparent
                    ? "bg-gold-500 text-navy-950 hover:bg-gold-400"
                    : "bg-navy-900 text-white hover:bg-navy-700"
                }`}
              >
                Nhận tư vấn
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`lg:hidden p-2 rounded-md transition-colors ${
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-navy-900 hover:bg-navy-50"
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
