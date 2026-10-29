import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProjects } from "@/lib/loadData";
import ProjectAnchorNav from "@/components/ProjectAnchorNav";
import MaiaHero from "@/components/maia/MaiaHero";
import MaiaOverview from "@/components/maia/MaiaOverview";
import MaiaLeadBand from "@/components/maia/MaiaLeadBand";
import MaiaLocation from "@/components/maia/MaiaLocation";
import MaiaResort from "@/components/maia/MaiaResort";
import MaiaDesign from "@/components/maia/MaiaDesign";
import MaiaPricing from "@/components/maia/MaiaPricing";

const SLUG = "maia-ho-tram";
const SECTIONS = ["tong-quan", "vi-tri", "tien-ich", "thiet-ke", "mat-bang", "gia-ban"];

export function generateMetadata(): Metadata {
  const p = loadProjects().find((x) => x.slug === SLUG);
  if (!p) return {};
  return {
    title: `${p.title} — Căn hộ & villa nghỉ dưỡng ven biển`,
    description: p.excerpt,
    alternates: { canonical: "/maia-resort-ho-tram/" },
    openGraph: { images: p.hero_image ? [p.hero_image] : undefined },
  };
}

export default function MaiaResortLanding() {
  const p = loadProjects().find((x) => x.slug === SLUG);
  if (!p) notFound();

  return (
    <div className="pt-16 lg:pt-[72px] bg-teal-950">
      <ProjectAnchorNav sections={SECTIONS} title={p.title} />
      <MaiaHero p={p} />
      <MaiaOverview p={p} />
      <MaiaLeadBand />
      <MaiaLocation p={p} />
      <MaiaResort />
      <MaiaLeadBand />
      <MaiaDesign />
      <MaiaPricing p={p} />
      <MaiaLeadBand id="dang-ky" />
    </div>
  );
}
