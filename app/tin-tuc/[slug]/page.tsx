import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPosts } from "@/lib/loadData";
import PostDetailView from "@/components/PostDetailView";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPosts().find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.hero_image
      ? { images: [{ url: post.hero_image }] }
      : undefined,
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = loadPosts();
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return <PostDetailView post={post} relatedPosts={related} />;
}
