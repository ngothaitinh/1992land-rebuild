import { Phone } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";
import FloatingFormButton from "@/components/FloatingFormButton";
import { contact } from "@/lib/site-config";

export default function FloatingCTA() {
  return (
    <>
      {/* Desktop: floating bottom-right buttons */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-[100] flex-col gap-3 items-end">

        {/* Zalo */}
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            Chat Zalo
          </span>
          <a
            href={contact.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:scale-110 transition-all duration-200 shadow-lg rounded-xl overflow-hidden"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={48} />
          </a>
        </div>

        {/* Form liên hệ */}
        <FloatingFormButton />

        {/* Phone */}
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            {contact.phoneDisplay}
          </span>
          <a
            href={`tel:${contact.phoneIntl}`}
            className="w-12 h-12 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            aria-label="Gọi điện"
          >
            <Phone size={20} />
          </a>
        </div>
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Depth shadow above bar */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
        <div className="bg-white border-t-2 border-gold-400/40 shadow-[0_-6px_32px_rgba(0,0,0,0.14)]">
          <div className="grid grid-cols-3">
            {/* Zalo */}
            <a
              href={contact.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center py-3.5 gap-1.5 border-r border-gray-100 hover:bg-blue-50 active:bg-blue-100 transition-colors"
              aria-label="Chat Zalo"
            >
              <ZaloIcon size={24} />
              <span className="text-[10px] font-semibold text-navy-700">Zalo</span>
            </a>

            {/* Form liên hệ */}
            <FloatingFormButton />

            {/* Phone — gold CTA */}
            <a
              href={`tel:${contact.phoneIntl}`}
              className="flex flex-col items-center justify-center py-3.5 gap-1.5 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 transition-colors relative overflow-hidden"
              aria-label={`Gọi điện ${contact.phoneDisplay}`}
            >
              {/* Subtle shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <Phone size={22} className="text-white relative z-10 drop-shadow-sm" />
              <span className="text-[10px] font-bold text-white relative z-10 tracking-wide">Gọi ngay</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
