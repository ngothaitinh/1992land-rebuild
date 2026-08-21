import { loadPosts } from "@/lib/loadData";
import DashboardPostEditor from "@/components/dashboard/DashboardPostEditor";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPosts().map((p) => ({ slug: p.slug }));
}

export default async function DashboardPostPage({ params }: Props) {
  const { slug } = await params;
  return <DashboardPostEditor slug={slug} />;
}
