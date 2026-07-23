// lib/dashboard-patch.mjs
const NON_DIFFABLE = new Set(["slug", "id", "descriptions", "hidden_sections"]);

export function buildPatch(original, draft, pendingImages = []) {
  const patch = {};

  const fields = {};
  for (const key of Object.keys(draft)) {
    if (NON_DIFFABLE.has(key)) continue;
    if (JSON.stringify(draft[key]) !== JSON.stringify(original[key])) {
      fields[key] = draft[key];
    }
  }
  if (Object.keys(fields).length) patch.fields = fields;

  const descriptions = {};
  const origDesc = original.descriptions || {};
  const draftDesc = draft.descriptions || {};
  const allKeys = new Set([...Object.keys(origDesc), ...Object.keys(draftDesc)]);
  for (const key of allKeys) {
    const before = origDesc[key];
    const after = draftDesc[key];
    if (before === after) continue;
    if (after === undefined) {
      if (before !== undefined) descriptions[key] = "";
    } else {
      descriptions[key] = after;
    }
  }
  if (Object.keys(descriptions).length) patch.descriptions = descriptions;

  const origHidden = original.hidden_sections ?? [];
  const draftHidden = draft.hidden_sections ?? [];
  if (JSON.stringify(origHidden) !== JSON.stringify(draftHidden)) {
    patch.hiddenSections = draftHidden;
  }

  if (pendingImages.length) {
    patch.images = pendingImages.map((img) => ({ kind: "field", ...img }));
  }

  return Object.keys(patch).length ? patch : null;
}

// Extracts inline base64 data-URL images embedded in Markdown (produced by
// RichTextEditor -> htmlToMarkdown) into real uploadable files, rewriting the
// Markdown to reference the eventual public path. Pure function, no I/O.
const DATA_IMAGE_RE = /!\[([^\]]*)\]\(data:([^;]+);base64,([^)]+)\)/g;

function extFromMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function extractInlineImages(descriptions, slug) {
  const rewritten = {};
  const images = [];
  let counter = 0;
  for (const [key, text] of Object.entries(descriptions ?? {})) {
    rewritten[key] = text.replace(DATA_IMAGE_RE, (match, alt, mime, base64) => {
      counter += 1;
      const filename = `inline-${Date.now()}-${counter}.${extFromMime(mime)}`;
      images.push({ filename, base64 });
      return `![${alt}](/images/projects/${slug}/${filename})`;
    });
  }
  return { descriptions: rewritten, images };
}
