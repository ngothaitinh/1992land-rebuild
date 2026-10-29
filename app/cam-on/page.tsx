import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { maiaHead, NARROW } from "@/components/maia/ui";

export const metadata: Metadata = {
  title: "Cảm ơn bạn đã liên hệ",
  description: "1992 Land đã nhận được thông tin của bạn và sẽ liên hệ tư vấn trong vòng 30 phút.",
  robots: { index: false },
};

export default function CamOnPage() {
  return (
    <div className="flex min-h-screen items-center bg-navy-950 px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <CheckCircle size={40} className="mb-6 text-gold-300" aria-hidden />
          <h1 style={NARROW} className={`${maiaHead.className} text-balance text-6xl font-extrabold uppercase leading-[0.98] tracking-tight text-gold-300 sm:text-7xl`}>
            Cảm ơn bạn!
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-white">
            Chúng tôi đã nhận được thông tin của bạn.
          </p>
          <p className="mt-3 text-lg leading-relaxed text-navy-50">
            Anh <span className="font-semibold text-white">Nguyễn Hữu Thọ</span> sẽ liên hệ tư vấn miễn phí trong vòng{" "}
            <span className="font-semibold text-white">30 phút</span>{" "}
            (giờ hành chính 8:00 – 20:00).
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/du-an"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold-300 px-7 py-3 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            >
              Xem dự án
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-gold-300 px-7 py-3 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-300 hover:text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
