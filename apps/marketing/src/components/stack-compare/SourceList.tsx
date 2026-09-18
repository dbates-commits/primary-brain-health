import type { Source } from "./stack-compare-model";

/** A repo path is not a link; an external claim is. */
function isExternal(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

/**
 * Where a row's claims come from.
 *
 * Every row has one. This is the part that makes the page survive contact with
 * someone who disagrees with it — and the reason a vendor's own page is marked
 * as such rather than quietly cited as though it were neutral.
 */
export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <div className="border-t border-border-subtle pt-3">
      <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
        Where this comes from
      </h3>
      <ul className="mt-1.5 flex flex-col gap-1">
        {sources.map((source) => (
          <li key={source.href} className="text-[11px] text-text-tertiary">
            {isExternal(source.href) ? (
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="text-brand-default underline"
              >
                {source.label}
              </a>
            ) : (
              <code className="rounded bg-background-warm px-1 py-0.5">{source.label}</code>
            )}
            {source.vendor ? <span> · HubSpot’s own documentation</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
