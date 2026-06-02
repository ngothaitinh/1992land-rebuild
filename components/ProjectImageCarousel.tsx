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
        <div className="fixed inset-0 z-[500] bg-navy-950/97 backdrop-blur-md flex items-center justify-center" onClick={() => setExpanded(false)}>
          <button onClick={() => setExpanded(false)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <X size={18} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">{current + 1} / {images.length}</div>
          <div className="relative w-full max-w-5xl max-h-[84vh] mx-14" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[current]}
              alt={`${title} ${current + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[84vh] rounded-xl shadow-2xl"
              sizes="100vw"
            />
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
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-12 h-9 rounded-lg overflow-hidden relative border-2 transition-all ${i === current ? "border-gold-500 scale-110 opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}>
                <Image src={src} alt="" fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
