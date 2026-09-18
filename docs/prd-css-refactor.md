# PRD: CSS layers, tokens, and BEM

## Problem Statement

I maintain Flexulator’s styles in a Sass tree that looks like ITCSS but is not. Empty shells sit next to real components. Every partial re-imports variables. There are no cascade layers, so specificity is won with `!important`, negative z-index, and `outline: none` on every control. Colors and type are Sass variables named like `$blue-1`, so I cannot tell which jobs they serve, and I cannot reuse the Firefox inspector palette as purpose-named tokens. Class names still say `flexulations`, `flexulator__form`, and `items-container-grow-button`, which fight the glossary (Add form, Grow Demo, Item Card formula) and make JavaScript parse identity out of BEM. I want to keep Sass nesting, but I want CSS layers, custom-property tokens, fewer files, and class names that match how the product actually works — without changing the look in this pass, and without a site-wide dark mode.

## Solution

One Sass entry declares five cascade layers (`reset`, `tokens`, `base`, `components`, `vendor`) and loads one partial per UI region. Tokens are CSS custom properties: primitives numbered light to dark, semantics named by job; components only use semantics. Type becomes named `clamp()` tokens that match today’s formulas so I can back-check. Mixins and Sass variables go away. BEM blocks match the glossary (Add form, Flex Container, Item Card, Grow Demo / Shrink Demo, formula). JavaScript retargets the same behavior onto the new classes and `data-step` / `data-dir`. Paint stays on `data-field`. The page should look the same after the pass. Modular type scale, breakpoint cleanup, and which region uses the dark inspector paints wait until I have tested this refactor by hand.

## User Stories

