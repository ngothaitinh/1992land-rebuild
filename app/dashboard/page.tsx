// app/dashboard/page.tsx
import Link from "next/link";
import { loadProjects, loadPosts } from "@/lib/loadData";

export default function DashboardHomePage() {
  const projects = loadProjects();
  const posts = loadPosts();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">Dashboard 1992 Land</h1>
        <p className="mt-1 text-sm text-muted">Quản trị nội dung dự án và tin tức</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Dự án ({projects.length})</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/dashboard/du-an/${p.slug}/`}
                className="block rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-navy-700 hover:border-gold-500"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Tin tức ({posts.length})</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/dashboard/tin-tuc/${p.slug}/`}
                className="block rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-navy-700 hover:border-gold-500"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
