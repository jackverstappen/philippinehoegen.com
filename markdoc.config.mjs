import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    details: {
      render: component('./src/components/markdoc/Details.astro'),
      attributes: {
        summary: { type: String, required: true },
      },
    },
  },
});
