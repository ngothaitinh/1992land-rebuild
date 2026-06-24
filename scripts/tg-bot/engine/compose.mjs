export function slugify(title) {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// YAML-safe: bọc nháy kép, đổi " bên trong thành ' (parser frontmatter chỉ strip nháy ngoài)
function yamlStr(v) {
  return `"${String(v ?? "").replace(/"/g, "'")}"`;
}

export function toPostMarkdown(obj, { slug, date, heroImage }) {
  const lines = ["---"];
  lines.push(`slug: ${slug}`);
  lines.push(`title: ${yamlStr(obj.title)}`);
  lines.push(`date: ${date}`);
  lines.push(`category: ${yamlStr(obj.category)}`);
  lines.push(`readTime: ${yamlStr(obj.readTime)}`);
  lines.push(`excerpt: ${yamlStr(obj.excerpt)}`);
  if (heroImage) lines.push(`hero_image: ${yamlStr(heroImage)}`);
  if (Array.isArray(obj.related_projects) && obj.related_projects.length)
    lines.push(`related_projects: ${yamlStr(obj.related_projects.join(", "))}`);
  lines.push("---");
  return lines.join("\n") + "\n\n" + (obj.body_markdown || "").trim() + "\n";
}

export function toProjectJson(obj, { slug, heroImage, now }) {
  const out = { ...obj };
  // loại field nội bộ
  delete out._review_fields;
  out.slug = slug;
  out.id = out.id || `prj_${slug.replace(/-/g, "_")}`;
  if (heroImage) out.hero_image = heroImage;
  out.created_at = now;
  out.updated_at = now;
  return JSON.stringify(out, null, 2) + "\n";
}

const REQUIRED = {
  post:    ["title", "body_markdown"],
  project: ["title", "location"],
};

export function validateComposed(type, obj) {
  const missing = (REQUIRED[type] || []).filter((k) => !obj || !String(obj[k] || "").trim());
  return { ok: missing.length === 0, missing };
}

// === Thêm vào engine/compose.mjs ===
import { callLLM, parseLLMJson } from "./llm.mjs";

const COMMON_RULES = `
QUY TẮC BẮT BUỘC:
- CHỈ viết lại / rút gọn / cấu trúc lại từ VĂN BẢN NGUỒN người dùng cung cấp.
- KHÔNG bịa: giá, diện tích, tên chủ đầu tư, số quyết định, ngày tháng, pháp lý, tọa độ, khoảng cách — nếu nguồn không ghi thì để trống / null / bỏ field.
- Liệt kê mọi trường mà bạn suy đoán hoặc không chắc vào mảng "_review_fields".
- Tiếng Việt. KHÔNG viết hoa cả từ (caps-lock). KHÔNG dùng tone sales kiểu "CỰC KỲ", "NHẤT THỊ TRƯỜNG".
- Trả về DUY NHẤT một object JSON hợp lệ. KHÔNG bọc markdown fence. KHÔNG giải thích thêm.`;

export function buildSystemPrompt(type, ctx) {
  const today = ctx.today;
  if (type === "post") {
    return `Bạn là biên tập viên của 1992 Land (môi giới BĐS). Nhiệm vụ: biên tập văn bản nguồn thành 1 BÀI VIẾT.
Hôm nay: ${today}.
${COMMON_RULES}

Schema JSON cần trả:
{
  "title": "tiêu đề ngắn gọn",
  "excerpt": "1-2 câu tóm tắt",
  "category": "tự đặt, ưu tiên tái dùng nếu hợp: ${ctx.existingCategories.join(", ")}",
  "readTime": "X phút đọc",
  "body_markdown": "nội dung markdown, dùng ## cho tiêu đề phụ",
  "related_projects": [chỉ chọn slug CÓ THẬT từ: ${ctx.existingSlugs.join(", ")} — rỗng nếu không chắc],
  "_review_fields": ["tên trường bạn không chắc"]
}`;
  }
  // project
  return `Bạn là biên tập viên của 1992 Land. Nhiệm vụ: biên tập văn bản nguồn thành 1 DỰ ÁN BĐS.
Hôm nay: ${today}.
${COMMON_RULES}
LƯU Ý ĐẶC BIỆT: các trường số/pháp lý cực kỳ nhạy cảm — price_from, price_to, area_from, area_to, unit_count, priceRange, legal_status, handover_date, ownership, lat, lng, product_types, nearby. CHỈ điền khi nguồn ghi rõ; nếu không, để null/bỏ và thêm vào "_review_fields".

Schema JSON cần trả (điền những gì nguồn có):
{
  "title": "...", "location": "...", "area": "...", "district": "...", "city": "...",
  "developer": "...", "type": "...", "project_type": "...", "status": "...",
  "priceRange": "...", "excerpt": "...",
  "descriptions": { "tong-quan": "...", "vi-tri": "...", "tien-ich": "...", "gia-ban": "...", "chinh-sach": "...", "diem-noi-bat": "...", "phap-ly": "..." },
  "_review_fields": ["..."]
}
related_projects nếu dùng chỉ chọn slug CÓ THẬT từ: ${ctx.existingSlugs.join(", ")}.`;
}

export async function composeContent(type, sourceText, ctx, editInstruction) {
  const system = buildSystemPrompt(type, ctx);
  let user = `VĂN BẢN NGUỒN:\n${sourceText}`;
  if (editInstruction) user += `\n\nYÊU CẦU SỬA của người dùng (áp dụng lên kết quả trước): ${editInstruction}`;
  const raw = await callLLM({ system, user });
  return parseLLMJson(raw);
}
