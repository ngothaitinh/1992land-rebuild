import { Phone } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";
import FloatingFormButton from "@/components/FloatingFormButton";
import { contact } from "@/lib/site-config";

const tip =
  "whitespace-nowrap bg-navy-950 px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100";

export default function FloatingCTA() {
  return (
    <>
      {/* Desktop: floating bottom-right buttons */}
      <div className="fixed bottom-8 right-8 z-[100] hidden flex-col items-end gap-3 md:flex">
        {/* Zalo */}
        <div className="group flex items-center gap-3">
          <span className={tip}>Chat Zalo</span>
          <a
            href={contact.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={48} />
          </a>
        </div>

        {/* Form liên hệ */}
        <FloatingFormButton />

        {/* Phone */}
        <div className="group flex items-center gap-3">
          <span className={tip}>{contact.phoneDisplay}</span>
          <a
            href={`tel:${contact.phoneIntl}`}
            className="flex h-12 w-12 items-center justify-center bg-gold-300 text-navy-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            aria-label="Gọi điện"
          >
            <Phone size={20} aria-hidden />
          </a>
        </div>
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold-300/30 bg-navy-950 md:hidden">
        <div className="grid grid-cols-3">
          {/* Zalo */}
          <a
            href={contact.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3 transition-colors hover:bg-navy-800 active:bg-navy-800"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={24} />
            <span className="text-xs font-semibold text-white">Zalo</span>
          </a>

          {/* Form liên hệ */}
          <FloatingFormButton />

          {/* Phone */}
          <a
            href={`tel:${contact.phoneIntl}`}
            className="flex flex-col items-center justify-center gap-1.5 bg-gold-300 py-3 text-navy-950 transition-colors hover:bg-gold-100 active:bg-gold-100"
            aria-label={`Gọi điện ${contact.phoneDisplay}`}
          >
            <Phone size={22} aria-hidden />
            <span className="text-xs font-bold">Gọi ngay</span>
          </a>
        </div>
      </div>
    </>
  );
}
