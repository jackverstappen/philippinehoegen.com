import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';


const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: "./src/data/artists" }),
  schema: z.object({
    name: z.string(),
    stage_name: z.string(),
    genre: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
  }),
});
 
const albums = defineCollection({
  loader: glob({ pattern: '**/*.md', base: "./src/data/albums" }),
  schema: z.object({
    name: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.date(), // e.g. 2024-09-17
    tracks: z.array(z.string()),
    artist: reference('artists'),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: "./src/data/works" }),
  schema: z.object({
    title: z.string(),
    cover: z.string().optional().default(''),
    media: z.array(z.string().optional().default('')).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
  }),
});


// Export all collections
export const collections = {artists, albums, works};