import { notFound } from "next/navigation";
import { renderEmail } from "@pbh/emails";
import { InternalTabs } from "@/components/internal/InternalTabs";
import { internalPagesHidden } from "@/lib/internal-gate";
import { EmailPreviewCard } from "./EmailPreviewCard";
import { emailPreviews } from "./preview-registry";

// Evaluate the gate per request (and skip build-time prerendering entirely).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Email templates — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * Stakeholder preview of every transactional email template, rendered from
 * `@pbh/emails` with the same sample data as the react-email dev preview.
 * Available on dev/preview deployments behind the shared password; hidden in
 * production unless INTERNAL_PAGES_ENABLED=1 is set.
 */
export default async function EmailsPreviewPage() {
  if (internalPagesHidden()) {
    notFound();
  }

  const rendered = await Promise.all(
    emailPreviews.map(async (preview) => ({
      ...preview,
      html: (await renderEmail(preview.element)).html,
    })),
  );

  return (
    // Full-bleed, like the other internal tabs: switching between them should
    // not make the site header appear and disappear.
    <div className="fixed inset-0 z-50 overflow-auto bg-background-warm px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-widest text-brand-default uppercase">
          Primary Brain Health · internal
        </p>
        <h1 className="mt-1 font-headline text-3xl text-text-heading">Email templates</h1>
        <p className="mt-1 mb-4 max-w-2xl text-body-sm text-text-default">
          Every transactional email the site sends, rendered with sample data. These are live
          previews of the actual templates — what ships is what you see here.
        </p>
        <InternalTabs active="/internal/emails" />
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-body-sm">
          {rendered.map((preview) => (
            <a
              key={preview.slug}
              href={`#${preview.slug}`}
              className="text-brand-default underline"
            >
              {preview.name}
            </a>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-10">
          {rendered.map((preview) => (
            <EmailPreviewCard
              key={preview.slug}
              slug={preview.slug}
              name={preview.name}
              subject={preview.subject}
              trigger={preview.trigger}
              html={preview.html}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
