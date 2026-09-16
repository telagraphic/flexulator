# JS naming and JS ↔ CSS map

Product words in JavaScript (`grow`, `basis`, `remainingSpace`). CSS flex property names exist only when talking to the browser (`style.flexGrow`).

`paintItemCards` / `paintExampleFormulas` write through **`data-field`**, whose value is the JS key. BEM classes are for Sass only until UI work.

```html
<span class="flex-item__flexulations-remaining-space" data-field="remainingSpace"></span>
```

Container-level keys on an Item Card (`width`, `totalBasis`, `remainingSpace`, `totalGrow`, `totalShrinkBasis`) are painted from `snapshot.container`. Item-level keys from that card's `snapshot.items` row. Inputs use `data-field` on `grow` / `shrink` / `basis` from `state.items`.

## Rules

- camelCase in JS. Verb-first functions: `calculateFlexValues`, `syncItemCards`, `applyFlexStyles`, `paintItemCards`.
- State fields match [CONTEXT.md](../CONTEXT.md): `id`, `grow`, `shrink`, `basis`.
- Snapshot fields match ADR 0010. Do not store them on the Flex Item.
- Banned in JS: `flexulations`, `flexItemObject`, `flexGrow` / `flexShrink` / `flexBasis` on records, `updateWidth` soup.

## Flex Item inputs

| Concept | JS (`state.items[]`) | CSSOM | Style class | Paint hook |
| --- | --- | --- | --- | --- |
| Identity | `id` | — | `.flex-item` | `data-id` |
| Grow | `grow` | `flexGrow` | `.flex-item__grow-value` | `data-field="grow"` |
| Shrink | `shrink` | `flexShrink` | `.flex-item__shrink-value` | `data-field="shrink"` |
| Basis (px) | `basis` | `flexBasis` (`${basis}px`) | `.flex-item__basis-value` | `data-field="basis"` |
| Shorthand write | — | `flex` = `${grow} ${shrink} ${basis}px` | `.flex-item` | — |

Add-form fields (not Flex Items): `input[name="flex-grow"]`, `input[name="flex-shrink"]`, `input[name="flex-basis"]` → `createItem({ grow, shrink, basis })` on Add.

## Container snapshot (`snapshot.container`)

| Concept | JS | `data-field` | Style class (Item Card) | Style class (example panel) |
| --- | --- | --- | --- | --- |
| Flex Container width | `width` | `width` | `.flex-item__flexulations-container-width` | `.grow-example__container`, `.shrink-example__container` |
| Total basis | `totalBasis` | `totalBasis` | `.flex-item__flexulations-total-flex-basis` | `.grow-example__total-flex-basis`, `.shrink-example__total-flex-basis` |
| Remaining Space | `remainingSpace` | `remainingSpace` | `.flex-item__flexulations-remaining-space` | `.grow-example__remaining-space`, `.shrink-example__remaining-space` |
| Total grow | `totalGrow` | `totalGrow` | `.flex-item__flexulations-grow-total` | `.grow-example__total-grow` |
| Total shrink basis | `totalShrinkBasis` | `totalShrinkBasis` | `.flex-item__flexulations-shrink-total-basis` | `.shrink-example__shrink-basis-total` |

## Per-item snapshot (`snapshot.items[]`)

| Concept | JS | `data-field` | Style class (Item Card) | Style class (example, item 0) |
| --- | --- | --- | --- | --- |
| Grow share | `growShare` | `growShare` | — | `.grow-example__total-grow-quotient` |
| Allocated space | `allocatedSpace` | `allocatedSpace` | `.flex-item__flexulations-grow-width` | `.grow-example__allocated-space` |
| Grow echo | `grow` (state) | `grow` | `.flex-item__flexulations-grow-value` | `.grow-example__item-grow` |
| Basis echo | `basis` (state) | `basis` | `.flex-item__flexulations-grow-item-basis` | `.grow-example__item-flex-basis` |
| Predicted grow width | `growWidth` | `growWidth` | `.flex-item__flexulations-grow-item-computed-width` | `.grow-example__final-width` |
| Shrink product | `shrinkProduct` | `shrinkProduct` | `.flex-item__flexulations-shrink-value-basis-total` | `.shrink-example__item-shrink-sum` |
| Shrink factor | `shrinkFactor` | `shrinkFactor` | `.flex-item__flexulations-shrink-quotient` | `.shrink-example__shrink-factor` |
| Shrink amount | `shrinkAmount` | `shrinkAmount` | `.flex-item__flexulations-shrink-width` | `.shrink-example__shrink-amount` |
| Predicted shrink width | `shrinkWidth` | `shrinkWidth` | `.flex-item__flexulations-shrink-final-width` | `.shrink-example__final-width` |
| Shrink echo | `shrink` (state) | `shrink` | `.flex-item__flexulations-shrink-value` | `.shrink-example__item-shrink` |

Formula spans that echo container keys use the container `data-field` names above (same `remainingSpace` on every copy of that span).

## Measured Width (DOM read, not calculate)

| Concept | JS | CSSOM | `data-field` | Style class |
| --- | --- | --- | --- | --- |
| Measured Width | `measuredWidth` in paint | `element.clientWidth` | `measuredWidth` | `.flex-item__width` |

## Functions

| Function | Module | Does |
| --- | --- | --- |
| `createItem` | `main.js` | `{ id, grow, shrink, basis }` |
| `calculateFlexValues` | `calculate.js` | snapshot |
| `syncItemCards` | `render.js` | clone/remove template by id |
| `applyFlexStyles` | `render.js` | `style.flex` from state |
| `paintItemCards` | `render.js` | `[data-field]` ← snapshot + measured width |
| `paintExampleFormulas` | `render.js` | same hooks on the example panel, item 0 |
| `render` | `render.js` | calculate → sync → apply → rAF → paint |

## Grow / Shrink Demo

| Control | JS | DOM |
| --- | --- | --- |
| Grow Demo | patch every `basis` to `100` | `.flexulator__items-container-grow-button` |
| Shrink Demo | patch every `basis` to `round(width / n + 100)` | `.flexulator__items-container-shrink-button` |
| Formula visibility | `remainingSpace >= 0` show grow panel | `.flex-item__flexulations-grow-container` / `...-shrink-container` |
