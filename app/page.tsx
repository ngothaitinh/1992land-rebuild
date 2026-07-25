import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { loadProjects, loadPosts } from "@/lib/loadData";
import Testimonials from "@/components/Testimonials";
import FadeIn from "@/components/FadeIn";
import ContactForm from "@/components/ContactForm";
import Signature from "@/components/Signature";
import HeroSection from "@/components/HeroSection";
import NewsList from "@/components/NewsList";

const allProjects = loadProjects();
// Sort by newest first for homepage (created_at desc, fallback to order)
const projectsByDate = [...allProjects].sort((a, b) => {
  const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
  return tB - tA;
});
const heroProject = projectsByDate[0];
const gridProjects = projectsByDate.slice(1);

// "Mới" badge: created within 45 days of build
const isNew = (d?: string) => !!d && (Date.now() - new Date(d).getTime()) / 86400000 <= 45;

const posts = loadPosts();

export default function Home() {
  return (
    <>
      {/* ── 1. HERO ──────────────────────────────────────────── */}
      <HeroSection projectCount={allProjects.length} />

      {/* ── 2. PROJECTS ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-bg">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-gold-500 text-xs font-semibold tracking-[0.4em] uppercase mb-3">Dự án</p>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">Mới nhất & Đang mở bán</h2>
                <div className="mt-3 w-14 h-0.5 bg-gold-500 rounded-full" />
              </div>
              <Link href="/du-an" className="flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm font-medium transition-colors group shrink-0">
                Xem tất cả {allProjects.length} dự án
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          {/* Hero card — newest project */}
          <FadeIn>
            <Link
              href={`/du-an/${heroProject.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-[1fr_380px] rounded-3xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-2xl transition-all duration-300 mb-6 cursor-pointer"
            >
              {/* Image */}
              <div className={`relative aspect-video lg:aspect-auto lg:min-h-[400px] bg-gradient-to-br ${heroProject.gradient} overflow-hidden`}>
                {heroProject.hero_image && (
                  <Image
                    src={heroProject.hero_image}
                    alt={heroProject.title}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
                {/* Badges */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                  {isNew(heroProject.created_at) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Mới đăng
                    </span>
                  )}
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm ${
                    heroProject.status === "Đang mở bán"
                      ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/30"
                      : "bg-gold-500/25 text-gold-200 border border-gold-400/30"
                  }`}>
                    {heroProject.status}
                  </span>
                </div>
              </div>

              {/* Info panel */}
              <div className="p-8 lg:p-10 flex flex-col justify-between bg-white">
                <div>
                  <span className="inline-block px-3 py-1 bg-navy-50 text-navy-600 text-xs font-medium rounded-full mb-5">
                    {heroProject.type}
                  </span>
                  <h3 className="font-display text-2xl lg:text-3xl font-bold text-navy-900 leading-tight mb-3 group-hover:text-gold-600 transition-colors">
                    {heroProject.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted text-sm mb-4">
                    <MapPin size={13} className="shrink-0 text-gold-500" />
                    {heroProject.address_full ?? heroProject.location}
                  </div>
                  <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-6">
                    {heroProject.excerpt}
                  </p>
                </div>

                <div>
                  <div className="flex items-end justify-between pt-6 border-t border-border-soft">
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Giá từ</div>
                      <div className="text-gold-500 font-bold text-2xl font-numeric leading-none">{heroProject.priceRange}</div>
                    </div>
                    <span className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-full group-hover:bg-navy-700 transition-colors">
                      Xem dự án <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Grid — remaining projects, newest first */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gridProjects.map((project, i) => (
              <FadeIn key={project.slug} delay={i * 0.07}>
                <Link
                  href={`/du-an/${project.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 h-full cursor-pointer"
                >
                  <div className={`relative h-48 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
                    {project.hero_image && (
                      <Image
                        src={project.hero_image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {isNew(project.created_at) && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">Mới</span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full backdrop-blur-sm ${
                        project.status === "Đang mở bán"
                          ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/30"
                          : "bg-gold-500/25 text-gold-200 border border-gold-400/30"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-navy-900 text-sm leading-snug mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1 text-muted text-xs mb-3">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-soft">
                      <span className="text-xs font-bold text-gold-500 font-numeric">{project.priceRange}</span>
                      <span className="text-muted text-xs flex items-center gap-0.5 group-hover:text-navy-900 transition-colors">
                        Xem <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* CTA */}
          <FadeIn>
            <div className="text-center mt-10">
              <Link href="/du-an" className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-200 text-navy-900 rounded-full hover:bg-navy-50 transition-colors text-sm font-medium">
                Xem tất cả {allProjects.length} dự án <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. ABOUT ─────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-navy-900 text-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left">
            <div>
              <p className="text-gold-500 text-xs font-semibold tracking-[0.4em] uppercase mb-4">Về chúng tôi</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-6">
                Đến với 1992 Land —<br />
                <span className="text-gold-400">Giá trị thật</span>, lòng tin bền
              </h2>
              <Signature light className="max-w-[120px] mb-8" />
              <p className="text-surface/70 leading-relaxed mb-6">
                Được sáng lập tại TP. Thủ Đức năm 2020, 1992 Land đã đồng hành cùng hơn 500 gia đình
                — từ căn hộ đầu tiên đến danh mục đầu tư thứ ba.
              </p>
              <p className="text-surface/70 leading-relaxed mb-10">
                Anh Thọ tin rằng một giao dịch tốt không cần phải hối thúc. Khách hàng cần thời gian,
                thông tin thật và người tư vấn dám nói thẳng — kể cả khi câu trả lời là &ldquo;chưa phải lúc.&rdquo;
              </p>
              <Link
                href="/gioi-thieu"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gold-500/40 text-gold-300 rounded-full hover:border-gold-500 hover:bg-gold-500/10 transition-colors text-sm font-medium"
              >
                Tìm hiểu thêm về chúng tôi <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:-ml-6 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/images/team/nguyen-huu-tho-team.jpg"
                  alt="Nguyễn Hữu Thọ và đội ngũ 1992 Land"
                  fill
                  className="object-cover object-[55%_50%] scale-[3.3] origin-center"
                  sizes="(max-width: 1024px) 448px, 448px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="font-bold text-lg">Nguyễn Hữu Thọ</div>
                  <div className="text-gold-400 text-sm">Nhà sáng lập · 1992 Land</div>
                </div>
              </div>
              {/* Floating stats */}
              <div className="absolute -right-4 top-8 grid grid-cols-1 gap-3">
                {[
                  { num: "500+", label: "Khách hàng" },
                  { num: "5+", label: "Năm KN" },
                  { num: `${allProjects.length}`, label: "Dự án" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[84px]"
                  >
                    <div className="text-gold-400 font-bold font-numeric text-xl">{s.num}</div>
                    <div className="text-white/65 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>


      {/* ── 5. LATEST NEWS ───────────────────────────────────── */}
      <section className="py-28 px-6 bg-navy-50">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
              <div>
                <p className="text-gold-500 text-xs font-semibold tracking-[0.4em] uppercase mb-3">Tin tức</p>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">Cập nhật thị trường</h2>
                <div className="mt-3 w-14 h-0.5 bg-gold-500 rounded-full" />
              </div>
              <Link
                href="/tin-tuc"
                className="flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm font-medium transition-colors group"
              >
                Xem tất cả tin tức
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          <NewsList posts={posts} />
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ──────────────────────────────────── */}
      <Testimonials />

      {/* ── 7. MANIFESTO ─────────────────────────────────────── */}
      <section className="relative py-32 px-6 bg-navy-950 overflow-hidden">
        {/* Gold accent top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-navy-700/20 blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <FadeIn direction="left">
            <p className="text-gold-500 text-xs tracking-[0.5em] uppercase mb-8">Triết lý</p>
            <blockquote className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface leading-[1.15] max-w-3xl">
              Chúng tôi không bán nhà.
              <br />
              <span className="text-surface/40">Chúng tôi giúp bạn</span>
              <br />
              tìm đúng ngôi nhà.
            </blockquote>
            <div className="mt-12 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-gold-500/50 shrink-0">
                <Image
                  src="/images/team/nguyen-huu-tho-portrait.png"
                  alt="Nguyễn Hữu Thọ"
                  fill
                  className="object-cover object-top"
                  sizes="40px"
                />
              </div>
              <div>
                <div className="text-surface font-semibold text-sm">Nguyễn Hữu Thọ</div>
                <div className="text-surface/50 text-xs">Nhà sáng lập · 1992 Land</div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Gold accent bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      </section>

      {/* ── 8. CONTACT CTA ───────────────────────────────────── */}
      <section className="py-28 px-6 bg-navy-900">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-gold-500 text-xs font-semibold tracking-[0.4em] uppercase mb-3">Liên hệ ngay</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-surface tracking-tight mb-4">
                Sẵn sàng tìm ngôi nhà của bạn?
              </h2>
              <p className="text-surface/60 text-lg max-w-xl mx-auto">
                Để lại thông tin, chuyên gia 1992 Land sẽ liên hệ trong vòng 30 phút trong giờ làm việc.
              </p>
              <div className="mt-4 mx-auto w-14 h-0.5 bg-gold-500 rounded-full" />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-white border-2 border-navy-100 rounded-3xl p-8 shadow-[0_8px_40px_-8px_rgba(13,30,56,0.18)] ring-4 ring-navy-50/60">
              <ContactForm subject="[Lead] Tư vấn từ Trang chủ 1992land.com" />
              <p className="text-xs text-muted text-center mt-4">
                Hoặc gọi trực tiếp:{" "}
                <a href="tel:+84909474123" className="text-gold-500 font-medium">
                  0909 474 123
                </a>
                {" "}· 8:00 — 20:00, Thứ 2 — Chủ nhật
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
