// scripts/tg-process-inbox.mjs
// Đọc content-inbox mới nhất, phân loại intent, trả về JSON cho Claude xử lý.
// Output: { intent, target_type, slug, fields, images[], raw_text, ... }
//
// Cách nhận diện ưu tiên: dòng đầu là LỆNH trong [NGOẶC VUÔNG] → intent chắc chắn.
// Nếu không có → rơi về fallback keyword (chat tự do).
//
// Intents:
//   "new_project"    — đăng dự án mới            [THÊM DỰ ÁN]
//   "update_project" — cập nhật dự án có sẵn      [SỬA DỰ ÁN]
//   "delete_project" — xóa dự án                  [XÓA DỰ ÁN]
//   "hide_section"   — ẩn một phần của dự án      [ẨN PHẦN]
//   "show_section"   — hiện lại một phần          [HIỆN PHẦN]
//   "new_post"       — đăng bài viết mới          [THÊM BÀI VIẾT]
//   "update_post"    — sửa bài viết               [SỬA BÀI VIẾT]
//   "delete_post"    — xóa bài viết               [XÓA BÀI VIẾT]
//   "update_image"   — thay/thêm hình ảnh dự án
//   "menu"           — gửi lại bộ mẫu
//   "unknown"        — không rõ, cần hỏi lại
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INBOX_DIR = path.join(ROOT, "content-inbox");
const PROJECTS_DIR = path.join(ROOT, "data", "projects");
const POSTS_DIR = path.join(ROOT, "data", "posts");

// Bỏ dấu tiếng Việt + chuẩn hóa để so khớp linh hoạt
function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

// Lấy folder mới nhất trong content-inbox
function getLatestInbox() {
  if (!fs.existsSync(INBOX_DIR)) return null;
  const dirs = fs
    .readdirSync(INBOX_DIR)
    .filter((d) => fs.statSync(path.join(INBOX_DIR, d)).isDirectory())
    .sort()
    .reverse();
  return dirs.length ? path.join(INBOX_DIR, dirs[0]) : null;
}

function getExistingSlugs() {
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

// Map slug → title (dự án)
function getProjectNames() {
  const result = {};
  for (const f of fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf8"));
      const slug = f.replace(".json", "");
      result[slug] = data.title;
      result[data.title.toLowerCase()] = slug;
    } catch {}
  }
  return result;
}

// Map slug → title (bài viết), đọc frontmatter
function getPostNames() {
  const result = {};
  if (!fs.existsSync(POSTS_DIR)) return result;
  for (const f of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
    const slug = f.replace(".md", "");
    let title = slug;
    try {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const m = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (m) title = m[1].trim();
    } catch {}
    result[slug] = title;
  }
  return result;
}

// Tìm slug dự án từ text
function findProjectSlug(text, projectNames) {
  const lower = text.toLowerCase();
  const slugs = Object.keys(projectNames).filter((k) => k.includes("-"));

  for (const slug of slugs) if (lower.includes(slug)) return slug;
  for (const slug of slugs) {
    const title = projectNames[slug];
    if (title && lower.includes(title.toLowerCase())) return slug;
  }

  const keywords = {
    "thanh ph": "thanh-phu-centre-point",
    "centre point": "thanh-phu-centre-point",
    "la home": "la-home-long-an",
    ansana: "ansana-by-kita",
    lusso: "lusso-sai-gon",
    "river collection": "river-collection-an-gia",
    "an gia": "river-collection-an-gia",
    salacia: "salacia-villas-phu-my",
    "phu my": "salacia-villas-phu-my",
    "sun group": "sun-group-cu-lao-pho",
    "cu lao": "sun-group-cu-lao-pho",
    "the quay": "the-quay-phuoc-hai",
    "phuoc hai": "the-quay-phuoc-hai",
    "water concept": "water-concept",
  };
  const norm = normalize(text);
  for (const [kw, slug] of Object.entries(keywords)) {
    if (lower.includes(kw) || norm.includes(normalize(kw))) return slug;
  }
  return null;
}

