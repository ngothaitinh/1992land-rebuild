import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Building2, User } from "lucide-react";
import PageHero from "@/components/PageHero";
import { H2, maiaHead, NARROW } from "@/components/maia/ui";
import ContactForm from "@/components/ContactForm";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";
import { legal, brand, contact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ ${brand.name} — chuyên trang dự án thuộc ${legal.name} (MST ${legal.taxId}). Hotline, Zalo, Messenger và form tư vấn miễn phí.`,
};

export default function LienHePage() {
  return (
    <div>
      <PageHero title="Liên hệ">
        <p>
          Để lại thông tin, chuyên gia 1992 Land sẽ liên hệ tư vấn miễn phí
          trong vòng 30 phút.
        </p>
      </PageHero>

      <div className="bg-bg px-4 py-16 text-navy-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Info column */}
          <div>
            <H2 className="!text-navy-900 mb-8 !text-4xl sm:!text-4xl lg:!text-5xl">Thông tin liên hệ</H2>

            <ul className="mb-10">
              {[
                {
                  icon: Building2,
                  label: "Đơn vị chủ quản",
                  value: `${legal.name} — MST ${legal.taxId}`,
                },
                {
                  icon: MapPin,
                  label: "Trụ sở chính",
                  value: legal.address,
                },
                {
                  icon: Phone,
                  label: "Hotline công ty",
                  value: legal.phone,
                  href: `tel:${legal.phoneIntl}`,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: legal.email,
                  href: `mailto:${legal.email}`,
                },
                {
                  icon: User,
                  label: `Tư vấn trực tiếp — ${contact.jobTitle}`,
                  value: `${contact.name} · ${contact.phoneDisplay}`,
                  href: `tel:${contact.phoneIntl}`,
                },
                {
                  icon: Clock,
                  label: "Giờ làm việc",
                  value: "Thứ 2 — Chủ nhật: 8:00 — 20:00",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4 border-t border-navy-900/20 py-4 last:border-b">
                  <item.icon size={20} className="mt-1 shrink-0 text-gold-900" aria-hidden />
                  <div className="min-w-0">
                    <div className="mb-0.5 text-sm text-navy-700">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="break-words font-medium text-navy-900 underline-offset-2 hover:text-gold-900 hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium text-navy-900">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Social channels */}
            <h3 style={NARROW} className={`${maiaHead.className} mb-4 text-xl font-bold uppercase tracking-wide text-navy-900`}>Nhắn tin nhanh</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={contact.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 border-2 border-[#0068FF] px-5 text-base font-semibold text-[#0050C8] transition-colors hover:bg-[#0068FF] hover:text-white"
              >
                <ZaloIcon size={20} />
                Zalo
              </a>
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 border-2 border-[#0084FF] bg-[#0084FF] px-5 text-base font-semibold text-white transition-colors hover:bg-[#006FD6]"
              >
                <MessengerIcon size={16} />
                Messenger
              </a>
            </div>

            {/* Map embed */}
            <div className="mt-8 h-56 overflow-hidden border border-navy-900/20">
              <iframe
                src={`https://www.google.com/maps?q=${legal.geo.lat},${legal.geo.lng}&z=17&hl=vi&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Bản đồ ${legal.name}`}
              />
            </div>
          </div>

          {/* Form column */}
          <div>
            <H2 className="!text-navy-900 mb-8 !text-4xl sm:!text-4xl lg:!text-5xl">Gửi yêu cầu tư vấn</H2>

            <ContactForm subject="[Lead] Liên hệ từ trang /lien-he — 1992land.com" />
          </div>
        </div>
      </div>
    </div>
  );
}
