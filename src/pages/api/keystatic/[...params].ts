export const prerender = false;

import { makeHandler } from '@keystatic/astro/api';
import type { APIContext } from 'astro';
import config from '../../../../keystatic.config';

const BASE = '/philippinehoegen.com';
const keystaticHandler = makeHandler({ config });

// Keystatic's internal URL parser strips /api/keystatic/ from the start of
// the pathname using a hard-coded regex. With Astro's `base` option our path
// may include /philippinehoegen.com/api/keystatic/..., so we strip the base
// prefix if present before handing off to the Keystatic handler.
export const ALL = (context: APIContext) => {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith(BASE)) {
    url.pathname = url.pathname.slice(BASE.length);
  }
  const patchedRequest = new Request(url.toString(), context.request);
  return keystaticHandler({ ...context, request: patchedRequest });
};
