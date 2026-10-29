"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data";
import { H2 } from "@/components/maia/ui";

const arrowCls =
  "flex h-12 w-12 items-center justify-center border border-gold-300/50 text-gold-300 transition-colors hover:bg-gold-300 hover:text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300";

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
    <section className="bg-navy-900 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-4xl">
        <H2 className="mb-12 lg:mb-16">Niềm tin từ khách hàng</H2>

        <div>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gold-300/30 pt-8 lg:pt-10"
            >
              <blockquote className="mb-8 max-w-[60ch] text-xl font-medium leading-relaxed text-white lg:text-2xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center bg-gold-300 text-lg font-bold text-navy-950"
                >
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-navy-100">
                    {t.role} · {t.project}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-gold-300/30 pt-6">
            <div className="flex">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > active ? 1 : -1);
                    setActive(i);
                  }}
                  className="group flex h-12 w-8 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  aria-label={`Testimonial ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                >
                  <span
                    className={`block h-0.5 transition-all duration-300 ${
                      i === active ? "w-6 bg-gold-300" : "w-3 bg-navy-300 group-hover:bg-navy-100"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={prev} className={arrowCls} aria-label="Trước">
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button onClick={next} className={arrowCls} aria-label="Tiếp">
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
