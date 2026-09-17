import { defineConfig } from "vitest/config";

/**
 * `server-only` is a build-time marker: it resolves to an empty module under
 * React's `react-server` condition and to a module that throws everywhere else,
 * which is how a client component importing a server module fails loudly. Under
 * plain Node — which is what these tests are — that throw fires on import, so a
 * `server-only` module cannot be unit tested at all without this.
 *
 * Aliased rather than resolved through `conditions: ["react-server"]`: the alias
 * says exactly what it neutralises, where the condition would quietly change how
 * every other package in the graph resolves, React included.
 */
export default defineConfig({
  resolve: {
    alias: { "server-only": new URL("./test/server-only-stub.ts", import.meta.url).pathname },
  },
});
