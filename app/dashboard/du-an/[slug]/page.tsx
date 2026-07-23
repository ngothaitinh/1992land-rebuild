import { loadProjects } from "@/lib/loadData";
import DashboardProjectEditor from "@/components/dashboard/DashboardProjectEditor";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export default async function DashboardProjectPage({ params }: Props) {
  const { slug } = await params;
  return <DashboardProjectEditor slug={slug} />;
}
