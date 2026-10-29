"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

const ctaClass =
  "inline-flex min-h-12 items-center justify-center bg-gold-300 px-6 text-[15px] font-semibold text-navy-950 transition-colors duration-200 hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gold-300/30 bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-18">
            <Link href="/" className="group flex min-h-11 items-center" aria-label="1992 Land — Trang chủ">
              <Image
                src="/images/logo.png"
                alt="1992 Land"
                width={120}
                height={48}
                className="h-10 w-auto object-contain brightness-0 invert transition-opacity group-hover:opacity-80"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center px-3 text-sm font-medium transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 ${
                    isActive(link.href) ? "font-semibold text-gold-300" : "text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/lien-he" className={`ml-4 ${ctaClass}`}>
                Nhận tư vấn
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="-mr-2 inline-flex h-12 w-12 items-center justify-center text-white transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 lg:hidden"
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
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-navy-950/70" onClick={() => setMobileOpen(false)} />
        <div className="absolute left-0 right-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-gold-300/30 bg-navy-950">
          <nav className="flex flex-col px-4 pb-6 pt-2 sm:px-6" aria-label="Điều hướng di động">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`flex min-h-12 items-center border-t border-gold-300/30 text-base transition-colors first:border-t-0 hover:text-gold-300 ${
                  isActive(link.href) ? "font-semibold text-gold-300" : "font-medium text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/lien-he" className={`mt-4 w-full ${ctaClass}`}>
              Nhận tư vấn miễn phí
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
