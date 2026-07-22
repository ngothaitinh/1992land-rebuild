import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownBlocks } from "./markdown.mjs";

test("chuỗi rỗng / null / undefined → mảng rỗng", () => {
  assert.deepEqual(parseMarkdownBlocks(""), []);
  assert.deepEqual(parseMarkdownBlocks(null), []);
  assert.deepEqual(parseMarkdownBlocks(undefined), []);
});

test("không có dòng trống → chia đoạn theo mỗi 2 câu (tương thích ngược với data cũ)", () => {
  const text = "Câu một. Câu hai. Câu ba. Câu bốn.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "p");
  assert.equal(blocks[0].lead, true);
  assert.equal(blocks[0].inline[0].text, "Câu một. Câu hai.");
  assert.equal(blocks[1].lead, false);
  assert.equal(blocks[1].inline[0].text, "Câu ba. Câu bốn.");
});

test("số lẻ câu → câu cuối đứng riêng 1 đoạn", () => {
  const text = "Câu một. Câu hai. Câu ba.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[1].inline[0].text, "Câu ba.");
});

test("có dòng trống → mỗi đoạn 1 block p, KHÔNG tự chia câu nữa", () => {
  const text = "Đoạn 1 có nhiều câu. Vẫn 1 đoạn.\n\nĐoạn 2 riêng.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "p");
  assert.equal(blocks[0].lead, true);
  assert.equal(blocks[0].inline[0].text, "Đoạn 1 có nhiều câu. Vẫn 1 đoạn.");
  assert.equal(blocks[1].lead, false);
  assert.equal(blocks[1].inline[0].text, "Đoạn 2 riêng.");
});

test("đậm, nghiêng, link trong cùng 1 đoạn", () => {
  const text = "Xem **giá tốt** tại _khu trung tâm_ và [liên hệ](https://zalo.me/0909474123) ngay.";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "p");
  const types = block.inline.map((i) => i.type);
  assert.ok(types.includes("bold"));
  assert.ok(types.includes("italic"));
  assert.ok(types.includes("link"));
  const bold = block.inline.find((i) => i.type === "bold");
  assert.equal(bold.text, "giá tốt");
  const italic = block.inline.find((i) => i.type === "italic");
  assert.equal(italic.text, "khu trung tâm");
  const link = block.inline.find((i) => i.type === "link");
  assert.equal(link.text, "liên hệ");
  assert.equal(link.href, "https://zalo.me/0909474123");
});

test("heading H2 và H3", () => {
  const text = "## Tiêu đề lớn\n\n### Tiêu đề nhỏ\n\nNội dung.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks[0].type, "h2");
  assert.equal(blocks[0].inline[0].text, "Tiêu đề lớn");
  assert.equal(blocks[1].type, "h3");
  assert.equal(blocks[1].inline[0].text, "Tiêu đề nhỏ");
  assert.equal(blocks[2].type, "p");
});

test("danh sách gạch đầu dòng", () => {
  const text = "- Mục 1\n- Mục 2\n- Mục 3";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "ul");
  assert.equal(block.items.length, 3);
  assert.equal(block.items[0][0].text, "Mục 1");
  assert.equal(block.items[2][0].text, "Mục 3");
});

test("danh sách đánh số", () => {
  const text = "1. Bước 1\n2. Bước 2";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "ol");
  assert.equal(block.items.length, 2);
  assert.equal(block.items[1][0].text, "Bước 2");
});

test("ảnh chèn giữa bài — đứng riêng 1 block giữa 2 đoạn văn", () => {
  const text = "Đoạn trước.\n\n![Ảnh minh hoạ](/images/projects/x/inline-1.jpg)\n\nĐoạn sau.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, "p");
  assert.equal(blocks[1].type, "img");
  assert.equal(blocks[1].src, "/images/projects/x/inline-1.jpg");
  assert.equal(blocks[1].alt, "Ảnh minh hoạ");
  assert.equal(blocks[2].type, "p");
});

test("heading nhiều dòng trong cùng 1 block vẫn gộp thành 1 tiêu đề", () => {
  const text = "## Tiêu đề\ncòn tiếp ở dòng sau";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "h2");
  assert.equal(block.inline[0].text, "Tiêu đề còn tiếp ở dòng sau");
});

test("danh sách KHÔNG có dòng trống bao quanh vẫn nhận diện đúng (không rơi vào legacy fallback)", () => {
  const text = "- Mục 1\n- Mục 2";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "ul");
  assert.equal(block.items.length, 2);
});

test("heading KHÔNG có dòng trống bao quanh vẫn nhận diện đúng (không rơi vào legacy fallback)", () => {
  const text = "## Chỉ 1 tiêu đề, không có đoạn văn nào khác";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "h2");
});
