import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Phone, Mail, Globe, MapPin, User } from "lucide-react";
import PageHero from "@/components/PageHero";
import { maiaHead, NARROW } from "@/components/maia/ui";
import { legal, brand, contact, licenseLine } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Thông tin pháp lý",
  description: `Thông tin doanh nghiệp của ${legal.name} — mã số thuế ${legal.taxId}, địa chỉ trụ sở, liên hệ chính thức và vai trò của chuyên trang ${brand.name}.`,
  alternates: { canonical: `${brand.url}/phap-ly` },
};

const rows = [
  { icon: Building2, label: "Tên doanh nghiệp", value: legal.name },
  { icon: Building2, label: "Mã số thuế / Mã số doanh nghiệp", value: legal.taxId },
  {
    icon: MapPin,
    label: "Địa chỉ trụ sở chính",
    value: legal.address,
    href: legal.mapUrl,
    external: true,
  },
  { icon: Phone, label: "Điện thoại", value: legal.phone, href: `tel:${legal.phoneIntl}` },
  { icon: Mail, label: "Email", value: legal.email, href: `mailto:${legal.email}` },
  { icon: Globe, label: "Website doanh nghiệp", value: legal.url, href: legal.url, external: true },
  { icon: User, label: "Người phụ trách nội dung", value: `${contact.name} — ${contact.jobTitle}` },
];

export default function PhapLyPage() {
  return (
    <div>
      <PageHero title="Thông tin pháp lý">
        <p>Thông tin doanh nghiệp vận hành website 1992land.com.</p>
      </PageHero>

      <div className="bg-bg px-4 py-16 text-navy-900 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-16">

        {/* Pháp nhân */}
        <section>
          <h2 style={NARROW} className={`${maiaHead.className} text-balance text-3xl font-extrabold uppercase leading-[1.02] tracking-tight text-navy-900 sm:text-4xl mb-3`}>
            Đơn vị chủ quản
          </h2>
          <p className="mb-8 text-base text-navy-700">{licenseLine}.</p>

          <dl className="divide-y divide-navy-900/20 border-y border-navy-900/20">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 py-4"
              >
                <dt className="flex items-center gap-2 text-base text-navy-700">
                  <row.icon size={16} className="shrink-0 text-gold-900" aria-hidden />
                  {row.label}
                </dt>
                <dd className="break-words font-medium text-navy-900 sm:col-span-2">
                  {row.href ? (
                    <a
                      href={row.href}
                      {...(row.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="underline underline-offset-2 hover:text-gold-900"
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
          <h2 style={NARROW} className={`${maiaHead.className} text-balance text-3xl font-extrabold uppercase leading-[1.02] tracking-tight text-navy-900 sm:text-4xl mb-5`}>
            Vai trò của {brand.name}
          </h2>
          <div className="max-w-[65ch] space-y-4 text-lg leading-relaxed">
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
          <h2 style={NARROW} className={`${maiaHead.className} text-balance text-3xl font-extrabold uppercase leading-[1.02] tracking-tight text-navy-900 sm:text-4xl mb-5`}>
            Xử lý dữ liệu khách hàng
          </h2>
          <p className="max-w-[65ch] text-lg leading-relaxed">
            Đơn vị thu thập và chịu trách nhiệm với dữ liệu cá nhân khách hàng để lại trên
            website là {legal.name}. Chi tiết về phạm vi thu thập, mục đích sử dụng và quyền
            của khách hàng được nêu tại{" "}
            <Link
              href="/chinh-sach-bao-mat"
              className="font-semibold underline underline-offset-2 hover:text-gold-900"
            >
              Chính sách bảo mật
            </Link>
            .
          </p>
        </section>

        {/* Liên hệ khiếu nại */}
        <section className="border-t border-navy-900/20 pt-8">
          <h2 style={NARROW} className={`${maiaHead.className} text-balance text-3xl font-extrabold uppercase leading-[1.02] tracking-tight text-navy-900 sm:text-4xl mb-4`}>
            Phản ánh & khiếu nại
          </h2>
          <p className="mb-4 max-w-[65ch] text-lg leading-relaxed">
            Nếu anh/chị phát hiện thông tin chưa chính xác trên website hoặc cần phản ánh về
            hoạt động tư vấn, vui lòng liên hệ trực tiếp đơn vị chủ quản:
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-base">
            <a
              href={`tel:${legal.phoneIntl}`}
              className="inline-flex min-h-12 items-center gap-2 font-medium text-navy-900 hover:text-gold-900"
            >
              <Phone size={16} className="text-gold-900" aria-hidden />
              {legal.phone}
            </a>
            <a
              href={`mailto:${legal.email}`}
              className="inline-flex min-h-12 items-center gap-2 font-medium text-navy-900 hover:text-gold-900"
            >
              <Mail size={16} className="text-gold-900" aria-hidden />
              {legal.email}
            </a>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
