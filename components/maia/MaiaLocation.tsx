import Image from "next/image";
import { MapPin, Plane, Flag, Car, Building2 } from "lucide-react";
import type { Project } from "@/lib/data";
import { CtaLink, SectionTitle, StarList } from "./ui";

const ICONS: Record<string, typeof MapPin> = { resort: Building2, golf: Flag, airport: Plane, road: Car };
const KIT = "/images/projects/maia-ho-tram/kit";

export default function MaiaLocation({ p }: { p: Project }) {
  return (
    <section id="vi-tri" className="scroll-mt-32 bg-teal-900 text-white">
      {/* Bản đồ vị trí của chủ đầu tư, tràn viền */}
      <div className="bg-[#f6f0e1]">
        <div className="relative aspect-[1920/1282] w-full">
          <Image src={`${KIT}/ban-do-vi-tri.webp`} alt="Bản đồ kết nối Hồ Tràm với TP.HCM, sân bay Long Thành và các tuyến cao tốc" fill sizes="100vw" className="object-cover" />
        </div>
        {/* Bản đồ có chữ nhỏ, nên tóm tắt lại khoảng cách bằng text để đọc được trên điện thoại */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-teal-950">
          <p className="text-center text-lg font-semibold">Từ Maia Resort Hồ Tràm đến</p>
          <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {p.nearby?.map((n) => {
              const Icon = ICONS[n.category ?? ""] ?? MapPin;
              return (
                <li key={n.name} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-teal-800 text-white shrink-0"><Icon size={18} aria-hidden /></span>
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug">{n.name}</span>
                    <span className="block font-numeric font-bold text-teal-800">{n.distance}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Hạ tầng: ảnh trái, chữ phải */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[960/576] rounded-2xl overflow-hidden border border-gold-300/60 shadow-2xl">
          <Image src={`${KIT}/phong-cach-song.webp`} alt="Gia đình thưởng trà chiều trong không gian nghỉ dưỡng" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionTitle top="Hạ tầng mở lối" bottom="Hồ Tràm gần hơn mỗi ngày" />
          <StarList
            className="mt-6 text-white/90"
            items={[
              <><b className="text-white">Sân bay quốc tế Long Thành cách khoảng 30 phút.</b> Khi đi vào khai thác, du khách quốc tế có thể đến Hồ Tràm trong cùng một buổi, mở rộng tệp khách cho căn hộ cho thuê.</>,
              <><b className="text-white">Cao tốc mới rút ngắn hành trình từ TP.HCM còn hơn 1 giờ.</b> Kỳ nghỉ cuối tuần trở nên dễ dàng: chiều thứ Sáu khởi hành, tối đã ngắm biển.</>,
            ]}
          />
          <p className="mt-6 border-l-2 border-gold-300 pl-4 text-base text-white/85 italic leading-relaxed">
            Hạ tầng giao thông đi cùng một hệ sinh thái nghỉ dưỡng đã vận hành là nền tảng để giá trị Hồ Tràm tăng trưởng bền vững.
          </p>
        </div>
      </div>
      <div className="flex justify-center px-4 pb-12"><CtaLink>Đăng ký tham quan thực tế The Grand Hồ Tràm</CtaLink></div>

      <div className="relative aspect-[1663/946] w-full">
        <Image src={`${KIT}/the-grand-ho-tram.webp`} alt="Toàn cảnh The Grand Ho Tram Strip với các khách sạn, sân golf The Bluffs và bãi biển" fill sizes="100vw" className="object-cover" />
      </div>
    </section>
  );
}
