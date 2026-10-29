import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import type { Post } from "@/lib/data";
import { parseMarkdownBlocks } from "@/lib/markdown";
import MarkdownBlocks from "@/components/MarkdownBlocks";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";
import { contact } from "@/lib/site-config";
import { maiaHead, NARROW } from "@/components/maia/ui";

type PostDetailViewProps = {
  post: Post;
  relatedPosts: Post[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PostDetailView({ post, relatedPosts }: PostDetailViewProps) {
  return (
    <div>
      {/* Hero */}
      <div className="bg-navy-950 px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-navy-100">
            <Link href="/" className="hover:text-gold-300">Trang chủ</Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-gold-300">Tin tức</Link>
            <span>/</span>
            <span className="line-clamp-1 text-white">{post.title}</span>
          </nav>

          <h1 style={NARROW} className={`${maiaHead.className} mb-6 text-balance text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-gold-300 sm:text-5xl lg:text-6xl`}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-navy-50">
            <span className="bg-gold-300 px-2.5 py-0.5 text-sm font-semibold text-navy-950">
              {post.category}
            </span>
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
      <div className="bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* Article */}
          <article className="min-w-0">
            <Link
              href="/tin-tuc"
              className="mb-8 inline-flex min-h-12 items-center gap-2 text-base font-medium text-navy-800 hover:text-gold-900"
            >
              <ArrowLeft size={14} />
              Quay lại tin tức
            </Link>

            {/* Featured image */}
            {post.hero_image && (
              <div className="relative mb-8 aspect-video overflow-hidden bg-navy-100">
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
            <p className="text-xl text-navy-700 leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>

            {/* Article content */}
            {post.body ? (
              <MarkdownBlocks blocks={parseMarkdownBlocks(post.body)} variant="article" />
            ) : (
              <p className="leading-relaxed text-ink">
                Liên hệ với đội ngũ 1992 Land để được tư vấn chi tiết về chủ
                đề này, phù hợp với nhu cầu và ngân sách của bạn.
              </p>
            )}

            {/* Author box */}
            <div className="mt-14 flex items-start gap-5 border-t border-navy-900/20 pt-6">
              <div className="relative size-16 shrink-0 overflow-hidden bg-navy-900">
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
                <div className="mb-4 text-base text-navy-700">Giám đốc dự án · TPI Land</div>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`tel:${contact.phoneIntl}`}
                    className="inline-flex min-h-12 items-center gap-2 bg-navy-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
                  >
                    <Phone size={13} />
                    {contact.phoneDisplay}
                  </a>
                  <a
                    href={contact.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center gap-2 border-2 border-[#0068FF] px-5 text-sm font-semibold text-[#0050C8] transition-colors hover:bg-[#0068FF] hover:text-white"
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
              <div className="bg-navy-950 p-6 text-white">
                <h3 style={NARROW} className={`${maiaHead.className} mb-3 text-2xl font-extrabold uppercase leading-tight tracking-tight text-gold-300`}>Cần tư vấn thêm?</h3>
                <p className="mb-5 text-base leading-relaxed text-navy-50">
                  Đội ngũ 1992 Land sẵn sàng giải đáp mọi thắc mắc về BĐS miễn phí.
                </p>
                <div className="space-y-2.5">
                  <a
                    href={contact.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 w-full items-center justify-center gap-2.5 bg-gold-300 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-100"
                  >
                    <ZaloIcon size={20} />
                    Chat Zalo
                  </a>
                  <a
                    href={contact.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 w-full items-center justify-center gap-2.5 border border-gold-300 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-300 hover:text-navy-950"
                  >
                    <MessengerIcon size={18} />
                    Messenger
                  </a>
                  <a
                    href={`tel:${contact.phoneIntl}`}
                    className="flex min-h-12 w-full items-center justify-center gap-2 border border-gold-300/50 text-base font-medium text-white transition-colors hover:border-gold-300"
                  >
                    <Phone size={14} />
                    {contact.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <h3 style={NARROW} className={`${maiaHead.className} mb-2 text-2xl font-extrabold uppercase tracking-tight text-navy-900`}>
                    Bài viết liên quan
                  </h3>
                  <div>
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp.slug}
                        href={`/tin-tuc/${rp.slug}`}
                        className="group flex gap-3 border-t border-navy-900/20 py-3"
                      >
                        <div className="relative h-[56px] w-[88px] shrink-0 overflow-hidden bg-navy-100">
                          {rp.hero_image && (
                            <Image
                              src={rp.hero_image}
                              alt={rp.title}
                              fill
                              className="object-cover"
                              sizes="88px"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 group-hover:text-gold-900">
                            {rp.title}
                          </h4>
                          <div className="mt-1.5 flex items-center gap-1 text-sm text-navy-700">
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
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-navy-900/20 bg-bg px-4 py-8 sm:px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <Link
            href="/tin-tuc"
            className="flex min-h-12 items-center gap-2 text-base font-medium text-navy-800 hover:text-gold-900"
          >
            <ArrowLeft size={16} />
            Tất cả tin tức
          </Link>
          <Link
            href="/lien-he"
            className="flex min-h-12 items-center gap-2 bg-navy-900 px-6 text-base font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Nhận tư vấn <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
