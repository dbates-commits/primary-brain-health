# Figma token requests

For **Arian**. Changes on the Figma side that the code can't decide for itself.

File `SppKdzsaH6rQ14u90UpNSq`. Full variable export:
[`design-tokens-figma-export.json`](design-tokens-figma-export.json).

**FIG-04 is the only blocking one.**

---

### FIG-04 — Type scale is missing six sizes ⚠️

The site renders text at sizes `Fonts` has no step for:

| size | uses | | size | uses |
| --- | --- | --- | --- | --- |
| 18px | 44 | | 60px | 9 |
| 30px | 21 | | 72px | 1 |
| 36px | 20 | | 13px | 1 |

**Ask:** add a step for each, or say which existing step each should snap to.
"They're mistakes, use the nearest" is a fine answer — we just can't assume it,
because guessing would resize live headings and body copy.

**Blocking ~100 call sites.** They stay on stock Tailwind until this is
answered; everything that matched a Figma step has already moved.

---

### FIG-01 — One red, two names, neither says what it's for

`accent/pink` and `colors/pink/600` are both `#d60012`. Bound on Delete Account
(1988:12282) and its confirm button (2060:7053).

It's a red, used for destructive actions and invalid fields — "pink" points at
the wrong thing, and there's a real magenta elsewhere in the brand.

**Ask:** keep one variable, named for its role (`danger`, or `accent/red`).

*Meanwhile:* code adds `--color-danger` as an alias so call sites read
`bg-danger`. The alias goes when this is resolved.

---

### FIG-02 — Six values in the design with no variable

| value | where | code token |
| --- | --- | --- |
| `#E2EFEF` | mint behind a benefit tile; the booking modal's navigator note | `mint-subtle` |
| `#4dc78c` | tick disc in the toast glyph (2092:13192) | `accent-green-strong` |
| `#e2f6e9` | ground under the account page's `Active` badge | `accent-green-container` |
| `#1f262e` | toast ground (2092:13191) | `toast-surface` |
| `#ffffff` | white as a **border/ring** on dark — `text/inverse` covers text only | `border-inverse` |
| `#f0eee9` | panel ground inside the transactional emails | `background-warm-strong` |

A value with no variable can't be changed from Figma, and can't be found by
anyone reading the design system.

**Ask:** add a variable for each, or say which existing one it should be.

⚠️ `#E2EFEF` and `#e2f6e9` are two different near-mints with different roles.
Please don't collapse them.

---

### FIG-03 — No elevation variables

Cards, menus, the sticky header and the toast all have elevation; `Primitives`
has no shadow variables.

Every shadow in the codebase was a hand-written `rgba()`, drifted into four
slightly different values, several still tinted with `#041632` and `#446558` —
a palette replaced long ago. Nobody noticed because there was nothing to
compare against.

**Ask:** four variables would cover it — card, menu/popover, sticky header,
toast.

*Meanwhile:* `--shadow-card`, `--shadow-menu`, `--shadow-header`,
`--shadow-toast`, read off the rendered design and re-tinted onto current ink.

---

### FIG-06 — Every text style reports `weight: 100, lineHeight: 100`

Reads as unset defaults — a real `lineHeight: 100` would be single-spaced on
every heading, which isn't what the design looks like. So the code can't take
line heights from Figma at all.

**Ask:** confirm the intended weight and line height per step. "Never
configured" is enough of an answer.

*Meanwhile:* body steps carry what they render with today; heading steps use a
ratio, marked unverified in `theme.css`.

---

### FIG-07 — Dark mode is a copy of Light

`Colors` declares `Light` and `Dark`. All 39 variables resolve identically in
both.

It reads as "dark mode is designed" to anyone opening the file, and it isn't.

**Ask:** populate it or remove it until it's real.

---

### FIG-08 — The `device` variable is inverted

In `Components`, `device` is `"Mobile"` in the **desktop** mode and `"desktop"`
in the **Mobile** mode.

Not currently visible — only `modal/*` and `section/*` differ between modes —
but it suggests the modes may be reversed elsewhere.

**Ask:** swap them, and a quick check that the responsive values sit on the
right side.

---

### FIG-05 — Duplicate sizes

`heading/subtitle` is 20px, same as `body/large`. `heading/small` is 16px, same
as `body/base`.

**Ask:** deliberate aliases, or an oversight? Code keeps all four names for now,
so if they're meant to be one thing, two are dead weight — and if they're not,
one pair will drift by accident.

---

### FIG-09 — Two values already corrected in code

Recorded for visibility; no action unless a code value was actually the
intended one.

| variable | Figma | code had |
| --- | --- | --- |
| `text/default` | `#45474d` | `#44474d` — body text across the whole site |
| `accent/pink` | `#d60012` | `#d6007f`, a magenta found nowhere in the file |

---

### FIG-10 — Component variables alias raw numbers

`button/radius` → `sizes/40`, `modal/padding` → `sizes/32`. No layer between "a
component's padding" and "the number 32", so a change to spacing rhythm has to
be made component by component.

**Ask:** low priority — worth a semantic spacing layer (`space/sm`, `space/md`)
if the system grows.

---

**What the code retired:** the Material Design 3 role names (`primary`,
`surface`, `on-surface`, `outline`, `inverse-*`). None existed in Figma, which
is what made the two sides impossible to compare. Mapping is in
[`design-tokens.md`](design-tokens.md#migration-map).