// Tìm slug bài viết từ text (khớp hai chiều: hint ⊂ title hoặc title ⊂ hint)
function findPostSlug(text, postNames) {
  const norm = normalize(text);
  if (!norm) return null;
  // 1) Khớp slug trực tiếp (cả dạng có gạch nối và dạng có khoảng trắng)
  for (const slug of Object.keys(postNames)) {
    const s = normalize(slug);
    if (norm.includes(s) || norm.includes(s.replace(/-/g, " "))) return slug;
  }
  // 2) Khớp tiêu đề hai chiều
  for (const [slug, title] of Object.entries(postNames)) {
    const t = normalize(title);
    if (t && (norm.includes(t) || t.includes(norm))) return slug;
  }
  return null;
}

// Lệnh [NGOẶC VUÔNG] → intent
const HEADER_INTENT = {
  "them du an": "new_project",
  "sua du an": "update_project",
  "xoa du an": "delete_project",
  "an phan": "hide_section",
  "hien phan": "show_section",
  "them bai viet": "new_post",
  "sua bai viet": "update_post",
  "xoa bai viet": "delete_post",
};

// /slash_command → intent (lệnh từ menu Telegram)
const SLASH_INTENT = {
  menu:        "menu",
  them_du_an:  "new_project",
  sua_du_an:   "update_project",
  xoa_du_an:   "delete_project",
  an_phan:     "hide_section",
  them_bai:    "new_post",
  sua_bai:     "update_post",
  xoa_bai:     "delete_post",
};

// /slash_command → menu key để gửi lại mẫu tương ứng
const SLASH_TEMPLATE_KEY = {
  menu:        "menu",
  them_du_an:  "them_du_an",
  sua_du_an:   "sua_du_an",
  xoa_du_an:   "xoa_du_an",
  an_phan:     "an_phan",
  them_bai:    "them_bai",
  sua_bai:     "sua_bai",
  xoa_bai:     "xoa_bai",
};

// Nhãn phần tiếng Việt → key trong descriptions/hidden_sections
const SECTION_KEY = {
  "tong quan": "tong-quan",
  "gia ban": "gia-ban",
  "chinh sach": "chinh-sach",
  "vi tri": "vi-tri",
  "tien ich": "tien-ich",
  "diem noi bat": "diem-noi-bat",
  "phap ly": "phap-ly",
};

function sectionToKey(label) {
  const n = normalize(label);
  if (SECTION_KEY[n]) return SECTION_KEY[n];
  // Cho phép nhập trực tiếp key (vd "gia-ban")
  const asKey = n.replace(/\s+/g, "-");
  if (Object.values(SECTION_KEY).includes(asKey)) return asKey;
  return null;
}

// Lấy lệnh ở dòng đầu nếu có dạng [ ... ] hoặc /slash_command
function parseHeader(text) {
  const firstLine = (text.split(/\r?\n/).find((l) => l.trim()) || "").trim();

  // /slash_command (có thể kèm @botname)
  const slashMatch = firstLine.match(/^\/([a-z_]+)(?:@\S+)?$/i);
  if (slashMatch) {
    const key = slashMatch[1].toLowerCase();
    return SLASH_INTENT[key] ? { intent: SLASH_INTENT[key], template_key: SLASH_TEMPLATE_KEY[key] } : null;
  }

  // [NGOẶC VUÔNG]
  const bracketMatch = firstLine.match(/^\[(.+?)\]/);
  if (!bracketMatch) return null;
  const intent = HEADER_INTENT[normalize(bracketMatch[1])];
  return intent ? { intent, template_key: null } : null;
}

// Parse các dòng "Nhãn: giá trị" (bỏ dòng đầu là lệnh)
function parseFields(text) {
  const lines = text.split(/\r?\n/);
  const fields = {};
  let started = false;
  for (const line of lines) {
    if (!started) {
      if (/^\s*\[.+?\]/.test(line)) {
        started = true;
        continue;
      }
      // nếu dòng đầu không phải header, vẫn parse từ đầu
    }
    started = true;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key && val) fields[key] = val;
  }
  return fields;
}

