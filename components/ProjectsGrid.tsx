"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/data";

const AREAS = ["Tất cả", "TP.HCM", "Bà Rịa — Vũng Tàu", "Bình Dương", "Long An", "Đồng Nai"];

function matchArea(project: Project, area: string) {
  if (area === "Tất cả") return true;
  if (area === "TP.HCM") return project.area.includes("Hồ Chí Minh") || project.area.includes("TP.HCM");
  return project.area === area;
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState("Tất cả");
  const filtered = projects.filter((p) => matchArea(p, selected));

  return (
    <>
      {/* Area filter */}
      <div className="sticky top-16 z-30 border-b border-navy-900/20 bg-bg py-3 sm:py-4 lg:top-[72px]">
        <div className="mx-auto flex max-w-7xl snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-6 [&::-webkit-scrollbar]:hidden">
          {AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setSelected(area)}
              aria-pressed={selected === area}
              className={`min-h-11 shrink-0 cursor-pointer snap-start px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 ${
                selected === area
                  ? "bg-navy-900 text-white"
                  : "border border-navy-900/30 text-navy-800 hover:border-navy-900 hover:text-navy-950"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-navy-700">
            <p className="mb-2 text-lg font-medium">Không có dự án tại khu vực này</p>
            <button
              onClick={() => setSelected("Tất cả")}
              className="min-h-11 text-sm font-semibold text-gold-900 underline underline-offset-4 hover:text-navy-950"
            >
              Xem tất cả dự án
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <Link
                key={project.slug}
                href={`/du-an/${project.slug}`}
                className="group flex flex-col border-t border-navy-900/20 pt-4"
              >
                <div className="relative h-52 overflow-hidden bg-navy-100">
                  {project.hero_image && (
                    <Image
                      src={project.hero_image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <p className="mb-2 text-sm font-semibold text-gold-900">
                    {project.status} · {project.type}
                  </p>
                  <h2 className="mb-2 text-lg font-bold leading-snug text-navy-900 group-hover:text-gold-900">
                    {project.title}
                  </h2>
                  <div className="mb-3 flex items-center gap-1.5 text-sm text-navy-700">
                    <MapPin size={14} aria-hidden />
                    {project.location}
                  </div>
                  <p className="mb-4 line-clamp-2 flex-1 text-base leading-relaxed text-navy-700">
                    {project.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-navy-900/20 pt-3">
                    <div>
                      <div className="text-sm text-navy-700">Giá từ</div>
                      <div className="font-numeric font-bold tabular-nums text-gold-900">
                        {project.priceRange}
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-navy-900">
                      Chi tiết <ArrowRight size={14} aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
