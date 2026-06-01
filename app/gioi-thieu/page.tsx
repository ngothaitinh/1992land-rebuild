import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Tìm hiểu về 1992 Land — đội ngũ môi giới BĐS chuyên nghiệp tại Thủ Đức, TP.HCM.",
};

export default function GioiThieuPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="bg-navy-900 py-20 px-6 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
          Giới thiệu
        </h1>
        <p className="text-surface/60 text-lg max-w-xl mx-auto">
          Đến với 1992 Land — nơi giá trị và lòng tin được kiến tạo từ mỗi
          giao dịch.
        </p>
        <div className="mt-3 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="space-y-6 text-ink leading-relaxed text-lg">
          <p>
            <strong className="text-navy-900">1992 Land</strong> là đơn vị môi
            giới bất động sản chuyên nghiệp, hoạt động tại TP. Hồ Chí Minh và
            các tỉnh lân cận như Vũng Tàu, Bình Dương, Long An, Đồng Nai.
          </p>
          <p>
            Được sáng lập bởi anh{" "}
            <strong className="text-navy-900">Nguyễn Hữu Thọ</strong>, 1992
            Land hướng đến mục tiêu mang lại giá trị thực sự cho khách hàng —
            không chỉ tư vấn một giao dịch, mà đồng hành lâu dài trong hành
            trình sở hữu bất động sản.
          </p>
          <p>
            Với phương châm{" "}
            <em className="text-navy-500">"Giá Trị Kiến Tạo Lòng Tin"</em>,
            chúng tôi cam kết minh bạch, chuyên nghiệp và đặt lợi ích khách
            hàng lên hàng đầu.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { num: "8+", label: "Dự án đang phân phối" },
            { num: "500+", label: "Khách hàng hài lòng" },
            { num: "5+", label: "Năm kinh nghiệm" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl border border-border-soft"
            >
              <div className="text-4xl font-bold text-navy-900 font-numeric mb-2">
                {stat.num}
              </div>
              <div className="text-muted text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
