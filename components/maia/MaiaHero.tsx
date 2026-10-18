import Image from "next/image";
import { Check } from "lucide-react";
import type { Project } from "@/lib/data";
import { positioningLine } from "@/lib/site-config";
import { CtaLink, StarList, maiaSerif } from "./ui";

export default function MaiaHero({ p }: { p: Project }) {
  const bullets = [
    <><b className="text-white">Sống giữa hệ sinh thái đã vận hành.</b> Maia nằm trong The Grand Ho Tram Strip, liền kề sân golf The Bluffs (Top 65 thế giới), trung tâm hội nghị MICE và chuỗi nhà hàng, spa đang đón khách mỗi ngày. Nhận nhà là dùng được ngay, không phải chờ tiện ích hình thành.</>,
    <><b className="text-white">Gần TP.HCM hơn bao giờ hết.</b> Cao tốc mới rút hành trình từ TP.HCM xuống còn hơn 1 giờ. Sân bay quốc tế Long Thành cách khoảng 30 phút, mở thêm nguồn khách quốc tế khi đi vào khai thác.</>,
    <><b className="text-white">Chủ đầu tư có nền tảng vốn quốc tế.</b> Công ty TNHH Dự Án Hồ Tràm được hai quỹ Warburg Pincus và VinaCapital rót vốn.</>,
    <><b className="text-white">Fusion lo trọn phần vận hành.</b> Thương hiệu quản lý khách sạn quốc tế phụ trách đón khách, buồng phòng, bảo trì theo chuẩn 5 sao, chủ nhà không phải tự quản lý.</>,
    <><b className="text-white">Dòng tiền nhẹ nhàng.</b> Thanh toán giãn đều trong 4 năm theo tiến độ xây dựng, không phải chuẩn bị một khoản lớn ngay từ đầu.</>,
  ];
  const card = [
    { b: "Nhận nhà là ở được", t: "Bàn giao full nội thất chuẩn 5 sao." },
    { b: "Không tốn công quản lý", t: "Fusion vận hành, bảo trì, đón khách thay bạn." },
    { b: "Thanh toán trong 4 năm", t: "Chia nhỏ theo tiến độ xây dựng." },
  ];
  const stats = [
    { n: "7", u: "ha", l: "Tổng diện tích" },
    { n: "1.244", u: "", l: "Căn hộ" },
    { n: "36", u: "", l: "Villa" },
    { n: "32", u: "tầng", l: "Mỗi tòa tháp" },
    { n: "100%", u: "", l: "Căn hộ view biển" },
  ];

  return (
    <section className="bg-gradient-to-b from-teal-900 to-teal-950 text-white">
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[1920/873] w-full">
        <Image src={p.hero_image ?? ""} alt="Phối cảnh Maia Resort Hồ Tràm nhìn từ trên cao" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-teal-950/20 to-transparent sm:bg-gradient-to-l sm:from-teal-950/75 sm:via-teal-950/20" />
        <div className="hidden sm:block absolute right-[6%] top-1/2 -translate-y-1/2 max-w-[48%] text-right">
          <p className="text-gold-300 text-sm lg:text-base font-semibold tracking-[0.3em] uppercase">{p.location}</p>
          <p className={`${maiaSerif.className} mt-3 text-5xl lg:text-7xl xl:text-8xl font-semibold leading-[1.02]`}>
            Maia Resort<span className="block text-gold-300">Hồ Tràm</span>
          </p>
          <p className="mt-4 text-lg lg:text-2xl text-white">Căn hộ & villa hướng biển, a fusion resort</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Mobile: tiêu đề hero nằm dưới ảnh để không bị ảnh nền làm khó đọc */}
        <div className="sm:hidden -mt-16 relative text-center">
          <p className="text-gold-300 text-xs font-semibold tracking-[0.25em] uppercase">{p.location}</p>
          <p className={`${maiaSerif.className} mt-2 text-[2.75rem] font-semibold leading-none`}>Maia Resort <span className="text-gold-300">Hồ Tràm</span></p>
          <p className="mt-2 text-base">Căn hộ & villa hướng biển, a fusion resort</p>
        </div>

        <div className="mt-8 flex justify-center"><CtaLink>Đăng ký đi site-tour & trải nghiệm resort</CtaLink></div>
        <h1 className={`${maiaSerif.className} text-gold-300 text-center text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] mt-10 max-w-4xl mx-auto`}>
          Một chốn nghỉ riêng giữa lòng The Grand Hồ Tràm
        </h1>
        <p className="text-center text-xs sm:text-sm text-white/80 mt-4">{positioningLine}</p>

        <div className="mt-10 grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-12 items-start">
          <div className="text-white/90">
            <p className="mb-6 text-lg leading-relaxed text-white">
              {p.title} gồm 1.244 căn hộ và 36 villa trên khu đất 7 ha ở Phước Thuận, Xuyên Mộc. Mỗi căn đều hướng ra biển, được bàn giao hoàn thiện và vận hành bởi Fusion, để kỳ nghỉ của gia đình bạn bắt đầu ngay từ ngày nhận nhà.
            </p>
            <StarList items={bullets} className="max-w-[65ch]" />
          </div>
          <aside className="rounded-2xl bg-gradient-to-b from-[#fdf9e3] to-[#d9f6f0] p-6 sm:p-8 text-teal-950 shadow-2xl lg:sticky lg:top-40">
            <p className={`${maiaSerif.className} text-center text-teal-800 text-4xl font-semibold leading-tight`}>Sở hữu nhẹ nhàng</p>
            <p className="mt-3 text-base text-teal-900 text-center">Dành cho người muốn có một tài sản nghỉ dưỡng bên biển mà không mất thời gian quản lý.</p>
            <ul className="mt-6 space-y-4">
              {card.map((c) => (
                <li key={c.b} className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-teal-700 text-white shrink-0"><Check size={16} aria-hidden /></span>
                  <span className="text-base"><b className="block text-teal-900">{c.b}</b>{c.t}</span>
                </li>
              ))}
            </ul>
            <a href="#gia-ban" className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-teal-800 text-base font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
              Xem giá từ {p.priceRange?.replace("Từ ", "")}
            </a>
          </aside>
        </div>

        <dl className="mt-16 grid grid-cols-2 sm:grid-cols-5 gap-y-8 gap-x-4 border-t border-white/15 pt-10 text-center">
          {stats.map((s) => (
            <div key={s.l} className="flex flex-col-reverse last:col-span-2 sm:last:col-span-1">
              <dt className="text-sm uppercase tracking-wider text-white/80 mt-1">{s.l}</dt>
              <dd className="font-numeric text-4xl lg:text-5xl font-bold text-gold-300 tabular-nums">
                {s.n}<span className="text-lg font-medium ml-1">{s.u}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 mx-auto max-w-4xl">
          <Image src="/images/projects/maia-ho-tram/kit/doi-tac.webp" alt="Đối tác trong hệ sinh thái The Grand Ho Tram: Holiday Inn Resort, Warburg Pincus, The Grand, InterContinental, The Bluffs, Ixora, Maia" width={1256} height={120} className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
