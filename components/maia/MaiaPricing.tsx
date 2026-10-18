import Image from "next/image";
import { CircleCheck, Sparkle } from "lucide-react";
import type { Project } from "@/lib/data";
import { CtaLink, SectionTitle, maiaSerif } from "./ui";

const KIT = "/images/projects/maia-ho-tram/kit";
const BENEFITS = [
  { t: "Không phải sắm sửa thêm", d: "Căn hộ bàn giao full nội thất và thiết bị chuẩn 5 sao. Ngày nhận nhà cũng là ngày bạn có thể đưa gia đình đến nghỉ hoặc đưa căn hộ vào khai thác." },
  { t: "Không phải tự quản lý", d: "Fusion lo trọn việc đón khách, buồng phòng, bảo trì và chăm sóc tài sản. Bạn ở xa vẫn yên tâm căn hộ luôn trong tình trạng tốt nhất." },
  { t: "Không phải dồn tiền một lần", d: "Thanh toán chia nhỏ trong 4 năm theo tiến độ. Theo chính sách chủ đầu tư, chủ sở hữu nhận 40% doanh thu cho thuê thực tế và 40 đêm nghỉ miễn phí mỗi năm." },
];

export default function MaiaPricing({ p }: { p: Project }) {
  return (
    <>
      <section id="chinh-sach" className="scroll-mt-32 bg-gradient-to-br from-teal-800 to-teal-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Sở hữu Maia" bottom="Ba điều bạn không phải lo" className="text-center" />
          <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
            <ul className="space-y-7">
              {BENEFITS.map((b) => (
                <li key={b.t}>
                  <p className="flex items-center gap-3 text-xl lg:text-2xl font-bold text-white">
                    <CircleCheck size={26} className="text-gold-300 shrink-0" aria-hidden /> {b.t}
                  </p>
                  <p className="mt-2 pl-[38px] text-base text-white/85 leading-relaxed">{b.d}</p>
                </li>
              ))}
              <li className="pl-[38px] text-sm text-white/75">Doanh thu cho thuê tùy tình hình vận hành thực tế, không phải cam kết lợi nhuận cố định.</li>
            </ul>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image src={`${KIT}/nghi-duong.webp`} alt="Cặp đôi dạo bước bên hồ nước lúc hoàng hôn" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-950 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Tiến độ thanh toán" bottom="Chia nhỏ, nhẹ nhàng trong 4 năm" className="text-center" />
          <p className="mt-6 text-center text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            Các đợt thanh toán trải đều từ 2026 đến 2029, bàn giao và bắt đầu khai thác từ quý 4/2027, giúp bạn chủ động kế hoạch tài chính.
          </p>
          <div className="mt-10 rounded-2xl border border-gold-300/60 p-1.5 shadow-2xl">
            <div className="relative aspect-[1920/707] rounded-xl overflow-hidden">
              <Image src={`${KIT}/tien-do-thanh-toan.webp`} alt="Phương thức thanh toán chuẩn căn hộ và villa: 20% năm 2026, 30% năm 2027, 20% năm 2028, 25% năm 2029 và 5% khi nhận sổ; bàn giao và khai thác bán phòng quý 4/2027" fill sizes="(min-width:1024px) 1150px, 100vw" className="object-cover" />
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-white/75">Theo chính sách bán hàng của chủ đầu tư tại thời điểm công bố; có thể thay đổi theo từng đợt.</p>
          <div className="flex justify-center mt-8"><CtaLink>Gửi file chính sách chi tiết</CtaLink></div>
        </div>
      </section>

      <section id="gia-ban" className="scroll-mt-32 bg-gradient-to-br from-teal-800 to-teal-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Giá bán" bottom="& Chính sách bán hàng" className="text-center" />
          <div className="mt-12 grid lg:grid-cols-[1fr_440px] gap-8 items-stretch">
            <div className="rounded-2xl bg-teal-950/60 border border-white/15 p-5 sm:p-7">
              <ul className="divide-y divide-white/15">
                {p.product_types?.map((t) => (
                  <li key={t.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3.5">
                    <Sparkle size={14} className="text-gold-300 fill-gold-300 shrink-0 self-center" aria-hidden />
                    <span className="text-base font-medium">{t.name}</span>
                    <span className="text-sm text-white/75">{t.area}</span>
                    <span className="ml-auto font-numeric text-lg font-bold text-gold-300 tabular-nums">{t.price_range}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-white/80 leading-relaxed">
                Giá tham khảo, thay đổi theo tầng, hướng view và từng đợt mở bán. Chiết khấu và ưu đãi đang áp dụng được gửi kèm bảng giá.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-lime-900 p-1.5 shadow-2xl">
              <div className="h-full rounded-xl bg-teal-950 p-7 sm:p-8 flex flex-col justify-center text-center">
                <p className={`${maiaSerif.className} text-4xl font-semibold text-gold-300 leading-tight`}>Chọn đúng căn ưng ý</p>
                <p className="mt-4 text-base text-white/90 leading-relaxed">
                  Để lại thông tin để nhận bảng hàng cập nhật, so sánh tầng, hướng view và được tư vấn chọn căn phù hợp với nhu cầu ở hoặc cho thuê.
                </p>
                <a href="#dang-ky" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-gold-300 px-8 font-semibold text-teal-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950">
                  Nhận bảng giá mới nhất
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