1. As a CSS learner, I want the Flex Container, Item Cards, Add form, and formulas to look the same after the refactor, so that the lesson is still the inspector-like calculator I already know.
2. As a CSS learner, I want three Item Cards on first load with the same Grow, Shrink, and Basis as today, so that boot is unchanged.
3. As a CSS learner, I want Measured Width on each Item Card, so that the laid-out column and the big number still match.
4. As a CSS learner, I want the grow formula visible when Remaining Space is leftover, so that the card still follows the layout.
5. As a CSS learner, I want the shrink formula visible when Remaining Space is overflow, so that the card still follows the layout.
6. As a CSS learner, I want to type Grow, Shrink, and Basis on an Item Card and see the row update, so that inputs still drive the calculator.
7. As a CSS learner, I want Item Card steppers to change Grow, Shrink, and Basis the same way, so that plus and minus still work after identity moves off class names.
8. As a CSS learner, I want steppers to appear on hover of a field row, so that the reveal still works.
9. As a CSS learner, I want to add a Flex Item from the Add form, so that Add still creates a card and is not a live Item Card.
10. As a CSS learner, I want to remove an Item Card, so that Remove still works.
11. As a CSS learner, I do not want to remove the last Flex Item, so that the Flex Container never goes empty.
12. As a CSS learner, I want Grow Demo to set every Basis to 100, so that leftover space still happens without a calculation mode.
13. As a CSS learner, I want Shrink Demo to raise every Basis until overflow, so that shrink still happens without a calculation mode.
14. As a CSS learner, I want Grow Demo and Shrink Demo to sit outside the Add form conceptually, so that submitting Add never fires a demo.
15. As a CSS learner, I want formula tabs (Grow, Shrink, Links) to switch teaching panels only, so that tabs never rewrite Basis or demo chips.
16. As a CSS learner, I want the teaching Grow and Shrink panels to show the first Flex Item’s snapshot, so that the long-form lesson still matches the cards.
17. As a CSS learner, I want NumberFlow digits to keep rolling on read-only fields, so that the CSS pass does not break paint.
18. As a CSS learner, I want to resize the Flex Container and see Remaining Space and Measured Width update, so that the live-resize lesson still works.
19. As a CSS learner, I want the calculator hidden below the current desktop breakpoint and visible above it, so that the “view on desktop” behavior stays until a later breakpoint pass.
20. As a CSS learner, I want Carbon ads to still appear in the header slot, so that vendor chrome is not smashed by unlayered CSS.
21. As a CSS learner, I want to tab to inputs and buttons and see a focus ring, so that `outline: none` is no longer the reset.
22. As a CSS learner, I want reduced-motion to still skip NumberFlow rolls, so that the CSS pass does not fight that preference.
23. As a maintainer, I want five cascade layers declared once, so that reset cannot beat components and ads cannot leak unlayered.
24. As a maintainer, I want every rule inside a layer, so that unlayered CSS cannot silently win.
25. As a maintainer, I want no `layouts` or `utilities` layer, so that layout and paint stay in the same component file and we do not keep empty utility shells.
26. As a maintainer, I want one file per UI region, so that I am not hunting ITCSS folders for a BEM block.
27. As a maintainer, I want empty ITCSS shells gone, so that globals, objects, utilities, and unused formula stubs are not fake architecture.
28. As a maintainer, I want the `page` block (including the footer) in the components layer, so that base stays element selectors only.
29. As a maintainer, I want a modern `:where()` reset, so that heading `!important` and a copied normalize v8 are not the cascade floor.
30. As a maintainer, I want `_base` to apply tokens to `html`/`body`/headings and `:focus-visible`, so that base is not a second type scale.
31. As a maintainer, I want color primitives numbered light to dark, so that grey, blue, and magenta ramps are a gradient, not Photon leftovers with gaps.
32. As a maintainer, I want semantic color tokens named by job (`--color-text-accent`, `--color-bg-item`, `--color-text-grow`), so that I never style a component with `--blue-1`.
33. As a maintainer, I want accent reserved for magenta/brand, so that `primary` never means both brand and body text, and inspector blue stays grow/selection/item — not accent.
34. As a maintainer, I want each token commented with name, value, and job, so that `_tokens` is the reference table.
35. As a maintainer, I want no site-wide dark mode and no `light-dark()`, so that dark inspector values are just palette steps for a later region, not a theme.
36. As a maintainer, I want named `clamp()` type tokens that match today’s min–max, so that I can back-check size regressions against the documented mapping.
37. As a maintainer, I want `_base` and components to share those type tokens, so that headings and BEM overrides are one scale.
38. As a maintainer, I want no Sass mixins, functions, or `$variables`, so that design values live in CSS.
39. As a maintainer, I want media queries as range literals (`width >= 62.5rem`), so that we do not pretend custom properties work in `@media` conditions.
40. As a maintainer, I want today’s breakpoint widths kept in this pass, so that layout does not shift before I can test.
41. As a maintainer, I want a real `.flexulator` block on the calculator article, so that elements are not orphans of a missing block.
42. As a maintainer, I want the Flex Container class to be the node JavaScript measures, so that the items row is not named like a generic wrapper.
43. As a maintainer, I want Add form as its own BEM block, so that draft fields are not `flexulator__form`.
44. As a maintainer, I want Grow Demo and Shrink Demo as flexulator elements in a toolbar sibling of Add form, so that class names match CONTEXT (demos sit outside the Add form).
45. As a maintainer, I want Item Card formula classes named `formula`, so that `flexulations` and the `flexuations` typo are gone.
46. As a maintainer, I want Item Card formula numbers to share one value class plus `data-field`, so that paint-only unique classes are gone.
47. As a maintainer, I want Item Card inputs to share one input class plus `data-field`, so that grow/shrink/basis skin is not three copies.
48. As a maintainer, I want steppers to be one class with `data-step` and `data-dir`, so that JavaScript does not parse `grow-increment` out of BEM.
49. As a maintainer, I want the teaching panel to be one `formula` block, so that `example-formula`, `grow-example`, and `shrink-example` are gone.
50. As a maintainer, I want teaching numbers to share `.formula__value` plus `data-field`, so that paint stays the snapshot key.
51. As a maintainer, I want formula tabs and panels to use a BEM `--active` modifier, so that `.is-active` is not a second state vocabulary.
52. As a maintainer, I want GSAP to target formula demo items, so that grow/shrink animation class names match the formula block.
53. As a maintainer, I want header, page footer, and resources class names cleaned, so that unused `github-counter` and `page__header` stubs are gone.
54. As a maintainer, I want JavaScript selectors updated in the same pass as markup, so that Add, demos, steppers, formula visibility, tabs, and paint do not break.
55. As a maintainer, I want `data-field` and `data-id` unchanged, so that paint and reconcile stay the JS contract.
56. As a maintainer, I want Calculate fixtures to stay green, so that a class rename cannot silently rewrite Remaining Space math.
57. As a visual tester, I want a documented current-to-token type map, so that if a heading looks wrong I know which `--text-*` to blame.
58. As a visual tester, I want three known type collapses called out (h5, formula titles, step numbers), so that I check those first.
59. As a visual tester, I want 404 and 500 pages updated or explicitly left as snapshots, so that static markup does not lie about the live template.
60. As a maintainer, I want logical properties where the layout is direction-related, so that `left`/`padding-left` are not the default.
61. As a maintainer, I want vendor Carbon rules isolated in the vendor layer, so that ad CSS cannot override Item Cards.
62. As a maintainer, I want unused palette Sass (`$purple-3`, `$pink-2`, unused greys) dropped, so that tokens are only colors with a job.
63. As a future me, I want a parked note to replace the ten type tokens with a modular scale after I have tested, so that this pass does not invent a new look.
64. As a future me, I want a parked note to rationalize breakpoint literals after I have tested, so that the 1000px / 2000px ladder is a later design decision.
65. As a future me, I want dark-end primitives in the token file, so that when I style one region like the dark inspector I already have the paints.

