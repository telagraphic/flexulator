# CSS cascade layers and class plan

Pickup doc for a later pass. Does **not** depend on the JS refactor, but **must not** restyle `[data-field]` (that is a JS paint hook, not a class API). Visual language stays Firefox-inspector (Consolas, pink/blue/gray tokens).

## What is wrong today

The Sass tree *looks* like ITCSS (`base/`, `objects/`, `components/`, `utilities/`) and is not:

- [`scss/styles.scss`](scss/styles.scss) imports **normalize and defaults before variables**. Each component re-imports mixins/variables. Empty shells: [`globals/_global.scss`](scss/globals/_global.scss), [`objects/_object.scss`](scss/objects/_object.scss), [`utilities/_utility.scss`](scss/utilities/_utility.scss), [`components/_formula.scss`](scss/components/_formula.scss).
- No cascade layers. Specificity is won with `!important` (heading `margin: 0`, tab `transform`), `z-index: -100` on the item form, and `outline: none` on all inputs/buttons ([`base/_defaults.scss`](scss/base/_defaults.scss)).
- Tokens are Sass `$gray-3` only. Runtime CSS cannot theme, and `@layer` files cannot share values without compiling Sass first.
- Breakpoints are a mix of `1000px`, `62.5rem`, `$mobile`, `43rem`, `2000px`.
- Type is `calc(14px + (26 - 14) * ((100vw - 300px) / (1600 - 300)))` instead of `clamp()`.
- BEM is real and useful (`.flex-item__grow-value`). `flexulations` is a fossil name; **do not rename those classes in the JS pass** — [`docs/naming.md`](naming.md) already maps them. A class rename is this CSS pass or later UI, not a third vocabulary.

## Target cascade

Declare **once** at the top of `styles.scss`:

```css
@layer reset, tokens, base, layouts, components, vendor, utilities;
```

Unlayered CSS always wins over layered CSS. Keep **everything** inside a layer, including Carbon ads, or ads will smash the page.

| Layer | Responsibility | Source files (after move) | Specificity intent |
| --- | --- | --- | --- |
| `reset` | Box model, normalize, strip UA margins | `base/_normalize.scss` rewritten with `:where()` | Lowest. Prefer `:where(h1)` over `h1 { margin: 0 !important }` |
| `tokens` | Custom properties only, no selectors | `config/_tokens.scss` (new) | N/A |
| `base` | `html`/`body` type, fonts, focus-visible, reduced-motion | `base/_typography.scss`, slim `_defaults.scss` | Element selectors, no classes |
| `layouts` | Page regions, header grid, item row, formula tabs strip | `pages/_page.scss`, layout chunks pulled out of header/flexulator | Composition only (flex/grid/gap). No colors |
| `components` | Skins: Item Card, add form, formula panels, footer, links | existing `components/*` | One BEM block per file |
| `vendor` | `#carbonads` | `_advert.scss` | Isolated so it cannot leak |
| `utilities` | Rare one-offs (`hidden`, maybe `.is-active` if it stays a state class) | `_utility.scss` actually used | Highest of *our* layers |

`layouts` vs `components` is the important split: **structure vs paint**. `.flexulator__items-container { display: flex }` is layout. `.flex-item { background: var(--blue-1) }` is component.

Sass wrapping:

```scss
@layer components {
  .flex-item {
    /* existing BEM nesting */
  }
}
```

Do not `@import` a file *around* a layer from `styles.scss` in a way that nests layers twice. Each partial opens its own `@layer name { ... }`.

## Token mapping (Sass → CSS)

Keep Sass variables as aliases during migration, then delete:

```scss
:root {
  --color-page: #{$gray-2};
  --color-item: #{$blue-1};
  --color-accent: #{$pink-3};
  --color-grow: #{$blue-4};
  --color-ink: #{$black-6};
  /* …one role per use, not --blue-4 in components */
}
```

Name by **role** (`--color-item-bg`), not by palette step, so the inspector look can shift without hunting `$blue-1`. Breakpoints become custom media or named Sass tokens **once**: `--bp-calculator: 62.5rem` (the width where the calculator appears). Kill the 1000px / 1200px / 1300px / 1500px / 2000px ladder unless a layout actually breaks there.

