import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cảm ơn bạn đã liên hệ",
  description: "1992 Land đã nhận được thông tin của bạn và sẽ liên hệ tư vấn trong vòng 30 phút.",
  robots: { index: false },
};

export default function CamOnPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <div className="w-12 h-0.5 bg-gold-500 rounded-full mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-4">
          Cảm ơn bạn!
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-3">
          Chúng tôi đã nhận được thông tin của bạn.
        </p>
        <p className="text-muted leading-relaxed mb-10">
          Anh <span className="font-semibold text-navy-900">Nguyễn Hữu Thọ</span> sẽ liên hệ tư vấn miễn phí trong vòng{" "}
          <span className="font-semibold text-navy-900">30 phút</span>{" "}
          (giờ hành chính 8:00 – 20:00).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/du-an"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 text-navy-950 font-semibold rounded-full hover:bg-gold-400 transition-colors"
          >
            Xem dự án
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border-soft text-navy-700 font-medium rounded-full hover:border-navy-300 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
