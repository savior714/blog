import { z, defineCollection } from 'astro:content';

const casesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    tag: z.enum(['Local LLM', 'Vibe Coding', 'Local AI']),
    title: z.string(),
    summary: z.string(),
    thumbnail: z.string().optional(),
    youtubeUrl: z.string().optional(),
    publishedAt: z.string(),
  }),
});

export const collections = {
  cases: casesCollection,
};
