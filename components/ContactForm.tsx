"use client";

import { useState, useRef } from "react";
import { gtagEvent, fireConversion } from "@/components/Analytics";

type Props = {
  subject?: string;
  duAnQuanTam?: string;
  compact?: boolean;
  showProject?: boolean;
  className?: string;
};

const WEBHOOK_URL = process.env.NEXT_PUBLIC_FORM_WEBHOOK_URL || "https://api.1992land.com/contact-lead";

export default function ContactForm({
  subject = "Liên hệ tư vấn BĐS từ 1992land.com",
  duAnQuanTam = "",
  compact = false,
  showProject = false,
  className = "",
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!WEBHOOK_URL) { setStatus("err"); return; }
    setStatus("loading");

    const fd = new FormData(e.currentTarget);
    const payload = {
      ho_ten: fd.get("ho_ten"),
      so_dien_thoai: fd.get("so_dien_thoai"),
      email: fd.get("email") || "",
      du_an_quan_tam: fd.get("du_an_quan_tam") || duAnQuanTam || "",
      loi_nhan: fd.get("loi_nhan") || "",
      subject,
      source_url: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("ok");
        formRef.current?.reset();
        gtagEvent("form_submit", { form_type: "contact" });
        gtagEvent("generate_lead");
        fireConversion();
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  }

  const inputCls =
    "w-full px-4 py-3 border border-border-soft rounded-xl text-sm focus:outline-none focus:border-navy-500 bg-bg transition-colors";

  if (status === "ok") {
    return (
      <div className={`text-center py-10 ${className}`}>
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-navy-900 mb-1">Đã gửi thành công!</p>
        <p className="text-muted text-sm">Anh Thọ sẽ liên hệ trong vòng 30 phút.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {duAnQuanTam && (
        <input type="hidden" name="du_an_quan_tam" value={duAnQuanTam} />
      )}

      {compact ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Họ và tên *</label>
              <input type="text" name="ho_ten" required placeholder="Nguyễn Văn A" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Số điện thoại *</label>
              <input type="tel" name="so_dien_thoai" required placeholder="0909 xxx xxx" className={inputCls} />
            </div>
          </div>
          {showProject && !duAnQuanTam && (
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Dự án quan tâm</label>
              <select name="du_an_quan_tam" className={inputCls}>
                <option value="">-- Chọn dự án --</option>
                <option>Thanh Phú Centre Point</option>
                <option>Maia Resort Hồ Tràm</option>
                <option>Blanca City Vũng Tàu</option>
                <option>Izumi City Đồng Nai</option>
                <option>Salacia Villas Phú Mỹ</option>
                <option>Ansana by Kita</option>
                <option>Lusso Sài Gòn</option>
                <option>Water Concept</option>
                <option>The Quậy Phước Hải</option>
                <option>Sun Group Cù Lao Phố</option>
                <option>River Collection An Gia</option>
                <option>LA Home Long An</option>
                <option>Khác / Chưa xác định</option>
              </select>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Họ và tên *</label>
              <input type="text" name="ho_ten" required placeholder="Nguyễn Văn A" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Số điện thoại *</label>
              <input type="tel" name="so_dien_thoai" required placeholder="0909 xxx xxx" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" name="email" placeholder="email@example.com" className={inputCls} />
          </div>
          {!duAnQuanTam && (
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Dự án quan tâm</label>
              <select name="du_an_quan_tam" className={inputCls}>
                <option value="">-- Chọn dự án (tùy chọn) --</option>
                <option>Maia Resort Hồ Tràm</option>
                <option>Blanca City Vũng Tàu</option>
                <option>Izumi City Đồng Nai</option>
                <option>Salacia Villas Phú Mỹ</option>
                <option>Ansana by Kita</option>
                <option>Lusso Sài Gòn</option>
                <option>Water Concept</option>
                <option>The Quậy Phước Hải</option>
                <option>Thanh Phú Centre Point</option>
                <option>Sun Group Cù Lao Phố</option>
                <option>River Collection An Gia</option>
                <option>LA Home Long An</option>
                <option>Khác / Chưa xác định</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Lời nhắn</label>
            <textarea name="loi_nhan" rows={4} placeholder="Mô tả nhu cầu của bạn..."
              className={`${inputCls} resize-none`} />
          </div>
        </>
      )}

      {status === "err" && (
        <p className="text-red-500 text-sm">Gửi thất bại. Vui lòng thử lại hoặc gọi trực tiếp 0909 474 123.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3.5 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
      </button>
    </form>
  );
}
