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
    <Link href={`/tin-tuc/${post.slug}`} className="group flex flex-col border-t border-navy-900/20 pt-4">
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-navy-100">
        {post.hero_image && (
          <Image
            src={post.hero_image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="mb-2 text-sm font-semibold text-gold-900">{post.category}</p>
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-navy-900 group-hover:text-gold-900">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-base leading-relaxed text-navy-700">{post.excerpt}</p>
        <div className="flex items-center justify-between border-t border-navy-900/20 pt-3 text-sm text-navy-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar size={12} aria-hidden />{formatDate(post.date)}</span>
            <span className="flex items-center gap-1"><Clock size={12} aria-hidden />{post.readTime}</span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-gold-900">
            Đọc <ArrowRight size={14} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function NewsList({ posts }: { posts: Post[] }) {
  const shown = posts.slice(0, INITIAL_COUNT);

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((post, i) => (
          <PostCard key={post.slug} post={post} priority={i < 3} />
        ))}
      </div>
      {posts.length > 3 && (
        <div className="mt-12">
          <Link
            href="/tin-tuc"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold-300 px-6 py-3 text-[15px] font-semibold text-navy-950 transition-colors duration-200 hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2"
          >
            Xem thêm nhiều bài viết <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
