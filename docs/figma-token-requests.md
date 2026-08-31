# Figma token requests

For **Arian**. Changes on the Figma side that the code can't decide for itself.

File `SppKdzsaH6rQ14u90UpNSq`. Full variable export:
[`design-tokens-figma-export.json`](design-tokens-figma-export.json).

Last synced **2026-08-31**. Arian's pass closed FIG-01, 02, 03, 05, 06, 07, 08
and 10 — see [Resolved](#resolved) at the bottom for what each turned into.

**FIG-04 is still the only blocking one.**

---

## Open

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

### FIG-11 — `Body/Large Bold` binds `fontSize` but not `fontFamily`

Every other text style binds both. This one binds only the size, so its family
is loose — it renders Inter today by coincidence rather than by the variable.

**Ask:** bind `body/font-family` on it, like the other sixteen. Low priority,
nothing renders wrong yet.

---

### FIG-12 — `danger` is the one semantic left as a raw hex

Every other variable in `Colors` is an alias into `Primitives`. `danger` is
`#d60012` written directly, because deleting `colors/pink/600` took its
primitive with it.

**Ask:** add a primitive for it (`colors/red/600`?) and alias `danger` at it, so
the whole collection reads one way. Cosmetic — the value is right.

---

## Resolved

**FIG-01 — one red, two names.** `accent/pink` and `colors/pink/600` are both
gone; a single `danger` replaces them. Code dropped `--color-accent-pink`
entirely and `--color-danger` is now a real variable rather than an alias.
The invalid-field ring (`aria-invalid:ring-*` in `@pbh/ui`) moved with it, so
invalid fields and destructive buttons now deliberately share one red.

**FIG-02 — six values with no variable.** All six landed, at the exact values
the code had guessed, and the two near-mints were kept apart as asked:
`mint/subtle`, `accent/green-strong`, `accent/green-container`,
`toast/surface`, `border/inverse`, `background/warm-strong`. Five new
primitives came with them (`colors/mint/100`, `colors/green/100`,
`colors/green/600`, `colors/warm/100`, `colors/ink/900`). They moved out of
theme.css's "no Figma variable yet" block into the semantics.

**FIG-03 — no elevation variables.** Four `elevation/*` **effect styles** now
exist — card, menu-popover, sticky-header, toast. Effect styles aren't part of
the variable enumeration, so the sync procedure now reads them separately.
The hand-written values were re-tinted onto the ink and read about half as
strong as the design; they're now Figma's, tinted pure black.

**FIG-05 — duplicate sizes.** Answered as deliberate: `heading/subtitle` now
explicitly aliases `body/large`, `heading/small` aliases `body/base`. All four
names stay in code.

**FIG-06 — text styles reported `weight: 100, lineHeight: 100`.** Weights are
now real — every heading is Larken **Thin**, body is Inter Regular/Medium/Bold,
captions Regular/Semi Bold. `lineHeight` is `AUTO` on all 17 styles, which is
the "never configured" answer. The heading ratios in `theme.css` are therefore
the code's own choice with nothing to match, and are no longer marked
"unverified".

**FIG-07 — dark mode was a copy of light.** The unpopulated `Dark` mode was
removed. `Colors` is single-mode now.

**FIG-08 — the `device` variable was inverted.** Swapped; `desktop` mode now
reads `"desktop"`. Spot-checked the responsive values and they sit on the right
side.

**FIG-09 — two values already corrected in code.** Both confirmed: `text/default`
is `#45474d`, and the magenta `#d6007f` the code once had for `accent/pink`
existed nowhere in the file and is now gone from both sides.

**FIG-10 — component variables aliased raw numbers.** `space/sm` (24) and
`space/md` (32) were added and `modal/padding` / `modal/gap` now go through
them, plus a `radius/button` that `button/radius` aliases. Not exported as
code tokens yet — nothing consumes them — but the layer exists.

---

**What the code retired:** the Material Design 3 role names (`primary`,
`surface`, `on-surface`, `outline`, `inverse-*`). None existed in Figma, which
is what made the two sides impossible to compare. Mapping is in
[`design-tokens.md`](design-tokens.md#migration-map).
