interface EmailPreviewCardProps {
  slug: string;
  name: string;
  subject: string;
  trigger: string;
  /** Fully rendered email document, injected via iframe srcDoc. */
  html: string;
}

/**
 * One template's preview: metadata header plus the rendered email at desktop
 * and phone widths. The iframes isolate the email's own styles from the app.
 */
export function EmailPreviewCard({
  slug,
  name,
  subject,
  trigger,
  html,
}: EmailPreviewCardProps) {
  return (
    <section id={slug} className="scroll-mt-6">
      <div className="rounded-2xl bg-background-default p-6 shadow-sm">
        <h2 className="font-headline text-xl text-ink-strong">{name}</h2>
        <p className="mt-1 text-sm text-text-default">
          <span className="font-semibold">Subject:</span> {subject}
        </p>
        <p className="mt-1 text-sm text-text-default">{trigger}</p>
        <div className="mt-4 flex flex-wrap gap-6">
          <figure className="min-w-0">
            <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-default">
              Desktop
            </figcaption>
            <iframe
              srcDoc={html}
              title={`${name} — desktop`}
              className="h-[640px] w-[640px] max-w-full rounded-lg border border-outline-variant bg-background-warm"
            />
          </figure>
          <figure className="min-w-0">
            <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-default">
              Phone
            </figcaption>
            <iframe
              srcDoc={html}
              title={`${name} — phone`}
              className="h-[640px] w-[375px] max-w-full rounded-lg border border-outline-variant bg-background-warm"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
