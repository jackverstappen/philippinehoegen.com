// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Slim replacement for @keystatic/astro that only sets up the virtual-module
// Vite plugin — route injection is handled by our own src/pages files instead,
// which avoids the Astro-5 injectRoute collision and the base-path mismatch.
/** @returns {import('astro').AstroIntegration} */
function keystatic_vite_only() {
  return {
    name: 'keystatic-vite-only',
    hooks: {
      'astro:config:setup'({ updateConfig, config }) {
        const dotAstroDir = new URL('./.astro/', config.root);
        mkdirSync(fileURLToPath(dotAstroDir), { recursive: true });
        writeFileSync(
          fileURLToPath(new URL('keystatic-imports.js', dotAstroDir)),
          `import "@keystatic/astro/ui";\nimport "@keystatic/astro/api";\nimport "@keystatic/core/ui";\n`
        );
        updateConfig({
          // Keystatic's React app redirects localhost → 127.0.0.1 at runtime.
          // Ensure the dev server is bound to 127.0.0.1 so that redirect lands.
          server: config.server.host ? {} : { host: '127.0.0.1' },
          vite: {
            plugins: [
              {
                name: 'keystatic-virtual-config',
                resolveId(id) {
                  if (id === 'virtual:keystatic-config') {
                    return this.resolve('./keystatic.config', import.meta.url);
                  }
                },
              },
            ],
            optimizeDeps: {
              entries: ['keystatic.config.*', '.astro/keystatic-imports.js'],
            },
          },
        });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  prefetch: true,

  // The Node adapter is required in dev so Keystatic's SSR routes
  // (src/pages/keystatic/ and src/pages/api/keystatic/) can handle
  // local-mode file I/O. The portfolio pages themselves are all static
  // (prerendered) and deploy to GitHub Pages unchanged.
  adapter: node({ mode: 'standalone' }),

  site: 'https://digitizedbeing.com',
  base: '/philippinehoegen.com',

  integrations: [sitemap(), react(), keystatic_vite_only()],
  vite: {
    // Force Vite to pick the Node.js conditional export of @keystatic/core
    // packages in SSR context. Without this Vite resolves the edge/default
    // build which stubs out local-mode file I/O with a 500 error.
    ssr: {
      resolve: {
        conditions: ['node', 'import', 'module'],
      },
    },
  },
});