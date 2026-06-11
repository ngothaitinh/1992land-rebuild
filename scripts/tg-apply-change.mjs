// scripts/tg-apply-change.mjs
// Áp dụng các thay đổi TẤT ĐỊNH, rủi ro thấp vào dữ liệu — kèm xem trước (diff).
// Mặc định DRY-RUN (chỉ in diff, không ghi). Thêm cờ --apply để ghi thật.
//
// Cách dùng:
//   node scripts/tg-apply-change.mjs hide_section <slug> <key> [--apply]
//   node scripts/tg-apply-change.mjs show_section <slug> <key> [--apply]
//   node scripts/tg-apply-change.mjs set_field    <slug> <field> <value...> [--apply]
//   node scripts/tg-apply-change.mjs delete_project <slug> [--apply]
//   node scripts/tg-apply-change.mjs delete_post    <slug> [--apply]
//
// Nội dung giàu (thêm dự án/bài mới, descriptions, product_types) KHÔNG xử lý ở đây
// — để Claude tự soạn nhằm tránh sai format / bịa dữ liệu.
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "data", "projects");
const POSTS_DIR = path.join(ROOT, "data", "posts");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const [op, slug, ...rest] = args.filter((a) => a !== "--apply");

function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

function projectPath(s) {
  const p = path.join(PROJECTS_DIR, `${s}.json`);
  if (!fs.existsSync(p)) fail(`Không thấy dự án: ${s} (${path.relative(ROOT, p)})`);
  return p;
}
function postPath(s) {
  const p = path.join(POSTS_DIR, `${s}.md`);
  if (!fs.existsSync(p)) fail(`Không thấy bài viết: ${s} (${path.relative(ROOT, p)})`);
  return p;
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function report(lines) {
  const mode = apply ? "✅ ĐÃ ÁP DỤNG" : "👀 XEM TRƯỚC (chưa ghi — thêm --apply để ghi)";
  console.log(mode + "\n" + lines.join("\n"));
}

function opHideShow(show) {
  if (!slug || !rest[0]) fail("Thiếu slug hoặc key. VD: hide_section salacia-villas-phu-my gia-ban");
  const key = rest[0];
  const p = projectPath(slug);
  const data = readJson(p);
  const cur = Array.isArray(data.hidden_sections) ? [...data.hidden_sections] : [];
  let next;
  if (show) {
    next = cur.filter((k) => k !== key);
    if (next.length === cur.length) return report([`Phần "${key}" vốn không bị ẩn — không đổi gì.`]);
  } else {
    if (cur.includes(key)) return report([`Phần "${key}" đã ẩn sẵn — không đổi gì.`]);
    next = [...cur, key];
  }
  data.hidden_sections = next;
  data.updated_at = new Date().toISOString();
  if (apply) writeJson(p, data);
  report([
    `Dự án: ${data.title} (${slug})`,
    `hidden_sections: [${cur.join(", ")}]`,
    `             →  [${next.join(", ")}]`,
  ]);
}

function opSetField() {
  if (!slug || !rest[0] || rest.length < 2) fail('Thiếu tham số. VD: set_field salacia-villas-phu-my priceRange "Từ 5 tỷ"');
  const field = rest[0];
  const value = rest.slice(1).join(" ");
  const p = projectPath(slug);
  const data = readJson(p);
  if (typeof data[field] === "object" && data[field] !== null)
    fail(`Trường "${field}" là object/mảng — không set bằng script. Để Claude soạn.`);
  const before = data[field] === undefined ? "(trống)" : String(data[field]);
  data[field] = value;
  data.updated_at = new Date().toISOString();
  if (apply) writeJson(p, data);
  report([
    `Dự án: ${data.title} (${slug})`,
    `${field}: ${before}`,
    `${" ".repeat(field.length)}  →  ${value}`,
  ]);
}

function opDeleteProject() {
  if (!slug) fail("Thiếu slug.");
  const p = projectPath(slug);
  const data = readJson(p);
  const imgDir = path.join(ROOT, "public", "images", "projects", slug);
  const hasImg = fs.existsSync(imgDir);
  if (apply) {
    fs.rmSync(p, { force: true });
    if (hasImg) fs.rmSync(imgDir, { recursive: true, force: true });
  }
  report([
    `Xóa dự án: ${data.title} (${slug})`,
    `• File: ${path.relative(ROOT, p)}`,
    hasImg ? `• Thư mục ảnh: ${path.relative(ROOT, imgDir)} (sẽ xóa cùng)` : `• Không có thư mục ảnh riêng.`,
  ]);
}

function opDeletePost() {
  if (!slug) fail("Thiếu slug.");
  const p = postPath(slug);
  if (apply) fs.rmSync(p, { force: true });
  report([`Xóa bài viết: ${slug}`, `• File: ${path.relative(ROOT, p)}`]);
}

switch (op) {
  case "hide_section":
    opHideShow(false);
    break;
  case "show_section":
    opHideShow(true);
    break;
  case "set_field":
    opSetField();
    break;
  case "delete_project":
    opDeleteProject();
    break;
  case "delete_post":
    opDeletePost();
    break;
  default:
    fail(`Lệnh không hợp lệ: "${op || "(trống)"}". Dùng: hide_section | show_section | set_field | delete_project | delete_post`);
}
