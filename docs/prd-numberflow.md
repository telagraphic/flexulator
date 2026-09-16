# PRD: Animate calculator numbers with NumberFlow

## Problem Statement

I use Flexulator to watch leftover or missing space split among Flex Items as I resize the Flex Container and change Grow, Shrink, and Basis. The Item Cards and teaching formulas already show the right numbers after every render, but those digits jump. I cannot see Remaining Space, allocated space, or Measured Width *move*, so the lesson feels like a spreadsheet refresh instead of a live layout.

I also do not want the add form or Item Card inputs to become a science project in this pass: I still need to type grow, shrink, and basis without the caret fighting an animation.

## Solution

Every read-only number on the Item Cards and the teaching Grow / Shrink panels becomes a vanilla NumberFlow host. After any mutation (add, remove, edit, stepper, Grow Demo, Shrink Demo, or Flex Container resize), the existing render cycle paints those hosts with `.update()`. Digits roll to the new value. First paint hydrates with no intro spin. Native inputs stay native. A single config object in Render holds timings (and later a resize A/B flag) so I can retune motion after the first implementation without hunting through paint.

## User Stories

1. As a CSS learner, I want Measured Width on each Item Card to roll to the new pixel width, so that the laid-out column and the big number feel like the same event.
2. As a CSS learner, I want Remaining Space on the Item Card to roll when the Flex Container width or total Basis changes, so that leftover space versus overflow is visible, not a sudden swap of digits.
3. As a CSS learner, I want grow-formula numbers (total Grow, grow share operands, allocated space, predicted grow width) to roll when I change Grow or Basis, so that I can watch a share of leftover space recalculate.
4. As a CSS learner, I want shrink-formula numbers (shrink product, shrink factor, shrink amount, predicted shrink width) to roll when I change Shrink or Basis, so that I can watch overflow weighted by Basis.
5. As a CSS learner, I want container totals that are copied onto every Item Card (width, total Basis, Remaining Space, total Grow, total shrink basis) to roll together, so that the same quantity does not jump on one card and tick on another.
6. As a CSS learner, I want the teaching Grow and Shrink panels to roll the same snapshot as the first Flex Item, so that the long-form lesson matches the cards instead of snapping while the cards animate.
7. As a CSS learner, I want numbers to roll when I add a Flex Item, so that every card’s share visibly redistributes.
8. As a CSS learner, I want numbers to roll when I remove a Flex Item, so that the remaining cards’ shares visibly grow or shrink.
9. As a CSS learner, I want numbers to roll when I type a new Grow, Shrink, or Basis on an Item Card, so that the formulas follow the keystroke after render (without fighting the caret in the input I am typing).
10. As a CSS learner, I want numbers to roll when I click an Item Card stepper, so that incrementing Grow, Shrink, or Basis feels connected to the formula.
11. As a CSS learner, I want numbers to roll after Grow Demo, so that forcing leftover space is a motion I can watch, not a hard cut.
12. As a CSS learner, I want numbers to roll after Shrink Demo, so that forcing overflow is a motion I can watch, not a hard cut.
13. As a CSS learner, I want numbers to roll while I resize the Flex Container, so that the live window-resize lesson still feels live.
14. As a CSS learner, I want the option to try a freeze-during-drag then animate-on-settle resize instead, so that we can pick whichever reads better after seeing both.
15. As a CSS learner, I want first load to show the real starting numbers immediately, so that the calculator is correct before I touch anything.
16. As a CSS learner, I do not want every formula field counting up from zero on first load in this pass, so that boot does not look like a slot machine.
17. As a CSS learner, I want a newly added Item Card’s numbers to hydrate on first paint, so that a new column does not invent a fake 0 → value intro.
18. As a CSS learner, I want to keep typing in Grow, Shrink, and Basis without the caret jumping, so that NumberFlow never overwrites the focused input.
19. As a CSS learner, I want the add form to stay ordinary number inputs, so that drafting the next Flex Item is still independent of any Item Card.
20. As a CSS learner, I want grow share and shrink factor to still show six decimal places, so that a share looks like teaching math, not a rounded integer.
21. As a CSS learner, I want whole-pixel and whole-factor numbers to display like the developer console (`1440`, not `1,440`), so that the formula matches how I read CSS pixels.
22. As a CSS learner, I want Remaining Space to show a minus sign when it is negative, so that overflow is still readable while digits roll.
23. As a CSS learner, I want neighboring formula numbers to slide when a value gains or loses a digit (for example `999` → `1000`, or Remaining Space crossing zero), so that operators do not jitter on wide screens or large Basis values.
24. As a CSS learner, I want Remaining Space to stay still when I only change Grow, so that a quantity that did not change does not twitch.
25. As a CSS learner, I want allocated space and related fields to stay still when their snapshot value did not change, so that a shared total does not restart a spin on every unrelated keystroke.
26. As a CSS learner, I want the hidden grow or shrink formula (opacity 0) to stay current, so that when Remaining Space changes sign the newly visible formula is already at the right numbers.
27. As a CSS learner, I want reduced-motion preference to skip the digit roll, so that the numbers still update instantly if I asked the system for less motion.
28. As a CSS learner, I want the big Measured Width to keep its heading stack (number above the “width” label), so that replacing the heading element with NumberFlow does not dump the number inline.
29. As a CSS learner, I want digit columns to keep a stable width while they spin, so that Consolas figures do not shift sideways mid-roll.
30. As a maintainer, I want NumberFlow updates to live in the existing paint path, so that add, remove, edit, demo, resize, and boot cannot grow a second animation API.
31. As a maintainer, I want event handlers to keep only mutating state and scheduling render, so that NumberFlow never needs to know why a number changed.
32. As a maintainer, I want Render to own NumberFlow, so that Calculate stays a pure snapshot function and Main stays state and events.
33. As a maintainer, I want no fourth JavaScript module for this work, so that we do not split paint until Render actually has two reasons to change.
34. As a maintainer, I want read-only `data-field` hosts to become NumberFlow elements in place, keeping the same `data-field` key and BEM class, so that paint still binds by snapshot key and Sass still skins by class.
35. As a maintainer, I want Item Card identity and reconcile-by-id unchanged, so that NumberFlow nodes survive across renders the way ADR 0002 intended.
36. As a maintainer, I want a NumberFlow group inside each Item Card that does not become a layout box (`display: contents`), so that grouping does not break the card’s existing children.
37. As a maintainer, I want a NumberFlow group around the teaching panels, so that example-formula digit-count changes stay in sync without grouping every Item Card together (which would couple a new card’s hydrate to in-flight spins).
38. As a maintainer, I want paint to call `.update()` with a real number, not a formatted string, so that NumberFlow owns formatting through `Intl.NumberFormat` options.
39. As a maintainer, I want string `formatField` to remain only for native inputs, so that focused Grow / Shrink / Basis fields still round-trip as text.
40. As a maintainer, I want a WeakMap of last painted values, so that skip-unchanged does not smash six-decimal floats into `data-*` strings.
41. As a maintainer, I want a single config object at the top of Render for spin, transform, and opacity timings, so that visual tuning is a three-number edit plus reload.
42. As a maintainer, I want that config to be the place for an `animateDuringResize` flag later, so that the resize A/B does not sprout a second settings surface.
43. As a maintainer, I want snappier-than-library-default spin on first implementation (about 350ms roll, 200ms fade), so that a calculator keystroke does not wait on a 700ms odometer.
44. As a maintainer, I want NumberFlow `::part` styling deferred, so that older browsers do not flash unstyled digits.
45. As a visual tester, I want to try resize-with-animation-on and resize-freeze-then-settle after v1 is on screen, so that we lock that behavior from evidence, not from a guess.
46. As a visual tester, I want timings easy to change after initial development, so that I can react to how the rolls feel next to the Item Card layout.
47. As a maintainer, I want Calculate fixture tests to stay green with no snapshot-shape change, so that animation cannot silently rewrite Remaining Space math.
48. As a CSS learner, I want this pass to leave Item Card inputs and the add form as native number fields, so that I can still type, paste, and use steppers the way I do today.

