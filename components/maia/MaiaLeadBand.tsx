"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import { gtagEvent, fireConversion } from "@/components/Analytics";
import { contact, legal } from "@/lib/site-config";
import { maiaHead, NARROW } from "./ui";

const WEBHOOK_URL = process.env.NEXT_PUBLIC_FORM_WEBHOOK_URL || "https://api.1992land.com/contact-lead";
const MAIA_PRODUCTS = ["Studio", "1 phòng ngủ", "2 phòng ngủ", "Penthouse", "Villa 2 phòng ngủ", "Villa 3 phòng ngủ", "Chưa xác định"];

type Props = { id?: string; project?: string; place?: string; products?: string[]; formType?: string };

/** Dải đăng ký ngang nền navy — form 1 hàng trên desktop, xếp dọc trên mobile. */
export default function MaiaLeadBand({ id, project = "Maia Resort Hồ Tràm", place = "Hồ Tràm", products = MAIA_PRODUCTS, formType = "maia_landing" }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("loading");
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: fd.get("ho_ten"),
          so_dien_thoai: fd.get("so_dien_thoai"),
          email: "",
          du_an_quan_tam: project,
          loi_nhan: fd.get("san_pham") ? `Quan tâm: ${fd.get("san_pham")}` : "",
          subject: `Đăng ký tham quan ${project}`,
          source_url: window.location.href,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      form.reset();
      gtagEvent("form_submit", { form_type: formType });
      gtagEvent("generate_lead");
      fireConversion();
    } catch {
      setStatus("err");
    }
  }

  const inputCls = "w-full h-12 bg-white px-4 text-base text-ink placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300";

  return (
    <section id={id} className="scroll-mt-32 relative overflow-hidden border-t border-gold-300/40 bg-navy-800 text-white py-14 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 style={NARROW} className={`${maiaHead.className} text-3xl lg:text-5xl font-extrabold uppercase leading-tight tracking-tight text-gold-300`}>Đăng ký tham quan dự án & nhận bảng giá</h2>
        <p className="mt-3 text-base lg:text-lg text-white max-w-3xl mx-auto leading-relaxed">
          Chỉ cần họ tên và số điện thoại. {contact.name} sẽ gửi bảng giá, mặt bằng và chính sách mới nhất qua Zalo, đồng thời sắp xếp lịch tham quan thực tế tại {place}.
        </p>

        <div aria-live="polite">
          {status === "ok" ? (
            <p className="mt-8 bg-white/10 py-5 text-lg font-semibold">Đã nhận thông tin. Chúng tôi sẽ liên hệ bạn trong vòng 30 phút.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
              <label className="block">
                <span className="sr-only">Họ tên</span>
                <input name="ho_ten" required autoComplete="name" placeholder="Họ tên *" className={inputCls} />
              </label>
              <label className="block">
                <span className="sr-only">Số điện thoại</span>
                <input name="so_dien_thoai" type="tel" inputMode="tel" required autoComplete="tel" pattern="[0-9 +.]{9,15}" title="Số điện thoại 9–15 chữ số" placeholder="Số điện thoại *" className={inputCls} />
              </label>
              <label className="block">
                <span className="sr-only">Sản phẩm quan tâm</span>
                <select name="san_pham" defaultValue="" className={inputCls}>
                  <option value="">Sản phẩm quan tâm</option>
                  {products.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-12 bg-gold-300 px-4 text-base font-bold text-navy-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === "loading" ? "Đang gửi..." : "Đăng ký ngay"}
              </button>
            </form>
          )}
          {status === "err" && <p role="alert" className="mt-3 text-base font-medium text-white">Gửi chưa thành công. Vui lòng thử lại hoặc gọi {contact.phoneDisplay}.</p>}
        </div>

        <a href={`tel:${contact.phone}`} className="mt-6 inline-flex min-h-12 items-center gap-2 text-xl font-bold text-gold-100 hover:text-white">
          <Phone size={20} aria-hidden /> Hotline (Zalo): {contact.phoneDisplay}
        </a>
        <p className="mt-4 text-xs sm:text-sm text-white/85 max-w-3xl mx-auto leading-relaxed">
          Bằng việc gửi thông tin, bạn đồng ý để {legal.name} liên hệ tư vấn và đồng ý với{" "}
          <Link href="/chinh-sach-bao-mat" className="underline underline-offset-2 hover:text-white">Chính sách bảo mật</Link>.
          Chúng tôi không chia sẻ dữ liệu của bạn cho bên thứ ba vì mục đích thương mại.
        </p>
      </div>
    </section>
  );
}
