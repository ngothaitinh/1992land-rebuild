"use client";

import { Phone, ShieldCheck, Banknote, Tag, MapPin } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";
import ContactForm from "@/components/ContactForm";

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
    <div className="rounded-3xl border border-border-soft bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-navy-950 px-5 py-4">
        <p className="text-gold-400 text-[10px] font-semibold tracking-[0.35em] uppercase mb-0.5">1992 Land</p>
        <h3 className="font-display text-white font-bold text-base leading-snug">Nhận tư vấn & báo giá</h3>
        <p className="text-navy-300 text-xs mt-0.5">Phản hồi trong 30 phút · Không spam</p>
      </div>

      {/* Key info strip */}
      <div className="border-b border-border-soft divide-y divide-border-soft">
        {project.priceRange && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <Banknote size={13} className="text-gold-500 shrink-0" />
            <span className="text-xs text-muted">Giá từ</span>
            <span className="ml-auto text-sm font-bold text-gold-600 font-numeric">{project.priceRange}</span>
          </div>
        )}
        {project.discount && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-gold-50/60">
            <Tag size={13} className="text-gold-500 shrink-0" />
            <span className="text-xs text-navy-800 font-medium leading-snug">{project.discount}</span>
          </div>
        )}
        {project.ownership && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
            <span className="text-xs text-navy-700">{project.ownership}</span>
          </div>
        )}
        {project.location && (
          <div className="flex items-center gap-3 px-5 py-2.5">
            <MapPin size={13} className="text-gold-500 shrink-0" />
            <span className="text-xs text-muted truncate">{project.location}</span>
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
      <div className="border-t border-border-soft mx-5" />

      {/* Alt contact */}
      <div className="px-5 py-4 flex flex-col gap-2">
        <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-0.5">Hoặc liên hệ trực tiếp</p>
        <a
          href="https://zalo.me/0909474123"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 border-2 border-[#0068FF] text-[#0068FF] text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
        >
          <ZaloIcon size={16} /> Chat Zalo ngay
        </a>
        <a
          href="tel:+84909474123"
          className="flex items-center justify-center gap-2 py-2.5 border border-border-soft text-navy-700 text-sm font-medium rounded-xl hover:bg-navy-50 transition-colors"
        >
          <Phone size={13} /> 0909 474 123
        </a>
      </div>

      {/* Trust footer */}
      <div className="border-t border-border-soft bg-navy-50/50 px-5 py-3">
        <p className="text-[10px] text-muted text-center leading-relaxed">
          Thứ 2 – Chủ nhật · 8:00–20:00 · Tư vấn 1-1 miễn phí
        </p>
      </div>
    </div>
  );
}
