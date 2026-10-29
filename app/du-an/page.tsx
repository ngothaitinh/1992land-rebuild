import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadProjects } from "@/lib/loadData";

import ProjectsGrid from "@/components/ProjectsGrid";
import PageHero from "@/components/PageHero";
import { H2 } from "@/components/maia/ui";

const projects = loadProjects();

export const metadata: Metadata = {
  title: "Dự án",
  description: `${projects.length} dự án bất động sản chọn lọc của 1992 Land — căn hộ, biệt thự, nghỉ dưỡng tại TP.HCM, Vũng Tàu, Bình Dương, Long An, Đồng Nai.`,
};

export default function DuAnPage() {
  return (
    <div>
      <PageHero title="Dự án 1992 Land">
        <p>
          Các dự án bất động sản được chọn lọc kỹ — pháp lý minh bạch, tiềm
          năng tăng giá cao, phù hợp nhu cầu ở thực và đầu tư.
        </p>
      </PageHero>

      {/* Interactive filter + grid */}
      <ProjectsGrid projects={projects} />

      {/* CTA */}
      <section className="bg-navy-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <H2>Không tìm thấy dự án phù hợp?</H2>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-navy-50">
            Mô tả nhu cầu của bạn — chúng tôi sẽ tư vấn dự án phù hợp nhất.
          </p>
          <Link
            href="/lien-he"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-gold-300 px-7 py-3 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            Nhận tư vấn cá nhân
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
