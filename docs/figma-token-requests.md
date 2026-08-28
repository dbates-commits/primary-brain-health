# Figma token requests

For **Arian**. Everything here is a question or a change on the Figma side that
the code cannot decide for itself.

Context: `packages/tokens/theme.css` now mirrors the design system's variables
under Figma's own names, so a variable name is greppable in the codebase. Doing
that surfaced the gaps below. Each has a stable ID, so a PR or a Linear issue
can cite it.

Figma file: `SppKdzsaH6rQ14u90UpNSq` (Primary Brain Health). The full variable
export the code was built from is
[`design-tokens-figma-export.json`](design-tokens-figma-export.json).

Ordered roughly by how much they cost us. **FIG-04 is the one blocking real
work.**

---

## FIG-01 — One red, two names, and neither says what it is for

**What.** `accent/pink` and `colors/pink/600` are both `#d60012`.

**Where.** `Colors` → `accent/pink`; `Primitives` → `colors/pink/600`. Bound on
the Delete Account button (1988:12282) and its confirm button (2060:7053).

**Why it matters.** Two names for one value means two places to change it and no
answer to "which is canonical". Worse, "pink" is misleading — the value is a
red, and it is used for destructive actions and invalid fields, not decoration.
There is a real magenta elsewhere in the brand, so the name actively points at
the wrong thing.

**The ask.** Keep one variable, and name it for its role — `danger`, or
`accent/red` if it stays in the accent group. If the design does want a separate
decorative pink, give it its own value.

**Meanwhile.** The code mirrors `accent/pink` at `#d60012` and adds
`--color-danger` as an alias, so call sites read `bg-danger`. That alias goes
away when this is resolved.

---

## FIG-02 — Values the design uses that no variable names

**What.** Colours drawn as raw hex in Figma, so the code has to name them
itself.

| value | where it is used | code token |
| --- | --- | --- |
| `#E2EFEF` | the mint behind a benefit tile, and the booking modal's navigator note | `mint-subtle` |
| `#4dc78c` | the tick disc in the toast confirmation glyph (2092:13192) | `accent-green-strong` |
| `#e2f6e9` | the pale ground under the account page's `Active` plan badge | `accent-green-container` |
| `#1f262e` | the toast ground (2092:13191) | `toast-surface` |
| `#ffffff` | white as a **border/ring** on a dark ground — `text/inverse` covers text, nothing covers this | `border-inverse` |
| `#f0eee9` | the panel ground inside the transactional emails | `background-warm-strong` |

**Why it matters.** A value with no variable cannot be changed from Figma. It
also cannot be found: nobody looking at the design system knows these six exist.

**The ask.** Add a variable for each, or tell us which existing one it should
have been.

**Careful:** `#E2EFEF` and `#e2f6e9` are two different near-mints with different
roles. Please do not collapse them into one — the code deliberately keeps them
apart.

**Meanwhile.** Each is a code-only token in a fenced "no Figma variable yet"
block in `theme.css`.

---

## FIG-03 — No elevation variables at all

**What.** The design clearly has elevation — cards, menus, the sticky header,
the toast — and the `Primitives` collection has no shadow variables.

**Why it matters.** Every shadow in the codebase was a hand-written `rgba()`
written straight into a class. They had drifted into four slightly different
values, and several were still tinted with `#041632` and `#446558` — the navy
and forest green from a palette replaced long ago. Nobody noticed, because
there was nothing to compare them against.

**The ask.** Four shadow variables would cover today's usage: a card, a menu or
popover, the sticky header, and the toast. Values and tints from the design.

**Meanwhile.** `--shadow-card`, `--shadow-menu`, `--shadow-header` and
`--shadow-toast`, read off the rendered design and re-tinted onto the current
ink so nothing carries the dead palette forward.

---

## FIG-04 — Type-scale gaps ⚠️ blocking

**What.** The `Fonts` collection has 12 sizes: 80, 56, 48, 40, 32, 24, 20, 20,
16, 16, 14, 12. The site renders text at six sizes that are not among them.

| size | uses | current class |
| --- | --- | --- |
| 18px | 44 | `text-lg` |
| 30px | 21 | `text-3xl` |
| 36px | 20 | `text-4xl` |
| 60px | 9 | `text-6xl` |
| 72px | 1 | `text-7xl` |
| 13px | 1 | `text-[13px]` |

