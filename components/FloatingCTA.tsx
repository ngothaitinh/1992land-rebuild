import { Phone } from "lucide-react";

function ZaloIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <path d="M24 4C12.954 4 4 12.954 4 24c0 5.254 2.013 10.04 5.306 13.668L8 44l6.56-1.726A19.91 19.91 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4zm-5.5 14h2v8h-2v-8zm5 8c0 .552-.448 1-1 1s-1-.448-1-1v-8c0-.552.448-1 1-1s1 .448 1 1v8zm5 0c0 .552-.448 1-1 1h-1v-8h1c.552 0 1 .448 1 1v6zm3.5-5h-1.5v-1h1.5c.276 0 .5.224.5.5s-.224.5-.5.5zm0 3h-1.5v-1h1.5c.276 0 .5.224.5.5s-.224.5-.5.5z"/>
    </svg>
  );
}

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
            className="w-12 h-12 rounded-full bg-[#0068FF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={24} />
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

        {/* Messenger */}
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-navy-900 text-surface text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            Nhắn Messenger
          </span>
          <a
            href="https://m.me/165126330021000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            aria-label="Nhắn Messenger"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.395 5.503 3.58 7.237V22l3.27-1.797C9.86 20.4 10.909 20.6 12 20.6c5.523 0 10-4.145 10-9.357C22 6.145 17.523 2 12 2zm1.022 12.611l-2.545-2.716-4.97 2.716 5.473-5.808 2.607 2.716 4.908-2.716-5.473 5.808z" />
            </svg>
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
            className="flex flex-col items-center justify-center py-3 gap-1 text-[#0068FF] hover:bg-blue-50 transition-colors"
            aria-label="Chat Zalo"
          >
            <ZaloIcon size={20} />
            <span className="text-[10px] font-medium text-muted">Zalo</span>
          </a>
          <a
            href="tel:+84909474123"
            className="flex flex-col items-center justify-center py-3 gap-1 text-gold-500 hover:bg-gold-100 transition-colors"
            aria-label="Gọi điện"
          >
            <Phone size={18} />
            <span className="text-[10px] font-medium text-muted">Gọi ngay</span>
          </a>
          <a
            href="https://m.me/165126330021000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-3 gap-1 text-[#0084FF] hover:bg-blue-50 transition-colors"
            aria-label="Nhắn Messenger"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.395 5.503 3.58 7.237V22l3.27-1.797C9.86 20.4 10.909 20.6 12 20.6c5.523 0 10-4.145 10-9.357C22 6.145 17.523 2 12 2zm1.022 12.611l-2.545-2.716-4.97 2.716 5.473-5.808 2.607 2.716 4.908-2.716-5.473 5.808z" />
            </svg>
            <span className="text-[10px] font-medium text-muted">Messenger</span>
          </a>
        </div>
      </div>
    </>
  );
}
