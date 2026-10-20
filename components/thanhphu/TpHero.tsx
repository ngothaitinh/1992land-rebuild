import Image from "next/image";
import { Check } from "lucide-react";
import { positioningLine } from "@/lib/site-config";
import { CtaLink, IMG, StarList, tpSerif } from "./ui";

const BULLETS = [
  <><b className="text-white">Đô thị 85 ha ngay cửa ngõ phía Tây TP.HCM.</b> Giai đoạn 1 mang tên Miền Thương Phú, nằm trên đường Nguyễn Hữu Trí, kết nối TP.HCM, Đông Nam Bộ và Đồng bằng sông Cửu Long.</>,
  <><b className="text-white">Mật độ xây dựng 14,41%, tiện ích và cảnh quan chiếm 48%.</b> Hồ nổi, công viên trung tâm 8 ha và quảng trường sự kiện là phần lõi của quy hoạch, không phải phần còn lại sau khi chia lô.</>,
  <><b className="text-white">Chủ đầu tư là BIM Land, thành viên BIM Group.</b> Thiết kế có sự tham gia của Codinachs Architects (Tây Ban Nha) và Broadway Malyan (Anh), vận hành bởi BIM Estates Management.</>,
  <><b className="text-white">Nhà phố 4 tầng từ khoảng 5,79 tỷ đồng.</b> Chính sách có chiết khấu 10–17% tùy tiến độ thanh toán và gói hỗ trợ lãi suất 0% trong 24 tháng.</>,
];
const CARD = [
  { b: "Tiện ích trong 10 phút đi bộ", t: "32 tiện ích quanh hồ và trục đô thị." },
  { b: "Sổ hồng lâu dài", t: "Với nhà thấp tầng cấp cho người Việt Nam." },
  { b: "Pháp lý công bố rõ", t: "Chấp thuận đầu tư, quy hoạch 1/500, giao đất đợt 1." },
];
const STATS = [
  { n: "85,2", u: "ha", l: "Giai đoạn 1" },
  { n: "1.251", u: "", l: "Sản phẩm" },
  { n: "14,41", u: "%", l: "Mật độ xây dựng" },
  { n: "48", u: "%", l: "Tiện ích & cảnh quan" },
  { n: "9,5", u: "ha", l: "Trung tâm thương mại" },
];

export default function TpHero({ priceFrom, location }: { priceFrom: string; location: string }) {
  return (
    <section className="bg-gradient-to-b from-emerald-900 to-emerald-950 text-white">
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[1920/873] w-full">
        <Image src={`${IMG}/hero.webp`} alt="Phối cảnh Thanh Phú Centre Point về đêm với hồ trung tâm, nhạc nước và trục thương mại" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-950/20 to-transparent sm:bg-gradient-to-r sm:from-emerald-950/80 sm:via-emerald-950/25 sm:to-transparent" />
        <div className="hidden sm:block absolute left-[6%] top-1/2 -translate-y-1/2 max-w-[48%]">
          <p className="text-gold-300 text-sm lg:text-base font-semibold tracking-[0.3em] uppercase">{location}</p>
          <p className={`${tpSerif.className} mt-3 text-5xl lg:text-7xl xl:text-8xl font-semibold leading-[1.02]`}>
            Thanh Phú<span className="block text-gold-300">Centre Point</span>
          </p>
          <p className="mt-4 text-lg lg:text-2xl text-white">Đô thị giao thương phía Tây TP.HCM</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="sm:hidden -mt-16 relative text-center">
          <p className="text-gold-300 text-xs font-semibold tracking-[0.25em] uppercase">{location}</p>
          <p className={`${tpSerif.className} mt-2 text-[2.75rem] font-semibold leading-none`}>Thanh Phú <span className="text-gold-300">Centre Point</span></p>
          <p className="mt-2 text-base">Đô thị giao thương phía Tây TP.HCM</p>
        </div>

        <div className="mt-8 flex justify-center"><CtaLink>Đăng ký tham quan & nhận bảng giá</CtaLink></div>
        <h1 className={`${tpSerif.className} text-gold-300 text-center text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] mt-10 max-w-4xl mx-auto`}>
          Miền trù phú, nơi cuộc sống và cơ hội giao thương cùng bắt đầu
        </h1>
        <p className="text-center text-xs sm:text-sm text-white/80 mt-4">{positioningLine}</p>

        <div className="mt-10 grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-12 items-start">
          <div className="text-white/90">
            <p className="mb-6 text-lg leading-relaxed text-white">
              Thanh Phú Centre Point là khu đô thị 200 ha theo quy hoạch tổng thể, do BIM Land phát triển tại xã Bến Lức (trước đây thuộc huyện Bến Lức, Long An). Giai đoạn 1 gồm 1.251 nhà phố, shophouse và biệt thự, xoay quanh hồ nổi 3.300 m² và Cầu Rồng.
            </p>
            <StarList items={BULLETS} className="max-w-[65ch]" />
          </div>
          <aside className="rounded-2xl bg-gradient-to-b from-[#fdf9e3] to-[#e2f3e6] p-6 sm:p-8 text-emerald-950 shadow-2xl lg:sticky lg:top-40">
            <p className={`${tpSerif.className} text-center text-emerald-800 text-4xl font-semibold leading-tight`}>Ở và kinh doanh</p>
            <p className="mt-3 text-base text-emerald-900 text-center">Dành cho gia đình cần nhà phố rộng rãi hoặc người muốn có mặt bằng kinh doanh trong đô thị mới.</p>
            <ul className="mt-6 space-y-4">
              {CARD.map((c) => (
                <li key={c.b} className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-emerald-700 text-white shrink-0"><Check size={16} aria-hidden /></span>
                  <span className="text-base"><b className="block text-emerald-900">{c.b}</b>{c.t}</span>
                </li>
              ))}
            </ul>
            <a href="#gia-ban" className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-emerald-800 text-base font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
              Xem giá từ {priceFrom}
            </a>
          </aside>
        </div>

        <dl className="mt-16 grid grid-cols-2 sm:grid-cols-5 gap-y-8 gap-x-4 border-t border-white/15 pt-10 text-center">
          {STATS.map((s) => (
            <div key={s.l} className="flex flex-col-reverse last:col-span-2 sm:last:col-span-1">
              <dt className="text-sm uppercase tracking-wider text-white/80 mt-1">{s.l}</dt>
              <dd className="font-numeric text-4xl lg:text-5xl font-bold text-gold-300 tabular-nums">
                {s.n}<span className="text-lg font-medium ml-1">{s.u}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
