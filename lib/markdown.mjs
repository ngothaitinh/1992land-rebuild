const INLINE_RE = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;

function parseInline(text) {
  return text
    .split(INLINE_RE)
    .filter((part) => part !== "")
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return { type: "bold", text: part.slice(2, -2) };
      }
      if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        return { type: "italic", text: part.slice(1, -1) };
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return { type: "link", text: linkMatch[1], href: linkMatch[2] };
      }
      return { type: "text", text: part };
    });
}

// Legacy behavior from the old DescBlock in app/du-an/[slug]/page.tsx:
// split on ". " (period + space) — safe because Vietnamese thousands use "."
// without a trailing space — then group every 2 sentences into 1 paragraph.
function splitLegacyParagraphs(text) {
  const rawSentences = text.split(/\. (?=\S)/g);
  const sentences = rawSentences.map((s, i) =>
    i < rawSentences.length - 1 ? s + "." : s
  );
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push([sentences[i], sentences[i + 1]].filter(Boolean).join(" "));
  }
  return paragraphs;
}

// A field only takes the legacy sentence-split path when it has neither a
// blank line NOR any line that looks like Markdown block syntax — i.e. it's
// a single old-style blob of prose. A field that's e.g. just a bullet list
// with no blank line around it must still be parsed as a real list.
function looksLikeMarkdownStructure(norm) {
  const lines = norm.split("\n").map((l) => l.trim());
  const isHeading = (l) => /^#{2,3}\s+/.test(l);
  const isImage = (l) => /^!\[[^\]]*\]\([^)]+\)$/.test(l);
  const isListItem = (l) => /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l);

  if (lines.some(isHeading) || lines.some(isImage)) return true;
  // A list marker only counts as real list structure across 2+ lines — a
  // single unbroken line that merely starts with "- " or "1. " is
  // indistinguishable from ordinary prose punctuation (e.g. a legacy
  // description starting with "20. Tính đến năm 2024...") and must stay
  // on the legacy sentence-split path instead of swallowing the whole
  // paragraph into one bogus list item.
  return lines.length >= 2 && lines.some(isListItem);
}

export function parseMarkdownBlocks(text) {
  const norm = (text ?? "").replace(/\r\n/g, "\n").trim();
  if (!norm) return [];

  const hasBlankLine = /\n[ \t]*\n/.test(norm);
  const isLegacy = !hasBlankLine && !looksLikeMarkdownStructure(norm);
  const blocks = [];
  let firstParagraphSeen = false;

  if (isLegacy) {
    for (const p of splitLegacyParagraphs(norm)) {
      blocks.push({ type: "p", inline: parseInline(p), lead: !firstParagraphSeen });
      firstParagraphSeen = true;
    }
    return blocks;
  }

  const rawBlocks = norm
    .split(/\n[ \t]*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const raw of rawBlocks) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (/^#{2,3}\s+/.test(lines[0])) {
      const level = lines[0].startsWith("### ") ? "h3" : "h2";
      const headingText = [lines[0].replace(/^#{2,3}\s+/, ""), ...lines.slice(1)].join(" ");
      blocks.push({ type: level, inline: parseInline(headingText) });
      continue;
    }

    if (lines.length === 1) {
      const imgMatch = lines[0].match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        blocks.push({ type: "img", alt: imgMatch[1], src: imgMatch[2] });
        continue;
      }
    }

    // Require 2+ lines for list detection — a lone line that merely starts
    // with "- " or "1. " is ordinary prose, not a real list (see
    // looksLikeMarkdownStructure above for why).
    if (lines.length >= 2 && lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({
        type: "ul",
        items: lines.map((l) => parseInline(l.replace(/^[-*]\s+/, ""))),
      });
      continue;
    }

    if (lines.length >= 2 && lines.every((l) => /^\d+\.\s+/.test(l))) {
      blocks.push({
        type: "ol",
        items: lines.map((l) => parseInline(l.replace(/^\d+\.\s+/, ""))),
      });
      continue;
    }

    blocks.push({ type: "p", inline: parseInline(lines.join(" ")), lead: !firstParagraphSeen });
    firstParagraphSeen = true;
  }

  return blocks;
}
