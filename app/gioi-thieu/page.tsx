import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";
import PageHero from "@/components/PageHero";
import { H2, maiaHead, NARROW } from "@/components/maia/ui";
import { legal, brand, contact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `Tìm hiểu về ${brand.name} — chuyên trang dự án thuộc ${legal.name}, do ${contact.name} (${contact.jobTitle}) phụ trách tư vấn tại TP.HCM và các tỉnh phía Nam.`,
};

const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export default function GioiThieuPage() {
  return (
    <div>
      <PageHero title="Giới thiệu 1992 Land">
        <p>Đến với 1992 Land — nơi giá trị và lòng tin được kiến tạo từ mỗi giao dịch.</p>
      </PageHero>

      {/* Portrait + Bio */}
      <section className="bg-bg px-4 py-16 text-navy-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <figure className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy-100">
              <Image
                src="/images/team/nguyen-huu-tho.jpg"
                alt={`${contact.name} — ${contact.jobTitle} tại ${legal.name}`}
                fill
                className="object-cover object-[54%_50%] scale-[1.5] origin-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <figcaption className="border-t border-navy-900/20 pt-4">
              <div className="text-lg font-bold">{contact.name}</div>
              <div className="text-base font-medium text-gold-900">
                {contact.jobTitle} · {legal.shortName}
              </div>
              <div className="font-numeric text-base tabular-nums text-navy-700">{contact.phoneDisplay}</div>
            </figcaption>
          </figure>

          <div className="order-1 space-y-6 text-lg leading-relaxed lg:order-2">
            <H2 className="!text-navy-900">Hơn 5 năm đồng hành cùng hàng trăm gia đình</H2>
            <p className="max-w-[65ch]">
              <strong>{brand.name}</strong> là chuyên trang dự án thuộc{" "}
              <a
                href={legal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2 hover:text-gold-900"
              >
                {legal.name}
              </a>
              , do anh <strong>{contact.name}</strong> —{" "}
              {contact.jobTitle.toLowerCase()} tại {legal.shortName} — trực tiếp phụ trách,
              với hơn 5 năm kinh nghiệm tư vấn bất động sản tại thị trường miền Nam.
            </p>
            <p className="max-w-[65ch]">
              Hoạt động tại TP. Hồ Chí Minh và mở rộng ra Bà Rịa — Vũng Tàu, Bình Dương, Long An,
              Đồng Nai, {brand.name} hướng đến mục tiêu mang lại{" "}
              <strong>giá trị thực sự</strong> cho khách hàng —
              không chỉ tư vấn một giao dịch, mà đồng hành lâu dài trong hành trình sở hữu
              bất động sản.
            </p>
            <p className="max-w-[65ch]">
              Với phương châm{" "}
              <em className="font-semibold not-italic text-gold-900">&ldquo;Giá Trị Kiến Tạo Lòng Tin&rdquo;</em>,
              chúng tôi cam kết minh bạch thông tin pháp lý, tư vấn trung thực và đặt lợi ích
              khách hàng lên hàng đầu trong mọi giao dịch.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`tel:${contact.phoneIntl}`}
                className={`${btn} bg-navy-900 text-white hover:bg-navy-800 focus-visible:ring-navy-900 focus-visible:ring-offset-bg`}
              >
                <Phone size={16} aria-hidden />
                {contact.phoneDisplay}
              </a>
              <a
                href={contact.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white focus-visible:ring-navy-900 focus-visible:ring-offset-bg`}
              >
                <ZaloIcon size={16} />
                Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {[
            { num: "9+", label: "Dự án đang phân phối", sub: "Trải dài 5 tỉnh thành" },
            { num: "500+", label: "Khách hàng tin tưởng", sub: "Từ năm 2020 đến nay" },
            { num: "5+", label: "Năm kinh nghiệm", sub: "Thị trường BĐS miền Nam" },
            { num: "2016", label: "Pháp nhân TPI Land", sub: `Thành lập ${legal.licenseDate}` },
          ].map((stat) => (
            <div key={stat.label} className="border-t border-gold-300/30 pt-4">
              <dd className="font-numeric text-5xl font-bold tabular-nums text-gold-300">{stat.num}</dd>
              <dt className="mt-2 text-base font-semibold text-white">{stat.label}</dt>
              <dd className="text-base text-navy-100">{stat.sub}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Team photo */}
      <section className="bg-navy-900 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <H2>Đội ngũ 1992 Land</H2>
          <div className="relative mt-10 aspect-video w-full overflow-hidden bg-navy-800">
            <Image
              src="/images/team/team-binh-duong.jpg"
              alt="Đội ngũ 1992 Land tại Bình Dương"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent px-5 pb-5 pt-16 sm:px-8">
              <p className="text-lg font-semibold">Đội ngũ 1992 Land</p>
              <p className="text-base text-navy-50">Chuyên nghiệp · Tận tâm · Minh bạch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Đơn vị chủ quản */}
      <section className="bg-bg px-4 py-16 text-navy-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <H2 className="!text-navy-900">Đơn vị chủ quản</H2>
          <h3 style={NARROW} className={`${maiaHead.className} mt-4 text-balance text-2xl font-bold uppercase leading-tight tracking-tight text-gold-900 sm:text-3xl`}>
            {legal.name}
          </h3>
          <dl className="mt-8 grid grid-cols-1 gap-x-10 text-base sm:grid-cols-2">
            <div className="border-t border-navy-900/20 py-4">
              <dt className="text-navy-700">Mã số thuế</dt>
              <dd className="font-numeric font-bold tabular-nums">{legal.taxId}</dd>
            </div>
            <div className="border-t border-navy-900/20 py-4">
              <dt className="text-navy-700">Trụ sở chính</dt>
              <dd>{legal.address}</dd>
            </div>
            <div className="border-t border-navy-900/20 py-4 sm:border-b">
              <dt className="text-navy-700">Điện thoại</dt>
              <dd>
                <a href={`tel:${legal.phoneIntl}`} className="font-numeric font-semibold tabular-nums hover:text-gold-900">
                  {legal.phone}
                </a>
              </dd>
            </div>
            <div className="border-y border-navy-900/20 py-4">
              <dt className="text-navy-700">Email</dt>
              <dd>
                <a href={`mailto:${legal.email}`} className="break-all font-semibold hover:text-gold-900">
                  {legal.email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-navy-700">
            {brand.name} hoạt động với vai trò {brand.role.toLowerCase()}, không phải chủ đầu
            tư dự án.{" "}
            <Link href="/phap-ly" className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-900">
              Xem thông tin pháp lý đầy đủ
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <H2>Sẵn sàng tư vấn miễn phí</H2>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-navy-50">
            Liên hệ {contact.name} để được tư vấn dự án phù hợp — miễn phí, không ràng buộc.
          </p>
          <Link
            href="/lien-he"
            className={`${btn} mt-8 bg-gold-300 text-navy-950 hover:bg-gold-100 focus-visible:ring-gold-100 focus-visible:ring-offset-navy-950`}
          >
            Liên hệ ngay <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
