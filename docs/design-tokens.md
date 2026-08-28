# Design tokens

Figma is the source of truth. `packages/tokens/theme.css` mirrors the
`Primitives`, `Colors` and `Fonts` collections of Figma file
`SppKdzsaH6rQ14u90UpNSq` under Figma's own variable names, and wires them into
Tailwind 4 via `@theme inline`.

Apps import it from their `globals.css` (`@import "@pbh/tokens/theme.css";`).
App-specific `@font-face` declarations and keyframes stay in the app's own
`globals.css`.

Audience: engineers. Requests **to** the designer live in
[`figma-token-requests.md`](figma-token-requests.md).

## The naming rule

A token's name is its Figma variable path with `/` replaced by `-`, so a Figma
variable name is greppable in this repo:

| Figma variable       | CSS variable                 | utility                 |
| -------------------- | ---------------------------- | ----------------------- |
| `background/default` | `--color-background-default` | `bg-background-default` |
| `text/default`       | `--color-text-default`       | `text-text-default`     |
| `border/subtle`      | `--color-border-subtle`      | `border-border-subtle`  |
| `brand/default`      | `--color-brand-default`      | `text-brand-default`    |

### The stutter is deliberate

`text-text-default` and `border-border-subtle` look wrong and are not. Tailwind 4
has a single `--color-*` namespace, and `default` is a leaf name in five Figma
groups — `background`, `border`, `brand`, `teal`, `text` — with `subtle` in four
and `brand` in three. Collapse the group out and `bg-default` and `text-default`
have to be the same colour, which is not what the design says.

This has been "tidied" once already (PR #60) and the reasoning lost with it.
Leave it.

### Two forced exceptions

Renamed only because Tailwind already ships those namespaces:

| Figma              | code     | why                               |
| ------------------ | -------- | --------------------------------- |
| `colors/neutral/*` | `grey-*` | Tailwind owns `--color-neutral-*` |
| `teal/*`           | `aqua-*` | Tailwind owns `--color-teal-*`    |

**Map by value, never by index.** Figma's step numbers do not match the ramp
this repo used before the sync — Figma's `colors/neutral/100` is what used to be
`--color-neutral-50`, and two values have no counterpart on the other side at
all. `grey-*` carries Figma's numbers.

### Component-scoped variables are resolved, not exported

Figma's `Components` collection (`button/*`, `modal/*`, `nav/*`, `footer/*`,
`form-field/*`, `FAQs/*`, `hero/*`, `section/*`, `step-card/*`) is 57 aliases
into `Colors` and `Primitives`. Those resolve to whatever primitive they point
at rather than becoming their own utilities — they are layout config, not a
surface the code should reach for, and exporting them would let one component
reach for another's token.

The exception is radii, which are exported: `--radius-button`, `--radius-modal`,
`--radius-form-card`, `--radius-input`, `--radius-hero`,
`--radius-step-card-icon`.

Spacing is not tokenised. Figma's `sizes/*` is an even-number ramp from 0 to 80,
which already lands on Tailwind's 4px grid — `p-10` is `sizes/40`. Naming them
again would add names without adding truth.

## The token set

**Primitives** — raw ramps. Prefer a semantic; a step number carries no meaning.
`brand-50…900`, `grey-50…900`, `aqua-50/100/500/700`, `green-500`, `pink-600`,
`yellow-100`, `warm-50`, `warm-900`, plus `white` and `black`.

**Semantics** — what components use. `background-*`, `text-*`, `border-*`,
`brand-*`, `aqua-*`, `accent-*`, `icon-*`, `stepper-*`.

**Type scale** — `text-display` (80px), `text-h1` (56), `text-h2` (48),
`text-h3` (40), `text-h4` (32), `text-h5` (24), `text-subtitle` (20),
`text-heading-small` (16), `text-body-lg` (20), `text-body` (16),
`text-body-sm` (14), `text-caption` (12). `heading/subtitle` and `body/large`
are both 20px in Figma, as are `heading/small` and `body/base` at 16px; both
names are kept because they are different Figma variables and may diverge.

Line heights are **not** from Figma — it tokenises none, and reports
`lineHeight: 100` on every style, which reads as an unset default. The body
steps carry what Tailwind's `text-sm`/`base`/`xl` pair with them, which is what
these sizes render with today. The heading steps use a ratio and are unverified
(FIG-06).

**No Figma variable yet** — a fenced block in `theme.css`. Every entry has a
numbered request in [`figma-token-requests.md`](figma-token-requests.md); do not
grow it without adding one.

`mint-subtle`, `accent-green-strong`, `accent-green-container`, `toast-surface`,
`border-inverse`, `brand-deep`, `brand-wash`, `brand-pale`, `focus-ring`,
`aqua-container`, `on-aqua-container`, `outline`, `outline-variant`,
`grey-warm-200`, `background-warm-strong`, `ink-strong`, `danger`, `on-danger`,
`error`, `on-error`, `error-container`, and the four `--shadow-*`.

