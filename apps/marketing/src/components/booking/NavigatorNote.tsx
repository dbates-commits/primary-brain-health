import { Section } from "@pbh/ui";

/**
 * The Navigator value-prop section (PR #45 item 4).
 *
 * Its own band directly below the booking section, not part of it: the package
 * cards sell what you buy, this answers what the Brain Health Navigator
 * actually does once you have. Light surface on purpose — it breaks the dark
 * `bg-primary` booking band and hands off to the FAQ section, which is also
 * surface-toned.
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

const PROMISE = "your guide, not your gatekeeper";

const BODY =
  "They review your wellness assessment with you, explain what it means in " +
  "plain language, and lay out every path forward — from clinical evaluation " +
  "to lifestyle changes to just checking back in a year. The decision is " +
  "yours; their job is to make sure you're making it with the full picture.";

export function NavigatorNote() {
  return (
    <Section className="bg-surface px-6 py-16 md:px-10 md:py-20">
      <p className="mx-auto max-w-3xl text-pretty text-center text-lg leading-relaxed text-on-surface-variant md:text-xl">
        Your Brain Health Navigator is{" "}
        <span className="font-semibold text-on-surface">{PROMISE}</span>. {BODY}
      </p>
    </Section>
  );
}
