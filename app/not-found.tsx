import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { maiaHead, NARROW } from "@/components/maia/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center bg-navy-950 px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <div style={NARROW} className={`${maiaHead.className} font-numeric text-[8rem] font-extrabold leading-none tabular-nums text-gold-300 sm:text-[11rem]`}>404</div>
          <h1 style={NARROW} className={`${maiaHead.className} mt-4 text-balance text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-white sm:text-5xl`}>Trang không tồn tại</h1>
          <p className="mt-5 text-lg leading-relaxed text-navy-50">
            Trang bạn đang tìm kiếm đã bị xóa hoặc chưa được tạo. Hãy quay lại trang chủ hoặc khám phá các dự án của chúng tôi.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold-300 px-7 py-3 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            >
              <Home size={16} aria-hidden />
              Trang chủ
            </Link>
            <Link
              href="/du-an"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-gold-300 px-7 py-3 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-300 hover:text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            >
              <ArrowLeft size={16} aria-hidden />
              Xem dự án
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
