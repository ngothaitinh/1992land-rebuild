import Image from "next/image";
import { IMG, SectionTitle } from "./ui";

const TEAM = [
  { n: "Codinachs Architects", r: "Quy hoạch và kiến trúc", d: "Văn phòng kiến trúc thành lập năm 1979 tại Barcelona, hoạt động tại hơn 10 quốc gia. Các dự án tiêu biểu gồm The Sea (Halong Marina) và Shiliupu Waterfront (Thượng Hải)." },
  { n: "Broadway Malyan", r: "Cảnh quan", d: "Đơn vị thiết kế đến từ Anh, tham gia tư vấn cảnh quan cho dự án." },
  { n: "BIM Estates Management", r: "Quản lý vận hành", d: "Công ty quản lý bất động sản thuộc hệ sinh thái BIM Group." },
];

export default function TpDeveloper() {
  return (
    <section className="bg-emerald-950 text-white py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle top="Đội ngũ kiến tạo" bottom="Chủ đầu tư và đối tác thiết kế" className="text-center" />
        <div className="mt-10 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div className="relative aspect-[1920/1072] rounded-2xl overflow-hidden border border-gold-300/60 shadow-2xl">
            <Image src={`${IMG}/mien-thuong-phu.webp`} alt="Phối cảnh phân khu Miền Thương Phú nhìn về hồ trung tâm lúc hoàng hôn" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <ul className="space-y-6">
            {TEAM.map((t) => (
              <li key={t.n}>
                <p className="text-xl font-bold text-gold-300">{t.n} <span className="text-base font-medium text-white/75">· {t.r}</span></p>
                <p className="mt-1 text-base text-white/85 leading-relaxed">{t.d}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 max-w-4xl mx-auto text-center text-base text-white/85 leading-relaxed">
          <b className="text-white">BIM Group</b> thành lập năm 1994, hoạt động trong bất động sản, du lịch nghỉ dưỡng, năng lượng tái tạo và nông nghiệp. <b className="text-white">BIM Land</b> là đơn vị phát triển bất động sản của tập đoàn, với các dự án tại Hạ Long, Phú Quốc, Hà Nội và Lào.
        </p>
      </div>
    </section>
  );
}
