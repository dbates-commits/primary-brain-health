import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const here = dirname(fileURLToPath(import.meta.url));

/** The `"use server"` modules we swap out, without their extensions. */
const BOOKING_ACTIONS = resolve(here, '../src/components/booking/actions');
const BOOKING_ACTIONS_MOCK = resolve(
  here,
  '../src/stories/booking/booking-actions.mock.ts',
);
const LOGIN_ACTIONS = resolve(here, '../src/app/login/actions');
const LOGIN_ACTIONS_MOCK = resolve(
  here,
  '../src/stories/layout/login-actions.mock.ts',
);
const SIGN_OUT = resolve(here, '../src/app/welcome/sign-out');
const SIGN_OUT_MOCK = resolve(here, '../src/stories/layout/sign-out.mock.ts');

/**
 * Resolve an import specifier to an absolute path the same way the app does,
 * so a module can be matched however it was written — `./actions` from a
 * sibling, or `@/app/login/actions` from anywhere.
 */
function resolveSpecifier(source: string, importer: string): string | null {
  if (source.startsWith('@/')) {
    return resolve(here, '../src', source.slice(2));
  }
  if (source.startsWith('.')) {
    return resolve(dirname(importer), source);
  }
  return null;
}

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
        if (!importer) {
          return null;
        }
        // Compare resolved paths rather than the specifier: `./actions` is
        // written by more than one module here (there is a `payment/actions`
        // too), and only these exact files should be swapped.
        const target = resolveSpecifier(source, importer);
        if (!target) {
          return null;
        }
        // These modules are imported statically by components that have no
        // prop seam to inject around — they *are* the wiring. Both are
        // `"use server"` and pull next/headers, the database, Stripe, Resend
        // or Auth.js, none of which can be bundled for the browser. Storybook
        // builds only; the app is untouched.
        if (target === BOOKING_ACTIONS) {
          return BOOKING_ACTIONS_MOCK;
        }
        if (target === LOGIN_ACTIONS) {
          return LOGIN_ACTIONS_MOCK;
        }
        if (target === SIGN_OUT) {
          return SIGN_OUT_MOCK;
        }
        return null;
      },
    });
    return viteConfig;
  },
};
export default config;
