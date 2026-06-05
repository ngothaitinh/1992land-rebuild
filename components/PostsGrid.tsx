"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import type { Post } from "@/lib/data";

const CATEGORIES = ["Tất cả", "Thị trường", "Đầu tư", "Pháp lý", "Dự án"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PostsGrid({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState("Tất cả");

  const filtered = active === "Tất cả"
    ? posts
    : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Category filter */}
      <div className="bg-bg border-b border-border-soft px-6 py-3 sticky top-16 lg:top-[72px] z-30">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                active === cat
                  ? "bg-navy-900 text-white"
                  : "bg-surface border border-border-soft text-navy-500 hover:border-navy-300 hover:text-navy-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-base font-medium mb-2">Chưa có bài viết trong mục này</p>
            <button
              onClick={() => setActive("Tất cả")}
              className="text-gold-500 underline underline-offset-4 text-sm hover:text-gold-600 transition-colors"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link
                key={post.slug}
                href={`/tin-tuc/${post.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail — 16:9 chuẩn */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-navy-500 to-navy-800">
                  {post.hero_image ? (
                    <Image
                      src={post.hero_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag size={32} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/10 transition-colors" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-block px-2.5 py-1 bg-gold-500/90 text-navy-950 text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="font-bold text-navy-900 text-base leading-snug mb-3 group-hover:text-gold-600 transition-colors line-clamp-2">
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
                    <span className="text-gold-500 text-xs flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                      Đọc <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
