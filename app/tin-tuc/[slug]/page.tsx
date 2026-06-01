import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { posts } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-navy-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-surface/50 text-sm mb-6">
            <Link href="/" className="hover:text-surface transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-surface transition-colors">
              Tin tức
            </Link>
            <span>/</span>
            <span className="text-surface/80 line-clamp-1">{post.title}</span>
          </nav>

          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gold-500/20 text-gold-300 text-xs font-semibold rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-surface leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-surface/50 text-sm">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article */}
          <article className="lg:col-span-2">
            <Link
              href="/tin-tuc"
              className="inline-flex items-center gap-2 text-muted hover:text-navy-900 text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={14} />
              Quay lại tin tức
            </Link>

            {/* Lead */}
            <p className="text-lg text-muted leading-relaxed mb-8 border-l-4 border-gold-500 pl-6 font-medium">
              {post.excerpt}
            </p>

            {/* Placeholder content */}
            <div className="space-y-6 text-ink leading-relaxed">
              <p>
                Thị trường bất động sản Việt Nam đang trải qua giai đoạn biến
                động thú vị, với nhiều cơ hội dành cho cả người mua để ở lẫn
                nhà đầu tư dài hạn. Bài viết này sẽ phân tích những xu hướng
                chính và đưa ra góc nhìn từ đội ngũ chuyên gia 1992 Land.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8">
                Tình hình thị trường hiện tại
              </h2>
              <p>
                Nguồn cung bất động sản tại các thành phố lớn như TP.HCM đang
                dần được bổ sung sau giai đoạn khan hiếm. Nhiều dự án mới được
                cấp phép và triển khai, tạo ra sự đa dạng về lựa chọn cho
                người mua nhà.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8">
                Lời khuyên cho nhà đầu tư
              </h2>
              <p>
                Trong giai đoạn này, việc chọn lựa dự án có pháp lý rõ ràng,
                chủ đầu tư uy tín và vị trí có hạ tầng phát triển là yếu tố
                then chốt để đảm bảo tính thanh khoản và tăng giá trong dài
                hạn.
              </p>
              <p>
                Liên hệ với đội ngũ chuyên gia 1992 Land để nhận tư vấn cá
                nhân hóa phù hợp với nhu cầu và ngân sách của bạn.
              </p>
            </div>

            {/* Author box */}
            <div className="mt-12 p-6 rounded-2xl bg-navy-50 border border-border-soft flex gap-4">
              <div className="w-14 h-14 rounded-full bg-navy-900 flex items-center justify-center text-surface font-bold text-xl shrink-0">
                T
              </div>
              <div>
                <div className="font-bold text-navy-900">Nguyễn Hữu Thọ</div>
                <div className="text-muted text-sm mb-3">
                  Chuyên gia BĐS · 1992 Land
                </div>
                <a
                  href="tel:+84909474123"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-surface text-xs font-medium rounded-full hover:bg-navy-700 transition-colors"
                >
                  <Phone size={12} />
                  Liên hệ tư vấn
                </a>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Contact CTA */}
              <div className="rounded-2xl bg-navy-900 p-6 text-surface">
                <h3 className="font-bold mb-3">Cần tư vấn thêm?</h3>
                <p className="text-surface/60 text-sm mb-5 leading-relaxed">
                  Đội ngũ 1992 Land sẵn sàng giải đáp mọi thắc mắc về BĐS
                  miễn phí.
                </p>
                <a
                  href="https://zalo.me/0909474123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-[#10B981] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
                >
                  Chat Zalo
                </a>
                <a
                  href="tel:+84909474123"
                  className="flex items-center justify-center gap-2 w-full py-3 mt-2 border border-white/20 text-surface font-medium rounded-full hover:border-white/40 transition-colors text-sm"
                >
                  <Phone size={14} />
                  0909 474 123
                </a>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wider">
                    Bài viết liên quan
                  </h3>
                  <div className="space-y-3">
                    {related.map((rp) => (
                      <Link
                        key={rp.slug}
                        href={`/tin-tuc/${rp.slug}`}
                        className="group flex gap-3 p-3 rounded-xl border border-border-soft hover:border-navy-200 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-navy-500 to-navy-700 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-gold-500 transition-colors">
                            {rp.title}
                          </h4>
                          <div className="flex items-center gap-1 text-muted text-xs mt-1">
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

      {/* Navigation */}
      <div className="bg-navy-50 py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/tin-tuc"
            className="flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Tất cả tin tức
          </Link>
          <Link
            href="/lien-he"
            className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-surface text-sm font-semibold rounded-full hover:bg-navy-700 transition-colors"
          >
            Nhận tư vấn
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
