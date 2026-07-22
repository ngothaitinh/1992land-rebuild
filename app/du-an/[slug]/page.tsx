import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProjects, loadPosts } from "@/lib/loadData";
import ProjectDetailView from "@/components/ProjectDetailView";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = loadProjects().find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const projects = loadProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const related = projects
    .filter((p) => p.slug !== slug && (p.area === project.area || p.project_type === project.project_type))
    .slice(0, 3);
  const relatedProjects = related.length >= 2 ? related : projects.filter((p) => p.slug !== slug).slice(0, 3);

  const allPosts = loadPosts();
  const relatedPosts = allPosts
    .filter((p) => p.related_projects?.includes(slug))
    .slice(0, 3);

  return (
    <ProjectDetailView
      project={project}
      relatedProjects={relatedProjects}
      relatedPosts={relatedPosts}
    />
  );
}
