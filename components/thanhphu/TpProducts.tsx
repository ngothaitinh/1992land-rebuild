import Image from "next/image";
import { CtaLink, IMG, SectionTitle } from "./ui";

/** Ba phân khu giai đoạn 1 theo thông tin đơn vị phân phối thanhphu-centrepoint.com.vn. */
const ZONES = [
  { name: "Hội Phú", total: "607 căn", d: "78 nhà phố liền kề và 529 nhà phố thương mại. Đang mở bán." },
  { name: "Thương Phú", total: "331 căn", d: "Shophouse Strip Mall, lõi giao thương đầu tiên. Chưa công bố giá." },
  { name: "An Phú", total: "313 căn", d: "Biệt thự, villa sinh thái. Chưa công bố giá." },
];
const SPECS = [
  { k: "Nhà phố liền kề (M8)", v: "Đất 5,5 × 15 m (82,5 m²), 4 tầng, tổng sàn khoảng 236,56 m², 4 phòng ngủ, 4 WC." },
  { k: "Shophouse (M6, M7)", v: "Tổng sàn từ 217,25 m² đến 309,90 m², tầng trệt kinh doanh 57,75–74,25 m²." },
  { k: "Shophouse căn góc", v: "Tổng sàn từ 289,27 m² đến 383,22 m², 2–3 mặt tiền." },
  { k: "Biệt thự (M1–M5)", v: "Đất 150–300 m², mặt tiền 6–7 m, tối đa 3 tầng." },
];

export default function TpProducts() {
  return (
    <section id="mat-bang" className="scroll-mt-32 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle top="Mặt bằng & sản phẩm" bottom="Ba phân khu giai đoạn 1" className="text-center" />
        <p className="mt-6 text-center text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
          Giai đoạn 1 gồm 1.251 sản phẩm thấp tầng chia thành ba phân khu. Làng Trù Phú, mô hình làng sinh thái và làng thể thao, sẽ công bố sau.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {ZONES.map((z) => (
            <div key={z.name} className="rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-lime-900 p-1.5 shadow-xl">
              <div className="h-full rounded-xl bg-emerald-950 p-6 text-center">
                <p className="text-sm uppercase tracking-widest text-white/75">Phân khu</p>
                <p className="mt-1 text-3xl font-semibold text-gold-300">{z.name}</p>
                <p className="mt-2 font-numeric text-2xl font-bold tabular-nums">{z.total}</p>
                <p className="mt-3 text-base text-white/85 leading-relaxed">{z.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[1500/844] rounded-2xl overflow-hidden border border-gold-300/60 shadow-2xl">
            <Image src={`${IMG}/pho-nha-phu.webp`} alt="Dãy nhà phố và shophouse bốn tầng bên đường nội khu" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <dl className="space-y-5">
            {SPECS.map((s) => (
              <div key={s.k} className="border-b border-white/15 pb-4">
                <dt className="text-lg font-semibold text-gold-300">{s.k}</dt>
                <dd className="mt-1 text-base text-white/90 leading-relaxed">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-8 text-center text-sm text-white/75">Thông số theo tài liệu bán hàng đang lưu hành, có thể điều chỉnh theo hồ sơ thiết kế được duyệt. Liên hệ để nhận mặt bằng chi tiết từng căn.</p>
        <div className="flex justify-center mt-8"><CtaLink>Nhận mặt bằng chi tiết</CtaLink></div>
      </div>
    </section>
  );
}
