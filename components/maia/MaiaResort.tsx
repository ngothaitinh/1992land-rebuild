import Image from "next/image";
import { CtaLink, H2, Ruled } from "./ui";

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
      <section id="tien-ich" className="scroll-mt-32 bg-navy-900 py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <H2>Cả một khu nghỉ ngay trước cửa</H2>
            <Ruled
              className="mt-7"
              items={[
                <><b className="text-gold-100">Sân golf The Bluffs</b>, nằm trong Top 65 sân golf tốt nhất thế giới, cho những buổi sáng phát bóng nhìn ra biển.</>,
                <><b className="text-gold-100">Trung tâm hội nghị MICE</b> quy mô lớn, phù hợp tổ chức hội thảo, sự kiện doanh nghiệp và tiệc cưới.</>,
                <><b className="text-gold-100">Ẩm thực và giải trí</b> với nhà hàng, nightclub, spa và rạp chiếu phim, đủ để cả gia đình không cần rời khu nghỉ.</>,
                <><b className="text-gold-100">Khu mua sắm quốc tế</b> và không gian vui chơi cho trẻ em trong cùng tổ hợp.</>,
                <><b className="text-gold-100">Tiện ích nội khu Maia:</b> hồ bơi vô cực, nhà hàng và bar bãi biển, spa, gym, yoga và kids club.</>,
              ]}
            />
          </div>
          <div className="relative aspect-square overflow-hidden">
            <Image src={`${KIT}/phoi-canh-2.webp`} alt="Hồ bơi vô cực giữa hai tòa tháp Maia Resort" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {AMENITY_STRIPS.map((s) => (
            <div key={s.f} className="relative aspect-[968/548] overflow-hidden">
              <Image src={`${KIT}/${s.f}.webp`} alt={s.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-6xl px-4 text-sm text-navy-100 sm:px-6 lg:px-8">
          Tiện ích thuộc tổ hợp The Grand Ho Tram Strip, do các đơn vị trong tổ hợp vận hành.
        </p>
      </section>

      <section id="thiet-ke" className="scroll-mt-32 bg-navy-800 pt-16 text-white lg:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <H2>Biển ở ngay trong nhà</H2>
            <Ruled
              className="mt-6"
              items={[
                <><b className="text-gold-100">100% căn hộ nhìn thẳng ra biển.</b> Hai tòa tháp 32 tầng được bố trí để mỗi căn đều đón trọn ánh sáng và gió biển; khối đế tập trung tiện ích nghỉ dưỡng.</>,
                <><b className="text-gold-100">36 villa có lối xe hơi vào tận cửa.</b> Không gian riêng tư cho gia đình nhiều thế hệ, đi lại thuận tiện như ở nhà.</>,
                <><b className="text-gold-100">Nội thất hoàn thiện chuẩn 5 sao.</b> Gam màu biển nhẹ nhàng, vật liệu tự nhiên, sẵn sàng đón khách từ ngày bàn giao.</>,
              ]}
            />
            <div className="mt-8"><CtaLink>Đăng ký tham quan căn hộ mẫu</CtaLink></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[729/549] overflow-hidden">
              <Image src={`${KIT}/noi-that-1.webp`} alt="Phòng ngủ căn hộ hướng biển" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            </div>
            {["noi-that-2", "noi-that-3"].map((f, i) => (
              <div key={f} className="relative aspect-[729/549] overflow-hidden">
                <Image src={`${KIT}/${f}.webp`} alt={i ? "Phòng tắm căn hộ" : "Bếp căn hộ"} fill sizes="(min-width:1024px) 22vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-1 lg:grid-cols-4">
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
