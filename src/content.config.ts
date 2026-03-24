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
  }),
});

const archive = defineCollection({
  loader: glob({
    pattern: '**/index.mdoc',
    base: "./src/content/archive",
    generateId: ({ entry }) => entry.replace('/index.mdoc', ''),
  }),
  schema: z.object({
    title: z.string(),
    desc: z.string().optional().default(''),
    keywords: z.string().optional().default(''),
    cover: z.string().optional().default(''),
    media: z.array(z.string()).optional().nullable(),
    tags: z.array(z.string().optional().default('')).optional().nullable(),
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

// Export all collections
export const collections = {archive, works, updates};