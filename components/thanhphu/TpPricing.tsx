import Image from "next/image";
import { CircleCheck, FileCheck2 } from "lucide-react";
import { CtaLink, IMG, SectionTitle, tpSerif } from "./ui";

/** Giá tham khảo theo bảng giá đơn vị phân phối thanhphu-centrepoint.com.vn (tháng 10/2026). */
const PRICES = [
  { name: "Nhà phố liền kề Hội Phú", area: "82,5 m² · 78 căn", price: "5,79–6,74 tỷ" },
  { name: "Nhà phố thương mại Hội Phú", area: "74,25–88 m² · 529 căn", price: "6,06–8,91 tỷ" },
  { name: "Shophouse Strip Mall Thương Phú", area: "331 căn", price: "Liên hệ" },
  { name: "Biệt thự An Phú", area: "150–300 m² · 313 căn", price: "Liên hệ" },
];
const POLICY = [
  { t: "Chiết khấu 10–17% theo tiến độ", d: "10% với tiến độ chuẩn, 13% khi thanh toán sớm 50%, 17% khi thanh toán sớm 95% giá trị." },
  { t: "Hỗ trợ lãi suất 0% trong 24 tháng", d: "Hoặc chiết khấu 3% nếu không vay. Sau đó áp trần lãi suất cố định 9,5%/năm trong 24 tháng tiếp theo, ân hạn nợ gốc tối đa 36 tháng." },
  { t: "Vay đến 70% giá trị sản phẩm", d: "Gồm VAT, theo gói của Vietcombank và MB Bank. Miễn phí trả nợ trước hạn trong thời gian hỗ trợ lãi suất." },
  { t: "Miễn phí quản lý 2 năm", d: "Gói quản lý vận hành của BIM Estates Management, tính từ ngày bàn giao." },
];
const LEGAL = [
  { n: "QĐ 8909/QĐ-UBND", d: "28/9/2023: chấp thuận chủ trương đầu tư, 85,198 ha." },
  { n: "QĐ 7500/QĐ-UBND", d: "27/6/2025: phê duyệt quy hoạch chi tiết 1/500." },
  { n: "QĐ 11339/QĐ-UBND", d: "26/12/2025: giao đất đợt 1 cho liên danh thực hiện dự án." },
  { n: "TB 07/2025/TB-BEHS", d: "27/12/2025: thông báo khởi công hạ tầng từ 30/12/2025." },
];

export default function TpPricing() {
  return (
    <>
      <section id="gia-ban" className="scroll-mt-32 bg-gradient-to-br from-emerald-800 to-emerald-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Giá bán" bottom="& Chính sách bán hàng" className="text-center" />
          <div className="mt-12 grid lg:grid-cols-[1fr_440px] gap-8 items-stretch">
            <div className="rounded-2xl bg-emerald-950/60 border border-white/15 p-5 sm:p-7">
              <ul className="divide-y divide-white/15">
                {PRICES.map((t) => (
                  <li key={t.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3.5">
                    <span className="text-base font-medium">{t.name}</span>
                    <span className="text-sm text-white/75">{t.area}</span>
                    <span className="ml-auto font-numeric text-lg font-bold text-gold-300 tabular-nums">{t.price}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-white/80 leading-relaxed">
                Giá tham khảo từ bảng giá đang công bố, phụ thuộc lộ giới, hướng view và từng đợt mở bán. Bảng hàng và chính sách có thể thay đổi theo quyết định của chủ đầu tư.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-lime-900 p-1.5 shadow-2xl">
              <div className="h-full rounded-xl bg-emerald-950 p-7 sm:p-8 flex flex-col justify-center text-center">
                <p className={`${tpSerif.className} text-4xl font-semibold text-gold-300 leading-tight`}>Chọn đúng căn ưng ý</p>
                <p className="mt-4 text-base text-white/90 leading-relaxed">
                  Để lại thông tin để nhận bảng hàng cập nhật, so sánh lộ giới, hướng view và được tư vấn phương án thanh toán phù hợp.
                </p>
                <a href="#dang-ky" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-gold-300 px-8 font-semibold text-emerald-950 transition-colors hover:bg-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950">
                  Nhận bảng giá mới nhất
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chinh-sach" className="scroll-mt-32 bg-emerald-950 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Chính sách" bottom="Chiết khấu và hỗ trợ tài chính" className="text-center" />
          <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
            <ul className="space-y-7">
              {POLICY.map((b) => (
                <li key={b.t}>
                  <p className="flex items-center gap-3 text-xl font-bold text-white">
                    <CircleCheck size={26} className="text-gold-300 shrink-0" aria-hidden /> {b.t}
                  </p>
                  <p className="mt-2 pl-[38px] text-base text-white/85 leading-relaxed">{b.d}</p>
                </li>
              ))}
              <li className="pl-[38px] text-sm text-white/75">Tiền thiện chí 300 triệu đồng khi ký thỏa thuận nguyên tắc. Điều kiện áp dụng theo chính sách chủ đầu tư tại thời điểm ký, gọi để được tư vấn bản mới nhất.</li>
            </ul>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image src={`${IMG}/nhip-song.webp`} alt="Phố thương mại với nhà phố bốn tầng lúc chiều muộn" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="phap-ly" className="scroll-mt-32 bg-gradient-to-br from-emerald-800 to-emerald-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Pháp lý dự án" bottom="Các văn bản đã công bố" className="text-center" />
          <ul className="mt-10 grid sm:grid-cols-2 gap-4">
            {LEGAL.map((l) => (
              <li key={l.n} className="flex gap-4 rounded-xl bg-emerald-950/60 border border-white/15 p-5">
                <FileCheck2 size={26} className="text-gold-300 shrink-0" aria-hidden />
                <span><b className="block text-lg">{l.n}</b><span className="text-base text-white/85">{l.d}</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-base text-white/85 max-w-3xl mx-auto leading-relaxed">
            Nhà thấp tầng được cấp sổ hồng lâu dài đối với người Việt Nam. Thông tin tổng hợp từ nguồn công bố của chủ đầu tư và đơn vị phân phối, chưa thay thế hồ sơ pháp lý gốc.
          </p>
          <div className="flex justify-center mt-8"><CtaLink>Nhận bản sao hồ sơ pháp lý</CtaLink></div>
        </div>
      </section>
    </>
  );
}
