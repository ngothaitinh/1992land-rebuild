import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Signature from "@/components/Signature";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";
import { legal, brand, contact, licenseLine } from "@/lib/site-config";
import { loadProjects } from "@/lib/loadData";
import { maiaHead, NARROW } from "@/components/maia/ui";

const projects = loadProjects().map((p) => ({ href: `/du-an/${p.slug}`, label: p.title }));

const linkCls = "inline-flex min-h-11 items-center transition-colors hover:text-gold-300";
const labelCls = "mb-0.5 block text-xs uppercase tracking-wider text-navy-100";

export default function Footer() {
  return (
    <footer className="border-t border-gold-300/30 bg-navy-950 text-navy-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">

          {/* Cột 1: Liên hệ */}
          <div>
            {/* Logo */}
            <div className="mb-6">
              <Image
                src="/images/logo.png"
                alt="1992 Land"
                width={64}
                height={64}
                
              />
            </div>

            <p className="mb-2 text-sm leading-relaxed text-navy-100">
              {brand.tagline} — {brand.role} thuộc{" "}
              <a
                href={legal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gold-300 transition-colors"
              >
                {legal.name}
              </a>
              .
            </p>

            <p className="mb-6 text-xs leading-relaxed text-navy-100">
              {licenseLine}
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-300 mt-0.5 shrink-0" />
                <span>
                  <span className={labelCls}>
                    Trụ sở chính
                  </span>
                  {legal.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-300 shrink-0" />
                <a
                  href={`tel:${legal.phoneIntl}`}
                  className={linkCls}
                >
                  {legal.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-300 shrink-0" />
                <a
                  href={`mailto:${legal.email}`}
                  className={linkCls}
                >
                  {legal.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-gold-300 shrink-0" />
                <span>Thứ 2 — Chủ nhật: 8:00 — 20:00</span>
              </li>
            </ul>

            {/* Tầng tư vấn — người phụ trách, tách khỏi khối pháp nhân bên trên */}
            <div className="mt-6 border-t border-gold-300/30 pt-5">
              <p className="mb-2 text-xs uppercase tracking-widest text-navy-100">
                Phụ trách nội dung & tư vấn
              </p>
              <p className="text-sm text-white">
                {contact.name} — {contact.jobTitle}
              </p>
              <a
                href={`tel:${contact.phoneIntl}`}
                className="inline-flex min-h-11 items-center text-sm text-gold-300 transition-colors hover:text-gold-100"
              >
                {contact.phoneDisplay}
              </a>
            </div>
          </div>

          {/* Cột 2: Dự án */}
          <div>
            <h3 style={NARROW} className={`${maiaHead.className} mb-4 text-xl font-bold uppercase tracking-wide text-gold-300`}>
              Dự án
            </h3>
            <ul>
              {projects.map((p) => (
                <li key={p.href} className="border-t border-gold-300/30 first:border-t-0">
                  <Link href={p.href} className="flex min-h-11 items-center py-1 text-sm text-navy-50 transition-colors hover:text-gold-300">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Theo dõi */}
          <div>
            <h3 style={NARROW} className={`${maiaHead.className} mb-4 text-xl font-bold uppercase tracking-wide text-gold-300`}>
              Theo dõi
            </h3>

            <div className="mb-8">
              <a
                href={contact.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 border-t border-gold-300/30 py-2 text-sm font-medium text-white transition-colors hover:text-gold-300"
              >
                <ZaloIcon size={32} />
                Chat Zalo
              </a>
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 border-t border-gold-300/30 py-2 text-sm font-medium text-white transition-colors hover:text-gold-300"
              >
                <MessengerIcon size={28} />
                Messenger
              </a>
              <a
                href={`tel:${contact.phoneIntl}`}
                className="flex min-h-12 items-center gap-3 border-t border-gold-300/30 py-2 text-sm font-medium text-white transition-colors hover:text-gold-300"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-gold-300 text-navy-950">
                  <Phone size={14} />
                </span>
                Gọi ngay
              </a>
            </div>

            <div>
              <h4 className="mb-2 text-xs uppercase tracking-widest text-navy-100">
                Trang
              </h4>
              <div className="flex flex-wrap gap-x-5 text-sm">
                {[
                  { href: "/gioi-thieu", label: "Giới thiệu" },
                  { href: "/tin-tuc", label: "Tin tức" },
                  { href: "/tuyen-dung", label: "Tuyển dụng" },
                  { href: "/lien-he", label: "Liên hệ" },
                  { href: "/phap-ly", label: "Pháp lý" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`${linkCls} text-navy-50`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signature */}
        <Signature light className="mt-12 mb-6" />

        {/* Disclaimer */}
        <div className="mb-4 mt-10 max-w-4xl border-t border-gold-300/30 pt-4 text-xs leading-relaxed text-navy-100">
          1992land.com là chuyên trang dự án của {legal.name}, hoạt động với vai trò{" "}
          <span className="text-white">{brand.role.toLowerCase()}</span> —{" "}
          <span className="text-white">không phải website chính thức của chủ đầu tư</span>.
          Thông tin mang tính tham khảo, giá và chính sách theo công bố từng thời điểm của chủ đầu tư.{" "}
          <Link
            href="/phap-ly"
            className="text-gold-300 hover:text-gold-100 underline underline-offset-2 whitespace-nowrap"
          >
            Thông tin pháp lý
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gold-300/30 pt-4 text-xs text-navy-100 sm:flex-row sm:items-center">
          <p>© 2026 {legal.name}. Bản quyền đã được bảo hộ.</p>
          <div className="flex flex-wrap items-center gap-x-4">
            <p>MST: {legal.taxId}</p>
            <Link
              href="/phap-ly"
              className={`${linkCls} whitespace-nowrap`}
            >
              Thông tin pháp lý
            </Link>
            <Link
              href="/chinh-sach-bao-mat"
              className={`${linkCls} whitespace-nowrap`}
            >
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
