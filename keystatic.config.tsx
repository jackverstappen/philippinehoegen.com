import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: process.env.NODE_ENV === 'production'
    ? { kind: 'cloud' }
    : { kind: 'local' },

  cloud: {
    project: 'digitizedbeing/philippinehoegen',
  },

  ui: {
    brand: {
      name: 'philippinehoegen.com',
      
      mark: ({ colorScheme }) => 
        <svg
					height={16}
					width={16}
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 65 65"
				>
					<path
						fill="currentColor"
						d="M39.445 25.555 37 17.163 65 0 47.821 28l-8.376-2.445Zm-13.89 0L28 17.163 0 0l17.179 28 8.376-2.445Zm13.89 13.89L37 47.837 65 65 47.821 37l-8.376 2.445Zm-13.89 0L28 47.837 0 65l17.179-28 8.376 2.445Z"
					></path>
				</svg>
        /*
        {
        let path = colorScheme === 'dark'
          ? '//images/dark-logo.png'
          : '//images/dark-logo.png';
        
        return <img src={path} height={24} />
      }*/
        ,
      
    },
  },

  collections: {
    works: collection({
      label: 'Works',
      slugField: 'title',
      path: 'src/content/works/*/',
      entryLayout: 'content',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        desc: fields.text({
          label: 'meta description',
          multiline: true
        }),
        keywords: fields.text({
          label: 'meta keywords',
          multiline: false
        }),
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
      entryLayout: 'content',
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
        cover: fields.image({
          label: 'Cover Image',
          directory: 'src/content/news',
          publicPath: './',
        }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'src/content/news',
            publicPath: '../',
          },
        }),
      },
    }),
  },
});
