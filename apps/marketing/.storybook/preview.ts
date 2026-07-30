import type { Preview } from '@storybook/nextjs-vite'
// The app loads Inter via `next/font/google` in `layout.tsx`, which sets the
// `--font-inter` variable on <body>. @storybook/nextjs-vite has no next/font
// support, so Storybook self-hosts the same family here and defines the variable
// in `preview-head.html`. Without both, `--font-body` falls back to system-ui and
// every story renders in the wrong typeface.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;