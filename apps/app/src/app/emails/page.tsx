import { notFound } from "next/navigation";
import { renderEmail } from "@pbh/emails";
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
 * Available on dev/preview deployments; hidden in production unless
 * EMAIL_PREVIEW_ENABLED=1 is set.
 */
export default async function EmailsPreviewPage() {
  const hidden =
    process.env.VERCEL_ENV === "production" &&
    process.env.EMAIL_PREVIEW_ENABLED !== "1";
  if (hidden) {
    notFound();
  }

  const rendered = await Promise.all(
    emailPreviews.map(async (preview) => ({
      ...preview,
      html: (await renderEmail(preview.element)).html,
    })),
  );

  return (
    <main className="min-h-screen bg-surface-container-low px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-headline text-3xl text-on-surface">
          Email templates
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Every transactional email the funnel sends, rendered with sample
          data. These are live previews of the actual templates — what ships is
          what you see here.
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {rendered.map((preview) => (
            <a
              key={preview.slug}
              href={`#${preview.slug}`}
              className="text-primary underline"
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
    </main>
  );
}
