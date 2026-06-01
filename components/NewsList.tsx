"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function NewsList({ posts }: { posts: Post[] }) {
  const [expanded, setExpanded] = useState(false);

  function handleExpand() {
    setExpanded(true);
    // Tracking: anh có thể dùng event này trong GA4 / Google Ads
    gtagEvent("news_expand", {
      event_category: "engagement",
      event_label: "homepage_news_see_more",
    });
  }

  const visible = expanded ? posts : posts.slice(0, INITIAL_COUNT);
  const hidden = posts.slice(INITIAL_COUNT);

  return (
    <div className="relative">
      {/* Danh sách luôn hiện (3 bài đầu) */}
      <div className="space-y-5">
        {visible.map((post, i) => (
          <Link
            key={post.slug}
            href={`/tin-tuc/${post.slug}`}
            className="group flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-surface border border-border-soft hover:border-navy-200 hover:shadow-md transition-all duration-200"
          >
            <div className="w-full sm:w-44 h-32 sm:h-auto rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center shrink-0">
              <span className="text-surface/40 text-sm font-medium">{post.category}</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full mb-3">
                  {post.category}
                </span>
                <h3 className="font-bold text-navy-900 text-lg leading-snug mb-2 group-hover:text-gold-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-soft text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {post.readTime}
                </span>
                <span className="ml-auto text-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Đọc tiếp <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Gradient fade + nút xem thêm (chỉ khi chưa expand) */}
      {!expanded && hidden.length > 0 && (
        <div className="relative mt-5">
          {/* Bài mờ dần — render sẵn nhưng bị che */}
          <div className="pointer-events-none select-none space-y-5 opacity-40 blur-[2px]">
            {hidden.slice(0, 2).map((post) => (
              <div
                key={post.slug}
                className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-surface border border-border-soft"
              >
                <div className="w-full sm:w-44 h-32 sm:h-auto rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-navy-100 rounded w-24" />
                  <div className="h-5 bg-navy-100 rounded w-3/4" />
                  <div className="h-4 bg-navy-100 rounded w-full" />
                  <div className="h-4 bg-navy-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Gradient che từ trong suốt → nền */}
          <div
            className="absolute inset-x-0 top-0 h-full pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(243,239,233,0) 0%, rgba(243,239,233,0.7) 40%, rgba(243,239,233,1) 80%)",
            }}
          />

          {/* Gợi mở */}
          <button
            onClick={handleExpand}
            className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 pb-3 pt-16 group cursor-pointer"
          >
            <span className="text-navy-500 text-sm font-medium group-hover:text-navy-900 transition-colors">
              Xem thêm tin tức
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
