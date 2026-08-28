/**
 * The account menu's navigation items (Figma 1917:7808), shared by the desktop
 * dropdown and the mobile drawer so the two can't drift.
 *
 * `Dashboard` is still a placeholder — that screen has never been built, and an
 * in-page fragment is deliberate: a real route would 404. Point it at the page
 * when it lands, the way `Profile` now points at `/profile`.
 */
export const USER_MENU_LINKS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Profile", href: "/profile" },
] as const;

/**
 * Menu-item styling from the design: 160px wide, 12px/10px padding, 8px
 * radius, and the brand-subtle fill with brand text on the highlighted item.
 * Figma names that fill `background/brand-subtle` #eff6f9, which has no token
 * here — it is `primary` at 6% over white to within a hex step, so it is
 * expressed that way rather than by adding a token for one hover state.
 *
 * A class string because the items are a mix of anchors and a submit button,
 * each with its own element and props.
 */
export const userMenuItemClass =
  "flex w-40 items-center rounded-lg px-3 py-2.5 text-left font-body text-body font-medium text-ink-strong transition-colors hover:bg-brand-default/6 hover:text-brand-default focus-visible:bg-brand-default/6 focus-visible:text-brand-default focus:outline-none";
