import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin, Building2, Tag, CheckCircle, ChevronDown,
  Banknote, ShieldCheck, Calendar, Home, Zap,
  TreePine, Car, GraduationCap, HeartPulse, ShoppingBag, Phone,
} from "lucide-react";
import { loadProjects } from "@/lib/loadData";
import ContactForm from "@/components/ContactForm";
import ProjectAnchorNav from "@/components/ProjectAnchorNav";
import ProjectGalleryGrid from "@/components/ProjectGalleryGrid";
import ContactModal from "@/components/ContactModal";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = loadProjects().find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt };
}

const NEARBY_ICONS: Record<string, React.ElementType> = {
  school: GraduationCap, hospital: HeartPulse,
  mall: ShoppingBag, road: Car, other: MapPin,
};

function Divider() {
  return <div className="border-t border-border-soft" />;
}

function SecHead({ id, title }: { id?: string; title: string }) {
  return (
    <div id={id} className="scroll-mt-28 mb-6">
      <h2 className="text-xl font-bold text-navy-900">{title}</h2>
      <div className="mt-2 w-8 h-0.5 bg-gold-500 rounded-full" />
    </div>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const projects = loadProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const hide = new Set(project.hidden_sections ?? []);
  const show = (id: string) => !hide.has(id);

  // Nav menu: không có tong-quan, diem-noi-bat, thiet-ke
  const anchorSections = [
    show("chinh-sach") ? "chinh-sach" : null,
    show("gia-ban") && project.product_types ? "gia-ban" : null,
    show("vi-tri") ? "vi-tri" : null,
    show("tien-ich") && (project.amenities_internal || project.amenities_external) ? "tien-ich" : null,
    show("mat-bang") && (project.masterplan_image || project.gallery?.length) ? "mat-bang" : null,
    show("phap-ly") ? "phap-ly" : null,
    show("dang-ky") ? "dang-ky" : null,
  ].filter(Boolean) as string[];

  const related = projects
    .filter((p) => p.slug !== slug && (p.area === project.area || p.project_type === project.project_type))
    .slice(0, 3);
  const relatedProjects = related.length >= 2 ? related : projects.filter((p) => p.slug !== slug).slice(0, 3);

  const img = (n: number) => project.gallery?.[n] ?? project.hero_image ?? null;

  const specs = [
    { icon: Building2, label: "Chủ đầu tư", value: project.developer },
    { icon: MapPin, label: "Vị trí", value: project.address_full ?? project.location },
    { icon: Tag, label: "Loại hình", value: project.type },
    { icon: Home, label: "Quy mô", value: project.scale ?? (project.unit_count ? `${project.unit_count} căn` : "—") },
    { icon: Banknote, label: "Giá từ", value: project.priceRange },
    { icon: CheckCircle, label: "Trạng thái", value: project.status },
    ...(project.handover_date ? [{ icon: Calendar, label: "Bàn giao", value: project.handover_date }] : []),
    ...(project.legal_status ? [{ icon: ShieldCheck, label: "Pháp lý", value: project.legal_status }] : []),
  ];

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product",
    name: project.title, description: project.excerpt,
    image: project.hero_image ? [`https://1992land.com${project.hero_image}`] : [],
    offers: project.price_from
      ? { "@type": "AggregateOffer", lowPrice: project.price_from, highPrice: project.price_to ?? project.price_from, priceCurrency: "VND" }
      : undefined,
  };
  const faqSchema = project.faq?.length
    ? { "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: project.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }
    : null;

  return (
    <div className="pt-16 lg:pt-18 bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* ── BREADCRUMB ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-3">
        <nav className="flex items-center gap-1.5 text-muted text-xs">
          <Link href="/" className="hover:text-navy-900 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/du-an" className="hover:text-navy-900 transition-colors">Dự án</Link>
          <span>/</span>
          <span className="text-navy-700 truncate">{project.title}</span>
        </nav>
      </div>

      {/* ── GALLERY GRID (full width) ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-5">
        <ProjectGalleryGrid
          images={project.gallery?.length ? project.gallery : project.hero_image ? [project.hero_image] : []}
          title={project.title}
        />
      </div>

      {/* ── PROJECT HEADER (full width) ── */}
      <div className="bg-white border-y border-border-soft">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  project.status === "Đang mở bán" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>{project.status}</span>
                <span className="px-2.5 py-0.5 bg-navy-100 text-navy-700 text-xs font-medium rounded-full">{project.type}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-1">{project.title}</h1>
              <div className="flex items-center gap-1.5 text-muted text-sm">
                <MapPin size={13} className="shrink-0" />{project.address_full ?? project.location}
              </div>
            </div>
            <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2 shrink-0">
              <div className="text-right">
                <div className="text-muted text-xs">Giá từ</div>
                <div className="text-gold-500 font-bold text-xl font-numeric">{project.priceRange}</div>
              </div>
              <ContactModal label="Đăng ký tư vấn" subject={`[Lead] ${project.title}`} projectSlug={project.slug} variant="gold" className="py-2.5 px-6 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── ANCHOR NAV ── */}
      <ProjectAnchorNav sections={anchorSections} title={project.title} />

      {/* ── MAIN GRID ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ════ LEFT: content ════ */}
          <div className="lg:col-span-2 space-y-0">

            {/* ── 1. CHÍNH SÁCH ── */}
            {show("chinh-sach") && (
              <section className="pb-10">
                <SecHead id="chinh-sach" title="Chính sách bán hàng" />

                {/* Lịch thanh toán — collapse */}
                {project.payment_policy && (
                  <details className="group rounded-2xl border border-border-soft bg-white overflow-hidden mb-4" open>
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-navy-900 text-white">
                      <span className="text-sm font-semibold">Lịch thanh toán</span>
                      <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180 text-white/70" />
                    </summary>
                    <div className="divide-y divide-border-soft">
                      {project.payment_policy.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-navy-50/40 transition-colors">
                          <div className="w-11 h-11 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                            <span className="text-gold-600 font-bold font-numeric text-sm">{p.percent}%</span>
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900 text-sm">{p.installment}</div>
                            {p.note && <div className="text-muted text-xs mt-0.5">{p.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {project.discount && (
                    <div className="rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-amber-50/60 p-5">
                      <Zap size={15} className="text-gold-500 mb-2" />
                      <div className="text-[10px] font-bold text-gold-700 uppercase tracking-wider mb-1.5">Chiết khấu & ưu đãi</div>
                      <p className="text-navy-900 text-sm leading-relaxed">{project.discount}</p>
                    </div>
                  )}
                  {project.bank_support && (
                    <div className="rounded-2xl border border-border-soft bg-white p-5">
                      <Banknote size={15} className="text-gold-500 mb-2" />
                      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Hỗ trợ vay</div>
                      <p className="text-navy-900 text-sm leading-relaxed">{project.bank_support}</p>
                    </div>
                  )}
                  {project.grace_period && (
                    <div className="rounded-2xl border border-border-soft bg-white p-5 sm:col-span-2">
                      <Calendar size={15} className="text-gold-500 mb-2" />
                      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Ân hạn gốc & lãi</div>
                      <p className="text-navy-900 text-sm">{project.grace_period}</p>
                    </div>
                  )}
                  {!project.payment_policy && !project.discount && !project.bank_support && (
                    <div className="rounded-2xl bg-white border border-border-soft p-5 text-sm text-muted sm:col-span-2">
                      Liên hệ để nhận thông tin chính sách mới nhất.
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <ContactModal label="Nhận bảng giá" subject={`[Bảng giá] ${project.title}`} projectSlug={project.slug} icon="price" variant="gold" />
                  <ContactModal label="Nhận chính sách PDF" subject={`[Chính sách PDF] ${project.title}`} projectSlug={project.slug} icon="pdf" variant="outline" />
                </div>
              </section>
            )}

            {/* ── TỔNG QUAN (no nav anchor) ── */}
            {show("tong-quan") && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead title="Tổng quan dự án" />
                  <div className="rounded-2xl border border-border-soft bg-white overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-border-soft">
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
                              <td className="px-5 py-3 bg-navy-50/60 text-muted text-xs uppercase tracking-wide font-medium w-36 lg:w-44">{label}</td>
                              <td className="px-5 py-3 text-navy-900 font-semibold text-sm">{value}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* ── GIÁ BÁN ── */}
            {show("gia-ban") && project.product_types && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead id="gia-ban" title="Giá bán & giỏ hàng" />
                  <div className="rounded-2xl border border-border-soft bg-white overflow-hidden mb-5">
                    <div className="grid grid-cols-4 gap-2 bg-navy-900 px-5 py-3 text-white/70 text-[10px] font-bold uppercase tracking-wider">
                      <span>Loại căn</span><span>Diện tích</span><span>Mức giá</span><span className="text-right">Còn lại</span>
                    </div>
                    {project.product_types.map((p, i) => {
                      const scarce = p.available != null && p.total ? p.available / p.total < 0.2 : false;
                      return (
                        <div key={i} className={`grid grid-cols-4 gap-2 px-5 py-4 items-center hover:bg-navy-50/40 transition-colors ${i > 0 ? "border-t border-border-soft" : ""}`}>
                          <span className="font-bold text-navy-900 text-sm">{p.name}</span>
                          <span className="text-muted text-sm">{p.area}</span>
                          <span className="text-gold-600 font-bold text-sm font-numeric">{p.price_range}</span>
                          <div className="text-right">
                            {p.available != null
                              ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scarce ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                                  {scarce ? `⚡ ${p.available}` : `${p.available} căn`}
                                </span>
                              : <span className="text-muted text-xs">Liên hệ</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <ContactModal label="Nhận bảng hàng mới nhất" subject={`[Bảng hàng] ${project.title}`} projectSlug={project.slug} icon="price" variant="gold" />
                </section>
              </>
            )}

            {/* ── VỊ TRÍ ── */}
            {show("vi-tri") && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead id="vi-tri" title="Vị trí dự án" />
                  {project.lat && project.lng && (
                    <div className="rounded-2xl overflow-hidden border border-border-soft mb-4 h-60 lg:h-72">
                      <iframe
                        src={`https://maps.google.com/maps?q=${project.lat},${project.lng}&z=15&output=embed`}
                        width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade" title={`Vị trí ${project.title}`}
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm mb-4">
                    <MapPin size={15} className="text-gold-500 mt-0.5 shrink-0" />
                    <span className="text-navy-900 font-medium">{project.address_full ?? project.location}</span>
                  </div>
                  {project.nearby && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {project.nearby.map((n, i) => {
                        const Icon = NEARBY_ICONS[n.category] ?? MapPin;
                        return (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-border-soft hover:border-navy-200 transition-colors">
                            <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                              <Icon size={13} className="text-gold-500" />
                            </div>
                            <span className="flex-1 text-navy-900 text-sm truncate">{n.name}</span>
                            <span className="text-gold-600 text-xs font-bold font-numeric shrink-0">{n.distance}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ── ĐIỂM NỔI BẬT (no nav anchor) ── */}
            {show("diem-noi-bat") && project.highlights && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead title="Điểm nổi bật & lý do đầu tư" />
                  {img(1) && (
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-5 border border-border-soft">
                      <Image src={img(1)!} alt={project.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.highlights.map((h, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl bg-white border border-border-soft hover:border-gold-200 transition-all">
                        <CheckCircle size={15} className="text-gold-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-navy-900 text-sm mb-0.5">{h.title}</div>
                          <div className="text-muted text-xs leading-relaxed">{h.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ── TIỆN ÍCH ── */}
            {show("tien-ich") && (project.amenities_internal || project.amenities_external) && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead id="tien-ich" title="Tiện ích dự án" />
                  {img(2) && (
                    <div className="relative h-40 rounded-2xl overflow-hidden mb-5 border border-border-soft">
                      <Image src={img(2)!} alt={`Tiện ích ${project.title}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {project.amenities_internal && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TreePine size={14} className="text-gold-500" />
                          <span className="font-bold text-navy-900 text-sm">Nội khu</span>
                        </div>
                        <ul className="space-y-1.5">
                          {project.amenities_internal.map((a, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-navy-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {project.amenities_external && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={14} className="text-gold-500" />
                          <span className="font-bold text-navy-900 text-sm">Ngoại khu</span>
                        </div>
                        <ul className="space-y-1.5">
                          {project.amenities_external.map((a, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-navy-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-navy-300 shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* ── MẶT BẰNG ── */}
            {show("mat-bang") && (project.masterplan_image || project.gallery?.length) && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead id="mat-bang" title="Mặt bằng & hình ảnh" />
                  {project.masterplan_image && (
                    <div className="rounded-2xl overflow-hidden border border-border-soft mb-4">
                      <Image src={project.masterplan_image} alt={`Mặt bằng ${project.title}`} width={900} height={500} className="w-full object-cover" />
                    </div>
                  )}
                  {project.gallery && project.gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                      {project.gallery.slice(0, 6).map((src, i) => (
                        <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border-soft">
                          <Image src={src} alt={`${project.title} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="33vw" />
                        </div>
                      ))}
                    </div>
                  )}
                  <ContactModal label="Tải mặt bằng chi tiết" subject={`[Mặt bằng] ${project.title}`} projectSlug={project.slug} icon="plan" variant="outline" />
                </section>
              </>
            )}

            {/* ── THIẾT KẾ (no nav anchor) ── */}
            {show("thiet-ke") && project.floor_plans && (
              <>
                <Divider />
                <section className="py-10">
                  <SecHead title="Thiết kế sản phẩm" />
                  <div className="space-y-2.5 mb-4">
                    {project.floor_plans.map((fp, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-border-soft hover:border-navy-200 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                          <Home size={16} className="text-navy-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-navy-900 text-sm">{fp.name}</div>
                          <div className="text-muted text-xs mt-0.5 truncate">{fp.layout}</div>
                        </div>
                        <div className="text-gold-600 font-bold text-sm font-numeric shrink-0">{fp.area}</div>
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
                <section className="py-10">
                  <SecHead id="phap-ly" title="Tiến độ & Pháp lý" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-2xl bg-white border border-border-soft p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={14} className="text-gold-500" />
                        <span className="font-bold text-navy-900 text-sm">Tiến độ xây dựng</span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {project.construction_update ?? "Liên hệ 1992 Land để cập nhật tiến độ mới nhất."}
                      </p>
                      {project.handover_date && (
                        <div className="mt-3 flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                          <Calendar size={12} /> Bàn giao: {project.handover_date}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-white border border-border-soft p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={14} className="text-gold-500" />
                        <span className="font-bold text-navy-900 text-sm">Pháp lý</span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {project.legal_status ?? "Đang hoàn thiện hồ sơ pháp lý. Liên hệ để xem trực tiếp."}
                      </p>
                      {project.ownership && (
                        <div className="mt-3 flex items-start gap-1.5 text-navy-700 text-xs">
                          <CheckCircle size={12} className="text-gold-500 mt-0.5 shrink-0" />{project.ownership}
                        </div>
                      )}
                    </div>
                  </div>
                  {project.faq && project.faq.length > 0 && (
                    <div className="space-y-2">
                      {project.faq.map(({ q, a }, i) => (
                        <details key={i} className="group rounded-xl border border-border-soft bg-white overflow-hidden">
                          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer list-none font-semibold text-navy-900 text-sm hover:text-gold-500 transition-colors">
                            {q}
                            <ChevronDown size={14} className="text-muted shrink-0 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="px-5 pb-4 pt-3 text-muted text-sm leading-relaxed border-t border-border-soft">{a}</div>
                        </details>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ── FORM ĐĂNG KÝ ── */}
            {show("dang-ky") && (
              <>
                <Divider />
                <section id="dang-ky" className="scroll-mt-28 py-10">
                  <SecHead title="Đăng ký nhận tư vấn" />
                  <div className="bg-white rounded-3xl border border-border-soft p-7 shadow-sm">
                    <p className="text-muted text-sm mb-6 leading-relaxed">
                      Điền thông tin để nhận <strong className="text-navy-900">bảng giá, chính sách mới nhất</strong> và được tư vấn 1-1 trong vòng 30 phút.
                    </p>
                    <ContactForm subject={`[Lead] ${project.title} — 1992land.com`} duAnQuanTam={project.slug} />
                    <p className="text-xs text-muted text-center mt-4">
                      Hoặc liên hệ:{" "}
                      <a href="tel:+84909474123" className="text-gold-500 font-semibold">0909 474 123</a>
                      {" "}·{" "}
                      <a href="https://zalo.me/0909474123" className="text-gold-500 font-semibold" target="_blank" rel="noopener">Zalo</a>
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* ════ SIDEBAR ════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              {/* Specs */}
              <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
                <h3 className="font-bold text-navy-900 mb-4 text-sm">Thông tin dự án</h3>
                <ul className="space-y-3">
                  {specs.map((spec) => (
                    <li key={spec.label} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-navy-50 flex items-center justify-center shrink-0 mt-0.5">
                        <spec.icon size={12} className="text-gold-500" />
                      </div>
                      <div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">{spec.label}</div>
                        <div className="text-navy-900 font-semibold text-sm leading-snug">{spec.value}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-border-soft space-y-2.5">
                  <a href="https://zalo.me/0909474123" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#10B981] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm">
                    Chat Zalo ngay
                  </a>
                  <a href="tel:+84909474123"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-700 transition-colors text-sm">
                    <Phone size={13} /> 0909 474 123
                  </a>
                  <ContactModal
                    label="Nhận bảng giá"
                    subject={`[Bảng giá Sidebar] ${project.title}`}
                    projectSlug={project.slug}
                    icon="price"
                    variant="ghost"
                    className="w-full justify-center py-2.5"
                  />
                </div>
              </div>
              {/* Mini form */}
              <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
                <h3 className="font-bold text-navy-900 mb-1 text-sm">Đăng ký nhanh</h3>
                <p className="text-muted text-xs mb-4">Phản hồi trong 30 phút</p>
                <ContactForm subject={`[Lead Sidebar] ${project.title}`} duAnQuanTam={project.slug} compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RELATED ── */}
      {relatedProjects.length > 0 && (
        <div className="border-t border-border-soft bg-white py-12 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-bold text-navy-900 mb-6">Dự án cùng phân khúc</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProjects.map((rp) => (
                <Link key={rp.slug} href={`/du-an/${rp.slug}`}
                  className="group block rounded-2xl border border-border-soft bg-white hover:border-navy-200 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className={`relative h-40 bg-gradient-to-br ${rp.gradient} overflow-hidden`}>
                    {rp.hero_image && (
                      <Image src={rp.hero_image} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold rounded-full ${rp.status === "Đang mở bán" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {rp.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-navy-900 text-sm leading-snug mb-1.5 group-hover:text-gold-500 transition-colors line-clamp-2">{rp.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin size={11} />{rp.location}</span>
                      <span className="text-gold-600 font-bold">{rp.priceRange}</span>
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
