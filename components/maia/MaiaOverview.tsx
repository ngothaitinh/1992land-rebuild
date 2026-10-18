import Image from "next/image";
import type { Project } from "@/lib/data";
import { CtaLink, SectionTitle, maiaSerif } from "./ui";

function Fact({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className={`${maiaSerif.className} text-gold-300 text-xl lg:text-2xl font-semibold uppercase`}>{k}</dt>
      <dd className="mt-1 text-[15px] sm:text-base text-white leading-snug">{children}</dd>
    </div>
  );
}

const KIT = "/images/projects/maia-ho-tram/kit";

const REASONS = [
  { t: "Tiện ích có sẵn từ ngày đầu", d: "Sân golf, trung tâm hội nghị, nhà hàng và spa của The Grand Ho Tram Strip đã vận hành nhiều năm. Bạn mua một kỳ nghỉ hoàn chỉnh, không phải một lời hứa quy hoạch." },
  { t: "Kết nối ngày càng thuận tiện", d: "Cao tốc mới đưa TP.HCM về hơn 1 giờ đi xe, sân bay Long Thành cách khoảng 30 phút. Lượng khách đến Hồ Tràm có thêm động lực tăng." },
  { t: "Vận hành chuẩn 5 sao bởi Fusion", d: "Đội ngũ chuyên nghiệp lo đón khách, buồng phòng và bảo trì. Căn hộ luôn được chăm sóc kể cả khi bạn không ở." },
  { t: "Chia sẻ doanh thu cho thuê", d: "Theo chính sách chủ đầu tư, chủ sở hữu nhận 40% doanh thu cho thuê thực tế và 40 đêm nghỉ miễn phí mỗi năm cho gia đình." },
  { t: "Thanh toán giãn trong 4 năm", d: "Các đợt thanh toán chia nhỏ theo tiến độ xây dựng, giúp chủ động dòng tiền thay vì dồn vào một lần." },
  { t: "Bàn giao full nội thất", d: "Nội thất và thiết bị chuẩn 5 sao được hoàn thiện sẵn. Nhận nhà là có thể nghỉ dưỡng hoặc đưa vào khai thác ngay." },
];

export default function MaiaOverview({ p }: { p: Project }) {
  return (
    <>
      <section id="tong-quan" className="scroll-mt-32 relative bg-teal-950 text-white overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 z-10">
          <SectionTitle top="Thông tin tổng quan" className="text-center" />
          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            <Fact k="Tên dự án">{p.title}<span className="block text-gold-300 text-sm">a fusion resort</span></Fact>
            <Fact k="Chủ đầu tư">Công ty TNHH Dự Án Hồ Tràm, được Warburg Pincus & VinaCapital rót vốn</Fact>
            <Fact k="Quy mô">7 ha · 1.244 căn hộ (Studio, 1PN, 2PN, Penthouse) · 36 villa</Fact>
            <Fact k="Bàn giao">Full nội thất, thiết bị vận hành chuẩn 5 sao quốc tế</Fact>
            <Fact k="Căn hộ">100% có view biển trực diện</Fact>
            <Fact k="Villa">Xe hơi vào tận cửa nhà</Fact>
            <Fact k="Vận hành">Fusion, thương hiệu quản lý khách sạn quốc tế</Fact>
            <Fact k="Sở hữu">{p.ownership}</Fact>
          </dl>
        </div>
        <div className="relative mt-8 aspect-[1920/958] w-full">
          <Image src={`${KIT}/tong-quan.webp`} alt="Phối cảnh Happy Tower 610 căn hộ, Peace Tower 634 căn hộ và bộ sưu tập 36 villa" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-teal-950 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-teal-950 to-transparent" />
        </div>
        <div className="relative flex justify-center px-4 pb-14 -mt-4"><CtaLink>Đăng ký tham quan Maia Resort</CtaLink></div>
      </section>

      <section id="diem-noi-bat" className="scroll-mt-32 bg-gradient-to-br from-teal-800 to-teal-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Vì sao chọn Maia" bottom="Nghỉ dưỡng hôm nay, tích sản lâu dài" className="text-center" />
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {REASONS.map((r, i) => (
              <li key={r.t} className="flex gap-4">
                <span className={`${maiaSerif.className} italic text-6xl leading-[0.8] text-gold-300`} aria-hidden>{i + 1}</span>
                <div>
                  <p className="text-lg font-semibold text-white">{r.t}</p>
                  <p className="mt-1.5 text-base text-white/85 leading-relaxed">{r.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-white/75">Doanh thu cho thuê tùy tình hình vận hành thực tế, không phải cam kết lợi nhuận cố định.</p>
          <a href="#dang-ky" className="mt-10 block relative aspect-[1600/725] rounded-2xl overflow-hidden border-2 border-gold-300/70 shadow-2xl transition-transform duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300">
            <Image src={`${KIT}/banner-happy-tower.webp`} alt="Ra mắt Happy Tower và bộ sưu tập 36 villa, bấm để đăng ký nhận thông tin" fill sizes="(min-width:1024px) 1150px, 100vw" className="object-cover" />
          </a>
        </div>
      </section>
    </>
  );
}
