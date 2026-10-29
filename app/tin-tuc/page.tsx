import type { Metadata } from "next";
import { loadPosts } from "@/lib/loadData";
import PostsGrid from "@/components/PostsGrid";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức bất động sản mới nhất — thị trường, pháp lý, đầu tư từ 1992 Land.",
};

export default function TinTucPage() {
  const posts = loadPosts();

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-navy-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">
            Kiến thức BĐS
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
            Tin tức & Phân tích
          </h1>
          <p className="text-surface/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Cập nhật thị trường bất động sản, phân tích đầu tư và hướng dẫn
            pháp lý từ đội ngũ chuyên gia 1992 Land.
          </p>
          <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
        </div>
      </div>

      <PostsGrid posts={posts} />
    </div>
  );
}
