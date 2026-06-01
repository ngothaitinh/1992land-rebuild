"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div className="bg-bg border-b border-border-soft px-6 py-4 sticky top-16 lg:top-[72px] z-30">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setSelected(area)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selected === area
                  ? "bg-navy-900 text-white"
                  : "bg-surface border border-border-soft text-navy-500 hover:border-navy-300 hover:text-navy-900"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-lg font-medium mb-2">Không có dự án tại khu vực này</p>
            <button
              onClick={() => setSelected("Tất cả")}
              className="text-gold-500 underline underline-offset-4 text-sm"
            >
              Xem tất cả dự án
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <Link
                key={project.slug}
                href={`/du-an/${project.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`h-52 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/10 transition-colors" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-block px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {project.type}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        project.status === "Đang mở bán"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-gold-500/20 text-gold-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-base font-bold text-navy-900 mb-2 group-hover:text-gold-500 transition-colors">
                    {project.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-muted text-xs mb-3">
                    <MapPin size={12} />
                    {project.location}
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">
                    {project.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border-soft">
                    <div>
                      <div className="text-xs text-muted">Giá từ</div>
                      <div className="text-navy-900 font-semibold font-numeric text-sm">
                        {project.priceRange}
                      </div>
                    </div>
                    <span className="text-gold-500 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Chi tiết <ArrowRight size={14} />
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
