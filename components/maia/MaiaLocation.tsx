import Image from "next/image";
import type { Project } from "@/lib/data";
import { CtaLink, H2, Ruled } from "./ui";

const KIT = "/images/projects/maia-ho-tram/kit";

export default function MaiaLocation({ p }: { p: Project }) {
  return (
    <section id="vi-tri" className="scroll-mt-32 bg-navy-950 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <H2>Từ Hồ Tràm đến</H2>
        {/* Bảng khoảng cách đọc được trên điện thoại, vì chữ trên bản đồ CĐT rất nhỏ */}
        <dl className="mt-8 bg-bg text-navy-900">
          {p.nearby?.map((n) => (
            <div key={n.name} className="flex items-baseline justify-between gap-4 border-t border-navy-900/15 px-5 py-3.5 first:border-t-0 sm:px-7">
              <dt className="text-base">{n.name}</dt>
              <dd className="whitespace-nowrap font-numeric text-lg font-bold tabular-nums text-gold-900">{n.distance}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative mt-10 aspect-[1920/1282] w-full bg-bg">
        <Image src={`${KIT}/ban-do-vi-tri.webp`} alt="Bản đồ kết nối Hồ Tràm với TP.HCM, sân bay Long Thành và các tuyến cao tốc" fill sizes="100vw" className="object-cover" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="relative aspect-[960/576] overflow-hidden">
          <Image src={`${KIT}/phong-cach-song.webp`} alt="Gia đình thưởng trà chiều trong không gian nghỉ dưỡng" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <H2>Hồ Tràm gần hơn mỗi ngày</H2>
          <Ruled
            className="mt-6"
            items={[
              <><b className="text-gold-100">Sân bay quốc tế Long Thành cách khoảng 30 phút.</b> Khi đi vào khai thác, du khách quốc tế có thể đến Hồ Tràm trong cùng một buổi, mở rộng tệp khách cho căn hộ cho thuê.</>,
              <><b className="text-gold-100">Cao tốc mới rút ngắn hành trình từ TP.HCM còn hơn 1 giờ.</b> Kỳ nghỉ cuối tuần trở nên dễ dàng: chiều thứ Sáu khởi hành, tối đã ngắm biển.</>,
              <>Hạ tầng giao thông đi cùng một hệ sinh thái nghỉ dưỡng đã vận hành là nền tảng để giá trị Hồ Tràm tăng trưởng bền vững.</>,
            ]}
          />
          <div className="mt-8"><CtaLink>Đăng ký tham quan thực tế The Grand Hồ Tràm</CtaLink></div>
        </div>
      </div>
      <div className="relative aspect-[1663/946] w-full">
        <Image src={`${KIT}/the-grand-ho-tram.webp`} alt="Toàn cảnh The Grand Ho Tram Strip với các khách sạn, sân golf The Bluffs và bãi biển" fill sizes="100vw" className="object-cover" />
      </div>
    </section>
  );
}
