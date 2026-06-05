"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

type Props = { images: string[]; title: string };

export default function ProjectImageCarousel({ images, title }: Props) {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!expanded) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [expanded, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Inline carousel */}
      <div className="relative rounded-2xl overflow-hidden border border-border-soft group">
        {/* Main image */}
        <div
          className="relative aspect-[16/9] cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <Image
            src={images[current]}
            alt={`${title} ${current + 1}`}
            fill
            className="object-cover transition-transform duration-500"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-navy-950/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand size={14} />
          </button>
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-navy-900 shadow transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-navy-900 shadow transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white w-5" : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-navy-950/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Expanded lightbox */}
      {expanded && (
        <div className="fixed inset-0 z-[500] bg-black/96 flex flex-col" onClick={() => setExpanded(false)}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0 z-10">
            <span className="text-white/50 text-sm tabular-nums">{current + 1} / {images.length}</span>
            <button
              onClick={() => setExpanded(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <X size={17} />
            </button>
          </div>

          {/* Full-screen image */}
          <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[current]}
              alt={`${title} ${current + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 888px) 888px, 1421px"
              priority
            />

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="shrink-0 pb-5 pt-3 px-4 z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1.5 justify-center overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`relative w-[52px] h-[36px] rounded-md overflow-hidden shrink-0 transition-all ${i === current ? "ring-2 ring-gold-500 opacity-100" : "opacity-40 hover:opacity-70"}`}>
                    <Image src={src} alt="" fill className="object-cover" sizes="52px" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
