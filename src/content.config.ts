import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';


const works = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: "./src/content/works",
    generateId: ({ entry }) => entry.replace('/index.md', ''),
  }),
  schema: z.object({
    title: z.string(),
    cover: z.string().optional().default(''),
    media: z.array(z.string()).optional().nullable(),
    tags: z.array(z.string().optional().default('')).optional().nullable(),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(), 
   }),
});

// Export all collections
export const collections = {works, updates};