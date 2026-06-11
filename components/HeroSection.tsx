"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Signature from "@/components/Signature";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-950">
      {/* Gradient background — deep navy with directional light from bottom-left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #0A1628 0%, #0D1E38 35%, #071121 65%, #04090F 100%)",
        }}
      />

      {/* Blueprint grid — architectural feel */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#C4972C 1px, transparent 1px), linear-gradient(90deg, #C4972C 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />

      {/* Diagonal accent lines — like architectural blueprints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute right-0 top-0 w-[55%] h-full opacity-[0.04]" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" fill="none">
          <line x1="400" y1="0" x2="0" y2="600" stroke="#C4972C" strokeWidth="1"/>
          <line x1="400" y1="100" x2="80" y2="600" stroke="#C4972C" strokeWidth="0.5"/>
          <line x1="400" y1="-80" x2="-80" y2="600" stroke="#C4972C" strokeWidth="0.5"/>
          <line x1="300" y1="0" x2="300" y2="600" stroke="#E5E2D9" strokeWidth="0.5"/>
          <line x1="200" y1="0" x2="200" y2="600" stroke="#E5E2D9" strokeWidth="0.3"/>
        </svg>
      </div>

      {/* Soft radial glow — bottom only, away from header */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-navy-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-48 h-48 rounded-full bg-gold-500/6 blur-[60px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-center pt-28 pb-20 min-h-screen">
        {/* ── Left: Text ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col"
        >
          <motion.div variants={item}>
            <Signature light className="max-w-[100px] mb-8" />
          </motion.div>

          <motion.p variants={item} className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-5 font-medium">
            Môi giới bất động sản · TP.HCM
          </motion.p>

          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl xl:text-[72px] font-bold text-surface leading-[1.08] tracking-tight mb-8"
          >
            Giá Trị
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #D9AF48 0%, #C49730 60%, #E8C978 100%)" }}
            >
              Kiến Tạo
            </span>
            <br />
            Lòng Tin
          </motion.h1>

          <motion.p variants={item} className="text-surface/60 text-lg max-w-md leading-relaxed mb-2">
            Anh Thọ và đội ngũ 1992 Land đã giúp hơn 500 gia đình tìm được đúng dự án —
          </motion.p>
          <motion.p variants={item} className="text-surface/40 text-base max-w-sm italic mb-10">
            không ép mua, không hối thúc, không hoa hồng che giấu.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-14">
            <Link
              href="/lien-he"
              className="px-8 py-4 bg-gold-500 text-navy-950 font-semibold rounded-full hover:bg-gold-400 active:scale-[0.97] transition-all duration-200 hover:shadow-[0_8px_32px_-4px_rgba(196,151,48,0.45)] text-base text-center"
            >
              Nhận tư vấn miễn phí
            </Link>
            <Link
              href="/du-an"
              className="px-8 py-4 border border-surface/25 text-surface font-medium rounded-full hover:border-surface/55 hover:bg-white/5 active:scale-[0.97] transition-all text-base text-center"
            >
              Xem dự án →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={item} className="flex flex-wrap gap-8 pt-6 border-t border-white/10">
            {[
              { num: "500+", label: "Gia đình tin tưởng" },
              { num: "5+", label: "Năm kinh nghiệm" },
              { num: "9", label: "Dự án phân phối" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-gold-400 font-bold text-3xl font-numeric leading-none">{s.num}</span>
                <span className="text-surface/45 text-xs">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: Portrait ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden lg:flex justify-center items-center relative"
        >
          {/* Decorative rings */}
          <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full border border-gold-500/8" />
          <div className="absolute -bottom-6 -left-6 w-52 h-52 rounded-full border border-gold-500/8" />
          <div className="absolute inset-0 scale-110 rounded-full border border-white/5" />

          {/* Portrait card */}
          <div className="relative w-[390px] h-[520px] rounded-3xl overflow-hidden shadow-[0_40px_80px_-12px_rgba(7,17,33,0.8)] border border-white/10">
            <Image
              src="/images/team/nguyen-huu-tho-portrait.png"
              alt="Nguyễn Hữu Thọ — Nhà sáng lập 1992 Land"
              fill
              className="object-cover object-top"
              priority
              sizes="390px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
            {/* Gold accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-5">
              <div className="text-white font-bold text-xl mb-0.5">Nguyễn Hữu Thọ</div>
              <div className="text-gold-400 text-sm">Nhà sáng lập · 1992 Land</div>
            </div>
          </div>

          {/* Floating badge: left */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -left-10 top-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-5 py-4 text-center shadow-2xl"
          >
            <div className="text-gold-400 font-bold font-numeric text-2xl">500+</div>
            <div className="text-white/65 text-xs mt-0.5">Khách hàng</div>
          </motion.div>

          {/* Floating badge: right bottom */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="absolute -right-6 bottom-28 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-5 py-4 text-center shadow-2xl"
          >
            <div className="text-gold-400 font-bold font-numeric text-2xl">5+</div>
            <div className="text-white/65 text-xs mt-0.5">Năm KN</div>
          </motion.div>

          {/* Floating badge: right top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.45 }}
            className="absolute -right-5 top-10 bg-gold-500 rounded-2xl px-4 py-3 text-center shadow-[0_8px_32px_-4px_rgba(196,151,48,0.5)]"
          >
            <div className="text-navy-950 font-bold font-numeric text-xl leading-none">9</div>
            <div className="text-navy-950/65 text-[10px] mt-0.5">Dự án</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
        <div className="w-px h-10 bg-gradient-to-b from-surface/0 to-surface/20" />
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-1.5 h-1.5 rounded-full bg-gold-500"
        />
      </div>
    </section>
  );
}
