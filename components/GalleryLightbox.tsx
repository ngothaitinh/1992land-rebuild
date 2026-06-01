"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type Props = {
  images: string[];
  title: string;
};

export default function GalleryLightbox({ images, title }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => {
    if (active === null) return;
    setActive((active - 1 + images.length) % images.length);
  }, [active, images.length]);
  const next = useCallback(() => {
    if (active === null) return;
    setActive((active + 1) % images.length);
  }, [active, images.length]);

  useEffect(() => {
    if (active === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-navy-100 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <Image
              src={src}
              alt={`${title} - ảnh ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/35 transition-colors flex items-center justify-center">
              <ZoomIn
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                size={28}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[200] bg-navy-950/97 backdrop-blur-md flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/55 text-sm tabular-nums">
            {active + 1} / {images.length}
          </div>

          {/* Main image */}
          <div
            className="relative w-full max-w-5xl max-h-[80vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${title} - ảnh ${active + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh] rounded-2xl shadow-2xl"
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
          </div>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                aria-label="Ảnh trước"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                aria-label="Ảnh sau"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden relative border-2 transition-all ${
                  i === active
                    ? "border-gold-500 opacity-100 scale-110"
                    : "border-transparent opacity-45 hover:opacity-75"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