## Implementation Decisions

- Modules: Render is the only JavaScript module that changes. Calculate is untouched. Main is untouched: it already coalesces mutations into one render per frame, including ResizeObserver. No fourth module, no per-card view class, no NumberFlow wrapper type.
- Library: vanilla NumberFlow custom element plus its group custom element. Not the React/Vue wrappers. Register by importing from Render so the first render already has the elements defined.
- Trigger: paint is the only caller of NumberFlow `.update()`. Add, remove, input, stepper, Grow Demo, Shrink Demo, resize, and boot stay on `scheduleRender` → render → paint.
- Surface (v1): every read-only `data-field` host on Item Cards and on the teaching Grow / Shrink panels, including Measured Width. Native inputs (`data-field` Grow / Shrink / Basis on the Item Card, and the add form) stay `<input type="number">`.
- Markup: replace those read-only hosts in place with NumberFlow, keeping BEM class and `data-field`. Do not wrap a NumberFlow inside the old span/heading.
- Grouping: one NumberFlow group inside each Item Card (not replacing the card root, so reconcile still keys on the Item Card). The group uses `display: contents`. A second group wraps the teaching formula panels. Do not wrap the whole Flex Container’s item row in one group.
- Paint contract: if the host is NumberFlow and the value is a finite number and it differs from the last painted value, configure (once) then `.update(number)`. If the host is an input, keep today’s skip-focused-input plus string `formatField`. First paint has no WeakMap entry, so it hydrates.
- Format: `useGrouping: false` for all fields (console-style `1440`). Grow share and shrink factor use six fraction digits. All other painted NumberFlow fields use zero fraction digits. Remaining Space may be negative; NumberFlow’s default sign handling is enough.
- Motion config: one object at the top of Render with `spinTiming` (duration 350, ease-out), `transformTiming` (duration 350, ease-out), `opacityTiming` (duration 200, ease-out). Copied onto each NumberFlow when first configured. `respectMotionPreference` stays true. Library default trend (direction follows the value change).
- CSS: existing BEM classes stay on the host. Measured Width host must be `display: block` because it is no longer a heading element. All NumberFlow hosts get `font-variant-numeric: tabular-nums` and `line-height: 0.85` (NumberFlow’s spin spacing). No `::part` rules in this PRD.
- Resize v1: leave animation on during ResizeObserver paints (existing rAF coalescing is the throttle). Do not debounce until mouseup in the first implementation. Record an `animateDuringResize` flag on the same config object as the place to A/B freeze-then-settle after visual testing.
- Architecture constraints respected: one render cycle (ADR 0001 / 0004), reconcile Item Cards by id (ADR 0002), paint via `data-field` (ADR 0012), three ES modules (ADR 0006), ResizeObserver still the width source (ADR 0009), no grow/shrink mode (ADR 0005).

