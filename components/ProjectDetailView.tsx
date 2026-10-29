import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Building2, CheckCircle, ChevronDown,
  Banknote, ShieldCheck, Calendar, Home, Zap,
  TreePine, Car, GraduationCap, HeartPulse, ShoppingBag, Phone, ArrowRight, Clock,
} from "lucide-react";
import type { Project, Post } from "@/lib/data";
import { testimonials } from "@/lib/data";
import { parseMarkdownBlocks } from "@/lib/markdown";
import MarkdownBlocks from "@/components/MarkdownBlocks";
import ContactForm from "@/components/ContactForm";
import ProjectAnchorNav from "@/components/ProjectAnchorNav";
import ProjectHeroSlider from "@/components/ProjectHeroSlider";
import ProjectImageCarousel from "@/components/ProjectImageCarousel";
import ProjectGalleryGrid from "@/components/ProjectGalleryGrid";
import AmenitiesGallery from "@/components/AmenitiesGallery";
import ContactModal from "@/components/ContactModal";
import ProjectSidebarForm from "@/components/ProjectSidebarForm";
import ZaloIcon from "@/components/ZaloIcon";
import VideoEmbed from "@/components/VideoEmbed";
import { contact, positioningLine } from "@/lib/site-config";
import { maiaHead, NARROW } from "@/components/maia/ui";

type ProjectDetailViewProps = {
  project: Project;
  relatedProjects: Project[];
  relatedPosts: Post[];
};

const NEARBY_ICONS: Record<string, React.ElementType> = {
  school: GraduationCap, hospital: HeartPulse,
  mall: ShoppingBag, road: Car, other: MapPin,
};

function Divider() {
  return <div className="border-t border-navy-900/20" />;
}

function SecHead({ id, title }: { id?: string; title: string }) {
  return (
    <div id={id} className="scroll-mt-20 mb-8">
      <h2 style={NARROW} className={`${maiaHead.className} text-balance text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-navy-900 sm:text-4xl`}>{title}</h2>
    </div>
  );
}

function SectionIntro({ desc, children }: { desc?: string; children: React.ReactNode }) {
  if (!desc) return <>{children}</>;
  return (
    <div>
      <div className="mb-8 pb-8 border-b border-navy-900/20">
        <MarkdownBlocks blocks={parseMarkdownBlocks(desc)} />
      </div>
      {children}
    </div>
  );
}

