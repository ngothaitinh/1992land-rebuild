import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadProjects } from "@/lib/loadData";

const projects = loadProjects();
import ProjectsGrid from "@/components/ProjectsGrid";

export const metadata: Metadata = {
  title: "Dự án",
  description: "9 dự án bất động sản chọn lọc của 1992 Land — căn hộ, biệt thự, nghỉ dưỡng tại TP.HCM, Vũng Tàu, Bình Dương, Long An, Đồng Nai.",
};

export default function DuAnPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-navy-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">
            Danh mục dự án
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-surface tracking-tight mb-4">
            Dự án 1992 Land
          </h1>
          <p className="text-surface/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Các dự án bất động sản được chọn lọc kỹ — pháp lý minh bạch, tiềm
            năng tăng giá cao, phù hợp nhu cầu ở thực và đầu tư.
          </p>
          <div className="mt-4 mx-auto w-12 h-0.5 bg-gold-500 rounded-full" />
        </div>
      </div>

      {/* Interactive filter + grid */}
      <ProjectsGrid projects={projects} />

      {/* CTA */}
      <div className="bg-navy-50 py-16 px-6 text-center">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
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
