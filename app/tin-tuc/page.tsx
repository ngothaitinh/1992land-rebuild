import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { posts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức bất động sản mới nhất — thị trường, pháp lý, đầu tư từ 1992 Land.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const categories = ["Tất cả", "Thị trường", "Đầu tư", "Pháp lý", "Dự án"];

export default function TinTucPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-navy-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">
            Kiến thức BĐS
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
            Tin tức & Phân tích
          </h1>
          <p className="text-surface/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Cập nhật thị trường bất động sản, phân tích đầu tư và hướng dẫn
            pháp lý từ đội ngũ chuyên gia 1992 Land.
          </p>
          <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-bg border-b border-border-soft px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {categories.map((cat, i) => (
            <span
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-default ${
                i === 0
                  ? "bg-navy-900 text-surface"
                  : "bg-surface border border-border-soft text-navy-500"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/tin-tuc/${post.slug}`}
              className="group block rounded-2xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-navy-500 to-navy-800 relative flex items-center justify-center">
                <Tag size={32} className="text-white/20" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-2.5 py-1 bg-gold-500/90 text-navy-950 text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="font-bold text-navy-900 text-base leading-snug mb-3 group-hover:text-gold-500 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border-soft">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="text-gold-500 text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    Đọc <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state note */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-navy-50 border border-border-soft">
          <p className="text-muted text-sm">
            Đang cập nhật thêm bài viết mới — 16+ bài sắp ra mắt.
          </p>
        </div>
      </div>
    </div>
  );
}
