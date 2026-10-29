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
      <div className="sticky top-16 z-30 border-b border-navy-900/20 bg-bg px-4 py-3 sm:px-6 lg:top-[72px]">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              className={`min-h-11 cursor-pointer px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 ${
                active === cat
                  ? "bg-navy-900 text-white"
                  : "border border-navy-900/30 text-navy-800 hover:border-navy-900 hover:text-navy-950"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-navy-700">
            <p className="mb-2 text-base font-medium">Chưa có bài viết trong mục này</p>
            <button
              onClick={() => setActive("Tất cả")}
              className="min-h-11 text-sm font-semibold text-gold-900 underline underline-offset-4 hover:text-navy-950"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <Link
                key={post.slug}
                href={`/tin-tuc/${post.slug}`}
                className="group flex flex-col border-t border-navy-900/20 pt-4"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-navy-100">
                  {post.hero_image ? (
                    <Image
                      src={post.hero_image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag size={32} className="text-navy-300" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <p className="mb-2 text-sm font-semibold text-gold-900">{post.category}</p>
                  <h2 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-navy-900 group-hover:text-gold-900">
                    {post.title}
                  </h2>
                  <p className="mb-4 line-clamp-3 flex-1 text-base leading-relaxed text-navy-700">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-navy-900/20 pt-3 text-sm text-navy-700">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} aria-hidden />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} aria-hidden />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-gold-900">
                      Đọc <ArrowRight size={14} aria-hidden />
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
