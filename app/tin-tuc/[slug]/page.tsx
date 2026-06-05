import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { loadPosts } from "@/lib/loadData";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPosts().find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.hero_image
      ? { images: [{ url: post.hero_image }] }
      : undefined,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, i) => {
    const t = block.trim();
    if (!t) return null;
    if (t.startsWith("## "))
      return (
        <h2 key={i} className="text-2xl font-bold text-navy-900 mt-10 mb-4 tracking-tight">
          {t.slice(3)}
        </h2>
      );
    if (t.startsWith("> "))
      return (
        <blockquote key={i} className="border-l-4 border-gold-500 pl-6 py-2 my-6 bg-gold-50 rounded-r-xl">
          <p className="text-navy-800 font-medium italic leading-relaxed">{t.slice(2)}</p>
        </blockquote>
      );
    if (t.startsWith("- ")) {
      const items = t.split(/\n/).filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return (
        <ul key={i} className="space-y-3 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3 items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="leading-[1.85] text-ink">
        {t}
      </p>
    );
  });
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = loadPosts();
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-navy-900 py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-surface/50 text-sm mb-6 flex-wrap">
            <Link href="/" className="hover:text-surface transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-surface transition-colors">Tin tức</Link>
            <span>/</span>
            <span className="text-surface/70 line-clamp-1">{post.title}</span>
          </nav>

          <span className="inline-block px-3 py-1 bg-gold-500/20 text-gold-300 text-xs font-semibold rounded-full mb-4">
            {post.category}
          </span>

          <h1 className="text-3xl lg:text-4xl font-bold text-surface leading-tight mb-6 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-5 text-surface/50 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* Article */}
          <article className="min-w-0">
            <Link
              href="/tin-tuc"
              className="inline-flex items-center gap-2 text-muted hover:text-navy-900 text-sm mb-8 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Quay lại tin tức
            </Link>

            {/* Featured image */}
            {post.hero_image && (
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-8">
                <Image
                  src={post.hero_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 760px"
                  priority
                />
              </div>
            )}

            {/* Lead */}
            <p className="text-lg text-navy-700 leading-relaxed mb-8 border-l-4 border-gold-500 pl-6 font-medium bg-gold-50/50 py-4 pr-4 rounded-r-xl">
              {post.excerpt}
            </p>

            {/* Article content */}
            <div className="space-y-5 text-[15px]">
              {post.body ? renderBody(post.body) : (
                <p className="leading-relaxed text-ink">
                  Liên hệ với đội ngũ 1992 Land để được tư vấn chi tiết về chủ
                  đề này, phù hợp với nhu cầu và ngân sách của bạn.
                </p>
              )}
            </div>

            {/* Author box */}
            <div className="mt-14 p-6 rounded-2xl bg-navy-50 border border-border-soft flex gap-5 items-start">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-navy-900 shrink-0">
                <Image
                  src="/images/team/nguyen-huu-tho-portrait.png"
                  alt="Nguyễn Hữu Thọ"
                  fill
                  className="object-cover object-top"
                  sizes="64px"
                />
              </div>
              <div>
                <div className="font-bold text-navy-900 text-base">Nguyễn Hữu Thọ</div>
                <div className="text-muted text-sm mb-4">Chuyên gia BĐS · Nhà sáng lập 1992 Land</div>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href="tel:+84909474123"
                    className="inline-flex items-center gap-2 px-4 min-h-[44px] bg-navy-900 text-surface text-xs font-semibold rounded-full hover:bg-navy-700 transition-colors cursor-pointer"
                  >
                    <Phone size={13} />
                    0909 474 123
                  </a>
                  <a
                    href="https://zalo.me/0909474123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 min-h-[44px] bg-white border-2 border-[#0068FF] text-[#0068FF] text-xs font-semibold rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <ZaloIcon size={18} />
                    Zalo
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-24 space-y-6">

              {/* Contact CTA */}
              <div className="rounded-2xl bg-navy-900 p-6 text-surface">
                <h3 className="font-bold text-lg mb-2">Cần tư vấn thêm?</h3>
                <p className="text-surface/60 text-sm mb-5 leading-relaxed">
                  Đội ngũ 1992 Land sẵn sàng giải đáp mọi thắc mắc về BĐS miễn phí.
                </p>
                <div className="space-y-2.5">
                  <a
                    href="https://zalo.me/0909474123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full min-h-[44px] bg-white border-2 border-[#0068FF] text-[#0068FF] font-semibold rounded-full hover:bg-blue-50 transition-colors text-sm cursor-pointer"
                  >
                    <ZaloIcon size={20} />
                    Chat Zalo
                  </a>
                  <a
                    href="https://m.me/165126330021000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full min-h-[44px] bg-[#0084FF] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm cursor-pointer"
                  >
                    <MessengerIcon size={18} />
                    Messenger
                  </a>
                  <a
                    href="tel:+84909474123"
                    className="flex items-center justify-center gap-2 w-full min-h-[44px] border border-white/25 text-surface font-medium rounded-full hover:border-white/50 transition-colors text-sm cursor-pointer"
                  >
                    <Phone size={14} />
                    0909 474 123
                  </a>
                </div>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <h3 className="font-bold text-navy-900 mb-4 text-xs uppercase tracking-widest">
                    Bài viết liên quan
                  </h3>
                  <div className="space-y-3">
                    {related.map((rp) => (
                      <Link
                        key={rp.slug}
                        href={`/tin-tuc/${rp.slug}`}
                        className="group flex gap-3 p-3 rounded-xl border border-border-soft hover:border-navy-200 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-navy-500 to-navy-700 shrink-0">
                          {rp.hero_image && (
                            <Image
                              src={rp.hero_image}
                              alt={rp.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <h4 className="text-xs font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-gold-600 transition-colors">
                            {rp.title}
                          </h4>
                          <div className="flex items-center gap-1 text-muted text-xs mt-1.5">
                            <Clock size={10} />
                            {rp.readTime}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-border-soft bg-bg py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <Link
            href="/tin-tuc"
            className="flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm font-medium transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft size={16} />
            Tất cả tin tức
          </Link>
          <Link
            href="/lien-he"
            className="flex items-center gap-2 px-6 min-h-[44px] bg-navy-900 text-surface text-sm font-semibold rounded-full hover:bg-navy-700 transition-colors cursor-pointer"
          >
            Nhận tư vấn <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
