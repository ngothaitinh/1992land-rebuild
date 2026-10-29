import type { Metadata } from "next";
import { loadPosts } from "@/lib/loadData";
import PostsGrid from "@/components/PostsGrid";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức bất động sản mới nhất — thị trường, pháp lý, đầu tư từ 1992 Land.",
};

export default function TinTucPage() {
  const posts = loadPosts();

  return (
    <div>
      <PageHero title="Tin tức & Phân tích">
        <p>
          Cập nhật thị trường bất động sản, phân tích đầu tư và hướng dẫn
          pháp lý từ đội ngũ chuyên gia 1992 Land.
        </p>
      </PageHero>

      <PostsGrid posts={posts} />
    </div>
  );
}
