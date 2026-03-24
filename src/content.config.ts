import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';


const works = defineCollection({
  loader: glob({
    pattern: '**/index.mdoc',
    base: "./src/content/works",
    generateId: ({ entry }) => entry.replace('/index.mdoc', ''),
  }),
  schema: z.object({
    title: z.string(),
    desc: z.string().optional().default(''),
    keywords: z.string().optional().default(''),
    cover: z.string().optional().default(''),
    media: z.array(z.string()).optional().nullable(),
    tags: z.array(z.string().optional().default('')).optional().nullable(),
    pinned: z.boolean().optional().default(false),
  }),
});

const updates = defineCollection({
  loader: glob({
    pattern: '**/index.mdoc',
    base: "./src/content/news",
    generateId: ({ entry }) => entry.replace('/index.mdoc', ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(), 
   }),
});

const bio = defineCollection({
  loader: glob({
    pattern: 'index.mdoc',
    base: './src/content/bio',
    generateId: () => 'bio',
  }),
  schema: z.object({
    title: z.string().optional().default('Bio'),
  }),
});

const pinned = defineCollection({
  loader: glob({
    pattern: 'index.yaml',
    base: './src/content/pinned',
    generateId: () => 'pinned',
  }),
  schema: z.object({
    works: z.array(z.string()).optional().default([]),
  }),
});

// Export all collections
export const collections = { works, updates, bio, pinned };