"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, ChevronDown } from "lucide-react";
import { gtagEvent } from "@/components/Analytics";
import type { Post } from "@/lib/data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const INITIAL_COUNT = 3;

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
        <h3 className="font-bold text-navy-900 text-base leading-snug mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
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
  const [expanded, setExpanded] = useState(false);

  function handleExpand() {
    setExpanded(true);
    gtagEvent("news_expand", {
      event_category: "engagement",
      event_label: "homepage_news_see_more",
    });
  }

  const visible = expanded ? posts : posts.slice(0, INITIAL_COUNT);
  const hidden = posts.slice(INITIAL_COUNT);

  return (
    <div className="relative">
      {/* Grid 3 cột */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((post, i) => (
          <PostCard key={post.slug} post={post} priority={i < 3} />
        ))}
      </div>

      {/* Gradient fade + nút xem thêm */}
      {!expanded && hidden.length > 0 && (
        <div className="relative mt-5">
          {/* Bài mờ — skeleton preview */}
          <div className="pointer-events-none select-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-35 blur-[2px]">
            {hidden.slice(0, 3).map((post) => (
              <div key={post.slug} className="rounded-2xl overflow-hidden bg-white border border-border-soft">
                <div className="aspect-[16/9] bg-navy-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-navy-100 rounded w-20" />
                  <div className="h-4 bg-navy-100 rounded w-full" />
                  <div className="h-4 bg-navy-100 rounded w-4/5" />
                  <div className="h-3 bg-navy-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Gradient fade */}
          <div
            className="absolute inset-x-0 top-0 h-full pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(243,239,233,0) 0%, rgba(243,239,233,0.75) 45%, rgba(243,239,233,1) 85%)",
            }}
          />

          {/* Nút xem thêm */}
          <button
            onClick={handleExpand}
            className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 pb-3 pt-14 group cursor-pointer"
          >
            <span className="text-navy-500 text-sm font-medium group-hover:text-navy-900 transition-colors">
              Xem thêm {hidden.length} bài viết
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            >
              <ChevronDown size={22} className="text-gold-500" />
            </motion.div>
          </button>
        </div>
      )}
    </div>
  );
}
