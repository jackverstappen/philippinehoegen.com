import { config, collection, fields, singleton } from '@keystatic/core';

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
        
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 160 160">
  
  <g>
    <path fill="#f4f4f4"
        stroke="#000000"
        stroke-width="8" d="M53.26,140.25c-4.96,0-9.59-2.67-12.07-6.97l-26.74-46.31c-2.48-4.3-2.48-9.64,0-13.94l26.74-46.31c2.48-4.3,7.11-6.97,12.07-6.97h53.48c4.96,0,9.59,2.67,12.07,6.97l26.74,46.31c2.48,4.3,2.48,9.64,0,13.94l-26.74,46.31c-2.48,4.3-7.11,6.97-12.07,6.97h-53.48Z"/>
    <path d="M106.74,20.25c4.79,0,9.25,2.58,11.64,6.72l26.74,46.31c2.39,4.15,2.39,9.3,0,13.44l-26.74,46.31c-2.39,4.15-6.85,6.72-11.64,6.72h-53.48c-4.79,0-9.25-2.58-11.64-6.72l-26.74-46.31c-2.39-4.15-2.39-9.3,0-13.44l26.74-46.31c2.39-4.15,6.85-6.72,11.64-6.72h53.48M106.74,19.25h-53.48c-5.16,0-9.93,2.75-12.51,7.22l-26.74,46.31c-2.58,4.47-2.58,9.97,0,14.44l26.74,46.31c2.58,4.47,7.35,7.22,12.51,7.22h53.48c5.16,0,9.93-2.75,12.51-7.22l26.74-46.31c2.58-4.47,2.58-9.97,0-14.44l-26.74-46.31c-2.58-4.47-7.35-7.22-12.51-7.22h0Z"/>
  </g>
  <g>
    <path d="M58.76,112.68v2.57h-18.53v-2.57l8.07-1.44h1.76l8.71,1.44ZM46.17,79.48c0-3.96-.07-6.15-.22-9.03l-5.68-.65v-2.54l10.04-4.35,1.09.72.57,6.09.29.2v22.48l-.22.46v7.08c0,5.01.07,10.2.22,15.32h-6.3c.14-5.12.22-10.17.22-15.18v-20.6ZM60.96,67c-2.73,0-6.31,1.45-11.4,6.41l-.65-1.29c4.17-6.42,8.86-9.21,13.84-9.21,7.64,0,13.7,6.74,13.7,17.88s-6.39,18.17-14.8,18.17c-4.51,0-8.94-2.11-12.72-9.6l.65-1.16c3.7,4.71,7.08,6.68,10.61,6.68,5.4,0,9.79-4.23,9.79-13.47s-3.76-14.42-9.03-14.42Z"/>
    <path d="M86.67,51.31l-5.89-.72v-2.55l11.03-3.24,1.02.58-.29,10.22v15.21l.22.94v11.16c0,4.46.07,11.88.22,15.12h-6.52c.14-3.24.22-10.66.22-15.12v-31.6ZM97.84,95.46v2.57h-16.7v-2.57l7.85-1.44h1.67l7.18,1.44ZM114.91,76.18v6.73c0,4.61.07,11.88.22,15.12h-6.52c.14-3.24.22-10.51.22-15.12v-6.13c0-6.58-1.68-8.71-5.92-8.71-3.55,0-6.51,1.35-10.55,5.02h-1.57v-3.35h3.73l-3.21,1.34c3.48-4.69,9.27-8.15,14.39-8.15,6.2,0,9.23,3.83,9.23,13.27ZM112.88,94.02l7.19,1.44v2.57h-16.7v-2.57l7.84-1.44h1.67Z"/>
  </g>
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

  singletons: {
    pinnedWorks: singleton({
      label: 'Pinned Works',
      path: 'src/content/pinned/',
      format: { data: 'yaml' },
      schema: {
        works: fields.array(
          fields.relationship({
            label: 'Work',
            collection: 'works',
          }),
          {
            label: 'Pinned Works',
//            itemLabel: (props) => props.value ?? 'Select a work',
            itemLabel: (props) => props.value ?? 'Select a work',
          }
        ),
      },
    }),

    bio: singleton({
      label: 'Bio Page',
      path: 'src/content/bio/',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({
          label: 'Page Title',
          defaultValue: 'Bio',
        }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),
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
