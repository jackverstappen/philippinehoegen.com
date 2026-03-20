// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  prefetch: true,

  site: 'https://digitizedbeing.com',
  base: '/philippinehoegen.com',


  integrations: [sitemap() ],
  experimental: {
    svg: true,
  },
});