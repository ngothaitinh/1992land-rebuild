import { Cormorant } from "next/font/google";
import { CalendarCheck, Sparkle } from "lucide-react";

/** Serif cho tiêu đề landing Maia — Cormorant có subset tiếng Việt (Cinzel thì không). */
export const maiaSerif = Cormorant({ subsets: ["vietnamese", "latin"], weight: ["500", "600", "700"], display: "swap" });

/** Tiêu đề section 2 dòng: dòng trên in hoa, dòng dưới serif thường. */
export function SectionTitle({ top, bottom, className = "", light = false }: { top: string; bottom?: string; className?: string; light?: boolean }) {
  return (
    <h2 className={`${maiaSerif.className} font-semibold leading-[1.1] ${light ? "text-teal-900" : "text-gold-300"} ${className}`}>
      <span className="block text-[2rem] sm:text-5xl lg:text-[3.5rem] uppercase tracking-wide">{top}</span>
      {bottom && <span className="block text-2xl sm:text-4xl lg:text-[2.75rem] mt-1 font-medium">{bottom}</span>}
    </h2>
  );
}

/** Nút viền vàng dẫn xuống form đăng ký. Cao tối thiểu 48px cho thao tác chạm. */
export function CtaLink({ children, href = "#dang-ky" }: { children: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gold-300 bg-teal-900 px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-black/25 transition-colors duration-200 hover:bg-gold-500 hover:text-teal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950 text-center"
    >
      <CalendarCheck size={18} className="shrink-0" aria-hidden />
      {children}
    </a>
  );
}

/** Danh sách gạch đầu dòng ngôi sao vàng. */
export function StarList({ items, className = "" }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-4 text-base leading-relaxed ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <Sparkle size={16} className="text-gold-300 fill-gold-300 mt-1 shrink-0" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
