import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import type { Project } from "@/lib/data";
import { contact } from "@/lib/site-config";
import { maiaHead, NARROW } from "@/components/maia/ui";

/** Hero trang chủ: người đứng tên + một dự án thật đang mở. Server component, nội dung hiện sẵn không chờ animation. */
export default function HomeHero({ project }: { project: Project }) {
  return (
    <section className="bg-navy-950 pt-24 text-white lg:pt-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:items-end lg:gap-16 lg:px-8">
        <div>
          <h1 style={NARROW} className={`${maiaHead.className} text-balance text-[3.25rem] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-8xl xl:text-[8rem]`}>
            Giá trị kiến tạo <span className="text-gold-300">lòng tin</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-navy-50">
            Anh Thọ và đội ngũ 1992 Land đã giúp hơn 500 gia đình tìm được đúng dự án. Không ép mua, không hối thúc.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href="/lien-he" className="inline-flex min-h-12 items-center bg-gold-300 px-7 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950">
              Nhận tư vấn
            </Link>
            <a href={`tel:${contact.phone}`} className="inline-flex min-h-12 items-center gap-2 text-lg font-semibold text-gold-300 hover:text-gold-100">
              <Phone size={18} aria-hidden /> {contact.phoneDisplay}
            </a>
          </div>
        </div>

        <figure className="relative mx-auto aspect-[4/5] w-full max-w-[380px] overflow-hidden lg:mx-0">
          <Image src="/images/team/nguyen-huu-tho-portrait.png" alt="Nguyễn Hữu Thọ, Giám đốc dự án tại Công ty Cổ phần TPI Land" fill priority sizes="380px" className="object-cover object-top" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 to-transparent px-5 pb-4 pt-12">
            <span className="block text-lg font-bold">Nguyễn Hữu Thọ</span>
            <span className="block text-sm text-gold-300">Giám đốc dự án · TPI Land</span>
          </figcaption>
        </figure>
      </div>

      {/* Dự án mới nhất: dòng bảng thật từ dữ liệu */}
      <Link href={`/du-an/${project.slug}`} className="group block border-t border-gold-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-300">
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-5 sm:px-6 md:grid-cols-[11rem_1fr_auto_auto] md:items-baseline md:gap-8 lg:px-8">
          <span style={NARROW} className={`${maiaHead.className} text-lg font-bold uppercase tracking-wide text-gold-300`}>Mới nhất</span>
          <span className="text-lg font-semibold">{project.title} <span className="font-normal text-navy-100">· {project.location}</span></span>
          <span className="font-numeric text-lg font-bold tabular-nums text-gold-300">{project.priceRange}</span>
          <span className="inline-flex items-center gap-2 text-base font-semibold group-hover:text-gold-300">Xem dự án <ArrowRight size={16} aria-hidden /></span>
        </div>
      </Link>
    </section>
  );
}
