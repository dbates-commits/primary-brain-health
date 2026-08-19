import { AccountCard } from "./AccountCard";

/**
 * TODO: Delete Account — Figma 2092:13184. Heading and sub-copy over a rule,
 * then the destructive button. `@pbh/ui`'s `Button` has no `danger` colour yet
 * (Figma uses `colors/pink/600` #d60012); adding one is part of this card.
 *
 * Stub: this card's slot in the grid is final. Everything inside, `min-h-*`
 * included, goes when the real card lands.
 */
export function DeleteAccountCard() {
  return (
    <AccountCard className="min-h-[232px]">
      <p className="font-body text-base text-on-surface-variant">
        Delete Account — coming soon.
      </p>
    </AccountCard>
  );
}
