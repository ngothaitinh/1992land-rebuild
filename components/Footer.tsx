import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Signature from "@/components/Signature";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";
import { legal, brand, contact, licenseLine } from "@/lib/site-config";

const projects = [
  { href: "/du-an/salacia-villas-phu-my", label: "Salacia Villas Phú Mỹ" },
  { href: "/du-an/ansana-by-kita", label: "Ansana by Kita" },
  { href: "/du-an/lusso-sai-gon", label: "Lusso Sài Gòn" },
  { href: "/du-an/water-concept", label: "Water Concept" },
  { href: "/du-an/the-quay-phuoc-hai", label: "The Quậy Phước Hải" },
  { href: "/du-an/thanh-phu-centre-point", label: "Thanh Phú Centre Point" },
  { href: "/du-an/sun-group-cu-lao-pho", label: "Sun Group Cù Lao Phố" },
  { href: "/du-an/river-collection-an-gia", label: "River Collection An Gia" },
  { href: "/du-an/la-home-long-an", label: "Khu đô thị LA Home Long An" },
  { href: "/du-an/maia-ho-tram", label: "Maia Resort Hồ Tràm" },
  { href: "/du-an/blanca-city-vung-tau", label: "Blanca City Vũng Tàu" },
  { href: "/du-an/izumi-city-dong-nai", label: "Izumi City Đồng Nai" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-surface/80">
      {/* Gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

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
                className="rounded-xl"
              />
            </div>

            <p className="text-sm text-surface/60 mb-2 leading-relaxed">
              {brand.tagline} — {brand.role} thuộc{" "}
              <a
                href={legal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface/80 hover:text-gold-300 transition-colors"
              >
                {legal.name}
              </a>
              .
            </p>

            <p className="text-xs text-surface/50 mb-6 leading-relaxed">
              {licenseLine}
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-500 mt-0.5 shrink-0" />
                <span>
                  <span className="block text-surface/50 text-xs uppercase tracking-wider mb-0.5">
                    Trụ sở chính
                  </span>
                  {legal.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-500 shrink-0" />
                <a
                  href={`tel:${legal.phoneIntl}`}
                  className="hover:text-gold-300 transition-colors"
                >
                  {legal.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-500 shrink-0" />
                <a
                  href={`mailto:${legal.email}`}
                  className="hover:text-gold-300 transition-colors"
                >
                  {legal.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-gold-500 shrink-0" />
                <span>Thứ 2 — Chủ nhật: 8:00 — 20:00</span>
              </li>
            </ul>

            {/* Tầng tư vấn — người phụ trách, tách khỏi khối pháp nhân bên trên */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-surface/50 text-xs uppercase tracking-widest mb-2">
                Phụ trách nội dung & tư vấn
              </p>
              <p className="text-sm text-surface/80">
                {contact.name} — {contact.jobTitle}
              </p>
              <a
                href={`tel:${contact.phoneIntl}`}
                className="text-sm text-gold-300 hover:text-gold-200 transition-colors"
              >
                {contact.phoneDisplay}
              </a>
              <p className="text-xs text-surface/50 mt-1">
                Văn phòng giao dịch: {brand.officeAddress}
              </p>
            </div>
          </div>

          {/* Cột 2: Dự án */}
          <div>
            <h3 className="text-surface font-semibold text-sm tracking-widest uppercase mb-6">
              Dự án
            </h3>
            <ul className="space-y-2.5">
              {projects.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-sm text-surface/60 hover:text-gold-300 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-500 transition-colors" />
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Theo dõi */}
          <div>
            <h3 className="text-surface font-semibold text-sm tracking-widest uppercase mb-6">
              Theo dõi
            </h3>

            <div className="space-y-3 mb-8">
              <a
                href={contact.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <ZaloIcon size={32} className="rounded-lg" />
                Chat Zalo
              </a>
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0084FF]/15 hover:bg-[#0084FF]/25 transition-colors text-sm font-medium text-[#0084FF]"
              >
                <MessengerIcon size={28} />
                Messenger
              </a>
              <a
                href={`tel:${contact.phoneIntl}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <span className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-white shrink-0">
                  <Phone size={14} />
                </span>
                Gọi ngay
              </a>
            </div>

            <div>
              <h4 className="text-surface/60 text-xs uppercase tracking-widest mb-3">
                Trang
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
                    className="text-surface/50 hover:text-gold-300 transition-colors"
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
        <div className="mt-10 mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-surface/50 leading-relaxed text-center">
          1992land.com là chuyên trang dự án của {legal.name}, hoạt động với vai trò{" "}
          <span className="text-surface/70">{brand.role.toLowerCase()}</span> —{" "}
          <span className="text-surface/70">không phải website chính thức của chủ đầu tư</span>.
          Thông tin mang tính tham khảo, giá và chính sách theo công bố từng thời điểm của chủ đầu tư.{" "}
          <Link
            href="/phap-ly"
            className="text-gold-300 hover:text-gold-200 underline underline-offset-2 whitespace-nowrap"
          >
            Thông tin pháp lý
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-surface/40">
          <p>© 2026 {legal.name}. Bản quyền đã được bảo hộ.</p>
          <div className="flex items-center gap-4">
            <p>MST: {legal.taxId}</p>
            <Link
              href="/phap-ly"
              className="hover:text-gold-300 transition-colors whitespace-nowrap"
            >
              Thông tin pháp lý
            </Link>
            <Link
              href="/chinh-sach-bao-mat"
              className="hover:text-gold-300 transition-colors whitespace-nowrap"
            >
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
