import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import { featuredProjects, remainingProjects, posts } from "@/lib/data";
import Testimonials from "@/components/Testimonials";
import FadeIn from "@/components/FadeIn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Home() {
  return (
    <>
      {/* ── 1. HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #1E3A60 0%, #0D1E38 50%, #071121 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#E5E2D9 1px, transparent 1px), linear-gradient(90deg, #E5E2D9 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-gold-500/60" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24 pb-16">
          <p className="text-gold-500 text-sm font-semibold tracking-[0.3em] uppercase mb-8 animate-[fadeInDown_0.6s_ease_forwards]">
            1992 Land · Thủ Đức · TP.HCM
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-surface leading-[1.1] tracking-tight mb-6">
            Giá Trị
            <br />
            <span className="text-gold-500">Kiến Tạo</span>
            <br />
            Lòng Tin
          </h1>
          <p className="text-surface/60 text-lg lg:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
            Chuyên môi giới bất động sản cao cấp tại TP.HCM, Vũng Tàu, Bình Dương, Long An và Đồng Nai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lien-he"
              className="px-8 py-4 bg-gold-500 text-navy-950 font-semibold rounded-full hover:bg-gold-300 active:scale-[0.98] transition-all duration-200 hover:shadow-lg hover:shadow-gold-500/20 text-base"
            >
              Nhận tư vấn miễn phí
            </Link>
            <Link
              href="/du-an"
              className="px-8 py-4 border border-surface/20 text-surface font-medium rounded-full hover:border-surface/50 hover:bg-white/5 active:scale-[0.98] transition-colors text-base"
            >
              Xem dự án →
            </Link>
          </div>
          <div className="mt-16 flex flex-wrap gap-6 justify-center">
            {["8 dự án đang phân phối", "500+ khách hàng tin tưởng", "5+ năm kinh nghiệm"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-surface/50 text-sm">
                <CheckCircle size={14} className="text-gold-500" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-px h-10 bg-gradient-to-b from-surface/0 to-surface/20" />
          <div className="w-1 h-1 rounded-full bg-gold-500 animate-bounce" />
        </div>
      </section>

      {/* ── 2. FEATURED PROJECTS ─────────────────────────────── */}
      <section className="py-24 px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Nổi bật</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">Dự án tiêu biểu</h2>
                <div className="mt-3 w-12 h-0.5 bg-gold-500 rounded-full" />
              </div>
              <Link href="/du-an" className="flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm font-medium transition-colors group">
                Xem tất cả dự án
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <FadeIn key={project.slug} delay={i * 0.1}>
                <Link
                  href={`/du-an/${project.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-xl transition-all duration-300 h-full"
                >
                  <div className={`h-56 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/10 transition-colors" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium rounded-full">{project.type}</span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${project.status === "Đang mở bán" ? "bg-emerald-500/20 text-emerald-300" : "bg-gold-500/20 text-gold-300"}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-gold-500 transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-1.5 text-muted text-sm mb-3"><MapPin size={13} />{project.location}</div>
                    <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">{project.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border-soft">
                      <div>
                        <div className="text-xs text-muted uppercase tracking-wider">Giá từ</div>
                        <div className="text-navy-900 font-semibold font-numeric text-sm">{project.priceRange}</div>
                      </div>
                      <span className="text-gold-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Xem chi tiết <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-navy-900 text-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left">
            <div>
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">Về chúng tôi</p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6">
                Đến với 1992 Land —<br />
                <span className="text-gold-500">Giá trị thật</span>, lòng tin bền
              </h2>
              <div className="w-12 h-0.5 bg-gold-500 rounded-full mb-8" />
              <p className="text-surface/70 leading-relaxed mb-6">
                Được sáng lập tại TP. Thủ Đức, 1992 Land là đơn vị môi giới bất động sản chuyên nghiệp với hơn 5 năm đồng hành cùng hàng trăm gia đình tìm được ngôi nhà đúng nghĩa.
              </p>
              <p className="text-surface/70 leading-relaxed mb-10">
                Chúng tôi không chạy theo số lượng giao dịch — chúng tôi tập trung vào chất lượng tư vấn. Mỗi khách hàng đều nhận được thông tin minh bạch, đầy đủ để ra quyết định tự tin nhất.
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
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "8+", label: "Dự án đang phân phối", sub: "Trải dài 5 tỉnh thành" },
                { num: "500+", label: "Khách hàng tin tưởng", sub: "Từ năm 2020 đến nay" },
                { num: "5+", label: "Năm kinh nghiệm", sub: "Thị trường BĐS miền Nam" },
                { num: "100%", label: "Minh bạch pháp lý", sub: "Kiểm tra kỹ trước khi tư vấn" },
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="text-4xl font-bold text-gold-500 font-numeric mb-1">{stat.num}</div>
                  <div className="text-surface font-medium text-sm mb-1">{stat.label}</div>
                  <div className="text-surface/40 text-xs">{stat.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 4. ALL PROJECTS GRID ─────────────────────────────── */}
      <section className="py-24 px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Danh mục</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">Các dự án khác</h2>
              <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {remainingProjects.map((project, i) => (
              <FadeIn key={project.slug} delay={i * 0.07}>
                <Link
                  href={`/du-an/${project.slug}`}
                  className="group flex gap-4 p-5 rounded-2xl border border-border-soft bg-surface hover:border-navy-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${project.gradient} shrink-0 flex items-center justify-center`}>
                    <span className="text-white/80 text-xl font-bold">{project.title[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900 text-sm leading-snug mb-1 group-hover:text-gold-500 transition-colors line-clamp-2">{project.title}</h3>
                    <div className="flex items-center gap-1 text-muted text-xs mb-1"><MapPin size={11} /><span className="truncate">{project.location}</span></div>
                    <span className="text-xs font-semibold text-gold-500 font-numeric">{project.priceRange}</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="text-center mt-10">
              <Link href="/du-an" className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-200 text-navy-900 rounded-full hover:bg-navy-50 transition-colors text-sm font-medium">
                Xem tất cả 8 dự án <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 5. LATEST NEWS ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-navy-50">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Tin tức</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">Cập nhật thị trường</h2>
                <div className="mt-3 w-12 h-0.5 bg-gold-500 rounded-full" />
              </div>
              <Link href="/tin-tuc" className="flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm font-medium transition-colors group">
                Xem tất cả tin tức
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          <div className="space-y-5">
            {posts.map((post, i) => (
              <FadeIn key={post.slug} delay={i * 0.1}>
                <Link
                  href={`/tin-tuc/${post.slug}`}
                  className="group flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-surface border border-border-soft hover:border-navy-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-full sm:w-44 h-32 sm:h-auto rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center shrink-0">
                    <span className="text-surface/40 text-sm font-medium">{post.category}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full mb-3">{post.category}</span>
                      <h3 className="font-bold text-navy-900 text-lg leading-snug mb-2 group-hover:text-gold-500 transition-colors">{post.title}</h3>
                      <p className="text-muted text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-soft text-xs text-muted">
                      <span className="flex items-center gap-1.5"><Calendar size={12} />{formatDate(post.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} />{post.readTime}</span>
                      <span className="ml-auto text-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all">Đọc tiếp <ArrowRight size={12} /></span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ──────────────────────────────────── */}
      <Testimonials />

      {/* ── 7. CONTACT CTA ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-bg">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Liên hệ ngay</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight mb-4">
                Sẵn sàng tìm ngôi nhà của bạn?
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                Để lại thông tin, chuyên gia 1992 Land sẽ liên hệ trong vòng 30 phút trong giờ làm việc.
              </p>
              <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form
              action="mailto:nguyenhuutho911@gmail.com?subject=Yêu cầu tư vấn BĐS từ 1992land.com"
              method="get"
              encType="text/plain"
              className="bg-surface border border-border-soft rounded-3xl p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Họ và tên *</label>
                  <input type="text" name="name" required placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:border-navy-500 bg-bg transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                  <input type="tel" name="phone" required placeholder="0909 xxx xxx"
                    className="w-full px-4 py-3.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:border-navy-500 bg-bg transition-colors" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Dự án quan tâm</label>
                <select name="project" className="w-full px-4 py-3.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:border-navy-500 bg-bg transition-colors">
                  <option value="">-- Chọn dự án (tùy chọn) --</option>
                  <option>Salacia Villas Phú Mỹ</option>
                  <option>Ansana by Kita</option>
                  <option>Lusso Sài Gòn</option>
                  <option>Water Concept</option>
                  <option>The Quậy Phước Hải</option>
                  <option>Thanh Phú Centre Point</option>
                  <option>Sun Group Cù Lao Phố</option>
                  <option>River Collection An Gia</option>
                  <option>Khác / Chưa xác định</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Lời nhắn</label>
                <textarea name="message" rows={4} placeholder="Mô tả nhu cầu của bạn..."
                  className="w-full px-4 py-3.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:border-navy-500 bg-bg transition-colors resize-none" />
              </div>
              <button type="submit"
                className="w-full py-4 bg-navy-900 text-surface font-semibold rounded-full hover:bg-navy-700 active:scale-[0.98] transition-all text-base">
                Gửi yêu cầu tư vấn
              </button>
              <p className="text-xs text-muted text-center mt-4">
                Hoặc gọi trực tiếp:{" "}
                <a href="tel:0909474123" className="text-gold-500 font-medium">0909 474 123</a>
                {" "}· Thứ 2 — Thứ 7: 8:00 — 18:00
              </p>
            </form>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
