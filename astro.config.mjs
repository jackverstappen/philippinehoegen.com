// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  prefetch: true,
  adapter: cloudflare(),

  site: 'https://digitizedbeing.com',
  base: '/philippinehoegen.com',

  integrations: [sitemap(), react(), keystatic()],
});