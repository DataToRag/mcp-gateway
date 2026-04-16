import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  order: number;
  section: string;
  content: string;
  html: string;
}

let pagesCache: DocPage[] | null = null;
const pagesBySlug = new Map<string, DocPage>();

export function getAllDocs(): DocPage[] {
  if (pagesCache) return pagesCache;

  if (!fs.existsSync(DOCS_DIR)) return [];

  pagesCache = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parsePage(f.replace(/\.md$/, "")))
    .filter((p): p is DocPage => p !== null)
    .sort((a, b) => a.order - b.order);

  for (const page of pagesCache) pagesBySlug.set(page.slug, page);
  return pagesCache;
}

export function getDocBySlug(slug: string): DocPage | null {
  if (!pagesCache) getAllDocs();
  return pagesBySlug.get(slug) ?? null;
}

export function getDocsBySection(section: string): DocPage[] {
  return getAllDocs().filter((p) => p.section === section);
}

function parsePage(slug: string): DocPage | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    order: data.order ?? 99,
    section: data.section ?? "general",
    content,
    html,
  };
}
