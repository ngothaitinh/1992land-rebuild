import { Phone } from "lucide-react";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";

export default function FloatingCTA() {
  return (
    <>
      {/* Desktop: floating bottom-right buttons */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-50 flex-col gap-3 items-end">

        {/* Zalo */}
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            Chat Zalo
          </span>
          <a
            href="https://zalo.me/0909474123"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:scale-110 transition-all duration-200 shadow-lg rounded-xl overflow-hidden"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={48} />
          </a>
        </div>

        {/* Messenger */}
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            Messenger
          </span>
          <a
            href="https://m.me/nguyenhuutho911"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            aria-label="Messenger"
          >
            <MessengerIcon size={22} />
          </a>
        </div>

        {/* Phone */}
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            0909 474 123
          </span>
          <a
            href="tel:+84909474123"
            className="w-12 h-12 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            aria-label="Gọi điện"
          >
            <Phone size={20} />
          </a>
        </div>
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border-soft shadow-2xl">
        <div className="grid grid-cols-3 divide-x divide-border-soft">
          <a
            href="https://zalo.me/0909474123"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-3 gap-1 hover:bg-blue-50 transition-colors"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={22} />
            <span className="text-[10px] font-medium text-muted">Zalo</span>
          </a>
          <a
            href="https://m.me/nguyenhuutho911"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-3 gap-1 text-[#0084FF] hover:bg-blue-50 transition-colors"
            aria-label="Messenger"
          >
            <MessengerIcon size={18} />
            <span className="text-[10px] font-medium text-muted">Messenger</span>
          </a>
          <a
            href="tel:+84909474123"
            className="flex flex-col items-center justify-center py-3 gap-1 text-gold-500 hover:bg-gold-100 transition-colors"
            aria-label="Gọi điện"
          >
            <Phone size={18} />
            <span className="text-[10px] font-medium text-muted">Gọi ngay</span>
          </a>
        </div>
      </div>
    </>
  );
}