// Phân loại intent fallback (chat tự do, không có header)
function classifyIntentFallback(text, hasImages) {
  const lower = text.toLowerCase();

  if (["menu", "mau", "/menu", "help"].includes(normalize(text))) return "menu";

  if (lower.includes("đăng bài") || lower.includes("bài viết mới") || lower.includes("viết bài") || lower.includes("đăng tin")) {
    return "new_post";
  }
  if (lower.includes("dự án mới") || lower.includes("đăng dự án") || lower.includes("thêm dự án")) {
    return "new_project";
  }

  const imageKeywords = ["hero", "ảnh bìa", "ảnh đại diện", "gallery", "hình ảnh", "ảnh", "hình", "mặt bằng", "masterplan", "phối cảnh"];
  if (hasImages && imageKeywords.some((kw) => lower.includes(kw))) return "update_image";

  const updateKeywords = ["cập nhật", "sửa", "thay đổi", "chỉnh", "update", "giá", "pháp lý", "tiến độ", "trạng thái", "chủ đầu tư", "diện tích"];
  if (updateKeywords.some((kw) => lower.includes(kw))) return "update_project";

  if (hasImages) return "update_image";
  return "unknown";
}

function classifyImagePosition(text) {
  const lower = text.toLowerCase();
  if (lower.includes("hero") || lower.includes("ảnh bìa") || lower.includes("ảnh đại diện") || lower.includes("bìa")) return "hero";
  if (lower.includes("mặt bằng") || lower.includes("masterplan") || lower.includes("mat bang")) return "masterplan";
  if (lower.match(/gallery[\s-]*(\d+)/)) return `gallery-${lower.match(/gallery[\s-]*(\d+)/)[1]}`;
  return "auto";
}

const POST_INTENTS = new Set(["new_post", "update_post", "delete_post"]);

function main() {
  const inboxDir = getLatestInbox();
  if (!inboxDir) {
    console.log(JSON.stringify({ empty: true }));
    return;
  }

  const msgFile = path.join(inboxDir, "message.txt");
  const rawText = fs.existsSync(msgFile) ? fs.readFileSync(msgFile, "utf8").trim() : "";

  const images = fs
    .readdirSync(inboxDir)
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map((f) => path.join(inboxDir, f));
  const hasImages = images.length > 0;

  const projectNames = getProjectNames();
  const postNames = getPostNames();

  // Ưu tiên header [NGOẶC VUÔNG] hoặc /slash_command
  const headerResult = parseHeader(rawText);
  let intent = headerResult ? headerResult.intent : classifyIntentFallback(rawText, hasImages);
  const template_key = headerResult ? (headerResult.template_key || null) : null;
  const fields = parseFields(rawText);

  const isPost = POST_INTENTS.has(intent);
  const target_type = isPost ? "post" : "project";

  // Tìm slug từ field "Dự án"/"Bài" trước, rồi tới toàn văn
  const slugHint = fields["Dự án"] || fields["Bài"] || fields["Dự án/Bài"] || rawText;
  let slug = isPost
    ? findPostSlug(slugHint, postNames) || findPostSlug(rawText, postNames)
    : findProjectSlug(slugHint, projectNames) || findProjectSlug(rawText, projectNames);

  // Với ẩn/hiện phần: chuyển nhãn "Phần" → key
  let section_key = null;
  if (intent === "hide_section" || intent === "show_section") {
    section_key = sectionToKey(fields["Phần"] || fields["Phan"] || "");
  }

  const imagePosition = hasImages ? classifyImagePosition(rawText) : null;

  const result = {
    intent,
    template_key,   // non-null khi anh bấm /slash_command → Claude chạy: pnpm menu <template_key>
    target_type,
    slug,
    project_slug: isPost ? null : slug, // tương thích ngược
    project_title: !isPost && slug ? projectNames[slug] : null,
    post_title: isPost && slug ? postNames[slug] : null,
    section_key,
    fields,
    image_position: imagePosition,
    images: images.map((p) => path.relative(ROOT, p)),
    image_count: images.length,
    raw_text: rawText,
    inbox_dir: path.relative(ROOT, inboxDir),
    existing_slugs: getExistingSlugs(),
    existing_posts: Object.keys(postNames),
    timestamp: path.basename(inboxDir),
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
