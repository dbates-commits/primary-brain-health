# Design tokens — what code has that Figma doesn't

Synced **2026-08-19** from Figma file `SppKdzsaH6rQ14u90UpNSq` ("Primary Brain
Health"), collections `Primitives` (78), `Colors` (39), `Components` (57) and
`Fonts` (14) — 188 local variables.

`packages/tokens/theme.css` now mirrors Figma's `Primitives`, `Colors` and
`Fonts` under Figma's own names. This file lists what it **can't** mirror,
because Figma has no variable for it, plus the questions the sync raised.

The sync is manual: the Figma plan tier is `starter`, so the [Variables REST
API][rest] is out of reach and the only programmatic access is the Plugin API
with the desktop app open. Re-running the sync means repeating the steps in
`packages/tokens/theme.css`'s header.

[rest]: https://www.figma.com/developers/api#variables

---

## 1. Code-only tokens — Figma has no variable for these

Every one is live in production. They are marked `CODE-ONLY` in `theme.css`.

| value     | code token                  | consumers                                | proposed Figma name                     | note                                                                                                                                                                                                    |
| --------- | --------------------------- | ---------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#ba1a1a` | `--color-error`             | 11 `role="alert"` sites                  | `colors/red/500` → `text/error`         | **Highest priority. Figma has no danger colour at all** — not a ramp, not a single variable, despite the design containing an Error State frame and a payment-failed flow.                              |
| `#75777e` | `--color-outline`           | checkbox border, white-button focus ring | `colors/neutral/650` → `border/control` | Figma's `border/strong` is `#888884`. Adopting it would drop the focus indicator to ≈3.0:1 against white, at the edge of WCAG 2.2 SC 1.4.11's 3:1 minimum — `#75777e` is ≈4.0:1. Not a safe substitute. |
| `#c5c6ce` | `--color-outline-variant`   | 8 hairline dividers                      | `colors/neutral/375`                    | `border/subtle` `#d9d9d9` is visibly lighter.                                                                                                                                                           |
| `#f0eee9` | `--color-warm-100`          | 2 email cards                            | `colors/warm/100`                       | Sits between `colors/warm/50` `#f5f3ee` and nothing.                                                                                                                                                    |
| `#004d61` | `--color-brand-deep`        | consultation-form panel                  | `colors/brand/750`                      |                                                                                                                                                                                                         |
| `#d1eaf2` | `--color-brand-wash`        | scroll-fill logo, 4 watermark SVGs       | `colors/brand/75`                       | **Reads from JS**, not a class — `ScrollFillLogo.tsx:29` does `var(--color-brand-wash)`. Invisible to any class-based scan; dropping it makes the logo transparent.                                     |
| `#8ec7da` | `--color-focus-ring`        | 5 focus rings on pale surfaces           | `colors/brand/250`                      |                                                                                                                                                                                                         |
| `#b3e8e9` | `--color-aqua-container`    | `::selection`, 2 badges                  | `colors/teal/150`                       | Figma tokenises `teal/default` and `teal/subtle` but no container step.                                                                                                                                 |
| `#007577` | `--color-on-aqua-container` | `::selection`, segmented control         | `colors/teal/600`                       |                                                                                                                                                                                                         |

Two more roles Figma doesn't name, though the values exist:

- **Text on the aqua accent.** Code needs it (4 sites); Figma has `brand/on-brand`
  but no `teal/on-teal`. Code currently uses `text/inverse`.
- **A "raised card on brand" surface.** `--color-brand-850` `#224b60` — the value
  _is_ a Figma primitive (`colors/brand/850`), it just has no semantic role.

## 2. Values that changed in this sync

These are live visual changes. Everything else was a pure rename.

| where                                      | was                             | now                                         | Figma variable                                                                                                                                                  |
| ------------------------------------------ | ------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| body text, 68 sites                        | `#44474d`                       | `#45474d`                                   | `text/default` — one digit apart in the red channel; the code value was a transcription drift                                                                   |
| secondary text on the brand panel, 7 sites | `#a3d4e4`                       | `#afd2e3`                                   | `text/inverse-secondary`                                                                                                                                        |
| consent-panel border + one `<hr>`, 2 sites | `#dfdfdf`                       | `#d9d9d9`                                   | `border/subtle`                                                                                                                                                 |
| form-field error ring, 2 sites             | `#d6007f`                       | `#d60012`                                   | `accent/pink` — **magenta → red.** Worth confirming: it now sits much closer to `--color-error` `#ba1a1a`, which is arguably the point, but it is a real change |
| two section backgrounds                    | `#E2EFEF` (hardcoded)           | `#e5efef`                                   | `teal/subtle` — the hardcoded value was never a design value                                                                                                    |
| `@pbh/ui` Card, 4 classes                  | Tailwind `gray-100/200/600/900` | `border-subtle`, `text-default`, `grey-850` | the shared Card had no tokens at all                                                                                                                            |
| "Brain Health" glow + neural texture       | `rgba(68,101,88,…)`             | `color-mix(… var(--color-aqua-default) …)`  | `#446558` is the **retired** forest green; the text it glows behind animates to `--color-aqua-default`                                                          |
| 3 box shadows                              | `rgba(4,22,50,…)`               | `rgba(0,0,0,…)`                             | `#041632` is the **retired** navy. Figma tokenises no shadow, so these are now neutral — matching the 4 shadows that already were                               |

## 3. Questions for Arian

1. **The danger ramp.** §1, row 1. Nothing else blocks Figma being a complete
   source of truth for colour.
2. **Heading colour.** Figma's `text/heading` is `#000000`. Code renders headings
   at `#1b1c19` (`colors/neutral/850`, which the design also binds directly) in
   **94 places** — the largest unreconciled surface. Code was left as-is rather
   than silently turning every heading pure black. Which is right?
3. **The neutral ramp offset.** Figma's `colors/neutral/*` indices sat one step
   above the pre-sync code ramp _at identical values_ — Figma's `neutral/400`
   `#d1d5db` was the code's `neutral-300`. Code has now absorbed Figma's
   numbering. Nothing to do unless Figma renumbers.
4. **Six neutral steps are bound directly, with no semantic role.** `colors/neutral/`
   `100`, `400`, `550`, `600`, `700`, `900` are used straight from `Primitives` on
   the funnel screens. Code mirrors them as `grey-*`. Each is a missing semantic
   name — `#4b5563` and `#6b7280` in particular are used as body copy alongside
   `text/default` `#45474d`, which reads like three greys doing one job.
5. **Light and Dark resolve identically** for all 39 `Colors` variables. There is
   no dark theme; the mode implies support that doesn't exist. Give it real
   values or remove it.
6. **Type scale: no line heights, no weights.** The `Fonts` collection is sizes
   and two families only. `theme.css` pairs the body steps with the line heights
   they render with today and guesses a ratio for the headings — those numbers
   are unverified against the design.
7. **Three sizes in use have no Figma step**: 18px (`Eyebrow`), 30px and 36px
   (the `Heading` responsive ramp), 60px (`Heading` `xl` at `lg:`). The design has
   a single, non-responsive scale, so the breakpoint ramp in `Heading.tsx` and
   `StepHeader.tsx` is a code invention. Should the design specify mobile sizes?
8. **`heading/h1` (56px) is never used in the design**, while `heading/display`
   (80px) appears once and `heading/h2` (48px) 61 times. Is h1 dead?

## 4. Figma variables not yet used in code

Deliberate, not oversights:

- **`Components` (57 variables)** — `button/radius`, `modal/padding`, `nav/gap`,
  `form-field/*`, `section/*`, `FAQs/*`, `footer/*`, `step-card/*`, `hero/*`.
  Spacing and radius are still Tailwind utilities in code. Adopting these means
  touching every padding, gap and radius in the codebase; it is a separate job.
  Note the `Mobile` mode is real here (`section/padding-vertical` halves,
  `modal/padding` drops 32→24) but **no frame in the design selects it**, so the
  Mobile screens render desktop spacing. Any code written from those frames is
  implementing the wrong number.
- **`sizes/*` (41 variables)** — the primitive scale the above alias. 28 of the
  steps have no consumer anywhere.
- **`device`** (STRING, `Components`) — its mode values are inverted (mode
  `desktop` holds `"Mobile"`). An authoring artefact with no code meaning.
- **Unused colour primitives** — `colors/brand/100 #b5ddf2`, `/600 #007dad`,
  `/900 #033246`, `colors/neutral/50 #fafafa`, `colors/teal/100 #a0e6ea`,
  `colors/yellow/100 #feffc8`. Mirrored as `--ref-*` but no semantic token points
  at them.

## 5. Known off-token colour still in the codebase

| what                                            | where                                                                      | why it was left                                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~167 stock-Tailwind `indigo-*`/`gray-*` classes | `blocks/{Stats,PricingTable,Testimonials,Gallery,FAQ}/`, `app/projects/**` | Unbranded TinaCMS starter blocks. No Figma design exists for them, so any token choice would be invented. Re-token or delete as a follow-up.        |
| 16 inline hex                                   | `apps/marketing/tina/fields/IconPicker.tsx`                                | Renders inside the Tina admin iframe, where the app's Tailwind isn't loaded. Should use the `--tina-color-*` vars it already partly uses, not ours. |
| `from-black/60 via-black/20`                    | `blocks/Hero/HeroFullImage.tsx:58`                                         | A photo scrim, not a brand colour. Same category as the neutral `rgba(0,0,0,…)` shadows.                                                            |
| `"white"` in `Button`'s `color` prop union      | `packages/ui/src/Button.tsx:8`                                             | A raw colour name in a public API. The classes behind it are now tokens; renaming the prop is a breaking change for consumers.                      |
| `#C9E7A0`, `#d4a86e`, `#fbf9f4`                 | `public/images/{double-quote-green,brain-pattern}.svg`                     | Static assets. `#fbf9f4` is the **retired** surface colour.                                                                                         |
| retired palette in rendered diagrams            | `docs/sow2/**/*.svg`                                                       | Point-in-time artefacts.                                                                                                                            |
