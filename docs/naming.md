# JS naming and JS ↔ CSS map

Product words in JavaScript (`grow`, `basis`, `remainingSpace`). CSS flex property names exist only when talking to the browser (`style.flexGrow`).

`paintItemCards` / `paintExampleFormulas` write through **`data-field`**, whose value is the JS key. BEM classes are skin only. Item Card formula numbers share `.flex-item__formula-value`; teaching-panel numbers share `.formula__value`; inputs share `.flex-item__input`.

```html
<number-flow class="flex-item__formula-value" data-field="remainingSpace"></number-flow>
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
| Grow | `grow` | `flexGrow` | `.flex-item__input` | `data-field="grow"` |
| Shrink | `shrink` | `flexShrink` | `.flex-item__input` | `data-field="shrink"` |
| Basis (px) | `basis` | `flexBasis` (`${basis}px`) | `.flex-item__input` | `data-field="basis"` |
| Stepper | — | — | `.flex-item__stepper` | `data-step` + `data-dir` (`up` / `down`) |
| Remove | — | — | `.flex-item__remove` | — |
| Shorthand write | — | `flex` = `${grow} ${shrink} ${basis}px` | `.flex-item` | — |

Add-form fields (not Flex Items): `input[name="flex-grow"]`, `input[name="flex-shrink"]`, `input[name="flex-basis"]` → `createItem({ grow, shrink, basis })` on Add.

## Container snapshot (`snapshot.container`)

| Concept | JS | `data-field` | Style class (Item Card) | Style class (example panel) |
| --- | --- | --- | --- | --- |
| Flex Container width | `width` | `width` | `.flex-item__formula-value` | `.formula__value` |
| Total basis | `totalBasis` | `totalBasis` | `.flex-item__formula-value` | `.formula__value` |
| Remaining Space | `remainingSpace` | `remainingSpace` | `.flex-item__formula-value` | `.formula__value` |
| Total grow | `totalGrow` | `totalGrow` | `.flex-item__formula-value` | `.formula__value` |
| Total shrink basis | `totalShrinkBasis` | `totalShrinkBasis` | `.flex-item__formula-value` | `.formula__value` |

## Per-item snapshot (`snapshot.items[]`)

| Concept | JS | `data-field` | Style class (Item Card) | Style class (example, item 0) |
| --- | --- | --- | --- | --- |
| Grow share | `growShare` | `growShare` | — | `.formula__value` |
| Allocated space | `allocatedSpace` | `allocatedSpace` | `.flex-item__formula-value` | `.formula__value` |
| Grow echo | `grow` (state) | `grow` | `.flex-item__formula-value` | `.formula__value` |
| Basis echo | `basis` (state) | `basis` | `.flex-item__formula-value` | `.formula__value` |
| Predicted grow width | `growWidth` | `growWidth` | `.flex-item__formula-value` | `.formula__value` |
| Shrink product | `shrinkProduct` | `shrinkProduct` | `.flex-item__formula-value` | `.formula__value` |
| Shrink factor | `shrinkFactor` | `shrinkFactor` | `.flex-item__formula-value` | `.formula__value` |
| Shrink amount | `shrinkAmount` | `shrinkAmount` | `.flex-item__formula-value` | `.formula__value` |
| Predicted shrink width | `shrinkWidth` | `shrinkWidth` | `.flex-item__formula-value` | `.formula__value` |
| Shrink echo | `shrink` (state) | `shrink` | `.flex-item__formula-value` | `.formula__value` |

Formula spans that echo container keys use the container `data-field` names above (same `remainingSpace` on every copy of that span).

## Measured Width (DOM read, not calculate)

| Concept | JS | CSSOM | `data-field` | Style class |
| --- | --- | --- | --- | --- |
| Measured Width | `measuredWidth` in paint | `element.clientWidth` | `measuredWidth` | `.flex-item__measured-width-value` |

## Functions

| Function | Module | Does |
| --- | --- | --- |
| `createItem` | `main.js` | `{ id, grow, shrink, basis }` |
| `scheduleRender` | `main.js` | coalesce mutations to one `render` per frame |
| `setupListeners` / `observeContainerWidth` / `boot` | `main.js` | wire once; ResizeObserver; first paint |
| `onItemInput` / `onItemClick` / label hover handlers | `item-controls.js` | mutate Flex Items from Item Card gestures; return whether to render |
| `parseNonNegative` | `utils.js` | shared number parse for Add form + Item Card inputs |
| `calculateFlexValues` | `calculate.js` | snapshot |
| `syncItemCards` | `render.js` | clone/remove template by id |
| `applyFlexStyles` | `render.js` | `style.flex` from state |
| `paintItemCards` | `render.js` | `[data-field]` ← snapshot + measured width |
| `paintExampleFormulas` | `render.js` | same hooks on the example panel, item 0 |
| `render` | `render.js` | calculate → sync → apply → rAF → paint |
| NumberFlow config / `paintNumberFlow` / `setNumberFlowAnimated` | `number-flow.js` | digit hosts; called from paint only |
| formula tabs + GSAP loops | `formula-demos.js` | teaching panel below the calculator (not the render cycle) |

## Teaching panel

| Control | JS | DOM |
| --- | --- | --- |
| Tab | toggle `--active` | `.formula__tab` / `.formula__tab--active` |
| Panel | paint active panel only | `.formula__panel` / `.formula__panel--active` |
| Number | `[data-field]` | `.formula__value` |
| Grow demo animation | GSAP | `.formula__demo--grow .formula__demo-item` |
| Shrink demo animation | GSAP | `.formula__demo--shrink .formula__demo-item` |

Drop `example-formula`, `grow-example`, `shrink-example`, `grow-animation`, `shrink-animation`, and `.is-active`.

## Grow / Shrink Demo

| Control | JS | DOM |
| --- | --- | --- |
| Grow Demo | patch every `basis` to `100` | `.flexulator__grow-demo` |
| Shrink Demo | patch every `basis` to `round(width / n + 100)` | `.flexulator__shrink-demo` |
| Formula visibility | `remainingSpace >= 0` show grow panel | `.flex-item__formula-grow` / `.flex-item__formula-shrink` |

## Style blocks

| Region | Block |
| --- | --- |
| Page shell | `page` (`page__main`, `page__footer`, `page__footer-inner`) |
| Header | `header` (`header__advert`, `header__logo`, `header__github`, `header__message`) |
| Calculator | `flexulator` (`flexulator__toolbar`, `flexulator__demos`, `flexulator__grow-demo`, `flexulator__shrink-demo`, `flexulator__items`) |
| Add form | `add-form` |
| Item Card | `flex-item` |
| Teaching panel | `formula` |
| Links | `resources` (`resources__list`, `resources__item`, `resources__heading`, `resources__marker`) |

Vendor `#carbonads` is not a BEM block. Drop `github-counter`, `page__header`, `resources__header`.