## Testing Decisions

- A good test for this work is observable behavior: after a mutation, read-only numbers animate to the snapshot values; focused inputs are not overwritten; unchanged fields do not restart a roll; Calculate fixtures still match known Remaining Space cases.
- Calculate remains the only unit-tested module. Its fixture suite is prior art and must stay green. This PRD does not add snapshot fields or change `calculateFlexValues`.
- Do not unit-test NumberFlow, the WeakMap, or paint by inspecting implementation details (shadow DOM, last-value map, custom-element internals).
- Browser / integration tests of Render remain out of this PRD, same as the JavaScript rewrite PRD (ADR 0014: browser tests later). Verification is a manual pass: add, remove, stepper, type, Grow Demo, Shrink Demo, resize, reduced motion, digit-count change, teaching panels vs first Item Card.
- No new test target is required unless Render later splits out a pure helper worth isolating. Do not extract a test-only module up front.

## Out of Scope

- First-load count-up from 0 (likely only Measured Width if revisited).
- NumberFlow overlay (or contenteditable) on Item Card Grow / Shrink / Basis inputs and on the add form.
- Custom increment/decrement steppers on the add form.
- On-page debug sliders for timings.
- NumberFlow `::part` styling, `data-will-change` unless leftover jitter shows up after v1.
- Matching GSAP formula-tab loop timings.
- CSS cascade layers, token migration, and `flexulations` class rename.
- Mobile/compact calculator below the current hide breakpoint.
- A fourth JavaScript module, React NumberFlow, or a third-party animated input package.
- Browser/end-to-end test harness.

## Further Notes

- Domain language: CONTEXT.md. Decisions this work stands on: ADRs 0001, 0002, 0004, 0006, 0009, 0012. Call graph: architecture.md. JS ↔ DOM map: naming.md. Prior rewrite: prd-javascript-refactor.md (NumberFlow was explicitly out of that PRD; Item Cards surviving in place was the prerequisite).
- NumberFlow docs: https://number-flow.barvian.me/vanilla
- Parked visual experiments after v1 is on screen: (1) load intro from 0, (2) input overlay, (3) resize live-spin vs freeze-then-settle via `animateDuringResize`.

## Work slices

