import Image from "next/image";
import { CtaLink, H2 } from "./ui";

const KIT = "/images/projects/maia-ho-tram/kit";
const APTS = [
  { f: "mb-studio", alt: "Mặt bằng căn hộ Studio 35 m²" },
  { f: "mb-1pn", alt: "Mặt bằng căn hộ 1 phòng ngủ 49 m²" },
  { f: "mb-2pn-chuan", alt: "Mặt bằng căn hộ 2 phòng ngủ chuẩn 65 m²" },
  { f: "mb-2pn-luxury", alt: "Mặt bằng căn hộ 2 phòng ngủ luxury 80 m²" },
];
const VILLAS = [
  { f: "mb-villa-2pn", alt: "Mặt bằng villa 2 phòng ngủ khoảng 256 m², tầng 1 và tầng 2" },
  { f: "mb-villa-3pn", alt: "Mặt bằng villa 3 phòng ngủ khoảng 380 m², tầng 1 và tầng 2" },
];

function Plan({ f, alt, sizes }: { f: string; alt: string; sizes: string }) {
  return (
    <figure className="relative aspect-square bg-white">
      <Image src={`${KIT}/${f}.webp`} alt={alt} fill sizes={sizes} className="object-contain" />
    </figure>
  );
}

export default function MaiaDesign() {
  return (
    <section id="mat-bang" className="scroll-mt-32 bg-navy-950 py-16 text-white lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <H2>Mỗi nhu cầu, một layout vừa vặn</H2>
        <p className="mt-6 max-w-[65ch] text-lg leading-relaxed">
          Từ Studio 35 m² cho cặp đôi đến căn 2 phòng ngủ 80 m² cho gia đình, mọi layout đều được tối ưu để đón ánh sáng và gió biển, vừa thoải mái khi ở vừa dễ khai thác cho thuê.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {APTS.map((a) => <Plan key={a.f} {...a} sizes="(min-width:1024px) 270px, 50vw" />)}
        </div>
        <p className="mt-16 max-w-[65ch] text-lg leading-relaxed">
          Chỉ 36 villa 2–3 phòng ngủ, diện tích 256–380 m², thiết kế mở với hồ bơi và sân vườn riêng, dành cho những kỳ nghỉ trọn vẹn của cả gia đình.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:gap-6">
          {VILLAS.map((v) => <Plan key={v.f} {...v} sizes="(min-width:768px) 50vw, 100vw" />)}
        </div>
        <p className="mt-6 text-sm text-navy-100">Penthouse 200 m²: liên hệ để nhận mặt bằng chi tiết.</p>
        <div className="mt-10"><CtaLink>Nhận file layout chi tiết</CtaLink></div>
      </div>
    </section>
  );
}
