import fs from "fs";
import path from "path";
import type { Project, Post } from "./data";

const PROJECTS_DIR = path.join(process.cwd(), "data/projects");
const POSTS_DIR = path.join(process.cwd(), "data/posts");

export function loadProjects(): Project[] {
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"));
  const items = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf8")) as Project & { order?: number }
  );
  return items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

// Simple YAML-line parser for frontmatter (handles key: value and key: "quoted value")
function parseLine(line: string): [string, string] | null {
  const idx = line.indexOf(": ");
  if (idx === -1) return null;
  const key = line.slice(0, idx).trim();
  const raw = line.slice(idx + 2).trim();
  // strip surrounding quotes
  const val = raw.replace(/^["']|["']$/g, "");
  return [key, val];
}

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content.trim() };

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = parseLine(line);
    if (pair) meta[pair[0]] = pair[1];
  }
  return { meta, body: match[2].trim() };
}

export function loadPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const items = files.map((f) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const post: Post = {
      slug: meta.slug ?? f.replace(".md", ""),
      title: meta.title ?? "",
      excerpt: meta.excerpt ?? "",
      date: meta.date ?? "",
      category: meta.category ?? "",
      readTime: meta.readTime ?? "",
      body,
    };
    if (meta.hero_image) post.hero_image = meta.hero_image;
    if (meta.related_projects) post.related_projects = meta.related_projects.split(",").map((s: string) => s.trim());
    return post;
  });
  // Sort by date descending
  return items.sort((a, b) => (a.date > b.date ? -1 : 1));
}
