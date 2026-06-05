"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images, Expand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { images: string[]; title: string };

export default function ProjectGalleryGrid({ images, title }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const touchStartX = useRef(0);
  const total = images.length;

  const close = useCallback(() => setActive(null), []);

  const navigate = useCallback((d: number) => {
    setDir(d);
    setActive((i) => i === null ? null : (i + d + total) % total);
  }, [total]);

  const prev = useCallback(() => navigate(-1), [navigate]);
  const next = useCallback(() => navigate(1), [navigate]);

  // Keyboard
  useEffect(() => {
    if (active === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [active, close, prev, next]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  if (!images.length) return null;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "50%" : "-50%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-50%" : "50%", opacity: 0 }),
  };

  return (
    <>
      {/* ── Gallery Grid ── */}

      {/* Mobile: aspect-ratio hero + count badge */}
      <div
        className="md:hidden relative overflow-hidden rounded-2xl cursor-pointer"
        style={{ aspectRatio: "16/10" }}
        onClick={() => setActive(0)}
      >
        <Image
          src={images[0]}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
        {total > 1 && (
          <button
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-white/60 text-navy-900 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
            onClick={(e) => { e.stopPropagation(); setActive(0); }}
          >
            <Images size={12} className="shrink-0" />
            {total} ảnh
          </button>
        )}
      </div>

      {/* Desktop: editorial 2fr/1fr grid */}
      <div className="hidden md:grid gap-2 rounded-2xl overflow-hidden" style={{ gridTemplateColumns: "2fr 1fr", height: "500px" }}>
        {/* Main large image */}
        <button
          className="relative overflow-hidden cursor-zoom-in group"
          onClick={() => setActive(0)}
          aria-label="Mở ảnh 1"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            priority
            sizes="(max-width: 1280px) 60vw, 780px"
          />
          <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/10 transition-colors duration-300" />
        </button>

        {/* Right column: 2 stacked */}
        <div className="flex flex-col gap-2">
          {[1, 2].map((idx) => (
            <button
              key={idx}
              className="relative flex-1 overflow-hidden cursor-zoom-in group"
              style={{ borderTopRightRadius: idx === 1 ? "1rem" : 0, borderBottomRightRadius: idx === 2 ? "1rem" : 0 }}
              onClick={() => setActive(idx < total ? idx : 0)}
              aria-label={`Mở ảnh ${idx + 1}`}
            >
              {idx < total ? (
                <>
                  <Image
                    src={images[idx]}
                    alt={`${title} ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    sizes="(max-width: 1280px) 30vw, 390px"
                  />
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/10 transition-colors duration-300" />
                </>
              ) : (
                <div className="w-full h-full bg-navy-100" />
              )}

              {/* "+N ảnh" overlay on last thumbnail */}
              {idx === 2 && total > 3 && (
                <div className="absolute inset-0 bg-navy-950/60 flex flex-col items-center justify-center pointer-events-none">
                  <Images size={20} className="text-white mb-1.5 opacity-80" />
                  <span className="text-white font-bold text-sm">+{total - 3} ảnh</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* "Xem tất cả" button — desktop */}
      {total > 1 && (
        <button
          onClick={() => setActive(0)}
          className="hidden md:flex items-center gap-2 mt-3 text-xs font-semibold text-navy-500 hover:text-navy-900 transition-colors group"
        >
          <Expand size={13} className="group-hover:scale-110 transition-transform" />
          Xem tất cả {total} ảnh
        </button>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[500] flex flex-col bg-black/96"
            style={{ WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm font-medium tabular-nums">{active + 1}</span>
                <span className="text-white/25 text-sm">/</span>
                <span className="text-white/30 text-sm tabular-nums">{total}</span>
              </div>
              <p className="text-white/40 text-xs tracking-widest uppercase hidden sm:block">{title}</p>
              <button
                onClick={close}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center text-white"
                aria-label="Đóng"
              >
                <X size={17} />
              </button>
            </div>

            {/* Main image — with swipe drag */}
            <div className="flex-1 relative flex items-center overflow-hidden">
              <AnimatePresence custom={dir} mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 flex items-center justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -55) next();
                    else if (info.offset.x > 55) prev();
                  }}
                  style={{ cursor: total > 1 ? "grab" : "default" }}
                  whileDrag={{ cursor: "grabbing" }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={images[active]}
                      alt={`${title} — ảnh ${active + 1}`}
                      fill
                      className="object-cover select-none pointer-events-none"
                      sizes="100vw"
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/22 active:bg-white/30 transition-colors flex items-center justify-center text-white"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/22 active:bg-white/30 transition-colors flex items-center justify-center text-white"
                    aria-label="Ảnh tiếp"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Swipe hint — mobile only */}
              {total > 1 && (
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/25 text-[10px] tracking-wider pointer-events-none sm:hidden">
                  vuốt để chuyển ảnh
                </p>
              )}
            </div>

            {/* Thumbnail strip */}
            {total > 1 && (
              <div className="shrink-0 pb-5 pt-3 px-4">
                <div
                  className="flex gap-1.5 overflow-x-auto justify-center"
                  style={{ scrollbarWidth: "none" }}
                >
                  {images.map((src, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-[52px] h-[36px] rounded-md overflow-hidden shrink-0 transition-opacity duration-200 ${
                        i === active
                          ? "ring-2 ring-gold-500 opacity-100"
                          : "opacity-35 hover:opacity-65"
                      }`}
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="52px" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
