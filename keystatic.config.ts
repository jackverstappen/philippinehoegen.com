import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },

  collections: {
    works: collection({
      label: 'Works',
      slugField: 'title',
      path: 'src/content/works/*/',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),

        cover: fields.image({
          label: 'Cover Image',
          directory: 'src/content/works',
          publicPath: './',
        }),

        media: fields.array(
          fields.image({
            label: 'Image',
            directory: 'src/content/works',
            publicPath: './',
          }),
          {
            label: 'Gallery Images',
            itemLabel: props => props.value?.filename ?? 'Image',
          }
        ),

        tags: fields.multiselect({
          label: 'Tags',
          options: [
            { label: 'Works',            value: 'works' },
            { label: 'Exhibition',       value: 'exhibition' },
            { label: 'Research',         value: 'research' },
            { label: 'Display',          value: 'display' },
            { label: 'Border',           value: 'border' },
            { label: 'Capture',          value: 'capture' },
            { label: 'House',            value: 'house' },
            { label: 'Image & Word',     value: 'image_and_word' },
            { label: 'Agent & Informer', value: 'agent_and_informer' },
          ],
        }),

        description: fields.document({
          label: 'Description',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),

    news: collection({
      label: 'News & Updates',
      slugField: 'title',
      path: 'src/content/news/*/',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
        pubDate: fields.date({
          label: 'Publication Date',
          defaultValue: { kind: 'today' },
        }),
        updatedDate: fields.date({
          label: 'Updated Date',
        }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'src/content/news',
            publicPath: './',
          },
        }),
      },
    }),
  },
});
