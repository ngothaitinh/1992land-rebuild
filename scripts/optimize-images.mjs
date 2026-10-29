// Nén ảnh dự án tại chỗ: tối đa 1920px ngang, giữ nguyên tên + định dạng.
// Chỉ ghi đè khi kết quả nhỏ hơn bản gốc. Bỏ qua file < 150KB.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images/projects");
const MIN_BYTES = 150 * 1024;
const MAX_WIDTH = 1920;

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png)$/i.test(e.name)) yield p;
  }
}

let before = 0, after = 0, changed = 0;
for await (const file of walk(ROOT)) {
  const buf = await fs.readFile(file);
  before += buf.length;
  if (buf.length < MIN_BYTES) { after += buf.length; continue; }
  const isPng = /\.png$/i.test(file);
  let img = sharp(buf).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  img = isPng ? img.png({ compressionLevel: 9, palette: false }) : img.jpeg({ quality: 78, mozjpeg: true });
  const out = await img.toBuffer();
  if (out.length < buf.length) {
    await fs.writeFile(file, out);
    after += out.length; changed++;
  } else after += buf.length;
}
const mb = (n) => (n / 1048576).toFixed(1) + " MB";
console.log(`Đã nén ${changed} file. Trước: ${mb(before)} -> Sau: ${mb(after)}`);
