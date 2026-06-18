import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve(import.meta.dirname, '../../content/cases');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function formatFrontmatter(fm: Record<string, string>): string {
  const keys = ['tag', 'title', 'summary', 'thumbnail', 'youtubeUrl', 'publishedAt'];
  return keys
    .filter((k) => fm[k] !== undefined && fm[k] !== null && fm[k] !== '')
    .map((k) => `${k}: "${fm[k].replace(/"/g, '\\"')}"`)
    .join('\n');
}

export const POST: APIRoute = async () => {
  try {
    const body = await request.json();
    const { title, tag, summary, publishedAt, content, slug, editSlug } = body;

    if (!title || !tag || !summary || !publishedAt) {
      return new Response(JSON.stringify({ error: 'title, tag, summary, publishedAt required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetSlug = editSlug || slugify(title) || slug;
    const filename = `${targetSlug}.md`;
    const filepath = path.join(CONTENT_DIR, filename);

    const fm: Record<string, string> = { tag, title, summary, publishedAt };
    if (body.thumbnail) fm.thumbnail = body.thumbnail;
    if (body.youtubeUrl) fm.youtubeUrl = body.youtubeUrl;

    const fileContent = `---\n${formatFrontmatter(fm)}\n---\n\n${content || ''}`;

    fs.writeFileSync(filepath, fileContent, 'utf-8');

    return new Response(JSON.stringify({ ok: true, slug: targetSlug }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
