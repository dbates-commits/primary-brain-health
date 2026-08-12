import { Button } from "@pbh/ui";

/**
 * Where a paid customer continues: the Linus Engagement App, which owns login
 * and the assessments themselves. This is the end of our surface — we hand off
 * with a plain link, no token and no session, because the Engagement App
 * authenticates people itself.
 *
 * Read at module scope. `NEXT_PUBLIC_*` is inlined at build time: changing it
 * needs a redeploy, not just an env edit.
 */
const ENGAGEMENT_APP_URL = process.env.NEXT_PUBLIC_ENGAGEMENT_APP_URL ?? "";

/**
 * The post-payment confirmation and the single CTA out to the Engagement App,
 * rendered by the `/welcome` route — the end of our surface.
 *
 * With the URL unset we render the confirmation without a button rather than a
 * disabled one: a dead button reads as a bug to someone who has just paid. The
 * fallback copy promises a follow-up rather than an automated email, because
 * with Linus registration on hold (pbh-ek8) nothing sends one.
 */
export function EngagementAppCta() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col gap-4">
        <h1 className="font-headline text-4xl font-thin text-on-surface sm:text-5xl">
          You&rsquo;re all set 🎉
        </h1>
        <p className="text-xl text-on-surface">
          Your payment is confirmed and we&rsquo;ve saved your details.{" "}
          {ENGAGEMENT_APP_URL
            ? "Continue to your app to start your brain health assessments."
            : "We'll be in touch with how to start your assessments."}
        </p>
      </div>
      {/* Same-tab on purpose: this is the hand-off out of our surface, and a new
          tab would leave a dead marketing tab behind. */}
      {ENGAGEMENT_APP_URL ? (
        <Button href={ENGAGEMENT_APP_URL} color="primary" className="w-full">
          Go to your app
        </Button>
      ) : null}
    </div>
  );
}
