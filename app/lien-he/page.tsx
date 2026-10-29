import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Building2, User } from "lucide-react";
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
    <div className="pt-24 pb-20">
      <div className="bg-navy-900 py-20 px-6 text-center">
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
          Liên hệ
        </h1>
        <p className="text-surface/60 text-lg max-w-xl mx-auto">
          Để lại thông tin, chuyên gia 1992 Land sẽ liên hệ tư vấn miễn phí
          trong vòng 30 phút.
        </p>
        <div className="mt-3 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Info column */}
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-8">
              Thông tin liên hệ
            </h2>

            <ul className="space-y-5 mb-10">
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
                <li key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon size={18} className="text-gold-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-0.5">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-navy-900 font-medium hover:text-gold-500 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-navy-900 font-medium">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Social channels */}
            <h3 className="text-navy-900 font-semibold mb-4">Nhắn tin nhanh</h3>
            <div className="flex gap-3">
              <a
                href={contact.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#0068FF] text-[#0068FF] text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors"
              >
                <ZaloIcon size={20} />
                Zalo
              </a>
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0084FF] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                <MessengerIcon size={16} />
                Messenger
              </a>
            </div>

            {/* Map embed */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-border-soft h-56">
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
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-8">
              Gửi yêu cầu tư vấn
            </h2>

            <ContactForm subject="[Lead] Liên hệ từ trang /lien-he — 1992land.com" />
          </div>
        </div>
      </div>
    </div>
  );
}
