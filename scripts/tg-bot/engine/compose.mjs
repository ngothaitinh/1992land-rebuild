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
