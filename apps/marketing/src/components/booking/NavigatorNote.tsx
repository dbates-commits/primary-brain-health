import { Section } from "@pbh/ui";

/**
 * The Navigator value-prop section (PR #45 item 4).
 *
 * Its own band directly below the booking section, not part of it: the package
 * cards sell what you buy, this answers what the Brain Health Navigator
 * actually does once you have.
 *
 * Styled to match `BenefitsList` ("What You Gain") — same mint band, same
 * headline treatment — so the two read as one family rather than two
 * one-offs. The mint is a raw hex there too; `@pbh/tokens` has no token for it
 * (the `surface-container` family is warm grey). If a third section wants it,
 * promote it to a token rather than pasting the hex a third time.
 *
 * Kept a standalone component because its final home is still open: David
 * offered "near the pricing cards" or "How it works", so relocating it should
 * be moving one JSX element, not re-typing copy.
 *
 * The copy names the clinical track ("from clinical evaluation to…") on what is
 * a wellness surface, and that is intentional — the point is that every path is
 * laid out, clinical included. It passes the banned-terms sweep because
 * `/\bclinicians?\b/i` matches the role noun, not the adjective. Don't "fix" it.
 */

const TITLE = "Your Brain Health Navigator is your guide, not your gatekeeper.";

const BODY =
  "They review your wellness assessment with you, explain what it means in " +
  "plain language, and lay out every path forward — from clinical evaluation " +
  "to lifestyle changes to just checking back in a year. The decision is " +
  "yours; their job is to make sure you're making it with the full picture.";

export function NavigatorNote() {
  return (
    <Section
      className="bg-mint-subtle px-6 py-20 md:px-10 md:py-28"
      stagger={90}
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Smaller than BenefitsList's headline scale on purpose: that one
            heads a section with three words, this is a full sentence. */}
        <h2
          data-scroll-item
          className="text-balance font-headline text-3xl font-thin leading-[1.15] text-ink-strong md:text-4xl"
        >
          {TITLE}
        </h2>
        <p
          data-scroll-item
          className="mx-auto mt-5 max-w-2xl text-pretty text-body leading-relaxed text-text-default md:text-lg"
        >
          {BODY}
        </p>
      </div>
    </Section>
  );
}
