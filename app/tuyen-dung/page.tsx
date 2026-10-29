import type { Metadata } from "next";
import { Briefcase, TrendingUp, Users, DollarSign } from "lucide-react";
import PageHero from "@/components/PageHero";
import { maiaHead, NARROW } from "@/components/maia/ui";
import ContactForm from "@/components/ContactForm";
import { legal } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tuyển dụng",
  description: "1992 Land tuyển dụng nhân viên kinh doanh bất động sản — môi trường chuyên nghiệp, thu nhập hấp dẫn.",
};

export default function TuyenDungPage() {
  return (
    <div>
      <PageHero title="Tuyển dụng">
        <p>
          Gia nhập đội ngũ 1992 Land — nơi mỗi thành viên đều được hỗ trợ phát
          triển toàn diện.
        </p>
      </PageHero>

      <div className="bg-bg px-4 py-16 text-navy-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
        {/* Job card */}
        <div>
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="mb-3 inline-block bg-navy-900 px-3 py-1 text-sm font-semibold text-gold-300">
                Đang tuyển
              </p>
              <h2 style={NARROW} className={`${maiaHead.className} text-balance text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-navy-900 sm:text-5xl`}>
                Nhân viên Kinh doanh Bất động sản
              </h2>
              <p className="mt-3 text-base text-navy-700">
                {legal.addressLocality}, {legal.addressRegion} — Toàn thời gian
              </p>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
            {[
              { icon: DollarSign, label: "Thu nhập", value: "15 — 50tr/tháng" },
              { icon: TrendingUp, label: "Hoa hồng", value: "Cạnh tranh" },
              { icon: Briefcase, label: "Kinh nghiệm", value: "Không yêu cầu" },
              { icon: Users, label: "Số lượng", value: "5 người" },
            ].map((item) => (
              <div
                key={item.label}
                className="border-t border-navy-900/20 py-4"
              >
                <item.icon size={20} className="mb-2 text-gold-900" aria-hidden />
                <div className="mb-1 text-sm text-navy-700">{item.label}</div>
                <div className="font-numeric text-base font-semibold text-navy-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-10 space-y-8 leading-relaxed">
            <div>
              <h3 style={NARROW} className={`${maiaHead.className} mb-2 text-2xl font-bold uppercase tracking-wide text-navy-900`}>Mô tả công việc</h3>
              <ul className="list-disc space-y-1 pl-5 text-base text-navy-800 marker:text-gold-700">
                <li>Tư vấn và giới thiệu sản phẩm BĐS đến khách hàng tiềm năng</li>
                <li>Chăm sóc và duy trì mối quan hệ khách hàng lâu dài</li>
                <li>Hỗ trợ khách hàng trong toàn bộ quy trình giao dịch</li>
                <li>Cập nhật thông tin thị trường và dự án mới</li>
              </ul>
            </div>
            <div>
              <h3 style={NARROW} className={`${maiaHead.className} mb-2 text-2xl font-bold uppercase tracking-wide text-navy-900`}>Quyền lợi</h3>
              <ul className="list-disc space-y-1 pl-5 text-base text-navy-800 marker:text-gold-700">
                <li>Hoa hồng hấp dẫn, trả đúng hạn</li>
                <li>Đào tạo chuyên sâu về sản phẩm và kỹ năng bán hàng</li>
                <li>Môi trường làm việc chuyên nghiệp, năng động</li>
                <li>Hỗ trợ marketing và công cụ bán hàng</li>
                <li>Cơ hội thăng tiến rõ ràng</li>
              </ul>
            </div>
          </div>

          {/* Apply form */}
          <div className="border-t border-navy-900/20 pt-8">
            <h3 style={NARROW} className={`${maiaHead.className} mb-5 text-2xl font-bold uppercase tracking-wide text-navy-900`}>Nộp hồ sơ ứng tuyển</h3>
            <ContactForm subject="[Tuyển dụng] Ứng tuyển Nhân viên Kinh doanh BĐS — 1992land.com" duAnQuanTam="tuyen-dung" />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
