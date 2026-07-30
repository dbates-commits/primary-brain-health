import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const here = dirname(fileURLToPath(import.meta.url));

/** The `"use server"` module we swap out, without its extension. */
const BOOKING_ACTIONS = resolve(here, '../src/components/booking/actions');
const BOOKING_ACTIONS_MOCK = resolve(
  here,
  '../src/stories/booking/booking-actions.mock.ts',
);

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ],
  async viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push({
      name: 'pbh-mock-booking-server-actions',
      // Ahead of the resolvers that would otherwise load the real file.
      enforce: 'pre',
      resolveId(source: string, importer?: string) {
        if (!importer || !source.startsWith('.')) {
          return null;
        }
        // Compare resolved paths rather than the specifier: `./actions` is
        // written by more than one module here (there is a `payment/actions`
        // too), and only this exact file should be swapped.
        if (resolve(dirname(importer), source) !== BOOKING_ACTIONS) {
          return null;
        }
        // `EmailConfirmationStep` imports these actions statically — the module
        // is `"use server"` and pulls next/headers plus @pbh/booking/server
        // (database, Stripe, Resend), none of which can be bundled for the
        // browser, and unlike the step forms it has no prop seam to inject
        // around. Storybook builds only; the app is untouched.
        return BOOKING_ACTIONS_MOCK;
      },
    });
    return viteConfig;
  },
};
export default config;
