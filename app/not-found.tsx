import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold text-navy-800 font-numeric mb-4">404</div>
        <div className="w-12 h-0.5 bg-gold-500 rounded-full mx-auto mb-6" />
        <h1 className="font-display text-2xl font-bold text-surface mb-3">Trang không tồn tại</h1>
        <p className="text-surface/50 mb-10 leading-relaxed">
          Trang bạn đang tìm kiếm đã bị xóa hoặc chưa được tạo. Hãy quay lại trang chủ hoặc khám phá các dự án của chúng tôi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 text-navy-950 font-semibold rounded-full hover:bg-gold-300 transition-colors"
          >
            <Home size={16} />
            Trang chủ
          </Link>
          <Link
            href="/du-an"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-surface font-medium rounded-full hover:border-white/40 transition-colors"
          >
            <ArrowLeft size={16} />
            Xem dự án
          </Link>
        </div>
      </div>
    </div>
  );
}
