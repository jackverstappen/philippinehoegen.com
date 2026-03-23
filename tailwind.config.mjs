/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdoc,ts,tsx}'],

  theme: {
    // Standardise on em-based breakpoints matching the site's existing layout points.
    // sm=480px (30em), md=704px (44em), lg=800px (50em)
    screens: {
      sm:  '480px',
      md:  '704px',
      lg:  '800px',
      xl:  '1024px',
    },

    extend: {
      // Color tokens — reference existing CSS custom properties so both
      // Tailwind utilities and scoped var() references stay in sync.
      colors: {
        ink:          'var(--color-text)',                   // #000
        muted:        'var(--color-text-alt)',               // #6a6a6a
        faded:        'var(--color-faded)',                  // #c9c9c9
        canvas:       'var(--color-bg)',                     // #fff
        surface:      'var(--color-background-primary)',     // #f4f4f4
        'surface-alt':'var(--color-background-secondary)',   // #ebebeb
        rim:          'var(--border-color)',                 // #ccc
        'rim-bold':   'var(--color-border-secondary)',       // #000
        'rim-soft':   'var(--color-border-tertiary)',        // rgba(0,0,0,0.1)
        accent:       'var(--color-border-info)',            // #378add
        placeholder:  'var(--color-placeholder)',            // #f8f8f8
      },

      fontFamily: {
        sans: ['var(--sans-serif)'],
      },

      fontSize: {
        s:  ['var(--font-size-s)',  { lineHeight: '1.4' }],
        l:  ['var(--font-size-l)',  { lineHeight: '1.3' }],
        xl: ['var(--font-size-xl)', { lineHeight: '1.2' }],
      },

      borderRadius: {
        sm:   '3px',
        md:   'var(--border-radius-md)',   // 6px
        lg:   'var(--border-radius-lg)',   // 12px
        full: '9999px',
      },

      // Spacing uses Tailwind v3 defaults (4px scale).
      // 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px
      // No additions needed — the default scale covers every value in the site.
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ],
};
