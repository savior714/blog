import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { title, description, pubDate, category, content } = data;

        if (!title || !content) {
            return new Response(JSON.stringify({ message: 'Title and Content are required' }), { status: 400 });
        }

        // Simple slugification
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();

        const fileName = `${slug}.md`;
        const filePath = path.join(process.cwd(), 'src', 'content', 'blog', fileName);

        const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description?.replace(/"/g, '\\"') || ''}"
pubDate: "${pubDate || new Date().toISOString().split('T')[0]}"
category: "${category || 'daily'}"
---

${content}
`;

        await fs.writeFile(filePath, fileContent, 'utf-8');

        return new Response(JSON.stringify({ message: 'Post saved successfully', slug }), { status: 200 });
    } catch (error) {
        console.error('Error saving post:', error);
        return new Response(JSON.stringify({ message: 'Error saving post' }), { status: 500 });
    }
};