**Why it matters.** This is the only item here that is blocking. Around 100 call
sites cannot move onto the design system until we know what these should be, and
guessing the nearest step would silently resize live headings — 18px snapping to
20px changes every piece of body copy in that group.

**The ask.** Either add a step for each, or tell us which existing step each one
should snap to. A "these are mistakes, use the nearest" answer is completely
fine — we just need it said, rather than assumed.

**Meanwhile.** Those ~100 call sites stay on stock Tailwind sizes and are the
one part of the codebase not yet on the design system. Every size that *does*
match a Figma step has already moved.

---

## FIG-05 — `heading/subtitle` and `heading/small` duplicate `body/*`

**What.** `heading/subtitle` is 20px, the same as `body/large`.
`heading/small` is 16px, the same as `body/base`.

**Why it matters.** Not a problem yet — the code keeps all four names, since
they are different variables and may be intended to diverge. But if they are
meant to be the same thing, two of them are dead weight, and if they are not,
one pair is going to drift by accident.

**The ask.** Confirm whether these are deliberate aliases or an oversight.

---

## FIG-06 — Every text style reports `weight: 100, lineHeight: 100`

**What.** Read through the API, every style in `Fonts` comes back as
`Font(family: …, style: Thin, size: …, weight: 100, lineHeight: 100,
letterSpacing: 0)`.

**Why it matters.** That reads as unset defaults rather than intent — a real
`lineHeight` of 100 would be 100% (single-spaced) on every heading and every
body step, which is not what the design looks like. So the code cannot take the
line heights from Figma at all.

**The ask.** Confirm the intended weight and line height per step. If the styles
simply were never configured, saying so is enough.

**Meanwhile.** Body steps carry the line heights they render with today; heading
steps use a ratio and are explicitly marked unverified in `theme.css`.

---

## FIG-07 — The `Colors` collection has a Dark mode that is a copy of Light

**What.** `Colors` declares two modes, `Light` and `Dark`. All 39 variables
resolve to the identical value in both.

**Why it matters.** It reads as "dark mode is designed" to anyone opening the
file, and it is not. The code has no dark mode and this gave no reason to build
one — but the next person to look will spend time working that out.

**The ask.** Either populate the Dark mode or remove it until it is real.

---

## FIG-08 — The `device` variable is inverted

**What.** In the `Components` collection, `device` resolves to `"Mobile"` in the
**desktop** mode and `"desktop"` in the **Mobile** mode.

**Why it matters.** Small, but it is the kind of thing that silently breaks
whatever reads it, and it suggests the modes may have been populated the wrong
way round somewhere else too. Only `modal/*` and `section/*` actually differ
between the two modes; everything else is identical, so the error is not
currently visible.

**The ask.** Swap them, and a quick check that the responsive values are on the
right side.

---

## FIG-09 — Two values are drifting between Figma and code

Already fixed **in Figma's favour**; recorded so it is visible.

| Figma variable | Figma | code had | resolution |
| --- | --- | --- | --- |
| `text/default` | `#45474d` | `#44474d` | code corrected |
| `accent/pink` | `#d60012` | `#d6007f` (a magenta) | code corrected |

`#44474d` was body-text colour across the whole site — a one-digit slip nobody
could have seen. The magenta existed nowhere in the Figma file at all.

**The ask.** Nothing, unless either code value was actually the intended one.

---

## FIG-10 — Component variables hold raw numbers, not aliases

**What.** `button/radius` is `sizes/40`, `modal/padding` is `sizes/32`, and so
on — the `Components` collection aliases straight to a raw size rather than to
anything semantic.

**Why it matters.** It works, but it means there is no layer between "this
component's padding" and "the number 32", so a change to spacing rhythm has to
be made component by component.

**The ask.** Low priority. Worth considering a semantic spacing layer
(`space/sm`, `space/md`) if the design system grows.

---

## What the code retired

For visibility: the codebase used Material Design 3 role names until this sync —
`primary`, `secondary`, `surface`, `on-surface`, `outline`, `inverse-*`. None of
those existed in Figma, which is what made the two sides impossible to compare.
They are gone. The mapping is in
[`design-tokens.md`](design-tokens.md#migration-map).
