// scripts/tg-process-inbox.mjs
// Đọc content-inbox mới nhất, phân loại intent, trả về JSON cho Claude xử lý.
// Output: { intent, project_slug, data, images[], raw_text }
//
// Intents:
//   "update_project"  — cập nhật thông tin dự án có sẵn
//   "update_image"    — thay/thêm hình ảnh dự án
//   "new_project"     — đăng dự án mới
//   "new_post"        — đăng bài viết mới
//   "unknown"         — không rõ, cần hỏi lại
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INBOX_DIR = path.join(ROOT, "content-inbox");
const PROJECTS_DIR = path.join(ROOT, "data", "projects");

// Lấy folder mới nhất trong content-inbox
function getLatestInbox() {
  if (!fs.existsSync(INBOX_DIR)) return null;
  const dirs = fs.readdirSync(INBOX_DIR)
    .filter(d => fs.statSync(path.join(INBOX_DIR, d)).isDirectory())
    .sort()
    .reverse();
  return dirs.length ? path.join(INBOX_DIR, dirs[0]) : null;
}

// Đọc danh sách slug dự án hiện có
function getExistingSlugs() {
  return fs.readdirSync(PROJECTS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(".json", ""));
}

// Đọc tên dự án từ JSON
function getProjectNames() {
  const result = {};
  for (const f of fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith(".json"))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf8"));
      const slug = f.replace(".json", "");
      result[slug] = data.title;
      // Thêm aliases
      result[data.title.toLowerCase()] = slug;
    } catch {}
  }
  return result;
}

// Tìm slug dự án từ text
function findProjectSlug(text, projectNames) {
  const lower = text.toLowerCase();
  const slugs = Object.keys(projectNames).filter(k => k.includes("-"));

  // Match trực tiếp slug
  for (const slug of slugs) {
    if (lower.includes(slug)) return slug;
  }

  // Match tên dự án
  for (const slug of slugs) {
    const title = projectNames[slug];
    if (title && lower.includes(title.toLowerCase())) return slug;
  }

  // Match từng phần tên
  const keywords = {
    "thanh ph": "thanh-phu-centre-point",
    "thanh phu": "thanh-phu-centre-point",
    "centre point": "thanh-phu-centre-point",
    "la home": "la-home-long-an",
    "ansana": "ansana-by-kita",
    "lusso": "lusso-sai-gon",
    "river collection": "river-collection-an-gia",
    "an gia": "river-collection-an-gia",
    "salacia": "salacia-villas-phu-my",
    "phú mỹ": "salacia-villas-phu-my",
    "phu my": "salacia-villas-phu-my",
    "sun group": "sun-group-cu-lao-pho",
    "cù lao": "sun-group-cu-lao-pho",
    "cu lao": "sun-group-cu-lao-pho",
    "the quay": "the-quay-phuoc-hai",
    "phước hải": "the-quay-phuoc-hai",
    "phuoc hai": "the-quay-phuoc-hai",
    "water concept": "water-concept",
  };

  for (const [kw, slug] of Object.entries(keywords)) {
    if (lower.includes(kw)) return slug;
  }

  return null;
}

// Phân loại intent từ text
function classifyIntent(text, hasImages) {
  const lower = text.toLowerCase();

  // Đăng bài viết
  if (lower.includes("đăng bài") || lower.includes("bài viết mới") || lower.includes("viết bài") || lower.includes("đăng tin")) {
    return "new_post";
  }

  // Đăng dự án mới
  if (lower.includes("dự án mới") || lower.includes("đăng dự án") || lower.includes("thêm dự án")) {
    return "new_project";
  }

  // Cập nhật hình ảnh
  const imageKeywords = ["hero", "ảnh bìa", "ảnh đại diện", "gallery", "hình ảnh", "ảnh", "hình",
    "mặt bằng", "masterplan", "phối cảnh"];
  if (hasImages && imageKeywords.some(kw => lower.includes(kw))) {
    return "update_image";
  }

  // Cập nhật thông tin dự án
  const updateKeywords = ["cập nhật", "sửa", "thay đổi", "chỉnh", "update", "giá", "pháp lý",
    "tiến độ", "trạng thái", "chủ đầu tư", "diện tích"];
  if (updateKeywords.some(kw => lower.includes(kw))) {
    return "update_project";
  }

  // Có ảnh + tên dự án → update_image
  if (hasImages) {
    return "update_image";
  }

  return "unknown";
}

// Phân loại vị trí ảnh
function classifyImagePosition(text) {
  const lower = text.toLowerCase();
  if (lower.includes("hero") || lower.includes("ảnh bìa") || lower.includes("ảnh đại diện") || lower.includes("bìa")) {
    return "hero";
  }
  if (lower.includes("mặt bằng") || lower.includes("masterplan") || lower.includes("mat bang")) {
    return "masterplan";
  }
  if (lower.match(/gallery[\s-]*(\d+)/)) {
    return `gallery-${lower.match(/gallery[\s-]*(\d+)/)[1]}`;
  }
  // Default
  return "auto"; // Claude sẽ quyết định
}

function main() {
  const inboxDir = getLatestInbox();
  if (!inboxDir) {
    console.log(JSON.stringify({ empty: true }));
    return;
  }

  // Đọc message
  const msgFile = path.join(inboxDir, "message.txt");
  const rawText = fs.existsSync(msgFile) ? fs.readFileSync(msgFile, "utf8").trim() : "";

  // Đọc ảnh
  const images = fs.readdirSync(inboxDir)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(f => path.join(inboxDir, f));

  const hasImages = images.length > 0;
  const projectNames = getProjectNames();
  const slug = findProjectSlug(rawText, projectNames);
  const intent = classifyIntent(rawText, hasImages);
  const imagePosition = hasImages ? classifyImagePosition(rawText) : null;

  const result = {
    intent,
    project_slug: slug,
    project_title: slug ? projectNames[slug] : null,
    image_position: imagePosition,
    images: images.map(p => path.relative(ROOT, p)),
    image_count: images.length,
    raw_text: rawText,
    inbox_dir: path.relative(ROOT, inboxDir),
    existing_slugs: getExistingSlugs(),
    timestamp: path.basename(inboxDir),
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
