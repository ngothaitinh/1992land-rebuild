import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Tìm hiểu về 1992 Land — đội ngũ môi giới BĐS chuyên nghiệp tại Thủ Đức, TP.HCM. Sáng lập bởi Nguyễn Hữu Thọ với hơn 5 năm kinh nghiệm.",
};

export default function GioiThieuPage() {
  return (
    <div className="pt-20 pb-20">
      {/* Hero */}
      <div className="bg-navy-900 py-20 px-6 text-center">
        <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">Về chúng tôi</p>
        <h1 className="text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
          Giới thiệu 1992 Land
        </h1>
        <p className="text-surface/60 text-lg max-w-xl mx-auto">
          Đến với 1992 Land — nơi giá trị và lòng tin được kiến tạo từ mỗi giao dịch.
        </p>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
      </div>

      {/* Portrait + Bio */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Portrait */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/team/nguyen-huu-tho.jpg"
                  alt="Nguyễn Hữu Thọ — Nhà sáng lập 1992 Land"
                  fill
                  className="object-cover object-[54%_50%] scale-[1.5] origin-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Name card overlay */}
              <div className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-xl p-5 border border-border-soft">
                <div className="text-navy-900 font-bold">Nguyễn Hữu Thọ</div>
                <div className="text-gold-500 text-sm font-medium">Nhà sáng lập · 1992 Land</div>
                <div className="text-muted text-xs mt-1">0909 474 123</div>
              </div>
              {/* Gold accent */}
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl bg-gold-500/10 border border-gold-500/20" />
            </div>
          </div>

          {/* Bio */}
          <div className="order-1 lg:order-2 space-y-6 text-ink leading-relaxed text-lg">
            <div>
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Câu chuyện của chúng tôi</p>
              <h2 className="text-3xl font-bold text-navy-900 mb-6">
                Hơn 5 năm đồng hành cùng hàng trăm gia đình
              </h2>
            </div>
            <p>
              <strong className="text-navy-900">1992 Land</strong> được sáng lập bởi anh{" "}
              <strong className="text-navy-900">Nguyễn Hữu Thọ</strong> — người có hơn 5 năm
              kinh nghiệm trong lĩnh vực môi giới bất động sản tại thị trường miền Nam.
            </p>
            <p>
              Hoạt động tại TP. Thủ Đức và mở rộng ra Bà Rịa — Vũng Tàu, Bình Dương, Long An,
              Đồng Nai, 1992 Land hướng đến mục tiêu mang lại <strong className="text-navy-900">giá trị thực sự</strong>{" "}
              cho khách hàng — không chỉ tư vấn một giao dịch, mà đồng hành lâu dài trong
              hành trình sở hữu bất động sản.
            </p>
            <p>
              Với phương châm{" "}
              <em className="text-navy-500 not-italic font-semibold">&ldquo;Giá Trị Kiến Tạo Lòng Tin&rdquo;</em>,
              chúng tôi cam kết minh bạch thông tin pháp lý, tư vấn trung thực và đặt lợi ích
              khách hàng lên hàng đầu trong mọi giao dịch.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="tel:+84909474123"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-700 transition-colors text-sm"
              >
                <Phone size={15} />
                0909 474 123
              </a>
              <a
                href="https://zalo.me/0909474123"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-soft text-navy-700 font-medium rounded-full hover:border-navy-300 transition-colors text-sm"
              >
                <ZaloIcon size={15} />
                Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-navy-900 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { num: "9+", label: "Dự án đang phân phối", sub: "Trải dài 5 tỉnh thành" },
            { num: "500+", label: "Khách hàng tin tưởng", sub: "Từ năm 2020 đến nay" },
            { num: "5+", label: "Năm kinh nghiệm", sub: "Thị trường BĐS miền Nam" },
            { num: "100%", label: "Minh bạch pháp lý", sub: "Kiểm tra kỹ trước khi tư vấn" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-4xl font-bold text-gold-500 font-numeric mb-1">{stat.num}</div>
              <div className="text-surface font-medium text-sm mb-1">{stat.label}</div>
              <div className="text-surface/40 text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team photo */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Đội ngũ</p>
          <h2 className="text-3xl font-bold text-navy-900">Đội ngũ 1992 Land</h2>
          <div className="mt-3 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
        </div>
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl">
          <Image
            src="/images/team/team-binh-duong.jpg"
            alt="Đội ngũ 1992 Land tại Bình Dương"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1152px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
          <div className="absolute bottom-6 left-8 text-white">
            <p className="font-semibold text-lg">Đội ngũ 1992 Land</p>
            <p className="text-white/70 text-sm">Chuyên nghiệp · Tận tâm · Minh bạch</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-navy-50 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-navy-900 mb-3">Sẵn sàng tư vấn miễn phí</h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          Liên hệ anh Thọ để được tư vấn dự án phù hợp — miễn phí, không ràng buộc.
        </p>
        <Link
          href="/lien-he"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-700 transition-colors"
        >
          Liên hệ ngay <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
