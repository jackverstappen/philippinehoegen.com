import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';


const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    cover: z.string().optional().default(''),
    media: z.array(z.string()).optional().nullable(),
    tags: z.array(z.string().optional().default('')).optional().nullable(),
  }),
});

// Export all collections
export const collections = {works};