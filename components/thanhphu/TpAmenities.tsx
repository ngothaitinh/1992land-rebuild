import Image from "next/image";
import { CtaLink, IMG, SectionTitle, StarList } from "./ui";

const ICONIC = [
  { f: "cau-rong", t: "Cầu Rồng", d: "Cây cầu biểu tượng nối công viên trung tâm với trục thương mại.", alt: "Cầu Rồng uốn lượn nhìn từ trên cao" },
  { f: "ho-boi-noi", t: "Hồ bơi nổi 3.300 m²", d: "Bể bơi resort trên mặt hồ, kèm Club House 3.400 m².", alt: "Hồ bơi nổi và Club House giữa hồ trung tâm" },
  { f: "nhac-nuoc-hoang-hon", t: "Show nhạc nước", d: "Biểu diễn nhạc nước hằng đêm trên hồ trung tâm.", alt: "Nhạc nước trên hồ lúc hoàng hôn" },
];
const GALLERY = [
  { f: "ho-trung-tam", alt: "Hồ trung tâm và hồ bơi nổi nhìn từ trên cao" },
  { f: "quang-truong-su-kien", alt: "Quảng trường sự kiện với đài phun nước" },
  { f: "khu-the-thao", alt: "Khu thể thao ngoài trời cạnh hồ" },
  { f: "pho-di-bo", alt: "Phố đi bộ thương mại" },
  { f: "pho-nha-phu", alt: "Phố nhà phố và shophouse lúc hoàng hôn" },
  { f: "cong-vien-nha-pho", alt: "Công viên xanh trước dãy nhà phố" },
  { f: "ban-cong-pho", alt: "Ban công nhìn xuống phố thương mại" },
  { f: "toan-canh-dem", alt: "Toàn cảnh khu đô thị về đêm" },
];

export default function TpAmenities() {
  return (
    <>
      <section id="tien-ich" className="scroll-mt-32 bg-emerald-950 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <SectionTitle top="Hệ tiện ích" bottom="Quanh hồ, quanh phố, trong tầm đi bộ" />
            <StarList
              className="mt-7 text-white/90"
              items={[
                <><b className="text-white">Trung tâm thương mại 9,5 ha</b> gồm Mega Mall và Strip Mall, cùng phố ẩm thực và chợ phiên cuối tuần.</>,
                <><b className="text-white">Công viên trung tâm 8 ha,</b> hồ cảnh quan 3 ha và quảng trường sự kiện cho các hoạt động cộng đồng.</>,
                <><b className="text-white">Thể thao ngoài trời:</b> 9 sân đa năng (gồm 2 sân Pickleball), bóng đá mini và đường chạy bộ 1,6 km.</>,
                <><b className="text-white">Trung tâm tổ chức sự kiện 2,3 ha</b> và BIM Gallery trong khu trung tâm.</>,
                <><b className="text-white">Y tế, giáo dục:</b> phòng khám đa khoa quốc tế và trường học liên cấp trong quy hoạch; Bệnh viện Đại học Tâm Anh liền kề.</>,
              ]}
            />
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <Image src={`${IMG}/cau-rong-cong-vien.webp`} alt="Cầu Rồng hướng lối vào công viên trung tâm" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid md:grid-cols-3 gap-4">
          {ICONIC.map((s) => (
            <figure key={s.f} className="rounded-2xl overflow-hidden bg-emerald-900 shadow-xl">
              <div className="relative aspect-[4/3]">
                <Image src={`${IMG}/${s.f}.webp`} alt={s.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="p-5">
                <p className="text-lg font-semibold text-gold-300">{s.t}</p>
                <p className="mt-1 text-base text-white/85 leading-relaxed">{s.d}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-sm text-white/75">
          Tiện ích theo quy hoạch của chủ đầu tư, sẽ hình thành theo từng giai đoạn. Một số hạng mục như Làng Trù Phú chưa công bố số liệu cụ thể.
        </p>
      </section>

      <section id="thu-vien-anh" className="scroll-mt-32 bg-gradient-to-br from-emerald-800 to-emerald-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Thư viện ảnh" bottom="Phối cảnh đô thị Thanh Phú" className="text-center" />
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {GALLERY.map((g) => (
              <div key={g.f} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={`${IMG}/${g.f}.webp`} alt={g.alt} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-white/75">Phối cảnh minh họa của chủ đầu tư. Thực tế có thể khác theo thiết kế được duyệt.</p>
          <div className="flex justify-center mt-8"><CtaLink>Đăng ký tham quan sa bàn</CtaLink></div>
        </div>
      </section>
    </>
  );
}
