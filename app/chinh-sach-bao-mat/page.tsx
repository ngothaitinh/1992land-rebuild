import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import { legal, brand, contact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — 1992 Land",
  description: `Chính sách bảo mật thông tin khách hàng của ${legal.name} — minh bạch cách thu thập, sử dụng và bảo vệ dữ liệu cá nhân khi anh/chị để lại thông tin tư vấn trên 1992land.com.`,
  alternates: { canonical: "/chinh-sach-bao-mat" },
  robots: { index: true, follow: true },
};

const updated = "21/06/2026";

export default function ChinhSachBaoMatPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-navy-900 pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-gold-300 text-xs font-medium tracking-wide mb-5">
            <ShieldCheck size={14} />
            Cam kết bảo mật
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-surface tracking-tight mb-3">
            Chính sách bảo mật thông tin
          </h1>
          <p className="text-surface/60 text-base leading-relaxed max-w-2xl">
            {legal.name} — đơn vị chủ quản của chuyên trang {brand.name} — tôn trọng và bảo
            vệ thông tin cá nhân của mỗi khách hàng. Trang này giải thích rõ chúng tôi thu
            thập gì, dùng để làm gì và cam kết của chúng tôi đối với dữ liệu của anh/chị.
          </p>
          <p className="text-surface/40 text-sm mt-4">Cập nhật lần cuối: {updated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="text-sm text-navy-500 hover:text-gold-600 transition-colors mb-10 inline-flex items-center gap-1"
        >
          ← Về trang chủ
        </Link>

        {/* Disclaimer box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-12 text-sm text-amber-900 leading-relaxed">
          <strong>Lưu ý về tính chất website:</strong> 1992land.com là chuyên trang dự án
          của {legal.name} (MST {legal.taxId}), hoạt động với vai trò{" "}
          {brand.role.toLowerCase()},{" "}
          <strong>không phải website chính thức của bất kỳ chủ đầu tư nào</strong>. Tên dự
          án, logo và thương hiệu được nhắc đến thuộc quyền sở hữu của các chủ đầu tư
          tương ứng. Thông tin dự án mang tính tham khảo; anh/chị vui lòng liên hệ trực
          tiếp để được tư vấn chính xác và cập nhật nhất.{" "}
          <Link
            href="/phap-ly"
            className="underline underline-offset-2 font-medium hover:text-amber-700"
          >
            Xem thông tin pháp lý đầy đủ
          </Link>
          .
        </div>

        <div className="space-y-12 text-navy-800 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">01</span>
              Thông tin chúng tôi thu thập
            </h2>
            <p className="mb-3">
              Chúng tôi chỉ thu thập thông tin khi anh/chị <strong>chủ động cung cấp</strong>{" "}
              qua các form tư vấn, form liên hệ hoặc nút đăng ký trên website. Cụ thể gồm:
            </p>
            <ul className="space-y-2 mt-2">
              {[
                ["Họ và tên", "để xưng hô đúng khi tư vấn — bắt buộc"],
                ["Số điện thoại", "để gọi / nhắn Zalo tư vấn lại — bắt buộc"],
                ["Email", "để gửi tài liệu, bảng giá dự án — tùy chọn"],
                ["Dự án quan tâm", "để tư vấn đúng nhu cầu — tùy chọn"],
                ["Lời nhắn / nhu cầu", "thông tin anh/chị tự nguyện chia sẻ — tùy chọn"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-navy-900">{k}</strong>{" "}
                    <span className="text-navy-600">— {v}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-navy-600">
              Hệ thống cũng tự động ghi nhận đường dẫn trang anh/chị gửi yêu cầu (source URL)
              để chúng tôi biết anh/chị quan tâm nội dung nào. Chúng tôi{" "}
              <strong>không</strong> yêu cầu và <strong>không</strong> thu thập số CMND/CCCD,
              thông tin tài khoản ngân hàng hay bất kỳ dữ liệu nhạy cảm nào khác.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">02</span>
              Mục đích sử dụng thông tin
            </h2>
            <p className="mb-3">
              Thông tin của anh/chị chỉ được sử dụng cho các mục đích sau:
            </p>
            <ul className="space-y-2">
              {[
                "Liên hệ lại để tư vấn dự án bất động sản theo đúng nhu cầu anh/chị đăng ký.",
                "Gửi bảng giá, chính sách bán hàng, tài liệu dự án khi anh/chị yêu cầu.",
                "Mời tham gia sự kiện mở bán, xem nhà mẫu (chỉ khi anh/chị đồng ý).",
                "Hỗ trợ, giải đáp thắc mắc trong và sau quá trình giao dịch.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3 — cam kết */}
          <section className="bg-navy-50 border border-navy-100 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">03</span>
              Cam kết của chúng tôi
            </h2>
            <ul className="space-y-3">
              {[
                "KHÔNG bán, trao đổi hay cho thuê thông tin của anh/chị cho bất kỳ bên thứ ba nào vì mục đích thương mại.",
                "KHÔNG chia sẻ thông tin ra ngoài, trừ khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền.",
                "KHÔNG gửi tin nhắn / cuộc gọi rác. Anh/chị có thể yêu cầu ngừng liên hệ bất cứ lúc nào.",
                "CHỈ chuyên viên phụ trách mới được tiếp cận thông tin để phục vụ việc tư vấn.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <ShieldCheck size={18} className="text-gold-500 mt-0.5 shrink-0" />
                  <span className="text-navy-800">{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">04</span>
              Lưu trữ & bảo mật dữ liệu
            </h2>
            <p>
              Thông tin anh/chị gửi được chuyển trực tiếp tới chuyên viên qua kênh nội bộ
              có kiểm soát truy cập (tin nhắn riêng và bảng tính nội bộ). Chúng tôi áp dụng
              các biện pháp kỹ thuật và quản lý hợp lý để chống truy cập trái phép, làm lộ
              hay thất lạc dữ liệu. Thông tin chỉ được lưu trong thời gian cần thiết để phục
              vụ tư vấn và chăm sóc khách hàng; khi không còn cần thiết hoặc khi anh/chị yêu
              cầu, dữ liệu sẽ được xóa.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">05</span>
              Quyền của anh/chị
            </h2>
            <p className="mb-3">Đối với thông tin cá nhân của mình, anh/chị có quyền:</p>
            <ul className="space-y-2">
              {[
                "Yêu cầu xem lại thông tin mà chúng tôi đang lưu giữ.",
                "Yêu cầu chỉnh sửa, cập nhật thông tin chưa chính xác.",
                "Yêu cầu xóa hoàn toàn thông tin khỏi hệ thống.",
                "Rút lại sự đồng ý và từ chối nhận liên hệ tư vấn bất cứ lúc nào.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-navy-600">
              Để thực hiện các quyền trên, anh/chị gọi hoặc nhắn Zalo{" "}
              <a
                href={`tel:${contact.phoneIntl}`}
                className="text-gold-600 font-medium hover:underline"
              >
                {contact.phoneDisplay}
              </a>
              , hoặc gửi email tới{" "}
              <a
                href={`mailto:${legal.email}`}
                className="text-gold-600 font-medium hover:underline"
              >
                {legal.email}
              </a>{" "}
              — chúng tôi xử lý trong vòng 48 giờ làm việc.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">06</span>
              Cookie & công cụ đo lường
            </h2>
            <p>
              Website có thể sử dụng cookie kỹ thuật để duy trì hoạt động bình thường và
              công cụ thống kê lượt truy cập (ví dụ Google Analytics) nhằm cải thiện trải
              nghiệm. Các công cụ này xử lý dữ liệu ở dạng ẩn danh, không định danh cá nhân
              anh/chị. Anh/chị có thể tắt cookie trong cài đặt trình duyệt mà không ảnh
              hưởng tới việc xem nội dung website.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">07</span>
              Thay đổi chính sách
            </h2>
            <p>
              Chính sách này có thể được cập nhật để phù hợp với quy định pháp luật và hoạt
              động thực tế. Phiên bản mới nhất luôn được đăng tại trang này kèm ngày cập
              nhật. Anh/chị nên xem lại định kỳ để nắm thông tin mới nhất.
            </p>
          </section>

          {/* 8 — liên hệ */}
          <section className="border-t border-border-soft pt-10">
            <h2 className="font-display text-xl font-bold text-navy-900 mb-5 flex items-baseline gap-3">
              <span className="text-gold-500 font-semibold">08</span>
              Đơn vị chịu trách nhiệm
            </h2>
            <p className="font-semibold text-navy-900 text-lg mb-1">{legal.name}</p>
            <p className="text-navy-600 text-sm mb-5">
              Mã số thuế: {legal.taxId} · Đơn vị chủ quản chuyên trang {brand.name}
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold-500 mt-0.5 shrink-0" />
                <span>{legal.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold-500 shrink-0" />
                <a
                  href={`tel:${legal.phoneIntl}`}
                  className="text-navy-900 font-medium hover:text-gold-600 transition-colors"
                >
                  {legal.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold-500 shrink-0" />
                <a
                  href={`mailto:${legal.email}`}
                  className="text-navy-900 font-medium hover:text-gold-600 transition-colors"
                >
                  {legal.email}
                </a>
              </li>
            </ul>

            <p className="text-navy-600 text-sm mt-5 pt-5 border-t border-border-soft">
              Người phụ trách nội dung &amp; tư vấn: <strong className="text-navy-900">{contact.name}</strong>{" "}
              — {contact.jobTitle},{" "}
              <a
                href={`tel:${contact.phoneIntl}`}
                className="text-navy-700 hover:text-gold-600 transition-colors"
              >
                {contact.phoneDisplay}
              </a>
              . Văn phòng giao dịch: {brand.officeAddress}.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
