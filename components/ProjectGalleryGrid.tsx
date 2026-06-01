"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

type Props = { images: string[]; title: string };

export default function ProjectGalleryGrid({ images, title }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive((i) => i === null ? null : (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((i) => i === null ? null : (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (active === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [active, close, prev, next]);

  const main = images[0];
  const thumbs = images.slice(1, 3);
  const remaining = images.length - 3;

  return (
    <>
      {/* Grid */}
      <div className="relative">
        {/* Mobile: single hero with count */}
        <div className="md:hidden relative h-64 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setActive(0)}>
          {main && <Image src={main} alt={title} fill className="object-cover" priority sizes="100vw" />}
          <div className="absolute inset-0 bg-navy-950/20" />
          <button onClick={() => setActive(0)} className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-navy-950/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            <Images size={13} /> {images.length} ảnh
          </button>
        </div>

        {/* Desktop: 1 large + 2 stacked */}
        <div className="hidden md:grid grid-cols-[1fr_240px] gap-2 rounded-2xl overflow-hidden h-[420px]">
          {/* Main */}
          <div className="relative cursor-pointer group" onClick={() => setActive(0)}>
            {main && <Image src={main} alt={title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" priority sizes="(max-width: 1280px) 65vw, 820px" />}
            <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/15 transition-colors" />
          </div>
          {/* Thumbs */}
          <div className="flex flex-col gap-2">
            {thumbs.map((src, i) => (
              <div key={i} className="relative flex-1 cursor-pointer group" onClick={() => setActive(i + 1)}>
                <Image src={src} alt={`${title} ${i + 2}`} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="240px" />
                <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/15 transition-colors" />
                {/* "Xem thêm X ảnh" overlay on last thumb */}
                {i === thumbs.length - 1 && remaining > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActive(i + 1); }}
                    className="absolute inset-0 bg-navy-950/55 flex flex-col items-center justify-center text-white"
                  >
                    <Images size={22} className="mb-1" />
                    <span className="text-sm font-semibold">+{remaining} ảnh</span>
                  </button>
                )}
              </div>
            ))}
            {thumbs.length === 0 && (
              <button onClick={() => setActive(0)} className="flex-1 bg-navy-100 flex items-center justify-center text-muted text-sm rounded-r-2xl">
                <Images size={20} className="mr-2" /> {images.length} ảnh
              </button>
            )}
          </div>
        </div>

        {/* "Xem tất cả" button bottom-right — desktop */}
        {images.length > 0 && (
          <button
            onClick={() => setActive(0)}
            className="hidden md:flex absolute bottom-3 right-3 items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-sm text-navy-900 text-xs font-semibold rounded-full shadow hover:bg-white transition-colors border border-white/60"
          >
            <Images size={14} /> Xem tất cả {images.length} ảnh
          </button>
        )}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div className="fixed inset-0 z-[500] bg-navy-950/97 backdrop-blur-md flex items-center justify-center" onClick={close}>
          <button onClick={close} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <X size={18} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">{active + 1} / {images.length}</div>
          <div className="relative w-full max-w-5xl max-h-[84vh] mx-14" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={`${title} ${active + 1}`} width={1200} height={800}
              className="object-contain w-full h-full max-h-[84vh] rounded-xl shadow-2xl" sizes="100vw" />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors">
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-12 h-9 rounded-lg overflow-hidden relative border-2 transition-all ${i === active ? "border-gold-500 scale-110 opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}>
                <Image src={src} alt="" fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
