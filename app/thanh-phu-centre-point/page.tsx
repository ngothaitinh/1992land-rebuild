import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProjects } from "@/lib/loadData";
import ProjectAnchorNav from "@/components/ProjectAnchorNav";
import MaiaLeadBand from "@/components/maia/MaiaLeadBand";
import TpHero from "@/components/thanhphu/TpHero";
import TpOverview from "@/components/thanhphu/TpOverview";
import TpLocation from "@/components/thanhphu/TpLocation";
import TpAmenities from "@/components/thanhphu/TpAmenities";
import TpProducts from "@/components/thanhphu/TpProducts";
import TpPricing from "@/components/thanhphu/TpPricing";
import TpDeveloper from "@/components/thanhphu/TpDeveloper";

const SLUG = "thanh-phu-centre-point";
const SECTIONS = ["tong-quan", "vi-tri", "tien-ich", "thu-vien-anh", "mat-bang", "gia-ban", "phap-ly"];
const PRODUCTS = ["Nhà phố liền kề Hội Phú", "Nhà phố thương mại Hội Phú", "Shophouse Strip Mall", "Biệt thự An Phú", "Chưa xác định"];
const lead = { project: "Thanh Phú Centre Point", place: "Bến Lức", products: PRODUCTS, formType: "thanhphu_landing" };

export function generateMetadata(): Metadata {
  const p = loadProjects().find((x) => x.slug === SLUG);
  if (!p) return {};
  return {
    title: `${p.title} — Nhà phố, shophouse đô thị 85 ha tại Bến Lức`,
    description: p.excerpt,
    alternates: { canonical: "/thanh-phu-centre-point/" },
    openGraph: { images: ["/images/projects/thanh-phu-centre-point/cdt/hero.webp"] },
  };
}

export default function ThanhPhuLanding() {
  const p = loadProjects().find((x) => x.slug === SLUG);
  if (!p) notFound();

  return (
    <div className="pt-16 lg:pt-[72px] bg-emerald-950">
      <ProjectAnchorNav sections={SECTIONS} title={p.title} />
      <TpHero priceFrom="5,79 tỷ/căn" location={p.location ?? "Bến Lức"} />
      <TpOverview />
      <MaiaLeadBand {...lead} />
      <TpLocation />
      <TpAmenities />
      <MaiaLeadBand {...lead} />
      <TpProducts />
      <TpPricing />
      <TpDeveloper />
      <MaiaLeadBand id="dang-ky" {...lead} />
    </div>
  );
}
