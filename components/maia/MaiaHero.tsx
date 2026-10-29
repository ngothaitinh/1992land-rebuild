import Image from "next/image";
import type { Project } from "@/lib/data";
import { positioningLine } from "@/lib/site-config";
import { CtaLink, Row, maiaHead, NARROW } from "./ui";

export default function MaiaHero({ p }: { p: Project }) {
  return (
    <section className="bg-navy-950 text-white">
      <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[1920/873] w-full">
        <Image src={p.hero_image ?? ""} alt="Phối cảnh Maia Resort Hồ Tràm nhìn từ trên cao" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 sm:px-6 sm:pb-10 lg:px-8">
          <h1 style={NARROW} className={`${maiaHead.className} text-[3.5rem] sm:text-8xl lg:text-[7.5rem] font-extrabold uppercase leading-[0.92] tracking-tight`}>
            Maia Resort <span className="block text-gold-300">Hồ Tràm</span>
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-white">Căn hộ & villa hướng biển, a fusion resort</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-[65ch] text-lg leading-relaxed text-white">
            {p.title} gồm 1.244 căn hộ và 36 villa trên khu đất 7 ha ở Phước Thuận, Xuyên Mộc. Mỗi căn đều hướng ra biển, được bàn giao hoàn thiện và vận hành bởi Fusion, để kỳ nghỉ của gia đình bạn bắt đầu ngay từ ngày nhận nhà.
          </p>
          <CtaLink>Đăng ký đi site-tour & trải nghiệm resort</CtaLink>
        </div>

        <dl className="mt-10">
          <Row k="Vị trí">{p.location}</Row>
          <Row k="Quy mô">7 ha · 1.244 căn hộ (Studio, 1PN, 2PN, Penthouse) · 36 villa</Row>
          <Row k="Tòa tháp">32 tầng mỗi tòa, 100% căn hộ có view biển trực diện. Villa có lối xe hơi vào tận cửa.</Row>
          <Row k="Chủ đầu tư">Công ty TNHH Dự Án Hồ Tràm, được Warburg Pincus & VinaCapital rót vốn</Row>
          <Row k="Vận hành">Fusion, thương hiệu quản lý khách sạn quốc tế</Row>
          <Row k="Bàn giao">Full nội thất, thiết bị vận hành chuẩn 5 sao quốc tế</Row>
          <Row k="Sở hữu">{p.ownership}</Row>
        </dl>
        <p className="mt-6 text-sm text-navy-100">{positioningLine}</p>
        <div className="mx-auto mt-12 max-w-4xl">
          <Image src="/images/projects/maia-ho-tram/kit/doi-tac.webp" alt="Đối tác trong hệ sinh thái The Grand Ho Tram: Holiday Inn Resort, Warburg Pincus, The Grand, InterContinental, The Bluffs, Ixora, Maia" width={1256} height={120} className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
