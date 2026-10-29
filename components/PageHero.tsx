import { maiaHead, NARROW } from "@/components/maia/ui";

/** Đầu trang con: nền navy-950, tiêu đề Archivo hẹp in hoa, mô tả bên dưới. Server component. */
export default function PageHero({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="bg-navy-950 px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8 lg:pb-16 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 style={NARROW} className={`${maiaHead.className} text-balance text-[2.75rem] font-extrabold uppercase leading-[0.98] tracking-tight text-gold-300 sm:text-6xl lg:text-7xl`}>
          {title}
        </h1>
        {children && <div className="mt-5 max-w-[60ch] text-lg leading-relaxed text-navy-50">{children}</div>}
      </div>
    </section>
  );
}
