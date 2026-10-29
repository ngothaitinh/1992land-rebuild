import Image from "next/image";
import type { Project } from "@/lib/data";
import { CtaLink, H2, Ruled, maiaHead, NARROW } from "./ui";

const KIT = "/images/projects/maia-ho-tram/kit";
const BENEFITS = [
  { t: "Không phải sắm sửa thêm", d: "Căn hộ bàn giao full nội thất và thiết bị chuẩn 5 sao. Ngày nhận nhà cũng là ngày bạn có thể đưa gia đình đến nghỉ hoặc đưa căn hộ vào khai thác." },
  { t: "Không phải tự quản lý", d: "Fusion lo trọn việc đón khách, buồng phòng, bảo trì và chăm sóc tài sản. Bạn ở xa vẫn yên tâm căn hộ luôn trong tình trạng tốt nhất." },
  { t: "Không phải dồn tiền một lần", d: "Thanh toán chia nhỏ trong 4 năm theo tiến độ. Theo chính sách chủ đầu tư, chủ sở hữu nhận 40% doanh thu cho thuê thực tế và 40 đêm nghỉ miễn phí mỗi năm." },
];
/** Tỷ lệ các đợt theo bảng thanh toán chuẩn của chủ đầu tư (ảnh tien-do-thanh-toan.webp). */
const TIDE = [
  { y: "2026", pct: 20 },
  { y: "2027", pct: 30 },
  { y: "2028", pct: 20 },
  { y: "2029", pct: 25 },
  { y: "Khi nhận sổ", pct: 5 },
];

export default function MaiaPricing({ p }: { p: Project }) {
  return (
    <>
      <section id="chinh-sach" className="scroll-mt-32 bg-navy-900 py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <H2>Ba điều bạn không phải lo</H2>
            <Ruled
              className="mt-8"
              items={BENEFITS.map((b) => (
                <>
                  <p className="text-xl font-semibold text-gold-100">{b.t}</p>
                  <p className="mt-1.5 text-navy-50">{b.d}</p>
                </>
              ))}
            />
            <p className="mt-4 text-sm text-navy-100">Doanh thu cho thuê tùy tình hình vận hành thực tế, không phải cam kết lợi nhuận cố định.</p>
          </div>
          <div className="relative aspect-square overflow-hidden">
            <Image src={`${KIT}/nghi-duong.webp`} alt="Cặp đôi dạo bước bên hồ nước lúc hoàng hôn" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-navy-800 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <H2>Chia nhỏ, nhẹ nhàng trong 4 năm</H2>
          <p className="mt-6 max-w-[65ch] text-lg leading-relaxed">
            Các đợt thanh toán trải đều từ 2026 đến 2029, bàn giao và bắt đầu khai thác từ quý 4/2027, giúp bạn chủ động kế hoạch tài chính.
          </p>
          {/* Mực nước: chiều dài thanh tỷ lệ với phần trăm từng đợt */}
          <ol className="mt-10 bg-bg p-5 text-navy-900 sm:p-8">
            {TIDE.map((t) => (
              <li key={t.y} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3 border-t border-navy-900/15 py-3 first:border-t-0 sm:grid-cols-[9rem_1fr_4rem] sm:gap-5">
                <span style={NARROW} className={`${maiaHead.className} text-lg font-bold uppercase`}>{t.y}</span>
                <span className="h-4 bg-navy-900/10" aria-hidden><span className="block h-full bg-navy-800" style={{ width: `${t.pct * 3}%` }} /></span>
                <span className="text-right font-numeric text-xl font-bold tabular-nums">{t.pct}%</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-navy-100">Theo chính sách bán hàng của chủ đầu tư tại thời điểm công bố; có thể thay đổi theo từng đợt.</p>
          <details className="mt-6">
            <summary className="cursor-pointer text-base font-semibold text-gold-300 min-h-12 flex items-center">Xem bảng gốc của chủ đầu tư</summary>
            <div className="relative mt-3 aspect-[1920/707] overflow-hidden">
              <Image src={`${KIT}/tien-do-thanh-toan.webp`} alt="Phương thức thanh toán chuẩn căn hộ và villa: 20% năm 2026, 30% năm 2027, 20% năm 2028, 25% năm 2029 và 5% khi nhận sổ; bàn giao và khai thác bán phòng quý 4/2027" fill sizes="(min-width:1024px) 1150px, 100vw" className="object-cover" />
            </div>
          </details>
          <div className="mt-8"><CtaLink>Gửi file chính sách chi tiết</CtaLink></div>
        </div>
      </section>

      <section id="gia-ban" className="scroll-mt-32 bg-navy-950 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <H2>Giá bán & chính sách bán hàng</H2>
          <ul className="mt-10 bg-bg px-5 text-navy-900 sm:px-8">
            {p.product_types?.map((t) => (
              <li key={t.name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-navy-900/15 py-4 first:border-t-0">
                <span className="text-base font-semibold">{t.name}</span>
                <span className="text-sm text-navy-600">{t.area}</span>
                <span className="ml-auto font-numeric text-lg font-bold tabular-nums text-gold-900">{t.price_range}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[65ch] text-sm leading-relaxed text-navy-100">
            Giá tham khảo, thay đổi theo tầng, hướng view và từng đợt mở bán. Chiết khấu và ưu đãi đang áp dụng được gửi kèm bảng giá.
          </p>
          <div className="mt-8"><CtaLink>Nhận bảng giá mới nhất</CtaLink></div>
        </div>
      </section>
    </>
  );
}