## Implementation Decisions

- Layers: `reset`, `tokens`, `base`, `components`, `vendor`, declared once at the stylesheet entry. Each partial opens its own layer. The entry only declares order and loads partials. Nothing unlayered, including ads.
- Files: one partial per UI region (page including footer, header, flexulator/Item Cards/toolbar/demos, Add form, formula, resources, vendor, plus reset, tokens, base). ITCSS folders and empty shells deleted. Sass kept for nesting and loading partials only.
- Reset: modern `:where()` rewrite, not a copy of normalize v8. Strip UA margins without heading `!important`. Do not remove focus from all controls in reset; `:focus-visible` lives in base or components.
- Tokens: two tiers. Primitives (grey, blue, magenta) numbered light → dark. Semantics named by job; components never use a primitive. Accent is magenta. Inspector blue is grow, selection, and Item Card — not accent. No `light-dark()`, no site dark mode. Dark-end primitives exist for a later region. Every token is commented with name, value, and job.
- Type: ten `--text-*` tokens as `clamp()` of today’s 300px–1600px formulas. Base and components both consume them. Documented mapping and three collapses (h5-like labels → ui-sm; Item Card formula titles → ui; formula step numbers → tab). Modular scale is out of this PRD.
- Mixins: deleted. No Sass functions or Sass variables. Media queries are CSS range literals with today’s widths. Custom properties are not used in `@media` conditions (`@custom-media` is not baseline).
- BEM blocks: `page`, `header`, `flexulator` (toolbar, demos, items), `add-form`, `flex-item`, `formula`, `resources`. Demos are siblings of Add form under a flexulator toolbar. Flex Container node is `flexulator__items`.
- Item Card: shared formula value class + `data-field`; shared input class + `data-field`; steppers `data-step` / `data-dir`; formula grow/shrink panels renamed; Remove class shortened. JavaScript identity for steppers is data attributes, not increment class names.
- Teaching panel: one `formula` block. Shared value class + `data-field`. Tabs/panels `--active`. GSAP targets formula demo items. Drop example-formula / grow-example / shrink-example / is-active.
- JavaScript: Main, Render, item-controls, and formula-demos retarget selectors in the same pass as markup. Paint still writes `data-field`. Reconcile still uses `data-id` and `.flex-item`. Calculate is untouched.
- Markup: live page and Item Card template change together. 404/500 follow the same class names or stay documented snapshots.
- Look: not a visual redesign. Mechanical swaps only (layers, tokens, clamp, range media, logical properties, reset, BEM). Calculator hide below the current desktop width stays.

## Testing Decisions

- A good test for this work is observable behavior: the calculator still adds, removes, edits, demos, resizes, paints NumberFlow, and switches formula tabs; Calculate fixtures still match known Remaining Space cases; the page looks like today’s inspector-inspired layout except for the three documented type collapses.
- Calculate remains the only unit-tested module. Its fixture suite is prior art and must stay green. This PRD does not change Remaining Space math or snapshot shape.
- Do not unit-test Sass, cascade layer order, or token files by parsing CSS.
- Do not add a browser/end-to-end harness in this PRD.
- Verification is a manual pass after the code ships: boot, type, steppers, Add, Remove (including last-item hide), Grow Demo, Shrink Demo, formula tabs vs demos (they must stay independent), teaching panel vs first Item Card, resize, ads, focus-visible, and the three type-collapse spots.

## Out of Scope

- Modular type scale (after manual test)
- Rationalizing breakpoint values (after manual test)
- Site dark mode, `light-dark()`, or an in-app theme toggle
- Deciding which region uses dark inspector paints (later styling)
- Box-model highlighter yellow/purple tokens unless that UI is restyled
- Mobile/compact calculator below the current hide breakpoint
- Visual redesign, hatch contrast, Bunny fonts, NumberFlow `::part`, stepper hit areas
- Moving stepper hover reveal from JS to `@media (hover: hover)` (later UI)
- Every Layout rewrite of the Item Card
- Changing Calculate, render sequence, or `data-field` keys
- Tailwind, CSS-in-JS, utility frameworks
- Browser/end-to-end test harness

## Further Notes

- Domain language: CONTEXT.md (including the four Grow/Shrink surfaces). Style class map: naming.md. Architecture: ADR 0017 (layers and files), ADR 0012 (paint via data-field), ADR 0005 (no grow/shrink mode). Pickup details: css-layers-plan.md.
- Type mapping table lives in css-layers-plan.md (current selector → token, including the three collapses).
- Child issues should be sliced with the to-issues skill; this PRD is the parent.