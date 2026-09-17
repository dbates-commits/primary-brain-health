import { Button } from "./Button";
import { cn } from "./utils";

/**
 * The cookie-consent banner: a bar pinned to the bottom of the viewport with
 * the disclosure and two explicit choices.
 *
 * Presentation only — it neither reads nor writes the stored choice, and it has
 * no opinion about when it should be on screen. The caller owns the consent
 * state (see the marketing app's `CookieConsent`), which keeps this renderable
 * in a story and keeps the storage rules in one place rather than one per
 * consumer.
 *
 * There is deliberately no dismiss affordance beyond the two buttons. Closing a
 * consent prompt without answering it is the pattern the MHMDA opt-in bar
 * rejects: silence is not consent, so the only ways out are Accept and Decline.
 *
 * `role="dialog"` with `aria-modal` absent: the page stays usable behind it, so
 * announcing it as modal would lie to a screen reader.
 */
export function CookieConsentBanner({
  title,
  body,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
  className,
}: {
  title: string;
  /** The disclosure itself. A node, so the copy can carry a policy link. */
  body: React.ReactNode;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}) {
  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-background-default shadow-toast",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-12">
        <div className="space-y-1">
          <h2
            id="cookie-consent-title"
            className="font-body text-heading-small font-bold text-text-heading"
          >
            {title}
          </h2>
          <div className="font-body text-body-sm text-text-secondary">{body}</div>
        </div>
        {/* Decline first in the DOM so the privacy-preserving choice is the one
            keyboard and screen-reader users reach first, and neither button is
            styled to out-shout the other — a decline that is harder to find
            than the accept is the dark pattern the MHMDA consent bar fails. */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button variant="outline" color="dark" onClick={onDecline}>
            {declineLabel}
          </Button>
          <Button color="primary" onClick={onAccept}>
            {acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
