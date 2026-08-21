// lib/markdown-html.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml, htmlToMarkdown } from "./markdown-html.mjs";

test("markdownToHtml — đoạn văn thường + đậm/nghiêng/link", () => {
  const md = "Xem **giá tốt** tại _khu trung tâm_ và [liên hệ](https://zalo.me/0909474123) ngay.\n\nĐoạn hai.";
  const html = markdownToHtml(md);
  assert.match(html, /<p>Xem <strong>giá tốt<\/strong> tại <em>khu trung tâm<\/em> và <a href="https:\/\/zalo\.me\/0909474123">liên hệ<\/a> ngay\.<\/p>/);
  assert.match(html, /<p>Đoạn hai\.<\/p>/);
});

test("markdownToHtml — heading, list, ảnh", () => {
  const md = "## Tiêu đề\n\n- Mục 1\n- Mục 2\n\n1. Bước 1\n2. Bước 2\n\n![Ảnh](/images/x.jpg)";
  const html = markdownToHtml(md);
  assert.match(html, /<h2>Tiêu đề<\/h2>/);
  assert.match(html, /<ul><li>Mục 1<\/li><li>Mục 2<\/li><\/ul>/);
  assert.match(html, /<ol><li>Bước 1<\/li><li>Bước 2<\/li><\/ol>/);
  assert.match(html, /<img src="\/images\/x\.jpg" alt="Ảnh">/);
});

test("markdownToHtml — rỗng/null → chuỗi rỗng", () => {
  assert.equal(markdownToHtml(""), "");
  assert.equal(markdownToHtml(null), "");
  assert.equal(markdownToHtml(undefined), "");
});

test("htmlToMarkdown — đoạn văn + đậm/nghiêng/link, join bằng dòng trống", () => {
  const html = '<p>Xem <strong>giá tốt</strong> tại <em>khu trung tâm</em> và <a href="https://zalo.me/0909474123">liên hệ</a> ngay.</p><p>Đoạn hai.</p>';
  const md = htmlToMarkdown(html);
  assert.equal(
    md,
    "Xem **giá tốt** tại _khu trung tâm_ và [liên hệ](https://zalo.me/0909474123) ngay.\n\nĐoạn hai."
  );
});

test("htmlToMarkdown — heading + list (kể cả <li><p>...</p></li> Tiptap hay dùng)", () => {
  const html = "<h2>Tiêu đề</h2><ul><li><p>Mục 1</p></li><li><p>Mục 2</p></li></ul><ol><li><p>Bước 1</p></li></ol>";
  const md = htmlToMarkdown(html);
  assert.equal(md, "## Tiêu đề\n\n- Mục 1\n- Mục 2\n\n1. Bước 1");
});

test("htmlToMarkdown — ảnh inline", () => {
  const html = '<p>Trước.</p><img src="/images/x.jpg" alt="Ảnh"><p>Sau.</p>';
  const md = htmlToMarkdown(html);
  assert.equal(md, "Trước.\n\n![Ảnh](/images/x.jpg)\n\nSau.");
});

test("htmlToMarkdown — roundtrip qua markdownToHtml không đổi ý nghĩa (đa khối)", () => {
  const original = "## Tiêu đề\n\nĐoạn có **đậm** và _nghiêng_.\n\n- A\n- B";
  const roundtripped = htmlToMarkdown(markdownToHtml(original));
  assert.equal(roundtripped, original);
});

test("htmlToMarkdown — rỗng → chuỗi rỗng", () => {
  assert.equal(htmlToMarkdown(""), "");
  assert.equal(htmlToMarkdown("<p></p>"), "");
});

test("roundtrip — ký tự đặc biệt HTML (&, <, >, \") trong văn bản thường", () => {
  // Test plaintext with special HTML chars survives roundtrip unchanged
  const original1 = "Giá & mô tả < hoặc > so sánh \"ngoặc\".";
  const roundtripped1 = htmlToMarkdown(markdownToHtml(original1));
  assert.equal(roundtripped1, original1, "Special chars in plain text should roundtrip");

  // Test literal HTML entities as plaintext (e.g. someone typed "&lt;" literally)
  const original2 = "Literal: &amp; &lt; &gt; &quot;";
  const roundtripped2 = htmlToMarkdown(markdownToHtml(original2));
  assert.equal(roundtripped2, original2, "HTML entities typed as plaintext should roundtrip");
});

test("markdownToHtml — trích dẫn", () => {
  assert.equal(
    markdownToHtml("> Câu trích dẫn"),
    "<blockquote><p>Câu trích dẫn</p></blockquote>"
  );
});

