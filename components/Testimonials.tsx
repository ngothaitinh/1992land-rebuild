"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setActive((v) => (v + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((v) => (v - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="bg-navy-50 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">
            Khách hàng nói gì
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">
            Niềm tin từ khách hàng
          </h2>
          <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
        </div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="bg-surface rounded-3xl p-8 lg:p-12 shadow-sm border border-border-soft"
            >
              <Quote
                size={40}
                className="text-gold-300 mb-6"
                strokeWidth={1.5}
              />
              <blockquote className="text-lg lg:text-xl text-ink leading-relaxed mb-8 font-medium">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center text-surface font-bold text-lg shrink-0">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-navy-900">{t.name}</div>
                  <div className="text-sm text-muted">
                    {t.role} · {t.project}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > active ? 1 : -1);
                    setActive(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-gold-500" : "w-2 bg-navy-200 hover:bg-navy-300"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-border-soft flex items-center justify-center text-navy-500 hover:border-navy-300 hover:text-navy-900 transition-colors"
                aria-label="Trước"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-border-soft flex items-center justify-center text-navy-500 hover:border-navy-300 hover:text-navy-900 transition-colors"
                aria-label="Tiếp"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