Fluid type: replace the vw formula with `clamp(min, preferred, max)` on a small scale (`--text-ui`, `--text-width`, `--text-formula`).

## Class rules (do not fight the JS plan)

1. **BEM blocks stay** for components: `.flex-item`, `.flexulator`, `.formula`, `.header`, `.page`.
2. **`data-field` is not a styling API.** No `[data-field="grow"] { color: ... }` unless we later decide attributes are the skin. Style `.flex-item__grow-value`.
3. **State classes:** keep `.is-active` on tabs *or* switch to `[aria-selected="true"]` when the JS tab widget lands. One state hook, not both.
4. **No new utility framework.** If `utilities` stays empty after the pass, delete the folder.
5. **`flexulations` in class names** may be renamed to `formula` in this CSS pass (HTML template + Sass together). If JS already shipped `data-field`, class rename is safe. If CSS ships first, keep `flexulations` until the template exists.
6. **Do not style `id`s** except `#carbonads` in `vendor`.

## Modern CSS methods to apply while layering

Not a visual redesign. Each is a mechanical swap:

| Old | New |
| --- | --- |
| `margin: 0 !important` on headings | `@layer reset { :where(h1, h2, h3, h4, h5, h6) { margin: 0 } }` |
| `outline: none` on all inputs | Remove from reset. Component `:focus-visible` in `base` or `components` |
| `z-index: -100` on `.flex-item__form` | Normal stacking; form is not under the card |
| `left` / `padding-left` | `inset-inline-start` / `padding-inline` where it is direction-related |
| `viewport-min(1000px)` scatter | Content-driven named breakpoints; calculator hide/show is one query |
| `calc((100vw - 300px) / …)` type | `clamp()` |
| Hover steppers in JS | `@media (hover: hover)` in CSS (when UI pass touches steppers) |
| Endless GSAP / width transitions | `@media (prefers-reduced-motion: no-preference)` for motion |

Park (true UI): hatch contrast, NumberFlow `::part`, stepper hit areas, Bunny fonts.

## File target

```
scss/
  styles.scss                 # @layer order + forwards
  tokens/_tokens.scss         # :root custom properties
  reset/_reset.scss           # :where() reset (drop full normalize or wrap it)
  base/_root.scss             # html/body, fonts, focus
  layouts/_page.scss
  layouts/_calculator.scss    # items container row
  layouts/_formula-tabs.scss
  components/_header.scss
  components/_item-card.scss  # rename from flexulator-item when convenient
  components/_add-form.scss
  components/_formula.scss    # teaching formulas (merge flexulator-formula)
  components/_footer.scss
  vendor/_carbon.scss
  utilities/_utilities.scss   # or delete
```

Keep Sass nesting for BEM. No CSS-in-JS. No Tailwind.

## Migration order (each step shippable, look unchanged)

1. **Declare `@layer` order** and wrap existing partials *without* moving rules. Confirm the compiled page is pixel-identical (ads in `vendor`).
2. **Fix import graph:** tokens/mixins first; stop per-file `@import '../config/variables'`.
3. **Reset layer:** `:where()` for element margins; delete heading `!important`.
4. **Promote `$variables` to `:root` custom properties;** point component files at `var(--color-item-bg)` one block at a time.
5. **Split layout vs skin** in Item Card and header (flex/grid vs colors).
6. **Named breakpoints + `clamp()` type.** Calculator `display: none` below `--bp-calculator` stays a known a11y debt (documented); do not invent a mobile calculator here.
7. **Optional:** rename `flexulations` classes to `formula` in template + Sass in one commit. Update [`docs/naming.md`](naming.md) style-class column only.
8. **Delete empty partials.** Drop unused normalize rules if reset supersedes them.

Compile as now (`sass scss:css`). No new bundler required for `@layer`.

## Out of scope

JS `render()` / `data-field`, NumberFlow, stepper UX, dark mode, mobile calculator, Every Layout primitive rewrite of the Item Card (can follow as a third pass if the hatch/row still fights intrinsic sizing).
