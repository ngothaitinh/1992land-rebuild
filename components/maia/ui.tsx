import { Archivo, Cormorant } from "next/font/google";
import { CalendarCheck } from "lucide-react";

/** Giữ cho landing Thanh Phú (components/thanhphu/ui.tsx) đang dùng chung; Maia không còn dùng. */
export const maiaSerif = Cormorant({ subsets: ["vietnamese", "latin"], weight: ["500", "600", "700"], display: "swap" });

/** Chữ tiêu đề dạng lịch con nước: Archivo hẹp, in hoa. Có subset tiếng Việt. */
export const maiaHead = Archivo({ subsets: ["vietnamese", "latin"], weight: "variable", axes: ["wdth"], display: "swap" });
export const NARROW = { fontVariationSettings: '"wdth" 75' } as const;

/** Tiêu đề section: một dòng, tự đứng được, không nhãn phụ. */
export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 style={NARROW} className={`${maiaHead.className} text-balance text-[2.25rem] sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[1.02] tracking-tight text-gold-300 ${className}`}>
      {children}
    </h2>
  );
}

/** Nút vàng dẫn xuống form đăng ký. Cao tối thiểu 48px cho thao tác chạm. */
export function CtaLink({ children, href = "#dang-ky", className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 bg-gold-300 px-6 py-3 text-[15px] font-semibold text-navy-950 transition-colors duration-200 hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 text-center ${className}`}
    >
      <CalendarCheck size={18} className="shrink-0" aria-hidden />
      {children}
    </a>
  );
}

/** Dòng bảng: nhãn bên trái, nội dung bên phải, kẻ vàng mảnh. */
export function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-gold-300/30 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
      <dt style={NARROW} className={`${maiaHead.className} text-lg font-bold uppercase tracking-wide text-gold-300`}>{k}</dt>
      <dd className="text-base leading-relaxed text-white">{children}</dd>
    </div>
  );
}

/** Danh sách kẻ dòng thay cho gạch đầu dòng. */
export function Ruled({ items, className = "" }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`text-base leading-relaxed ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="max-w-[65ch] border-t border-gold-300/30 py-4">{item}</li>
      ))}
    </ul>
  );
}
