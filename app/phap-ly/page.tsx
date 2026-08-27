import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Phone, Mail, Globe, MapPin, User } from "lucide-react";
import { legal, brand, contact, licenseLine } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Thông tin pháp lý",
  description: `Thông tin doanh nghiệp của ${legal.name} — mã số thuế ${legal.taxId}, địa chỉ trụ sở, liên hệ chính thức và vai trò của chuyên trang ${brand.name}.`,
  alternates: { canonical: `${brand.url}/phap-ly` },
};

const rows = [
  { icon: Building2, label: "Tên doanh nghiệp", value: legal.name },
  { icon: Building2, label: "Mã số thuế / Mã số doanh nghiệp", value: legal.taxId },
  { icon: MapPin, label: "Địa chỉ trụ sở chính", value: legal.address },
  { icon: Phone, label: "Điện thoại", value: legal.phone, href: `tel:${legal.phoneIntl}` },
  { icon: Mail, label: "Email", value: legal.email, href: `mailto:${legal.email}` },
  { icon: Globe, label: "Website doanh nghiệp", value: legal.url, href: legal.url, external: true },
  { icon: User, label: "Người phụ trách nội dung", value: `${contact.name} — ${contact.jobTitle}` },
];

export default function PhapLyPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="bg-navy-900 py-20 px-6 text-center">
        <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">
          Minh bạch
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
          Thông tin pháp lý
        </h1>
        <p className="text-surface/60 text-lg max-w-2xl mx-auto">
          Thông tin doanh nghiệp vận hành website 1992land.com.
        </p>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 space-y-14">

        {/* Pháp nhân */}
        <section>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
            Đơn vị chủ quản
          </h2>
          <p className="text-muted text-sm mb-8">{licenseLine}.</p>

          <dl className="divide-y divide-border-soft border-y border-border-soft">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 py-4"
              >
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <row.icon size={15} className="text-gold-500 shrink-0" />
                  {row.label}
                </dt>
                <dd className="sm:col-span-2 text-ink font-medium">
                  {row.href ? (
                    <a
                      href={row.href}
                      {...(row.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-navy-700 hover:text-gold-600 transition-colors"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Định vị */}
        <section>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
            Vai trò của {brand.name}
          </h2>
          <div className="space-y-4 text-ink leading-relaxed">
            <p>
              <strong className="text-navy-900">{brand.name}</strong> là chuyên trang dự án
              của {legal.name}, do{" "}
              <strong className="text-navy-900">{contact.name}</strong> —{" "}
              {contact.jobTitle.toLowerCase()} tại {legal.shortName} — phụ trách nội dung và
              tư vấn khách hàng.
            </p>
            <p>
              Chúng tôi hoạt động với vai trò{" "}
              <strong className="text-navy-900">{brand.role.toLowerCase()}</strong>.{" "}
              1992land.com <strong className="text-navy-900">không phải</strong> website chính
              thức của chủ đầu tư và không đại diện cho chủ đầu tư trong các cam kết pháp lý.
            </p>
            <p>
              Mọi thông tin về quy mô, tiến độ, giá bán, chính sách bán hàng và pháp lý dự án
              đăng trên website đều được tổng hợp từ tài liệu do chủ đầu tư công bố tại từng
              thời điểm, mang tính tham khảo. Điều khoản chính thức của mỗi giao dịch căn cứ
              theo hợp đồng ký kết trực tiếp giữa khách hàng và chủ đầu tư.
            </p>
            <p>
              Tên dự án, tên chủ đầu tư và các nhãn hiệu liên quan xuất hiện trên website
              thuộc quyền sở hữu của các chủ sở hữu tương ứng, được sử dụng nhằm mục đích mô
              tả và giới thiệu sản phẩm đang phân phối.
            </p>
          </div>
        </section>

        {/* Dữ liệu khách hàng */}
        <section>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
            Xử lý dữ liệu khách hàng
          </h2>
          <p className="text-ink leading-relaxed">
            Đơn vị thu thập và chịu trách nhiệm với dữ liệu cá nhân khách hàng để lại trên
            website là {legal.name}. Chi tiết về phạm vi thu thập, mục đích sử dụng và quyền
            của khách hàng được nêu tại{" "}
            <Link
              href="/chinh-sach-bao-mat"
              className="text-navy-700 underline underline-offset-2 hover:text-gold-600 transition-colors"
            >
              Chính sách bảo mật
            </Link>
            .
          </p>
        </section>

        {/* Liên hệ khiếu nại */}
        <section className="rounded-2xl border border-border-soft bg-navy-50/60 p-7">
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">
            Phản ánh & khiếu nại
          </h2>
          <p className="text-ink leading-relaxed mb-4">
            Nếu anh/chị phát hiện thông tin chưa chính xác trên website hoặc cần phản ánh về
            hoạt động tư vấn, vui lòng liên hệ trực tiếp đơn vị chủ quản:
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <a
              href={`tel:${legal.phoneIntl}`}
              className="flex items-center gap-2 text-navy-700 hover:text-gold-600 transition-colors font-medium"
            >
              <Phone size={15} className="text-gold-500" />
              {legal.phone}
            </a>
            <a
              href={`mailto:${legal.email}`}
              className="flex items-center gap-2 text-navy-700 hover:text-gold-600 transition-colors font-medium"
            >
              <Mail size={15} className="text-gold-500" />
              {legal.email}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
