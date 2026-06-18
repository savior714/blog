import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve(import.meta.dirname, '../../content/cases');

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  const fm: Record<string, unknown> = {};
  match[1].split('\n').forEach((line) => {
    const sep = line.indexOf(':');
    if (sep === -1) return;
    const key = line.slice(0, sep).trim();
    let val = line.slice(sep + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  });
  return { frontmatter: fm, content: match[2] || '' };
}

function getFiles(): Array<{ slug: string; tag: string; title: string; summary: string; publishedAt: string }> {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
      const { frontmatter } = parseFrontmatter(raw);
      const slug = f.replace(/\.md$/, '');
      return {
        slug,
        tag: String(frontmatter.tag ?? ''),
        title: String(frontmatter.title ?? ''),
        summary: String(frontmatter.summary ?? ''),
        publishedAt: String(frontmatter.publishedAt ?? ''),
      };
    })
    .sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));
}

export const GET: APIRoute = () => {
  try {
    return new Response(JSON.stringify(getFiles()), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
