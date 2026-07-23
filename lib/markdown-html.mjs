import { parseMarkdownBlocks } from "./markdown.mjs";

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineToHtml(inline) {
  return inline
    .map((node) => {
      if (node.type === "bold") return `<strong>${escapeHtml(node.text)}</strong>`;
      if (node.type === "italic") return `<em>${escapeHtml(node.text)}</em>`;
      if (node.type === "link") return `<a href="${escapeHtml(node.href)}">${escapeHtml(node.text)}</a>`;
      return escapeHtml(node.text);
    })
    .join("");
}

export function markdownToHtml(md) {
  const blocks = parseMarkdownBlocks(md);
  return blocks
    .map((block) => {
      if (block.type === "p") return `<p>${inlineToHtml(block.inline)}</p>`;
      if (block.type === "h2") return `<h2>${inlineToHtml(block.inline)}</h2>`;
      if (block.type === "h3") return `<h3>${inlineToHtml(block.inline)}</h3>`;
      if (block.type === "ul") return `<ul>${block.items.map((i) => `<li>${inlineToHtml(i)}</li>`).join("")}</ul>`;
      if (block.type === "ol") return `<ol>${block.items.map((i) => `<li>${inlineToHtml(i)}</li>`).join("")}</ol>`;
      return `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">`;
    })
    .join("");
}

// Tiptap's ListItem extension wraps item text in an inner <p> (content model
// "paragraph block*") — strip that one layer before reading inline content,
// but tolerate list items without it too (defensive, cheap).
function stripInnerParagraph(inner) {
  const m = inner.trim().match(/^<p>([\s\S]*)<\/p>$/);
  return m ? m[1] : inner.trim();
}

function inlineFromHtml(inner) {
  const parts = inner.split(/(<strong>[\s\S]*?<\/strong>|<em>[\s\S]*?<\/em>|<a\s+href="[^"]*">[\s\S]*?<\/a>)/g);
  const out = [];
  for (const part of parts) {
    if (!part) continue;
    let m;
    if ((m = part.match(/^<strong>([\s\S]*)<\/strong>$/))) out.push(`**${unescapeHtml(m[1])}**`);
    else if ((m = part.match(/^<em>([\s\S]*)<\/em>$/))) out.push(`_${unescapeHtml(m[1])}_`);
    else if ((m = part.match(/^<a\s+href="([^"]*)">([\s\S]*)<\/a>$/))) out.push(`[${unescapeHtml(m[2])}](${m[1]})`);
    else out.push(unescapeHtml(part));
  }
  return out.join("");
}

function unescapeHtml(s) {
  return s.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}

const BLOCK_RE = /<(p|h2|h3|ul|ol)>([\s\S]*?)<\/\1>|<img\s+([^>]*?)>/g;
const LI_RE = /<li>([\s\S]*?)<\/li>/g;

export function htmlToMarkdown(html) {
  if (!html) return "";
  const out = [];
  for (const match of html.matchAll(BLOCK_RE)) {
    const [, tag, inner, imgAttrs] = match;
    if (imgAttrs !== undefined) {
      const srcMatch = imgAttrs.match(/src="([^"]*)"/);
      const altMatch = imgAttrs.match(/alt="([^"]*)"/);
      out.push(`![${altMatch ? altMatch[1] : ""}](${srcMatch ? srcMatch[1] : ""})`);
      continue;
    }
    if (tag === "p") {
      const text = inlineFromHtml(inner);
      if (text) out.push(text);
      continue;
    }
    if (tag === "h2" || tag === "h3") {
      out.push(`${tag === "h2" ? "##" : "###"} ${inlineFromHtml(inner)}`);
      continue;
    }
    if (tag === "ul" || tag === "ol") {
      const items = [...inner.matchAll(LI_RE)].map((li) => inlineFromHtml(stripInnerParagraph(li[1])));
      out.push(items.map((text, i) => (tag === "ul" ? `- ${text}` : `${i + 1}. ${text}`)).join("\n"));
      continue;
    }
  }
  return out.join("\n\n");
}
