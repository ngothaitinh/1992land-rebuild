"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

type Props = { images: string[]; title: string };

export default function AmenitiesGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;

  const close = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close, goPrev, goNext]);

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-navy-100 cursor-zoom-in"
          >
            <Image
              src={src}
              alt={`${title} ${i + 1}`}
              fill
              className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/30 transition-colors flex items-center justify-center">
              <Expand size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[500] bg-black/96 flex flex-col"
            onClick={close}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-white/60 text-sm font-medium">
                {lightboxIndex + 1} / {images.length}
              </span>
              <button
                onClick={close}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main image */}
            <div
              className="flex-1 relative flex items-center justify-center px-14 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full max-w-5xl">
                <Image
                  src={images[lightboxIndex]}
                  alt={`${title} ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1024px"
                  priority
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div
                className="shrink-0 px-6 py-4 flex gap-2 overflow-x-auto scrollbar-thin"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`relative w-16 h-12 shrink-0 rounded-lg overflow-hidden transition-all ${
                      i === lightboxIndex
                        ? "ring-2 ring-gold-500 opacity-100"
                        : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
