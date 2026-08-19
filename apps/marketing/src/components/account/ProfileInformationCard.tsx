import { AccountCard } from "./AccountCard";

/**
 * TODO: Profile Information — Figma 2092:13144. Heading and sub-copy over a
 * rule, then a two-column grid of eight text fields (first/last name, email,
 * phone, year of birth, gender, ZIP, education), a second rule, the "receive
 * newsletters" checkbox, a third rule, and Save Changes.
 *
 * Stub: this card's slot in the grid is final. Everything inside, `min-h-*`
 * included, goes when the real card lands.
 */
export function ProfileInformationCard() {
  return (
    <AccountCard className="min-h-[692px]">
      <p className="font-body text-base text-on-surface-variant">
        Profile Information — coming soon.
      </p>
    </AccountCard>
  );
}