export default function ProjectDetailView({ project, relatedProjects, relatedPosts }: ProjectDetailViewProps) {
  const hide = new Set(project.hidden_sections ?? []);
  const show = (id: string) => !hide.has(id);

  const anchorSections = [
    show("tong-quan") ? "tong-quan" : null,
    show("vi-tri") ? "vi-tri" : null,
    show("thu-vien-anh") && project.gallery?.length ? "thu-vien-anh" : null,
    show("tien-ich") && (project.amenities_internal || project.amenities_external) ? "tien-ich" : null,
    show("mat-bang") && project.masterplan_image ? "mat-bang" : null,
    show("gia-ban") && project.product_types ? "gia-ban" : null,
    show("phap-ly") ? "phap-ly" : null,
    show("chinh-sach") ? "chinh-sach" : null,
    show("dang-ky") ? "dang-ky" : null,
  ].filter(Boolean) as string[];

  const scarcestProduct = (project.product_types ?? []).reduce<{ name: string; available: number; ratio: number } | null>((best, p) => {
    if (p.available == null || !p.total) return best;
    const ratio = p.available / p.total;
    if (ratio >= 0.2) return best;
    if (!best || ratio < best.ratio) return { name: p.name, available: p.available, ratio };
    return best;
  }, null);

  const matchedTestimonial = testimonials.find((t) => t.project === project.title) ?? testimonials[0];

  const legalConfirmed = !!project.legal_status && !/liên hệ|đang hoàn thiện|đang cập nhật/i.test(project.legal_status);
  const ownershipShort = project.ownership && project.ownership !== "Liên hệ"
    ? project.ownership.split(/[·(]/)[0].trim()
    : null;
  const developerShort = project.developer && !/đang cập nhật|liên hệ/i.test(project.developer)
    ? project.developer.split(/[—–-]/)[0].trim()
    : null;
  const trustBadges = [
    legalConfirmed ? { label: "Pháp lý đầy đủ", icon: ShieldCheck } : null,
    ownershipShort ? { label: ownershipShort, icon: CheckCircle } : null,
    developerShort ? { label: developerShort, icon: Building2 } : null,
  ].filter(Boolean) as { label: string; icon: React.ElementType }[];

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product",
    name: project.title, description: project.excerpt,
    image: project.hero_image ? [`https://1992land.com${project.hero_image}`] : [],
    offers: project.price_from
      ? { "@type": "AggregateOffer", lowPrice: project.price_from, highPrice: project.price_to ?? project.price_from, priceCurrency: "VND" }
      : undefined,
  };
  const faqSchema = project.faq?.length
    ? {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: project.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }
    : null;

  return (
    <div className="pt-16 lg:pt-18 bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* ── BREADCRUMB ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-3">
        <nav className="flex items-center gap-1.5 text-sm text-navy-700">
          <Link href="/" className="hover:text-navy-900 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/du-an" className="hover:text-navy-900 transition-colors">Dự án</Link>
          <span>/</span>
          <span className="text-navy-700 truncate">{project.title}</span>
        </nav>
        {/* Đặt ngay dưới breadcrumb — vị trí đầu trang, đọc được không cần cuộn.
            Trước đây dòng này chỉ có trong footer (~87% chiều dài trang). */}
        <p className="mt-1.5 text-sm text-navy-700">{positioningLine}</p>
      </div>

      {/* ── HERO SLIDER — full width, edge-to-edge ── */}
      <ProjectHeroSlider
        images={project.gallery?.length ? project.gallery : project.hero_image ? [project.hero_image] : []}
        title={project.title}
      />

      {/* ── COMPACT INFO BAR ── */}
      <div className="bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Left: status + title + location */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-sm font-semibold ${
                  project.status === "Đang mở bán"
                    ? "bg-gold-300 text-navy-950"
                    : "border border-gold-300 text-gold-300"
                }`}>
                  {project.status}
                </span>
                <span className="text-sm text-navy-100">{project.type}</span>
              </div>
              <h1 style={NARROW} className={`${maiaHead.className} mb-2 text-balance text-3xl font-extrabold uppercase leading-[1.02] tracking-tight text-gold-300 sm:text-4xl lg:text-5xl`}>
                {project.title}
              </h1>
              <div className="flex items-center gap-1.5 text-base text-navy-50">
                <MapPin size={14} className="shrink-0 text-gold-300" aria-hidden />
                <span className="line-clamp-1">{project.address_full ?? project.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ANCHOR NAV ── */}
      <ProjectAnchorNav sections={anchorSections} title={project.title} />

      {/* ── KEY STATS STRIP ── */}
      <div className="border-t border-gold-300/30 bg-navy-900 text-navy-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-6 overflow-x-auto scrollbar-none">
          {project.scale && (
            <div className="flex items-center gap-2 shrink-0 text-sm text-navy-50">
              <Building2 size={14} className="shrink-0 text-gold-300" aria-hidden />
              <span>{project.scale}</span>
            </div>
          )}
          {project.discount && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-gold-300 px-2.5 py-0.5 text-sm font-bold text-navy-950">{project.discount}</span>
            </div>
          )}
          {project.bank_support && (
            <div className="flex items-center gap-2 shrink-0 text-sm text-navy-50">
              <Banknote size={14} className="shrink-0 text-gold-300" aria-hidden />
              <span>{project.bank_support}</span>
            </div>
          )}
          {project.ownership && (
            <div className="flex items-center gap-2 shrink-0 text-sm font-semibold text-gold-300">
              <ShieldCheck size={13} className="shrink-0" />
              <span>{project.ownership}</span>
            </div>
          )}
          {scarcestProduct && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="border border-gold-300 px-2.5 py-0.5 text-sm font-bold text-gold-300">
                ⚡ Chỉ còn {scarcestProduct.available} căn {scarcestProduct.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK LEAD — CTA Google Ads ── */}
      <section className="border-t border-gold-300/30 bg-navy-950 py-12 text-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h2 style={NARROW} className={`${maiaHead.className} mb-4 text-balance text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-gold-300 md:text-4xl`}>
              Nhận báo giá &amp; chính sách<br className="hidden md:block" /> mới nhất ngay hôm nay
            </h2>
            <p className="mb-5 text-base leading-relaxed text-navy-50">
              {[project.discount, project.bank_support].filter(Boolean).join(" · ") || "Liên hệ để nhận thông tin chi tiết"}
            </p>
            {trustBadges.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {trustBadges.map(({ label, icon: Icon }) => (
                  <span key={label} className="flex items-center gap-1.5 border border-gold-300/40 px-3 py-1.5 text-sm font-medium text-white">
                    <Icon size={14} className="text-gold-300" aria-hidden />{label}
                  </span>
                ))}
              </div>
            )}
            {matchedTestimonial && (
              <div className="mt-4 flex items-start gap-2.5 max-w-md mx-auto md:mx-0">
                <span className="flex size-8 shrink-0 items-center justify-center bg-gold-300 text-sm font-bold text-navy-950">
                  {matchedTestimonial.initial}
                </span>
                <p className="text-left text-sm leading-relaxed text-navy-50">
                  <span className="italic">&ldquo;{matchedTestimonial.quote}&rdquo;</span>
                  <span className="mt-1 block text-navy-100 not-italic">
                    — {matchedTestimonial.name} · {matchedTestimonial.role} · {matchedTestimonial.project}
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="w-full bg-bg p-6 text-navy-900 md:w-[380px] md:shrink-0">
            <h3 className="mb-0.5 text-base font-bold text-navy-900">Để lại thông tin tư vấn</h3>
            <p className="mb-4 text-sm text-navy-700">Phản hồi trong 30 phút · Không spam</p>
            <ContactForm
              compact
              duAnQuanTam={project.title}
              subject={`[QuickLead] ${project.title} — 1992land.com`}
            />
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

        {/* ── CONTENT COLUMN ── */}
        <div className="flex-1 min-w-0 space-y-0">

        {/* ── 1. CHÍNH SÁCH ── */}
        {show("chinh-sach") && (
          <section className="pb-14">
            <SecHead id="chinh-sach" title="Chính sách bán hàng" />
            {project.videos?.["chinh-sach"] && (
              <VideoEmbed url={project.videos["chinh-sach"]} title={`Video chính sách ${project.title}`} />
            )}
            <SectionIntro desc={project.descriptions?.["chinh-sach"]}>
              {project.payment_policy && (
                <details className="group border-y border-navy-900/20 mb-4" open>
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-navy-900 text-white">
                    <span className="text-sm font-semibold">Lịch thanh toán</span>
                    <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180 text-white" />
                  </summary>
                  <div className="divide-y divide-navy-900/20">
                    {project.payment_policy.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="flex size-11 shrink-0 items-center justify-center bg-gold-100">
                          <span className="font-numeric text-sm font-bold text-gold-900">{p.percent}%</span>
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900 text-sm">{p.installment}</div>
                          {p.note && <div className="text-navy-700 text-sm mt-0.5">{p.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {project.discount && (
                  <div className="rounded-2xl border-t border-gold-700 py-5">
                    <Zap size={15} className="text-gold-700 mb-2" />
                    <div className="text-sm font-semibold text-gold-900 mb-1.5">Chiết khấu & ưu đãi</div>
                    <p className="text-navy-900 text-sm leading-relaxed">{project.discount}</p>
                  </div>
                )}
                {project.bank_support && (
                  <div className="rounded-2xl border-t border-navy-900/20 py-5">
                    <Banknote size={15} className="text-gold-700 mb-2" />
                    <div className="text-sm font-semibold text-navy-700 mb-1.5">Hỗ trợ vay</div>
                    <p className="text-navy-900 text-sm leading-relaxed">{project.bank_support}</p>
                  </div>
                )}
                {project.grace_period && (
                  <div className="rounded-2xl border-t border-navy-900/20 py-5 sm:col-span-2">
                    <Calendar size={15} className="text-gold-700 mb-2" />
                    <div className="text-sm font-semibold text-navy-700 mb-1.5">Ân hạn gốc & lãi</div>
                    <p className="text-navy-900 text-sm">{project.grace_period}</p>
                  </div>
                )}
                {!project.payment_policy && !project.discount && !project.bank_support && (
                  <div className="rounded-2xl border-t border-navy-900/20 py-5 text-sm text-navy-700 sm:col-span-2">
                    Liên hệ để nhận thông tin chính sách mới nhất.
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <ContactModal label="Nhận bảng giá" subject={`[Bảng giá] ${project.title}`} projectSlug={project.slug} icon="price" variant="gold" />
                <ContactModal label="Nhận chính sách PDF" subject={`[Chính sách PDF] ${project.title}`} projectSlug={project.slug} icon="pdf" variant="outline" />
              </div>
            </SectionIntro>
          </section>
        )}

        {/* ── TỔNG QUAN ── */}
        {show("tong-quan") && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead title="Tổng quan dự án" />
              {/* Illustration image — above description */}
              {(project.overview_image ?? project.gallery?.[0] ?? project.hero_image) && (
                <div className="rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={(project.overview_image ?? project.gallery?.[0] ?? project.hero_image) as string}
                    alt={`Tổng quan ${project.title}`}
                    width={1200}
                    height={600}
                    className="w-full h-[220px] sm:h-[320px] lg:h-[400px] object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 820px"
                  />
                </div>
              )}
              {project.videos?.["tong-quan"] && (
                <VideoEmbed url={project.videos["tong-quan"]} title={`Video tổng quan ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["tong-quan"]}>
                <div className="rounded-2xl border-y border-navy-900/20">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-navy-900/20">
                      {[
                        ["Chủ đầu tư", project.developer],
                        ["Vị trí", project.address_full ?? project.location],
                        project.scale ? ["Quy mô", project.scale] : null,
                        ["Loại hình", project.type],
                        project.unit_count ? ["Số sản phẩm", `${project.unit_count} căn`] : null,
                        project.handover_date ? ["Bàn giao", project.handover_date] : null,
                        project.ownership ? ["Sở hữu", project.ownership] : null,
                      ]
                        .filter((r): r is [string, string] => r !== null)
                        .map(([label, value]) => (
                          <tr key={label} className="hover:bg-navy-50/40 transition-colors">
                            <td className="py-3 pr-5 text-sm font-medium text-navy-700 w-36 lg:w-44">{label}</td>
                            <td className="py-3 text-navy-900 font-semibold text-base">{value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── GIÁ BÁN ── */}
        {show("gia-ban") && project.product_types && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="gia-ban" title="Giá bán & giỏ hàng" />
              {project.videos?.["gia-ban"] && (
                <VideoEmbed url={project.videos["gia-ban"]} title={`Video giá bán ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["gia-ban"]}>
                <div className="rounded-2xl border-b border-navy-900/20 mb-5">
                  <div className="grid grid-cols-4 gap-2 bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                    <span>Loại căn</span><span>Diện tích</span><span>Mức giá</span><span className="text-right">Còn lại</span>
                  </div>
                  {project.product_types.map((p, i) => {
                    const scarce = p.available != null && p.total ? p.available / p.total < 0.2 : false;
                    return (
                      <div key={i} className={`grid grid-cols-4 gap-2 px-5 py-4 items-center ${i > 0 ? "border-t border-navy-900/20" : ""}`}>
                        <span className="font-bold text-navy-900 text-sm">{p.name}</span>
                        <span className="text-navy-700 text-sm">{p.area}</span>
                        <span className="text-gold-900 font-bold text-sm font-numeric tabular-nums">{p.price_range}</span>
                        <div className="text-right">
                          {p.available != null
                            ? <span className={`text-sm font-semibold ${scarce ? "bg-gold-300 px-2 py-0.5 text-navy-950" : "text-navy-900"}`}>
                                {scarce ? `⚡ ${p.available}` : `${p.available} căn`}
                              </span>
                            : <span className="text-navy-700 text-sm">Liên hệ</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ContactModal label="Nhận bảng hàng mới nhất" subject={`[Bảng hàng] ${project.title}`} projectSlug={project.slug} icon="price" variant="gold" />
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── VỊ TRÍ ── */}
        {show("vi-tri") && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="vi-tri" title="Vị trí dự án" />
              {/* Illustration image — above description, fallback to gallery */}
              {(project.location_image ?? project.gallery?.[1] ?? project.hero_image) && (
                <div className="rounded-2xl overflow-hidden mb-6 w-full">
                  <Image
                    src={(project.location_image ?? project.gallery?.[1] ?? project.hero_image) as string}
                    alt={`Vị trí ${project.title}`}
                    width={1200}
                    height={600}
                    className="w-full h-[220px] sm:h-[320px] lg:h-[400px] object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 820px"
                  />
                </div>
              )}
              {project.videos?.["vi-tri"] && (
                <VideoEmbed url={project.videos["vi-tri"]} title={`Video vị trí ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["vi-tri"]}>
                <div>
                  <div className="flex items-start gap-2 text-sm mb-4">
                    <MapPin size={15} className="text-gold-700 mt-0.5 shrink-0" />
                    <span className="text-navy-900 font-medium">{project.address_full ?? project.location}</span>
                  </div>
                  {project.nearby && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {project.nearby.map((n, i) => {
                        const Icon = NEARBY_ICONS[n.category] ?? MapPin;
                        return (
                          <div key={i} className="flex items-center gap-3 border-t border-navy-900/20 py-3">
                            <div className="flex size-7 shrink-0 items-center justify-center">
                              <Icon size={13} className="text-gold-700" />
                            </div>
                            <span className="flex-1 text-navy-900 text-sm truncate">{n.name}</span>
                            <span className="text-gold-900 text-sm font-bold font-numeric tabular-nums shrink-0">{n.distance}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── ĐIỂM NỔI BẬT ── */}
        {show("diem-noi-bat") && project.highlights && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead title="Điểm nổi bật & lý do đầu tư" />
              {project.gallery && project.gallery.length > 1 && (
                <div className="mb-6">
                  <ProjectImageCarousel images={project.gallery.slice(0, 4)} title={project.title} />
                </div>
              )}
              {project.videos?.["diem-noi-bat"] && (
                <VideoEmbed url={project.videos["diem-noi-bat"]} title={`Video điểm nổi bật ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["diem-noi-bat"]}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="flex gap-3 border-t border-navy-900/20 py-4">
                      <CheckCircle size={15} className="text-gold-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-navy-900 text-sm mb-0.5">{h.title}</div>
                        <div className="text-navy-700 text-sm leading-relaxed">{h.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── THƯ VIỆN ẢNH ── */}
        {show("thu-vien-anh") && project.gallery && project.gallery.length > 0 && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="thu-vien-anh" title="Thư viện ảnh dự án" />
              <ProjectGalleryGrid images={project.gallery} title={project.title} />
            </section>
          </>
        )}

        {/* ── TIỆN ÍCH ── */}
        {show("tien-ich") && (project.amenities_internal || project.amenities_external || project.amenities_images) && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="tien-ich" title="Tiện ích dự án" />
              {project.amenities_images && project.amenities_images.length > 0 && (
                <AmenitiesGallery images={project.amenities_images} title={`Tiện ích ${project.title}`} />
              )}
              {project.videos?.["tien-ich"] && (
                <VideoEmbed url={project.videos["tien-ich"]} title={`Video tiện ích ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["tien-ich"]}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {project.amenities_internal && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TreePine size={14} className="text-gold-700" />
                        <span className="font-bold text-navy-900 text-sm">Nội khu</span>
                      </div>
                      <ul className="space-y-1.5">
                        {project.amenities_internal.map((a, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-navy-700">
                            <span className="w-1.5 h-1.5 bg-gold-700 shrink-0" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.amenities_external && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-gold-700" />
                        <span className="font-bold text-navy-900 text-sm">Ngoại khu</span>
                      </div>
                      <ul className="space-y-1.5">
                        {project.amenities_external.map((a, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-navy-700">
                            <span className="w-1.5 h-1.5 bg-navy-300 shrink-0" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── MẶT BẰNG ── */}
        {show("mat-bang") && project.masterplan_image && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="mat-bang" title="Mặt bằng tổng thể" />
              {project.videos?.["mat-bang"] && (
                <VideoEmbed url={project.videos["mat-bang"]} title={`Video mặt bằng ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["mat-bang"]}>
                <div>
                  <div className="rounded-2xl overflow-hidden mb-4">
                    <Image src={project.masterplan_image} alt={`Mặt bằng ${project.title}`} width={900} height={500} className="w-full object-cover" />
                  </div>
                  <ContactModal label="Tải mặt bằng chi tiết" subject={`[Mặt bằng] ${project.title}`} projectSlug={project.slug} icon="plan" variant="outline" />
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── THIẾT KẾ ── */}
        {show("thiet-ke") && project.floor_plans && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead title="Thiết kế sản phẩm" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {project.floor_plans.map((fp, i) => (
                  <div key={i} className="flex items-center gap-4 border-t border-navy-900/20 py-4">
                    <div className="flex size-9 shrink-0 items-center justify-center">
                      <Home size={16} className="text-navy-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-navy-900 text-sm">{fp.name}</div>
                      <div className="text-navy-700 text-sm mt-0.5 truncate">{fp.layout}</div>
                    </div>
                    <div className="text-gold-900 font-bold text-sm font-numeric shrink-0">{fp.area}</div>
                  </div>
                ))}
              </div>
              <ContactModal label="Tải thiết kế chi tiết" subject={`[Thiết kế] ${project.title}`} projectSlug={project.slug} icon="plan" variant="outline" />
            </section>
          </>
        )}

        {/* ── PHÁP LÝ + FAQ ── */}
        {show("phap-ly") && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="phap-ly" title="Tiến độ & Pháp lý" />
              {project.construction_images && project.construction_images.length > 0 && (
                <AmenitiesGallery images={project.construction_images} title={`Tiến độ thi công ${project.title}`} />
              )}
              {project.videos?.["phap-ly"] && (
                <VideoEmbed url={project.videos["phap-ly"]} title={`Video pháp lý ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["phap-ly"]}>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-2xl border-t border-navy-900/20 py-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={14} className="text-gold-700" />
                        <span className="font-bold text-navy-900 text-sm">Tiến độ xây dựng</span>
                      </div>
                      <p className="text-navy-700 text-sm leading-relaxed">
                        {project.construction_update ?? "Liên hệ 1992 Land để cập nhật tiến độ mới nhất."}
                      </p>
                      {project.handover_date && (
                        <div className="mt-3 flex items-center gap-1.5 text-navy-900 text-sm font-semibold">
                          <Calendar size={12} /> Bàn giao: {project.handover_date}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border-t border-navy-900/20 py-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={14} className="text-gold-700" />
                        <span className="font-bold text-navy-900 text-sm">Pháp lý</span>
                      </div>
                      <p className="text-navy-700 text-sm leading-relaxed">
                        {project.legal_status ?? "Đang hoàn thiện hồ sơ pháp lý. Liên hệ để xem trực tiếp."}
                      </p>
                      {project.ownership && (
                        <div className="mt-3 flex items-start gap-1.5 text-navy-700 text-sm">
                          <CheckCircle size={12} className="text-gold-700 mt-0.5 shrink-0" />{project.ownership}
                        </div>
                      )}
                    </div>
                  </div>
                  {project.faq && project.faq.length > 0 && (
                    <div className="space-y-2">
                      {project.faq.map(({ q, a }, i) => (
                        <details key={i} className="group border-t border-navy-900/20">
                          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer list-none font-semibold text-navy-900 text-sm hover:text-gold-900">
                            {q}
                            <ChevronDown size={14} className="text-navy-700 shrink-0 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="px-5 pb-4 pt-3 text-navy-700 text-sm leading-relaxed border-t border-navy-900/20">{a}</div>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              </SectionIntro>
            </section>
          </>
        )}
        </div>{/* ── END CONTENT COLUMN ── */}

        {/* ── STICKY SIDEBAR ── */}
        <div className="hidden lg:block w-80 xl:w-[340px] shrink-0 sticky top-24 self-start">
          <ProjectSidebarForm project={project} />
        </div>

        </div>{/* ── END FLEX ── */}
      </div>{/* ── END OUTER ── */}

      {/* ── ĐĂNG KÝ TƯ VẤN ── */}
      {show("dang-ky") && (
        <section id="dang-ky" className="scroll-mt-20 border-t border-gold-300/30 bg-navy-950 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: text + contacts */}
            <div className="text-surface">
              <h2 style={NARROW} className={`${maiaHead.className} mb-5 text-balance text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-gold-300 lg:text-5xl`}>
                Nhận thông tin <br className="hidden lg:block" />
                <span className="text-white">{project.title}</span>
              </h2>
              <p className="mb-8 max-w-[52ch] text-lg leading-relaxed text-navy-50">
                Điền thông tin để nhận <strong className="text-white">bảng giá, chính sách mới nhất</strong> và
                được tư vấn 1-1 trong vòng 30 phút trong giờ làm việc.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${contact.phoneIntl}`}
                  className="inline-flex min-h-12 items-center gap-2 bg-gold-300 px-6 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-100"
                >
                  <Phone size={16} aria-hidden /> {contact.phoneDisplay}
                </a>
                <a
                  href={contact.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 border border-gold-300 px-6 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-300 hover:text-navy-950"
                >
                  <ZaloIcon size={18} /> Chat Zalo
                </a>
              </div>
              <div className="mt-8 hidden lg:block">
                <div className="flex items-center gap-3 text-navy-50">
                  <Clock size={14} aria-hidden />
                  <span className="text-sm">Thứ 2 — Chủ nhật · 8:00 — 20:00</span>
                </div>
              </div>
            </div>
            {/* Right: form */}
            <div className="bg-bg p-7 text-navy-900">
              <h3 className="mb-0.5 text-lg font-bold text-navy-900">Để lại thông tin</h3>
              <p className="mb-5 text-sm text-navy-700">Phản hồi trong 30 phút · Không spam</p>
              <ContactForm subject={`[Lead] ${project.title} — 1992land.com`} duAnQuanTam={project.slug} />
            </div>
          </div>
        </section>
      )}

      {/* ── DỰ ÁN CÙNG PHÂN KHÚC ── */}
      {relatedProjects.length > 0 && (
        <div className="bg-bg px-4 py-14 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 style={NARROW} className={`${maiaHead.className} text-balance text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-navy-900 sm:text-4xl`}>Dự án cùng phân khúc</h2>
              </div>
              <Link href="/du-an" className="inline-flex min-h-12 items-center gap-1 text-base font-semibold text-navy-800 hover:text-gold-900">
                Tất cả dự án <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
              {relatedProjects.map((rp) => (
                <Link key={rp.slug} href={`/du-an/${rp.slug}`}
                  className="group block border-t border-navy-900/20 pt-4">
                  <div className="relative h-44 overflow-hidden bg-navy-100">
                    {rp.hero_image && (
                      <Image src={rp.hero_image} alt={rp.title} fill className="object-cover" sizes="33vw" />
                    )}
                    <span className={`absolute left-0 top-3 px-2.5 py-0.5 text-sm font-semibold ${rp.status === "Đang mở bán" ? "bg-gold-300 text-navy-950" : "bg-navy-950 text-gold-300"}`}>
                      {rp.status}
                    </span>
                  </div>
                  <div className="pt-3">
                    <h3 className="mb-1.5 line-clamp-2 text-lg font-semibold leading-snug text-navy-900 group-hover:text-gold-900">{rp.title}</h3>
                    <div className="flex items-center justify-between gap-3 text-sm text-navy-700">
                      <span className="flex items-center gap-1"><MapPin size={11} />{rp.location}</span>
                      <span className="font-numeric font-bold tabular-nums text-gold-900">{rp.priceRange}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TIN TỨC LIÊN QUAN — ẩn ── */}
      {false && relatedPosts.length > 0 && (
        <div className="bg-navy-50 py-14 px-4 lg:px-8 border-t border-navy-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Tin tức liên quan</h2>
              </div>
              <Link href="/tin-tuc" className="text-sm text-navy-500 hover:text-navy-900 transition-colors flex items-center gap-1 group">
                Tất cả tin tức <ArrowRight size={14} className="" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/tin-tuc/${rp.slug}`}
                  className="group block border-t border-navy-900/20 pt-4"
                >
                  <div className="aspect-[16/9] bg-navy-800 overflow-hidden relative">
                    {rp.hero_image && (
                      <Image src={rp.hero_image} alt={rp.title} fill className="object-cover " sizes="33vw" />
                    )}
                    {rp.category && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-navy-950 text-white text-sm font-medium">
                        {rp.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-navy-900 text-sm leading-snug line-clamp-2 group-hover:text-gold-900 mb-2">{rp.title}</h3>
                    <div className="flex items-center gap-1 text-navy-700 text-sm">
                      <Clock size={10} />
                      <span>{rp.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
