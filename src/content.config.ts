import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { tryParse } from './lib/fuzzyDate';
import type { FuzzyDateJSON } from './lib/fuzzyDateFormat';
 
/**
 * Fuzzy date fields for frontmatter.
 *
 * Both store the plain JSON shape rather than the FuzzyDate instance: Astro
 * persists collection data to a build cache, and class instances do not
 * survive that round trip.
 */
 
// YAML is helpful in unhelpful ways. `period: 2023` arrives as a number and an
// unquoted `period: 2023-05-14` arrives as a Date. Normalise both back to text.
const rawFuzzy = z.union([z.string(), z.number(), z.date()]);
 
function toText(value: string | number | Date): string {
  return value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).trim();
}
 
function parseOrIssue(text: string, ctx: z.RefinementCtx) {
  const parsed = tryParse(text);
  if (!parsed) {
    ctx.addIssue({
      code: 'custom',
      message:
        `"${text}" is not a date expression I can parse ` +
        `(try 2023, 2025 Q2, Dec 2019, 2020M1, or 2023-2024)`,
    });
    return z.NEVER;
  }
  return parsed.toJSON();
}
 
/** Required. A missing or blank value fails the build. */
export const fuzzyDate = rawFuzzy.transform((value, ctx) => {
  const text = toText(value);
  if (!text) {
    ctx.addIssue({ code: 'custom', message: 'a date expression is required' });
    return z.NEVER;
  }
  return parseOrIssue(text, ctx);
});
 
/**
 * Optional. Resolves to `null` when the key is missing, when it is explicitly
 * null (`period:` with nothing after it), or when it is an empty string.
 *
 * A value that is present but unparseable still fails the build. That is a
 * typo rather than an omission, and quietly nulling it would hide the mistake
 * exactly where you would never look for it.
 */
export const optionalFuzzyDate = rawFuzzy
  .nullish()
  .transform((value, ctx): FuzzyDateJSON | null => {
    if (value === null || value === undefined) return null;
    const text = toText(value);
    if (!text) return null;
    return parseOrIssue(text, ctx);
  });
 
const works = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: "./src/content/works",
    generateId: ({ entry }) => entry.replace('/index.md', ''),
  }),
  schema: z.object({
    title: z.string(),
    desc: z.string().optional().default(''),
    period: optionalFuzzyDate,
    keywords: z.string().optional().default(''),
    cover: z.string().optional().default(''),
    media: z.array(z.string()).optional().nullable(),
    tags: z.array(z.string().optional().default('')).optional().nullable(),
  }),
});

const updates = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: "./src/content/news",
    generateId: ({ entry }) => entry.replace('/index.md', ''),
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
    pattern: 'index.md',
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