Two of those are worth knowing about:

- **`ink-strong`** (#1b1c19) is the darkest ink — body text on light grounds and
  the ground of the dark Button. Figma's darkest *named* text is `text/heading`
  (pure black); this value is `colors/neutral/850`, which the design uses
  constantly and never names. Called `ink` because it is a ground as often as a
  colour.
- **`danger`** is an alias of `accent-pink`, not a second value. Figma calls
  #d60012 both `accent/pink` and `colors/pink/600`, neither of which says what
  it is for. `bg-danger` reads correctly at the call site; FIG-01 asks for the
  name to be fixed upstream.

## Stock Tailwind colours are off

`theme.css` sets `--color-*: initial`, so `bg-indigo-600`, `text-gray-600` and
`bg-neutral-800` emit nothing. Before that reset the theme was purely additive
and all three resolved silently — which is how five TinaCMS starter blocks
shipped an indigo palette on a teal site.

`white` and `black` survive, re-declared, because Figma defines both as
primitives at exactly those values.

## Adding a token

Four places, and three of them are enforced:

1. `:root` in `packages/tokens/theme.css` — the value, with its Figma variable
   name in a comment (or a FIG number if it has none).
2. `@theme inline` in the same file — the mirror. **Without it Tailwind emits no
   utility at all, silently.** `apps/marketing/src/tokens.node.test.ts` fails if
   you forget, and also catches an orphaned mirror and a typo'd `var()` target.
3. `apps/marketing/src/stories/design-system/tokens.ts` — a swatch, if it is a
   colour, size or radius. The story measures `getComputedStyle`, which is the
   only thing that proves the utility reached the browser.
4. `packages/emails/src/theme.ts` — **only** if an email needs it. Add the
   `@token --color-x` annotation; `emails-theme.node.test.ts` resolves it
   through `theme.css` and fails on drift.

A new `--text-*` step needs a fifth: `TYPE_SCALE` in `packages/ui/src/utils.ts`.
tailwind-merge accepts any name as a *colour* but only t-shirt sizes as a
*font size*, so an unregistered step falls into the colour group and `cn()`
drops it with no error.

## Re-syncing from Figma

Manual, by design. The Figma plan tier is `starter`, so the Variables REST API
is unavailable and the only complete read is the Plugin API through the Figma
MCP, which needs the desktop app open.

1. Load the `figma-use` skill (a required prerequisite for `use_figma`).
2. Enumerate `figma.variables.getLocalVariableCollectionsAsync()`, resolving
   each variable's `valuesByMode` and following `VARIABLE_ALIAS` entries.
3. Diff against [`design-tokens-figma-export.json`](design-tokens-figma-export.json),
   which is that enumeration as of the last sync.
4. Apply the diff to `theme.css`, then work through "Adding a token" above.

`get_variable_defs` on a node is **not** a substitute: it returns only the
variables bound to that node, which is why a first pass made two dozen tokens
look orphaned when they were simply unused on the page sampled.

## Migration map

Kept for one release so a reviewer can decode PRs from the sync. The retired
names are the Material Design 3 vocabulary this repo used until August 2026.

| retired | now | note |
| --- | --- | --- |
| `primary` | `brand-default` | |
| `primary-container` | `brand-deep` | no Figma variable |
| `on-primary-container` | `brand-wash` | no Figma variable |
| `primary-fixed` | `brand-pale` | no Figma variable |
| `primary-fixed-dim` | `focus-ring` | no Figma variable |
| `primary-container-high` | `brand-850` | |
| `on-primary` | `brand-on-brand` | |
| `secondary` | `aqua-default` | |
| `secondary-container`, `secondary-fixed` | `aqua-container` | no Figma variable |
| `on-secondary-container` | `on-aqua-container` | no Figma variable |
| `on-secondary` | `text-inverse` | |
| `surface`, `surface-container-lowest` | `background-default` | |
| `surface-container-low` | `background-warm` | |
| `surface-container` | `background-warm-strong` | no Figma variable |
| `on-surface` | `ink-strong` | no Figma variable |
| `on-surface-variant` | `text-default` | **value corrected** #44474d → #45474d |
| `on-surface-warm` | `text-warm-dark` | |
| `neutral-50/100/300/350/400/600/700/900` | `grey-100/200/400/350/450/700/800/900` | by value, not by index |
| `neutral-200` | `grey-warm-200` | no Figma variable |
| `on-danger` | `text-inverse` | |
| `accent-pink` | `accent-pink` | **value corrected** #d6007f → #d60012 |

`danger`, `on-danger`, `error`, `on-error`, `error-container`, `outline`,
`outline-variant`, `accent-green`, `accent-green-container`, `brand-muted`,
`border-subtle`, `border-strong`, `text-secondary`, `background-brand-subtle`
and `toast-surface` kept their names.