Tracer-bullet issues, filed under [#50](https://github.com/telagraphic/flexulator/issues/50). Each slice is demoable.

### 1. Measured Width rolls through paint — AFK — [#51](https://github.com/telagraphic/flexulator/issues/51)

**Blocked by:** none — can start immediately.

**User stories:** 1, 15–18, 24–25 (foundation), 27–32, 34–35, 38–43, 47–48.

**What to build:** Install vanilla NumberFlow. Add the Render config object. Teach paint to configure-once and `.update(number)` on NumberFlow hosts, skip unchanged via WeakMap, hydrate on first paint, and keep string paint for native inputs (still skip focused). Replace only the Measured Width host on the Item Card template. CSS: Measured Width `display: block`; NumberFlow `tabular-nums` and `line-height: 0.85`.

**Acceptance criteria:**

- [ ] After add, remove, stepper, type (blurred field), Grow Demo, Shrink Demo, or resize, Measured Width rolls to `clientWidth`.
- [ ] First load and a newly added Item Card show the real width with no 0 → value intro.
- [ ] Typing in Grow / Shrink / Basis does not lose the caret.
- [ ] Calculate fixtures still pass.
- [ ] Timings are editable from one config object.

### 2. Item Card formula numbers roll — AFK — [#53](https://github.com/telagraphic/flexulator/issues/53)

**Blocked by:** [#51](https://github.com/telagraphic/flexulator/issues/51).

**User stories:** 2–5, 7–12, 20–26, 33, 36, 38.

**What to build:** Replace remaining read-only `data-field` hosts on the Item Card template with NumberFlow. Wrap card contents in a NumberFlow group that does not generate a layout box. Apply integer vs six-decimal format from the `data-field` key.

**Acceptance criteria:**

- [ ] Grow and shrink formula numbers on every Item Card roll when their snapshot value changes.
- [ ] `1440` stays `1440`; grow share / shrink factor keep six decimal places; Remaining Space can be negative.
- [ ] Changing only Grow does not restart Remaining Space’s roll.
- [ ] Gaining or losing a digit slides neighbors in the formula row.
- [ ] The hidden grow or shrink formula stays current when Remaining Space changes sign.

### 3. Teaching example formulas roll — AFK — [#52](https://github.com/telagraphic/flexulator/issues/52)

**Blocked by:** [#51](https://github.com/telagraphic/flexulator/issues/51) (can proceed in parallel with slice 2).

**User stories:** 6, 20–23, 37.

**What to build:** Replace read-only `data-field` hosts on the teaching Grow and Shrink panels with NumberFlow. Wrap those panels in a NumberFlow group. Same format rules as Item Cards.

**Acceptance criteria:**

- [ ] Example-panel numbers match the first Flex Item’s snapshot and roll with it.
- [ ] Digit-count changes in the example formulas do not leave operators behind.
- [ ] Formula tab clicks still only show/hide panels (no extra NumberFlow trigger).

### 4. Visual tune: timings and resize A/B — HITL — [#54](https://github.com/telagraphic/flexulator/issues/54)

**Blocked by:** [#51](https://github.com/telagraphic/flexulator/issues/51), [#52](https://github.com/telagraphic/flexulator/issues/52), [#53](https://github.com/telagraphic/flexulator/issues/53).

**User stories:** 13–14, 45–46.

**What to build:** After v1 is on screen, retune the config object if 350/200ms feels wrong. Try `animateDuringResize` true (digits chase width every frame) versus false (freeze while ResizeObserver is hot, one animated paint when width settles). Lock one resize behavior from that viewing. No on-page sliders.

**Acceptance criteria:**

- [ ] A human has watched both resize modes on a wide window drag.
- [ ] Chosen mode is the config default (or the flag is removed if live-spin stays).
- [ ] Timing numbers in the config match what looked right next to the Item Cards.

### 5. Follow-up (parked): load intro from 0 — HITL — [#55](https://github.com/telagraphic/flexulator/issues/55)

**Blocked by:** [#51](https://github.com/telagraphic/flexulator/issues/51). Out of this PRD’s v1.

**User stories:** deferred from 16.

**What to build:** Optional two-phase first paint that counts selected fields up from 0 after layout is stable. Likely Measured Width only, not every formula field.

**Acceptance criteria:**

- [ ] Decision recorded: ship, or keep hydrate-only.
- [ ] If shipped, add and first load use the same intro rule.

### 6. Follow-up (parked): NumberFlow on inputs — HITL — [#56](https://github.com/telagraphic/flexulator/issues/56)

**Blocked by:** [#51](https://github.com/telagraphic/flexulator/issues/51). Out of this PRD’s v1.

**User stories:** deferred overlay; 18–19 stay as today’s native inputs until then.

**What to build:** Idle NumberFlow display plus real input while focused (official overlay pattern), including add-form steppers if those values should tick. Not a contenteditable NumberFlow input.

**Acceptance criteria:**

- [ ] Typing still uses a native input and does not spin per keystroke.
- [ ] Stepper / demo / unfocused paint can roll the idle display.
- [ ] Add form remains a draft, not a Flex Item.
