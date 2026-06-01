import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, ArrowLeft, ArrowRight, Building2, Tag, CheckCircle, ChevronDown } from "lucide-react";
import { projects } from "@/lib/data";
import ContactForm from "@/components/ContactForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.excerpt,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  // JSON-LD schemas
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: project.title,
    description: project.excerpt,
    image: project.hero_image ? [`https://1992land.com${project.hero_image}`] : [],
    offers: project.price_from
      ? {
          "@type": "AggregateOffer",
          lowPrice: project.price_from,
          highPrice: project.price_to ?? project.price_from,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  const faqSchema = project.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: project.faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  const related = projects.filter((p) => p.slug !== slug && p.area === project.area).slice(0, 3);
  const fallbackRelated = projects.filter((p) => p.slug !== slug).slice(0, 3);
  const relatedProjects = related.length >= 2 ? related : fallbackRelated;

  const specs = [
    { icon: MapPin, label: "Vị trí", value: project.location },
    { icon: Building2, label: "Loại hình", value: project.type },
    { icon: Tag, label: "Mức giá", value: project.priceRange },
    { icon: CheckCircle, label: "Trạng thái", value: project.status },
  ];

  return (
    <div className="pt-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero */}
      <div
        className={`h-72 lg:h-96 bg-gradient-to-br ${project.gradient} relative flex items-end`}
      >
        {project.hero_image && (
          <Image
            src={project.hero_image}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-navy-950/50" />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8 pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-surface/60 text-sm mb-4">
            <Link href="/" className="hover:text-surface transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/du-an" className="hover:text-surface transition-colors">
              Dự án
            </Link>
            <span>/</span>
            <span className="text-surface">{project.title}</span>
          </nav>
          <h1 className="text-3xl lg:text-5xl font-bold text-surface tracking-tight mb-2">
            {project.title}
          </h1>
          <div className="flex items-center gap-2 text-surface/70 text-sm">
            <MapPin size={14} />
            {project.location}
          </div>
        </div>
      </div>

      {/* Sticky info bar */}
      <div className="sticky top-16 z-40 bg-surface/95 backdrop-blur-md border-b border-border-soft shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/du-an"
              className="flex items-center gap-1.5 text-muted hover:text-navy-900 text-sm transition-colors"
            >
              <ArrowLeft size={14} />
              Tất cả dự án
            </Link>
            <span className="text-border-soft">|</span>
            <span className="font-semibold text-navy-900 text-sm hidden sm:inline">
              {project.title}
            </span>
          </div>
          <a
            href="tel:+84909474123"
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-surface text-sm font-medium rounded-full hover:bg-navy-700 transition-colors"
          >
            <Phone size={14} />
            Liên hệ tư vấn
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted text-lg leading-relaxed">{project.excerpt}</p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">
                Về dự án
              </h2>
              <p className="text-muted leading-relaxed">
                {project.title} là dự án bất động sản cao cấp tại {project.location}.
                Với thiết kế hiện đại và tiêu chuẩn xây dựng quốc tế, dự án hứa hẹn
                mang lại trải nghiệm sống đẳng cấp cho cư dân.
              </p>
              <p className="text-muted leading-relaxed mt-4">
                Dự án được phát triển bởi {project.developer} — đơn vị uy tín
                với nhiều năm kinh nghiệm trong lĩnh vực bất động sản.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">
                Điểm nổi bật
              </h2>
              <ul className="space-y-3">
                {[
                  "Vị trí đắc địa, giao thông thuận tiện",
                  "Pháp lý rõ ràng, sổ đỏ lâu dài",
                  "Tiện ích nội khu đầy đủ và cao cấp",
                  "Chủ đầu tư uy tín, tiến độ đảm bảo",
                  "Tiềm năng tăng giá cao trong dài hạn",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted">
                    <CheckCircle size={18} className="text-gold-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-navy-900 mb-6">Hình ảnh dự án</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.gallery.map((src, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden relative bg-navy-100">
                      <Image
                        src={src}
                        alt={`${project.title} - ảnh ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky info card */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 space-y-4">
              {/* Specs card */}
              <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
                <h3 className="font-bold text-navy-900 mb-5">Thông tin dự án</h3>
                <ul className="space-y-4">
                  {specs.map((spec) => (
                    <li key={spec.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                        <spec.icon size={15} className="text-gold-500" />
                      </div>
                      <div>
                        <div className="text-xs text-muted uppercase tracking-wider mb-0.5">
                          {spec.label}
                        </div>
                        <div className="text-navy-900 font-medium text-sm">
                          {spec.value}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t border-border-soft space-y-3">
                  <a
                    href="https://zalo.me/0909474123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#10B981] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
                  >
                    Chat Zalo ngay
                  </a>
                  <a
                    href="tel:+84909474123"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-navy-900 text-surface font-semibold rounded-full hover:bg-navy-700 transition-colors text-sm"
                  >
                    <Phone size={15} />
                    0909 474 123
                  </a>
                  <Link
                    href="/lien-he"
                    className="flex items-center justify-center w-full py-3 border border-border-soft text-navy-700 font-medium rounded-full hover:border-navy-200 transition-colors text-sm"
                  >
                    Đặt lịch xem dự án
                  </Link>
                </div>
              </div>

              {/* Developer card */}
              <div className="rounded-2xl border border-border-soft bg-navy-50 p-5">
                <div className="text-xs text-muted uppercase tracking-wider mb-2">
                  Chủ đầu tư
                </div>
                <div className="font-bold text-navy-900">{project.developer}</div>
              </div>

              {/* Inline contact form */}
              <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
                <h3 className="font-bold text-navy-900 mb-1">Nhận tư vấn miễn phí</h3>
                <p className="text-muted text-xs mb-4">Phản hồi trong 30 phút trong giờ làm việc</p>
                <ContactForm
                  subject={`[Lead] Quan tâm ${project.title} — 1992land.com`}
                  duAnQuanTam={project.slug}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      {project.faq && project.faq.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-8">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {project.faq.map(({ q, a }, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border-soft bg-surface overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-medium text-navy-900 hover:text-gold-500 transition-colors">
                  {q}
                  <ChevronDown size={16} className="text-muted shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-4 text-muted text-sm leading-relaxed border-t border-border-soft pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Related projects */}
      {relatedProjects.length > 0 && (
        <div className="bg-navy-50 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">
              Dự án liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProjects.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/du-an/${rp.slug}`}
                  className="group flex gap-4 p-5 rounded-2xl border border-border-soft bg-surface hover:border-navy-200 hover:shadow-md transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rp.gradient} shrink-0 flex items-center justify-center`}
                  >
                    <span className="text-white/80 font-bold">{rp.title[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900 text-sm leading-snug mb-1 group-hover:text-gold-500 transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    <div className="flex items-center gap-1 text-muted text-xs">
                      <MapPin size={11} />
                      <span className="truncate">{rp.location}</span>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-muted shrink-0 self-center group-hover:text-gold-500 group-hover:translate-x-1 transition-all"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
