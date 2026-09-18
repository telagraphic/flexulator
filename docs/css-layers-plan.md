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

Locked in [ADR 0017](adr/0017-css-layers-and-files.md). Declare **once** at the top of `styles.scss`:

```scss
@layer reset, tokens, base, components, vendor;
```

Unlayered CSS always wins over layered CSS. Keep **everything** inside a layer, including Carbon ads, or ads will smash the page.

No `layouts` layer (layout and paint live in the same component file). No `utilities` layer (empty; BEM modifiers stay on the block).

Each partial opens its own `@layer`. `styles.scss` only declares order and `@use`s — it must not wrap imports in `@layer`.

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

Park (true UI): hatch contrast, NumberFlow `::part`, stepper hit areas, Bunny fonts. Which region uses the dark inspector greys/blues is a later styling pass — not a site theme. **After the CSS refactor ships and you have manually tested:** (1) replace the ten `--text-*` clamps with a modular type scale; (2) rationalize breakpoint literals (`62.5rem`, `43rem`, `1000px`, `1200px`, `1500px`, `2000px`, `$mobile`/`$desktop`) into a short content-driven set. First pass keeps today’s query widths, written as `@media (width >= …)`.

## Work list

- **Modern reset.** Do not copy `scss/base/_normalize.scss` v8 as-is. Rewrite `_reset.scss` with `:where()`, drop unused normalize rules and the heading `!important` / `outline: none` defaults. That is a refresh, not a file move.
- **Token comments.** In `_tokens.scss`, every primitive and semantic is commented with name, hex/value, and job. Ramps numbered light → dark (`--grey-1` lightest). No `light-dark()`. No site dark mode. Dark-end primitives exist so a later region can use them.

## Type scale (current → token)

All fluid sizes use the same interpolation: `300px–1600px` viewport, min at 300, max at 1600. Token form:

`clamp({min}px, calc({min}px + ({max} - {min}) * (100vw - 300px) / 1300px), {max}px)`

| Token | clamp min–max | Exact current formulas |
| --- | --- | --- |
| `--text-ui-sm` | 12–22 | formula numbers (`12–22`); h5 was `0.83×(14–26)` ≈ 11.6–21.6 |
| `--text-ui` | 14–26 | body, h3, h4; formula titles were `12–25` |
| `--text-prose` | 12–32 | formula lede |
| `--text-input` | 12–34 | Add form labels/inputs, Item Card steppers |
| `--text-subhead` | 18–34 | `resources__heading` |
| `--text-operator` | 26–38 | formula operators |
| `--text-heading` | 32–46 | h2 |
| `--text-tab` | 26–60 | formula tab labels; step numbers were `26–68` |
| `--text-title` | 55–85 | h1 (unused as display), resources title |
| `--text-measured` | `3rem` | Item Card measured-width value (only fixed size) |

Call sites (after BEM rename). **Collapse** means the token’s min/max differ from today.

| Current selector | Current min–max | Token | Notes |
| --- | --- | --- | --- |
| `body`, `h3`, `h4` | 14–26 | `--text-ui` | exact |
| `h5`, `.flex-item__measured-width-label`, `.flex-item__field-label` | ≈11.6–21.6 | `--text-ui-sm` | collapse; lose 0.83 quirk |
| `.flex-item__formula-grow` / `__formula-shrink` (container) | 12–22 | `--text-ui-sm` | exact (was mixin) |
| `.flex-item__formula-title` | 12–25 | `--text-ui` | collapse |
| `.add-form__label`, `.add-form__input`, `.flex-item__input` | 12–34 | `--text-input` | exact |
| `.flex-item__measured-width-value` | `3rem` | `--text-measured` | exact |
| `.formula__tab-label` | 26–60 | `--text-tab` | exact (wins over `h3`) |
| `.formula__step-number` | 26–68 | `--text-tab` | collapse; 8px smaller at 1600px (wins over `h1`) |
| `.formula__lede` | 12–32 | `--text-prose` | exact |
| `.formula__operand` | 12–22 | `--text-ui-sm` | exact |
| `.formula__operator` | 26–38 | `--text-operator` | exact |
| `.resources__heading` | 18–34 | `--text-subhead` | exact (wins over `h3`) |
| `h2` | 32–46 | `--text-heading` | exact |
| `h1` | 55–85 | `--text-title` | exact; formula step `h1` does not use this |
| `.resources__header-title` | 55–85 | `--text-title` | exact; class not in current `index.html` |

Leave in vendor, not tokens: Carbon `13px` / `8px`. Reset `100%` / `1em` stay untokened.

## File target

Flat under `scss/`. Drop `base/`, `config/`, `components/`, `globals/`, `objects/`, `pages/`, `utilities/`.

```
scss/
  styles.scss          @layer order + @use
  _reset.scss          @layer reset
  _tokens.scss         @layer tokens
  _base.scss           @layer base
  _page.scss           @layer components  (page + page__footer)
  _header.scss         @layer components
  _flexulator.scss     @layer components  (toolbar, demos, items, flex-item)
  _add-form.scss       @layer components
  _formula.scss        @layer components
  _resources.scss      @layer components
  _vendor.scss         @layer vendor
```

`_mixins.scss` is gone. No Sass mixins, functions, or `$variables`. Media queries are CSS range literals (`width >= 62.5rem`). Custom properties cannot be used in `@media` conditions.

Keep Sass nesting for BEM. No CSS-in-JS. No Tailwind.

## Migration order (each step shippable, look unchanged)

1. **Declare `@layer` order** and wrap existing partials *without* moving rules. Confirm the compiled page is pixel-identical (ads in `vendor`).
2. **Fix import graph:** tokens/mixins first; stop per-file `@import '../config/variables'`.
3. **Reset layer:** modern `:where()` reset (not a copy of normalize v8); delete heading `!important`.
4. **Promote `$variables` to `:root` custom properties;** point component files at semantic `var(--color-…)` one block at a time.
5. **Named breakpoints + `clamp()` type.** Calculator `display: none` below the calculator breakpoint stays a known a11y debt; do not invent a mobile calculator here.
6. **BEM rename** in template + Sass + JS selectors together. Map: [`docs/naming.md`](naming.md).
7. **Delete empty folders** (`globals/`, `objects/`, `utilities/`, old ITCSS paths).

Compile as now (`sass scss:css`). No new bundler required for `@layer`.

## Out of scope

JS `render()` / `data-field`, NumberFlow, stepper UX, dark mode, mobile calculator, Every Layout primitive rewrite of the Item Card (can follow as a third pass if the hatch/row still fights intrinsic sizing). NumberFlow constraints vs Item Card markup: [semantic-control-markup.md](semantic-control-markup.md).
