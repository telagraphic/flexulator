# PRD: Flexulator JavaScript calculator rewrite

## Problem Statement

I use Flexulator to watch how leftover or missing space is split among Flex Items as I resize the window and change grow, shrink, and basis. Today those numbers live in several places at once (records, form fields, formula spans, and inline styles), so the Item Cards, the teaching formulas, and the actual layout can disagree. Adding or removing an Item Card rebinds listeners and waits on timeouts. I cannot trust that the formula on the card is the same math the browser just used, and I cannot change the math without hunting through a God Object.

## Solution

A single list of Flex Items is the source of truth. After any change (edit, add, remove, demo, or resize), one render cycle calculates Remaining Space and both formulas, writes flex styles, waits for layout, then paints Measured Width and formula numbers onto the same Item Cards. Grow Demo and Shrink Demo only change Basis so leftover space or overflow actually happens; they are not a calculation mode. The teaching math is a pure function I can fixture-test whenever it changes.

## User Stories

1. As a CSS learner, I want to see three Flex Items on first load, so that I can start from a working Flex Container without assembling the page myself.
2. As a CSS learner, I want each Item Card to show that item’s grow, shrink, basis, and Measured Width, so that I can connect the inputs to the laid-out size.
3. As a CSS learner, I want Remaining Space on the Item Card, so that I can see width minus total Basis before I read grow or shrink.
4. As a CSS learner, I want the grow formula filled in when Remaining Space is positive, so that the card explains leftover space the way the layout is behaving.
5. As a CSS learner, I want the shrink formula filled in when Remaining Space is negative, so that the card explains overflow the way the layout is behaving.
6. As a CSS learner, I want both formulas always computed even when only one is shown, so that switching demos does not leave stale or empty math.
7. As a CSS learner, I want to type a new grow value on one Item Card and see every card’s allocated space update, so that I can learn that grow is a share of leftover space, not a pixel width.
8. As a CSS learner, I want to type a new shrink value and see shrink factor and shrink amount update, so that I can learn that shrink is weighted by Basis.
9. As a CSS learner, I want to type a new Basis and see Remaining Space and Measured Width change, so that I can see Basis as the starting width before grow or shrink.
10. As a CSS learner, I want the column to actually grow or shrink when I change those inputs, so that the visual Flex Container matches the formula.
11. As a CSS learner, I want to keep typing in a field without the caret jumping, so that render does not fight me mid-keystroke.
12. As a CSS learner, I want to add a Flex Item using the add form’s grow, shrink, and basis, so that I can compare more than three shares.
13. As a CSS learner, I want a new Item Card to appear for that Flex Item without the page forgetting the old listeners, so that add feels like the same calculator, not a reload.
14. As a CSS learner, I want to remove an Item Card, so that I can see how Remaining Space is split among fewer items.
15. As a CSS learner, I do not want to remove the last Flex Item, so that the Flex Container never goes empty and the formulas still have a row to show.
16. As a CSS learner, I want the last Item Card’s Remove control hidden, so that I am not offered an action that does nothing.
17. As a CSS learner, I want Grow Demo to set every Basis to 100, so that I can force leftover space and study grow without resizing first.
18. As a CSS learner, I want Shrink Demo to raise every Basis until the items overflow, so that I can force shrink without guessing pixel values.
19. As a CSS learner, I want the visible formula to follow Remaining Space after a demo, so that the card does not teach shrink while the columns are growing.
20. As a CSS learner, I want to resize the Flex Container and see Remaining Space, allocated space, and Measured Width update together, so that the live window-resize lesson still works.
21. As a CSS learner, I want those updates to happen as the container itself changes size, so that ads or layout chrome do not desync the math from the row I am looking at.
22. As a CSS learner, I want the example Grow and Shrink panels below the calculator to show the same snapshot as the first Flex Item, so that the long-form lesson matches the cards.
23. As a CSS learner, I want Measured Width to come from the laid-out Item Card, so that the big width number is what the browser painted, not only the predicted formula width.
24. As a CSS learner, I want predicted grow width and predicted shrink width on the formula, so that I can compare the teaching arithmetic to Measured Width.
25. As a maintainer, I want grow, shrink, and basis to live on Flex Item records, so that I am not copying the same three numbers through style, form, and formula objects.
26. As a maintainer, I want one render cycle after every mutation, so that add, edit, remove, demo, and resize cannot take different write paths.
27. As a maintainer, I want Calculate to take width and items and return a snapshot, so that I can change teaching math in one place.
28. As a maintainer, I want that snapshot thrown away next cycle, so that derived fields cannot drift from the records.
29. As a maintainer, I want Item Cards matched by id, so that rebuilding the list does not drop focus or destroy nodes we will animate later.
30. As a maintainer, I want a single Item Card template, so that add and the initial three items share one shape.
31. As a maintainer, I want listeners registered once, so that adding an Item Card does not stack handlers.
32. As a maintainer, I want CSS flex property names used only when applying styles, so that records stay in product language (grow, shrink, basis).
33. As a maintainer, I want paint to use data-field keys that match the snapshot, so that formula spans cannot silently bind to the wrong concept.
34. As a maintainer, I want fixture tests on Calculate, so that I know Remaining Space and allocated space still match known cases after a math change.
35. As a maintainer, I want zero total grow or zero total shrink basis to yield zeros, so that empty shares do not become NaN on the Item Card.
36. As a maintainer, I want the old God Object and per-card objects gone, so that the next change is not another method on a 500-line singleton.
37. As a CSS learner, I want grow, shrink, and basis to stay at or above zero, so that the calculator does not model invalid flex values.
38. As a CSS learner, I want the add form to stay independent of any Flex Item, so that drafting the next item does not rewrite an existing card until I add it.

