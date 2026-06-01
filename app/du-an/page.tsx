import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Dự án",
  description: "8 dự án bất động sản chọn lọc của 1992 Land — căn hộ, biệt thự, nghỉ dưỡng tại TP.HCM, Vũng Tàu, Bình Dương, Long An, Đồng Nai.",
};

const areas = ["Tất cả", "TP.HCM", "Bà Rịa — Vũng Tàu", "Bình Dương", "Long An", "Đồng Nai"];

export default function DuAnPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-navy-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">
            Danh mục dự án
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
            Dự án 1992 Land
          </h1>
          <p className="text-surface/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Các dự án bất động sản được chọn lọc kỹ — pháp lý minh bạch, tiềm
            năng tăng giá cao, phù hợp nhu cầu ở thực và đầu tư.
          </p>
          <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
        </div>
      </div>

      {/* Area filter (static display) */}
      <div className="bg-bg border-b border-border-soft px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {areas.map((area, i) => (
            <span
              key={area}
              className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-default ${
                i === 0
                  ? "bg-navy-900 text-surface"
                  : "bg-surface border border-border-soft text-navy-500 hover:border-navy-200"
              }`}
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/du-an/${project.slug}`}
              className="group block rounded-2xl overflow-hidden border border-border-soft bg-surface hover:border-navy-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient image placeholder */}
              <div
                className={`h-52 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}
              >
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
      </div>

      {/* CTA */}
      <div className="bg-navy-50 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-navy-900 mb-3">
          Không tìm thấy dự án phù hợp?
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          Mô tả nhu cầu của bạn — chúng tôi sẽ tư vấn dự án phù hợp nhất.
        </p>
        <Link
          href="/lien-he"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 text-surface font-semibold rounded-full hover:bg-navy-700 transition-colors"
        >
          Nhận tư vấn cá nhân
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
