import Link from "next/link";
import { loadPosts } from "@/lib/loadData";

export default function DashboardPostListPage() {
  const posts = loadPosts();
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-bold text-navy-900">Chọn bài viết để sửa</h1>
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/dashboard/tin-tuc/${p.slug}/`} className="text-navy-700 underline hover:text-gold-600">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
