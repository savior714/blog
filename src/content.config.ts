import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const casesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    tag: z.enum(['Local LLM', 'Vibe Coding']),
    title: z.string(),
    summary: z.string(),
    thumbnail: z.string().url().or(z.string().startsWith('/')).optional(),
    youtubeUrl: z.string().url().optional(),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = {
  cases: casesCollection,
};
