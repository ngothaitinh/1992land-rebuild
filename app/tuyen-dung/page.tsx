import type { Metadata } from "next";
import { Briefcase, TrendingUp, Users, DollarSign } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Tuyển dụng",
  description: "1992 Land tuyển dụng nhân viên kinh doanh bất động sản — môi trường chuyên nghiệp, thu nhập hấp dẫn.",
};

export default function TuyenDungPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="bg-navy-900 py-20 px-6 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
          Tuyển dụng
        </h1>
        <p className="text-surface/60 text-lg max-w-xl mx-auto">
          Gia nhập đội ngũ 1992 Land — nơi mỗi thành viên đều được hỗ trợ phát
          triển toàn diện.
        </p>
        <div className="mt-3 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        {/* Job card */}
        <div className="border border-border-soft rounded-2xl p-8 bg-surface shadow-sm mb-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full mb-3">
                Đang tuyển
              </span>
              <h2 className="text-2xl font-bold text-navy-900">
                Nhân viên Kinh doanh Bất động sản
              </h2>
              <p className="text-muted mt-1">
                TP. Thủ Đức, TP.HCM — Toàn thời gian
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: DollarSign, label: "Thu nhập", value: "15 — 50tr/tháng" },
              { icon: TrendingUp, label: "Hoa hồng", value: "Cạnh tranh" },
              { icon: Briefcase, label: "Kinh nghiệm", value: "Không yêu cầu" },
              { icon: Users, label: "Số lượng", value: "5 người" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-4 bg-navy-50 rounded-xl"
              >
                <item.icon size={20} className="text-gold-500 mx-auto mb-2" />
                <div className="text-xs text-muted mb-1">{item.label}</div>
                <div className="text-sm font-semibold text-navy-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5 text-ink leading-relaxed mb-8">
            <div>
              <h3 className="font-semibold text-navy-900 mb-2">Mô tả công việc</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                <li>Tư vấn và giới thiệu sản phẩm BĐS đến khách hàng tiềm năng</li>
                <li>Chăm sóc và duy trì mối quan hệ khách hàng lâu dài</li>
                <li>Hỗ trợ khách hàng trong toàn bộ quy trình giao dịch</li>
                <li>Cập nhật thông tin thị trường và dự án mới</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-navy-900 mb-2">Quyền lợi</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                <li>Hoa hồng hấp dẫn, trả đúng hạn</li>
                <li>Đào tạo chuyên sâu về sản phẩm và kỹ năng bán hàng</li>
                <li>Môi trường làm việc chuyên nghiệp, năng động</li>
                <li>Hỗ trợ marketing và công cụ bán hàng</li>
                <li>Cơ hội thăng tiến rõ ràng</li>
              </ul>
            </div>
          </div>

          {/* Apply form */}
          <div className="border-t border-border-soft pt-6">
            <h3 className="font-semibold text-navy-900 mb-4">Nộp hồ sơ ứng tuyển</h3>
            <ContactForm subject="[Tuyển dụng] Ứng tuyển Nhân viên Kinh doanh BĐS — 1992land.com" duAnQuanTam="tuyen-dung" />
          </div>
        </div>
      </div>
    </div>
  );
}
