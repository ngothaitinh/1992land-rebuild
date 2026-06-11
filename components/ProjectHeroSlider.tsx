"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { images: string[]; title: string };

export default function ProjectHeroSlider({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex(next);
  }, []);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const t = setTimeout(() => go((index + 1) % images.length, 1), 5000);
    return () => clearTimeout(t);
  }, [index, paused, images.length, go]);

  if (!images.length) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-navy-950 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`${title} — ảnh ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/35 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => go((index - 1 + images.length) % images.length, -1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gold-500 active:scale-95 transition-all z-10"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => go((index + 1) % images.length, 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gold-500 active:scale-95 transition-all z-10"
            aria-label="Ảnh sau"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > index ? 1 : -1)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-7 bg-gold-400" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ảnh ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium z-10 pointer-events-none">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
