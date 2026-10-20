import Image from "next/image";
import { CtaLink, IMG, SectionTitle, tpSerif } from "./ui";

function Fact({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className={`${tpSerif.className} text-gold-300 text-xl lg:text-2xl font-semibold uppercase`}>{k}</dt>
      <dd className="mt-1 text-[15px] sm:text-base text-white leading-snug">{children}</dd>
    </div>
  );
}

const REASONS = [
  { t: "Lõi kết nối ba vùng kinh tế", d: "Vị trí cửa ngõ phía Tây liên kết TP.HCM, Đông Nam Bộ và Đồng bằng sông Cửu Long, nơi các trục hạ tầng lớn đang hình thành." },
  { t: "Quy hoạch 01 – 03 – 06", d: "Một trục đô thị, ba tầng giao thương và sáu cộng đồng, với mật độ xây dựng 14,41% và 48% diện tích dành cho tiện ích." },
  { t: "Tiện ích trong tầm đi bộ", d: "Trung tâm thương mại, giải trí và cộng đồng nằm trong khoảng cách đi bộ dưới 10 phút từ khu ở." },
  { t: "Cảnh quan lấy nước làm trung tâm", d: "Hồ nổi 3.300 m², show nhạc nước, công viên trung tâm 8 ha và quảng trường sự kiện tạo nhịp sống ngoài trời quanh năm." },
  { t: "Đội ngũ thiết kế quốc tế", d: "Codinachs Architects (Tây Ban Nha) và Broadway Malyan (Anh) cùng tham gia quy hoạch, kiến trúc và cảnh quan." },
  { t: "Chủ đầu tư có hệ sinh thái", d: "BIM Land thuộc BIM Group, đã phát triển các dự án tại Hạ Long, Phú Quốc và hợp tác với các thương hiệu khách sạn quốc tế." },
];

export default function TpOverview() {
  return (
    <>
      <section id="tong-quan" className="scroll-mt-32 relative bg-emerald-950 text-white overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 z-10">
          <SectionTitle top="Thông tin tổng quan" className="text-center" />
          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            <Fact k="Tên dự án">Thanh Phú Centre Point</Fact>
            <Fact k="Vị trí">Đường Nguyễn Hữu Trí, xã Bến Lức (trước đây thuộc huyện Bến Lức, Long An)</Fact>
            <Fact k="Đơn vị phát triển">BIM Land, thành viên BIM Group. Công ty cổ phần BEHS phát triển dự án.</Fact>
            <Fact k="Quy mô">200 ha theo quy hoạch tổng thể · Giai đoạn 1: 85,2 ha, vốn đầu tư hơn 10.662 tỷ đồng</Fact>
            <Fact k="Sản phẩm GĐ1">1.251 nhà phố, shophouse và biệt thự</Fact>
            <Fact k="Mật độ xây dựng">14,41%, tiện ích và cảnh quan 48%</Fact>
            <Fact k="Thiết kế">Codinachs Architects, Broadway Malyan</Fact>
            <Fact k="Vận hành">BIM Estates Management</Fact>
          </dl>
        </div>
        <div className="relative mt-8 aspect-[1920/958] w-full">
          <Image src={`${IMG}/top-view-85ha.webp`} alt="Toàn cảnh quy hoạch giai đoạn 1 Thanh Phú Centre Point rộng 85 ha" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-emerald-950 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-emerald-950 to-transparent" />
        </div>
        <p className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-white/75">Hình ảnh phối cảnh do chủ đầu tư công bố, có thể thay đổi theo thiết kế thực tế.</p>
        <div className="relative flex justify-center px-4 py-10"><CtaLink>Đăng ký tham quan Thanh Phú Centre Point</CtaLink></div>
      </section>

      <section id="diem-noi-bat" className="scroll-mt-32 bg-gradient-to-br from-emerald-800 to-emerald-900 text-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle top="Vì sao chọn Thanh Phú" bottom="Sáu điểm khác biệt của đô thị" className="text-center" />
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {REASONS.map((r, i) => (
              <li key={r.t} className="flex gap-4">
                <span className={`${tpSerif.className} italic text-6xl leading-[0.8] text-gold-300`} aria-hidden>{i + 1}</span>
                <div>
                  <p className="text-lg font-semibold text-white">{r.t}</p>
                  <p className="mt-1.5 text-base text-white/85 leading-relaxed">{r.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
