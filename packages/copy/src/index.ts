/**
 * `@pbh/copy` — the shared clinical/wellness lexicon and the `track` axis every
 * track-sensitive surface branches on. Imported by both apps, `@pbh/booking`
 * and `@pbh/emails`, so it deliberately has NO runtime dependencies: it is
 * plain data plus a resolver, safe in a server component, a client component,
 * and a react-email template alike.
 *
 * See docs/sow2/technical/track-copy-mapping-plan.md.
 */
export * from "./track";
export * from "./lexicon";
export * from "./resolve";
export * from "./banned-terms";
