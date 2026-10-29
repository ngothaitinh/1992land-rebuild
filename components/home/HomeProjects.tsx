import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/data";
import { H2, maiaHead, NARROW } from "@/components/maia/ui";

/** Danh mục dự án dạng bảng kẻ dòng: một dự án nổi bật, phần còn lại một dòng mỗi dự án. */
export default function HomeProjects({ featured, rest, total }: { featured: Project; rest: Project[]; total: number }) {
  return (
    <section className="bg-bg px-4 py-16 text-navy-900 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <H2 className="!text-navy-900">Mới nhất & đang mở bán</H2>
          <Link href="/du-an" className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-navy-800 hover:text-navy-950">
            Xem tất cả {total} dự án <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <Link href={`/du-an/${featured.slug}`} className="group mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative aspect-video overflow-hidden bg-navy-100 lg:aspect-auto lg:min-h-[380px]">
            {featured.hero_image && <Image src={featured.hero_image} alt={featured.title} fill priority sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />}
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-gold-900">{featured.status} · {featured.type}</p>
              <h3 style={NARROW} className={`${maiaHead.className} mt-2 text-4xl font-extrabold uppercase leading-none tracking-tight group-hover:text-gold-900 lg:text-5xl`}>{featured.title}</h3>
              <p className="mt-3 text-base text-navy-600">{featured.address_full ?? featured.location}</p>
              <p className="mt-4 line-clamp-4 max-w-[60ch] text-base leading-relaxed">{featured.excerpt}</p>
            </div>
            <p className="mt-6 flex items-baseline justify-between border-t border-navy-900/20 pt-4">
              <span className="text-sm text-navy-600">Giá từ</span>
              <span className="font-numeric text-2xl font-bold tabular-nums text-gold-900">{featured.priceRange}</span>
            </p>
          </div>
        </Link>

        <ul className="mt-12">
          {rest.map((p) => (
            <li key={p.slug} className="border-t border-navy-900/20 last:border-b">
              <Link href={`/du-an/${p.slug}`} className="group grid grid-cols-[72px_1fr] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[96px_1fr_12rem_9rem] md:gap-x-8">
                <span className="relative row-span-3 aspect-[4/3] overflow-hidden bg-navy-100 md:row-span-1">
                  {p.hero_image && <Image src={p.hero_image} alt="" fill sizes="96px" className="object-cover" />}
                </span>
                <span className="text-lg font-semibold group-hover:text-gold-900">{p.title}</span>
                <span className="text-sm text-navy-600">{p.location}<span className="md:hidden"> · {p.status}</span></span>
                <span className="font-numeric font-bold tabular-nums text-gold-900 md:text-right">{p.priceRange}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
