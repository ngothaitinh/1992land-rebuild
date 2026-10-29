import Image from "next/image";
import { H2, Ruled } from "./ui";

const KIT = "/images/projects/maia-ho-tram/kit";

const REASONS = [
  { t: "Tiện ích có sẵn từ ngày đầu", d: "Sân golf The Bluffs (Top 65 thế giới), trung tâm hội nghị MICE, nhà hàng và spa của The Grand Ho Tram Strip đã vận hành nhiều năm. Bạn mua một kỳ nghỉ hoàn chỉnh, không phải một lời hứa quy hoạch." },
  { t: "Kết nối ngày càng thuận tiện", d: "Cao tốc mới đưa TP.HCM về hơn 1 giờ đi xe, sân bay Long Thành cách khoảng 30 phút. Lượng khách đến Hồ Tràm có thêm động lực tăng." },
  { t: "Vận hành chuẩn 5 sao bởi Fusion", d: "Đội ngũ chuyên nghiệp lo đón khách, buồng phòng và bảo trì. Căn hộ luôn được chăm sóc kể cả khi bạn không ở." },
  { t: "Chia sẻ doanh thu cho thuê", d: "Theo chính sách chủ đầu tư, chủ sở hữu nhận 40% doanh thu cho thuê thực tế và 40 đêm nghỉ miễn phí mỗi năm cho gia đình." },
  { t: "Thanh toán giãn trong 4 năm", d: "Các đợt thanh toán chia nhỏ theo tiến độ xây dựng, giúp chủ động dòng tiền thay vì dồn vào một lần." },
  { t: "Bàn giao full nội thất", d: "Nội thất và thiết bị chuẩn 5 sao được hoàn thiện sẵn. Nhận nhà là có thể nghỉ dưỡng hoặc đưa vào khai thác ngay." },
];

export default function MaiaOverview() {
  return (
    <section id="tong-quan" className="scroll-mt-32 bg-navy-900 text-white">
      <div className="relative aspect-[1920/958] w-full">
        <Image src={`${KIT}/tong-quan.webp`} alt="Phối cảnh Happy Tower 610 căn hộ, Peace Tower 634 căn hộ và bộ sưu tập 36 villa" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <H2>Nghỉ dưỡng hôm nay, tích sản lâu dài</H2>
        <Ruled
          className="mt-10 grid lg:grid-cols-2 lg:gap-x-12 [&>li]:max-w-none"
          items={REASONS.map((r) => (
            <>
              <p className="text-lg font-semibold text-gold-100">{r.t}</p>
              <p className="mt-1.5 text-navy-50">{r.d}</p>
            </>
          ))}
        />
        <p className="mt-6 text-sm text-navy-100">Doanh thu cho thuê tùy tình hình vận hành thực tế, không phải cam kết lợi nhuận cố định.</p>
        <a href="#dang-ky" className="relative mt-10 block aspect-[1600/725] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300">
          <Image src={`${KIT}/banner-happy-tower.webp`} alt="Ra mắt Happy Tower và bộ sưu tập 36 villa, bấm để đăng ký nhận thông tin" fill sizes="(min-width:1024px) 1150px, 100vw" className="object-cover" />
        </a>
      </div>
    </section>
  );
}
