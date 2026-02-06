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

        // Improved slugification (supporting Korean and English)
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/ /g, '-')
            .replace(/[^\w\s-\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g, '');

        const fileName = `${slug || 'unnamed-post'}.md`;
        const filePath = path.join(process.cwd(), 'src', 'content', 'blog', fileName);

        console.log('Attempting to save to:', filePath);

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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error saving post:', errorMessage);
        return new Response(JSON.stringify({
            message: 'Error saving post',
            details: errorMessage,
            path: process.cwd()
        }), { status: 500 });
    }
};