## Implementation Decisions

- Three modules by reason to change: Calculate (math), Render (Item Cards and paint), Main (state, events, boot). No store class, no per-card view class, no orchestrator type, no extra files until one of these three has two jobs.
- Canonical state is Flex Container width plus a list of Flex Items (`id`, `grow`, `shrink`, `basis`). Derived snapshot fields are never stored on the Flex Item.
- `calculateFlexValues(width, items)` always returns both grow and shrink fields plus container totals (`totalBasis`, `remainingSpace`, `totalGrow`, `totalShrinkBasis`, per-item `growShare`, `allocatedSpace`, `shrinkProduct`, `shrinkFactor`, `shrinkAmount`, `growWidth`, `shrinkWidth`).
- Render is the only caller of Calculate. Sequence: snapshot → sync Item Cards by id → apply flex styles → next animation frame → paint Measured Width and `data-field` hooks (skip the focused input) → paint example formulas from the first Flex Item.
- Main registers delegated input/click on the Flex Container once, plus boot listeners for Add and the two demos. ResizeObserver on the Flex Container writes width and coalesces to one render per frame; the first observation is boot width.
- Initial three Flex Items are created in state (grow 1, shrink 1, basis 100). The page ships an empty Flex Container and one Item Card template. Add uses that template and the add-form values via `createItem`.
- Grow Demo sets every Basis to 100. Shrink Demo sets every Basis to round(width / count + 100). Formula visibility follows the sign of Remaining Space. There is no calculation mode flag.
- At least one Flex Item always remains. Remove is a no-op at length 1; that Item Card’s Remove control is hidden.
- Product words in JS; CSSOM `flexGrow` / `flexShrink` / `flexBasis` / `flex` only inside apply-styles. Paint hooks are `data-field` values equal to JS keys. BEM class names stay for styling.
- Native ES modules: one entry loaded as a module. Production minify starts from those modules.

## Testing Decisions

- A good test asserts the snapshot Calculate returns for given width and Flex Items. It does not open a browser, query the DOM, or inspect how Render paints.
- The module under test is Calculate only. Known fixture: three items, grow 1, shrink 1, basis 100, width 1440 → Remaining Space 1140, allocated space 380 per item. Also cover Remaining Space negative (shrink), a single item, uneven grow shares, uneven shrink × basis, and totals of zero producing zeros rather than NaN.
- There are no existing unit tests in the project; these fixtures are the first. Node’s built-in test runner, no extra framework.
- Browser and integration tests of Render and Main are out of this PRD (after the UI pass).

## Out of Scope

- NumberFlow, stepper UX, tab order, focus rings, and other UI/animation work
- CSS cascade layers, custom properties, and class renames (`flexulations` → formula)
- Mobile/compact calculator below the current hide breakpoint
- Allowing zero Flex Items
- EventTarget store, Strategy classes, per-card objects, or a fourth JS module
- Browser/end-to-end tests
- Fonts, hatch contrast, GSAP formula-tab demos, ads

## Further Notes

- Domain language: CONTEXT.md. Decisions: ADRs 0001–0014. Call graph and sequences: architecture.md. JS ↔ DOM map: naming.md.
- CSS layers plan is a follow-up PRD, not this one.
- Later UI (NumberFlow) depends on Item Cards surviving in place (id reconcile) and on paint writing the same nodes each cycle.
