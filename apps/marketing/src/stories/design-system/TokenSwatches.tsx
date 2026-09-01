import type { Swatch } from "./tokens";

/**
 * One labelled block per token, painted with the real utility class.
 *
 * The class has to be written out literally — Tailwind scans source text, so a
 * template-built `bg-${name}` would never be emitted and every swatch would
 * come back transparent. `tokens.ts` therefore stores whole class strings.
 */
export function TokenSwatches({
  title,
  swatches,
}: {
  title: string;
  swatches: Swatch[];
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-headline text-h5 text-text-heading">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {swatches.map((swatch) => (
          <div key={swatch.className} className="flex flex-col gap-1">
            <div
              data-testid={swatch.className}
              className={`h-14 w-full rounded-input border border-border-subtle ${swatch.className}`}
            />
            <code className="font-body text-caption text-text-default">
              {swatch.className}
            </code>
            <span className="font-body text-caption text-text-secondary">
              {swatch.figma ?? "no Figma variable"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
