import settings from "@/content/settings.json";

/**
 * Nguồn dữ liệu duy nhất cho thông tin doanh nghiệp và liên hệ.
 *
 * Hai tầng, cố ý tách rời:
 *  - `legal`   — pháp nhân vận hành website (Công ty Cổ phần TPI Land).
 *                Dùng cho footer, schema, chính sách bảo mật, trang /phap-ly.
 *                Đây là thứ Google Ads đối chiếu khi xác minh nhà quảng cáo.
 *  - `contact` — người phụ trách tư vấn (Nguyễn Hữu Thọ, Giám đốc dự án).
 *                Dùng cho nút gọi, Zalo, Messenger, form.
 *
 * Sửa giá trị trong `content/settings.json`, không sửa file này.
 */

export const legal = settings.legal;
export const brand = settings.brand;
export const contact = settings.contact;

/** "Công ty Cổ phần TPI Land — MST 0313899226" */
export const legalLine = `${legal.name} — MST ${legal.taxId}`;

/** Câu định vị bắt buộc: không phải chủ đầu tư. */
export const positioningLine = `${brand.name} là ${brand.role.toLowerCase()} thuộc ${legal.name}, không phải chủ đầu tư dự án.`;

/** Dòng giấy phép đầy đủ cho footer và trang pháp lý. */
export const licenseLine = `Giấy chứng nhận ĐKKD/MST: ${legal.taxId} do ${legal.licenseIssuer} cấp ngày ${legal.licenseDate}`;

const siteConfig = { legal, brand, contact, legalLine, positioningLine, licenseLine };

export default siteConfig;
