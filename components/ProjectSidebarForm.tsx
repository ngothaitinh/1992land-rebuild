"use client";

import { Phone, ShieldCheck, Banknote, Tag, MapPin } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";
import ContactForm from "@/components/ContactForm";
import { contact } from "@/lib/site-config";
import { maiaHead, NARROW } from "@/components/maia/ui";

type Project = {
  title: string;
  slug: string;
  priceRange?: string;
  discount?: string;
  bank_support?: string;
  ownership?: string;
  developer?: string;
  location?: string;
  status?: string;
};

export default function ProjectSidebarForm({ project }: { project: Project }) {
  return (
    <div className="overflow-hidden border border-navy-900/20 bg-bg text-navy-900">
      {/* Header */}
      <div className="bg-navy-950 px-5 py-4">
        <h3 style={NARROW} className={`${maiaHead.className} text-2xl font-extrabold uppercase leading-tight tracking-tight text-gold-300`}>Nhận tư vấn & báo giá</h3>
        <p className="mt-1 text-sm text-navy-50">Phản hồi trong 30 phút · Không spam</p>
      </div>

      {/* Key info strip */}
      <div className="border-b border-navy-900/20 divide-y divide-navy-900/20">
        {project.priceRange && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <Banknote size={14} className="text-gold-700 shrink-0" aria-hidden />
            <span className="text-sm text-navy-700">Giá từ</span>
            <span className="ml-auto font-numeric text-base font-bold tabular-nums text-gold-900">{project.priceRange}</span>
          </div>
        )}
        {project.discount && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <Tag size={14} className="text-gold-700 shrink-0" aria-hidden />
            <span className="text-sm font-medium leading-snug text-navy-900">{project.discount}</span>
          </div>
        )}
        {project.ownership && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <ShieldCheck size={14} className="text-gold-700 shrink-0" aria-hidden />
            <span className="text-sm text-navy-900">{project.ownership}</span>
          </div>
        )}
        {project.location && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <MapPin size={14} className="text-gold-700 shrink-0" aria-hidden />
            <span className="truncate text-sm text-navy-700">{project.location}</span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="px-5 py-5">
        <ContactForm
          compact
          duAnQuanTam={project.title}
          subject={`[Lead Sidebar] ${project.title} — 1992land.com`}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-navy-900/20 mx-5" />

      {/* Alt contact */}
      <div className="px-5 py-4 flex flex-col gap-2">
        <p className="mb-0.5 text-sm font-medium text-navy-700">Hoặc liên hệ trực tiếp</p>
        <a
          href={contact.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 border-2 border-[#0068FF] text-base font-semibold text-[#0050C8] transition-colors hover:bg-[#0068FF] hover:text-white"
        >
          <ZaloIcon size={16} /> Chat Zalo ngay
        </a>
        <a
          href={`tel:${contact.phoneIntl}`}
          className="flex min-h-12 items-center justify-center gap-2 border border-navy-900 text-base font-medium text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
        >
          <Phone size={13} /> {contact.phoneDisplay}
        </a>
      </div>

      {/* Trust footer */}
      <div className="border-t border-navy-900/20 px-5 py-3">
        <p className="text-center text-sm leading-relaxed text-navy-700">
          Thứ 2 – Chủ nhật · 8:00–20:00 · Tư vấn 1-1 miễn phí
        </p>
      </div>
    </div>
  );
}