test("htmlToMarkdown — trích dẫn", () => {
  assert.equal(
    htmlToMarkdown("<blockquote><p>Câu trích dẫn</p></blockquote>"),
    "> Câu trích dẫn"
  );
});

test("khứ hồi trích dẫn không mất chữ", () => {
  const original = "> Giá **2,9 tỷ** cho căn góc";
  assert.equal(htmlToMarkdown(markdownToHtml(original)), original);
});

test("khứ hồi trích dẫn xen giữa các block khác", () => {
  const original = "Mở đầu.\n\n> Trích dẫn\n\n## Tiêu đề\n\nKết thúc.";
  assert.equal(htmlToMarkdown(markdownToHtml(original)), original);
});

test("khứ hồi trích dẫn có nghiêng và link không mất chữ", () => {
  const original = "> Xem [tại đây](/lien-he) và _giá tốt_";
  assert.equal(htmlToMarkdown(markdownToHtml(original)), original);
});

test("htmlToMarkdown — trích dẫn nhiều đoạn không bị hỏng thành HTML thô", () => {
  const result = htmlToMarkdown("<blockquote><p>a</p><p>b</p></blockquote>");
  assert.equal(result, "> a\n> b");
});

test("htmlToMarkdown — trích dẫn rỗng không sinh ra dòng > trống", () => {
  assert.equal(htmlToMarkdown("<blockquote><p></p></blockquote>"), "");
});

test("htmlToMarkdown — trích dẫn có nội dung khác đoạn văn (vd danh sách lồng) bị bỏ, không rò rỉ HTML thô", () => {
  const result = htmlToMarkdown("<blockquote><ul><li>a</li></ul></blockquote>");
  assert.equal(result.includes("<ul>"), false);
  assert.equal(result.includes("<li>"), false);
});

// Ghi nhận có chủ đích: bộ chuyển đổi chỉ hiểu đúng 10 cấu trúc trong hợp đồng
// định dạng (spec §5). Thẻ ngoài hợp đồng bị bỏ — đây là hành vi ĐÃ BIẾT, không
// phải sơ suất. Test này khoá danh sách lại: muốn thêm nút vào toolbar thì phải
// sửa cả markdownToHtml, BLOCK_RE, htmlToMarkdown, MarkdownBlocks VÀ test này.
test("thẻ ngoài hợp đồng định dạng bị bỏ — hành vi có chủ đích", () => {
  assert.equal(htmlToMarkdown("<table><tr><td>ô</td></tr></table>"), "");
  assert.equal(htmlToMarkdown("<h4>tiêu đề cấp 4</h4>"), "");
  assert.equal(htmlToMarkdown("<hr>"), "");
});

test("thẻ trong hợp đồng đều được giữ", () => {
  const html =
    "<p>đoạn</p><h2>h2</h2><h3>h3</h3><ul><li>a</li></ul>" +
    "<ol><li>b</li></ol><blockquote><p>q</p></blockquote>" +
    '<img src="/a.jpg" alt="x">';
  const md = htmlToMarkdown(html);
  assert.ok(md.includes("đoạn"));
  assert.ok(md.includes("## h2"));
  assert.ok(md.includes("### h3"));
  assert.ok(md.includes("- a"));
  assert.ok(md.includes("1. b"));
  assert.ok(md.includes("> q"));
  assert.ok(md.includes("![x](/a.jpg)"));
});

test("htmlToMarkdown — link do TipTap sinh ra (kèm target/rel) không bị rò rỉ HTML thô — bug đang chạy thật trên production", () => {
  // @tiptap/extension-link mặc định renderHTML sinh target="_blank" rel="noopener noreferrer nofollow"
  // TRƯỚC href trong thẻ <a> — regex cũ chỉ khớp <a href="..."> nên coi cả thẻ là "text" lạ, in nguyên
  // HTML ra file lưu. Nút "Chèn liên kết" đã có sẵn trên toolbar RichTextEditor.tsx hiện tại.
  const html = '<p>Xem <a target="_blank" rel="noopener noreferrer nofollow" href="/lien-he">tại đây</a></p>';
  assert.equal(htmlToMarkdown(html), "Xem [tại đây](/lien-he)");
});

test("htmlToMarkdown — link không có attribute thừa vẫn hoạt động (không hồi quy)", () => {
  assert.equal(htmlToMarkdown('<p><a href="/x">y</a></p>'), "[y](/x)");
});

test("khứ hồi link kèm target/rel qua markdownToHtml rồi htmlToMarkdown", () => {
  const original = "[tại đây](/lien-he)";
  const withExtraAttrs = '<p><a target="_blank" rel="noopener noreferrer nofollow" href="/lien-he">tại đây</a></p>';
  assert.equal(htmlToMarkdown(withExtraAttrs), original);
});
