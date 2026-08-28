import { Heading } from "@pbh/ui";

/**
 * The masthead on the account page (Figma 2092:13093 / 2092:13094): 48px Larken
 * over a 20px body line, white on `cta-section/bg-color` #006e8a — which is
 * `primary` — at the 12px card radius.
 *
 * `as="h1"` even though Figma names the style "Heading / H2": that is a type
 * ramp entry, not a document outline, and nothing else on the page is an `h1`.
 *
 * The 40px frame Figma draws around this block is the page gutter, applied by
 * `/profile` rather than repeated here. No props — one caller, fixed copy; if
 * `/dashboard` ever needs a matching masthead, generalise it then.
 */
export function AccountSettingsBanner() {
  return (
    <div className="rounded-xl bg-brand-default px-6 py-12 text-brand-on-brand md:px-10 md:py-20">
      {/* `Heading` hardcodes `text-ink-strong` and `leading-[1.15]`; `cn` is
          tailwind-merge, so both overrides below win. */}
      <Heading as="h1" size="lg" className="leading-[1.06] text-brand-on-brand">
        Account Settings
      </Heading>
      <p className="mt-4 font-body text-lg leading-[1.2] md:text-xl">
        Manage your profile information and subscription.
      </p>
    </div>
  );
}
