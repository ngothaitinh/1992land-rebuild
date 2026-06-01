"use client";

import { useState } from "react";
import { X, FileText, ArrowRight } from "lucide-react";
import ContactForm from "@/components/ContactForm";

type Props = {
  label: string;
  subject: string;
  projectSlug: string;
  icon?: "pdf" | "price" | "plan";
  variant?: "gold" | "outline" | "ghost";
  className?: string;
};

const ICONS = {
  pdf: FileText,
  price: ArrowRight,
  plan: FileText,
};

export default function ContactModal({ label, subject, projectSlug, icon, variant = "gold", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const Icon = icon ? ICONS[icon] : null;

  const btnClass =
    variant === "gold"
      ? "bg-gold-500 text-navy-950 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
      : variant === "outline"
      ? "border border-navy-200 text-navy-900 hover:bg-navy-50"
      : "border border-gold-400 text-gold-600 hover:bg-gold-50";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full transition-all active:scale-[0.97] ${btnClass} ${className}`}
      >
        {Icon && <Icon size={14} />}
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold accent */}
            <div className="h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

            <div className="p-8">
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-navy-100 hover:bg-navy-200 transition-colors"
                aria-label="Đóng"
              >
                <X size={15} />
              </button>

              {/* Header */}
              <div className="mb-6">
                <p className="text-gold-500 text-[10px] font-semibold tracking-[0.4em] uppercase mb-1">1992 Land</p>
                <h3 className="text-xl font-bold text-navy-900">{label}</h3>
                <p className="text-muted text-sm mt-1">Điền thông tin để nhận tài liệu qua Zalo/SMS trong vài phút</p>
              </div>

              <ContactForm subject={subject} duAnQuanTam={projectSlug} compact />

              <p className="text-xs text-muted text-center mt-4">
                Hoặc gọi ngay{" "}
                <a href="tel:+84909474123" className="text-gold-500 font-medium">0909 474 123</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
