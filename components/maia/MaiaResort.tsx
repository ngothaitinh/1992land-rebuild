import Image from "next/image";
import { CtaLink, SectionTitle, StarList } from "./ui";

const KIT = "/images/projects/maia-ho-tram/kit";
const AMENITY_STRIPS = [
  { f: "tien-ich-1", alt: "Khách sạn đẳng cấp, sân golf The Bluffs và khu Kid's Quarter" },
  { f: "tien-ich-2", alt: "Parkland, The Grand Central Park và khu Game Zone" },
  { f: "tien-ich-3", alt: "Rạp chiếu phim, khu ẩm thực và The Lotus Spa" },
];
const STRIP = ["phoi-canh-1", "phoi-canh-2", "phoi-canh-3", "phoi-canh-4"];

export default function MaiaResort() {
  return (
    <>
      <section id="tien-ich" className="scroll-mt-32 bg-teal-950 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <SectionTitle top="Nghỉ dưỡng 5 sao" bottom="Cả một khu nghỉ ngay trước cửa" />
            <StarList
              className="mt-7 text-white/90"
              items={[
                <><b className="text-white">Sân golf The Bluffs</b>, nằm trong Top 65 sân golf tốt nhất thế giới, cho những buổi sáng phát bóng nhìn ra biển.</>,
                <><b className="text-white">Trung tâm hội nghị MICE</b> quy mô lớn, phù hợp tổ chức hội thảo, sự kiện doanh nghiệp và tiệc cưới.</>,
                <><b className="text-white">Ẩm thực và giải trí</b> với nhà hàng, nightclub, spa và rạp chiếu phim, đủ để cả gia đình không cần rời khu nghỉ.</>,
                <><b className="text-white">Khu mua sắm quốc tế</b> và không gian vui chơi cho trẻ em trong cùng tổ hợp.</>,
                <><b className="text-white">Tiện ích nội khu Maia:</b> hồ bơi vô cực, nhà hàng và bar bãi biển, spa, gym, yoga và kids club.</>,
              ]}
            />
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <Image src={`${KIT}/phoi-canh-2.webp`} alt="Hồ bơi vô cực giữa hai tòa tháp Maia Resort" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid md:grid-cols-3 gap-4">
          {AMENITY_STRIPS.map((s) => (
            <div key={s.f} className="relative aspect-[968/548] rounded-2xl overflow-hidden shadow-xl">
              <Image src={`${KIT}/${s.f}.webp`} alt={s.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-sm text-white/75">
          Tiện ích thuộc tổ hợp The Grand Ho Tram Strip, do các đơn vị trong tổ hợp vận hành.
        </p>
      </section>

      <section id="thiet-ke" className="scroll-mt-32 bg-gradient-to-br from-teal-800 to-teal-900 text-white pt-16 lg:pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionTitle top="Kiến trúc khoáng đạt" bottom="Biển ở ngay trong nhà" className="text-center lg:text-left" />
            <StarList
              className="mt-6 text-white/90"
              items={[
                <><b className="text-white">100% căn hộ nhìn thẳng ra biển.</b> Hai tòa tháp 32 tầng được bố trí để mỗi căn đều đón trọn ánh sáng và gió biển; khối đế tập trung tiện ích nghỉ dưỡng.</>,
                <><b className="text-white">36 villa có lối xe hơi vào tận cửa.</b> Không gian riêng tư cho gia đình nhiều thế hệ, đi lại thuận tiện như ở nhà.</>,
                <><b className="text-white">Nội thất hoàn thiện chuẩn 5 sao.</b> Gam màu biển nhẹ nhàng, vật liệu tự nhiên, sẵn sàng đón khách từ ngày bàn giao.</>,
              ]}
            />
            <div className="mt-8 text-center lg:text-left"><CtaLink>Đăng ký tham quan căn hộ mẫu</CtaLink></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[729/549] rounded-2xl overflow-hidden shadow-2xl">
              <Image src={`${KIT}/noi-that-1.webp`} alt="Phòng ngủ căn hộ hướng biển" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            </div>
            {["noi-that-2", "noi-that-3"].map((f, i) => (
              <div key={f} className="relative aspect-[729/549] rounded-2xl overflow-hidden shadow-xl">
                <Image src={`${KIT}/${f}.webp`} alt={i ? "Phòng tắm căn hộ" : "Bếp căn hộ"} fill sizes="(min-width:1024px) 22vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-1">
          {STRIP.map((f) => (
            <div key={f} className="relative aspect-[960/534]">
              <Image src={`${KIT}/${f}.webp`} alt="Phối cảnh không gian Maia Resort Hồ Tràm" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
