"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function FloatingFormButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop trigger */}
      <div className="hidden md:flex group items-center gap-3">
        <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
          Form liên hệ
        </span>
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
          aria-label="Mở form liên hệ"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Mobile trigger — used inside grid-cols-3 in FloatingCTA */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col items-center justify-center py-3.5 gap-1.5 bg-navy-900 hover:bg-navy-800 active:bg-navy-950 transition-colors w-full border-x border-navy-800/30"
        aria-label="Form liên hệ"
      >
        <MessageCircle size={22} className="text-gold-400" />
        <span className="text-[10px] font-bold text-gold-400 tracking-wide">Tư vấn</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            <div className="p-7">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-navy-100 hover:bg-navy-200 transition-colors"
                aria-label="Đóng"
              >
                <X size={15} />
              </button>
              <div className="mb-5">
                <p className="text-gold-500 text-[10px] font-semibold tracking-[0.4em] uppercase mb-1">1992 Land</p>
                <h3 className="font-display text-lg font-bold text-navy-900">Nhận tư vấn miễn phí</h3>
                <p className="text-muted text-sm mt-1">Điền thông tin, anh Thọ liên hệ trong 30 phút</p>
              </div>
              <ContactForm compact showProject />
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
