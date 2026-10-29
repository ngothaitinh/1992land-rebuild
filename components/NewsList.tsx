"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { Post } from "@/lib/data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const INITIAL_COUNT = 6;

function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link
      href={`/tin-tuc/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-border-soft hover:border-navy-200 hover:shadow-lg transition-all duration-250 cursor-pointer"
    >
      {/* Thumbnail — 16:9 chuẩn */}
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-100 shrink-0">
        {post.hero_image ? (
          <Image
            src={post.hero_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-600 to-navy-900 flex items-center justify-center">
            <span className="text-white/30 text-sm font-medium">{post.category}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-gold-500/90 text-navy-950 text-[10px] font-bold rounded-full backdrop-blur-sm uppercase tracking-wide">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-bold text-navy-900 text-base leading-snug mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border-soft text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(post.date)}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{post.readTime}</span>
          </div>
          <span className="text-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all font-semibold">
            Đọc <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function NewsList({ posts }: { posts: Post[] }) {
  const first3 = posts.slice(0, 3);
  const next3 = posts.slice(3, INITIAL_COUNT);

  return (
    <div className="relative">
      {/* Hàng 1 — full opacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {first3.map((post, i) => (
          <PostCard key={post.slug} post={post} priority={i < 3} />
        ))}
      </div>

      {/* Hàng 2 — fade dần từ giữa xuống */}
      {next3.length > 0 && (
        <div className="relative mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {next3.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {/* Gradient overlay — bắt đầu mờ từ 35% xuống */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-6"
            style={{
              background: "linear-gradient(to bottom, rgba(243,239,233,0) 0%, rgba(243,239,233,0.55) 40%, rgba(243,239,233,0.92) 72%, rgba(243,239,233,1) 100%)",
            }}
          >
            <Link
              href="/tin-tuc"
              className="flex items-center gap-2 px-7 py-3 bg-navy-900 text-white text-sm font-semibold rounded-full hover:bg-navy-700 transition-colors shadow-lg"
            >
              Xem thêm nhiều bài viết <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
