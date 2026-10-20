import Image from "next/image";
import { Building2, Bus, Hospital, MapPin, Plane, Store, Waves } from "lucide-react";
import { CtaLink, IMG, SectionTitle, StarList } from "./ui";

/** Thời gian di chuyển theo công bố của chủ đầu tư (thanhphucentrepoint.com). */
const TIMES = [
  { name: "Bệnh viện Đại học Tâm Anh", t: "Liền kề", Icon: Hospital },
  { name: "UBND xã Bến Lức", t: "10 phút", Icon: Building2 },
  { name: "Campus y tế Tây TP.HCM", t: "15 phút", Icon: Hospital },
  { name: "Bến xe Miền Tây", t: "20 phút", Icon: Bus },
  { name: "Quận 7", t: "30 phút", Icon: MapPin },
  { name: "Quận 5, Quận 6", t: "30 phút", Icon: Store },
  { name: "Quận 1 (chợ Bến Thành)", t: "45 phút", Icon: MapPin },
  { name: "Sân bay quốc tế Long Thành", t: "45 phút", Icon: Plane },
  { name: "Vũng Tàu", t: "80 phút", Icon: Waves },
];

export default function TpLocation() {
  return (
    <section id="vi-tri" className="scroll-mt-32 bg-emerald-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
        <SectionTitle top="Vị trí" bottom="Cửa ngõ phía Tây, kết nối ba vùng" className="text-center" />
        <p className="mt-6 text-center text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
          Dự án nằm mặt đường Nguyễn Hữu Trí. Thời gian di chuyển dưới đây theo công bố của chủ đầu tư, thực tế phụ thuộc giờ cao điểm và tình trạng giao thông.
        </p>
        <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TIMES.map(({ name, t, Icon }) => (
            <li key={name} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-emerald-950 shadow-sm">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-emerald-800 text-white shrink-0"><Icon size={18} aria-hidden /></span>
              <span className="min-w-0">
                <span className="block text-sm leading-snug">{name}</span>
                <span className="block font-numeric font-bold text-emerald-800">{t}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[1500/992] rounded-2xl overflow-hidden border border-gold-300/60 shadow-2xl">
          <Image src={`${IMG}/tong-the.webp`} alt="Phối cảnh tổng thể giai đoạn 1 nhìn từ trên cao, trục đường Nguyễn Hữu Trí phía sau" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionTitle top="Hạ tầng đang mở" bottom="Kết nối vùng ngày càng rõ nét" />
          <StarList
            className="mt-6 text-white/90"
            items={[
              <><b className="text-white">5 phút đến nút giao Mỹ Yên</b> của cao tốc TP.HCM – Trung Lương và cao tốc Bến Lức – Long Thành.</>,
              <><b className="text-white">Khoảng 35 phút đến trung tâm Quận 1</b> qua đại lộ Võ Văn Kiệt, theo thông tin từ đơn vị phân phối.</>,
              <><b className="text-white">Nhiều tuyến lớn đang triển khai:</b> đường Nguyễn Hữu Trí mở rộng, Vành đai 3, cao tốc Bến Lức – Long Thành, Võ Văn Kiệt nối dài và Vành đai 4.</>,
            ]}
          />
          <p className="mt-6 border-l-2 border-gold-300 pl-4 text-base text-white/85 italic leading-relaxed">
            Mốc hoàn thành từng tuyến đường thay đổi theo tiến độ của cơ quan nhà nước. Liên hệ để cập nhật thông tin mới nhất trước khi quyết định.
          </p>
        </div>
      </div>
      <div className="flex justify-center px-4 pb-16"><CtaLink>Đăng ký xem vị trí thực tế</CtaLink></div>
    </section>
  );
}
