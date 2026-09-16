# Audit: current JavaScript vs the refactor

Read this when you want to remember *why* we are rewriting the calculator, not only *what* the new modules are. Evidence is from the code as of the `refactor-javascript` branch. Domain words match [CONTEXT.md](../CONTEXT.md). Fixes match [PRD](prd-javascript-refactor.md) and [architecture.md](architecture.md).

The site still *works* as a demo. The problems are that the same facts are stored many times, every user action takes a different path, layout is guessed with timeouts, and the teaching math cannot be tested without a browser. The refactor does not change the lesson (grow/shrink/basis, Remaining Space, Item Cards). It makes one list of Flex Items and one render cycle the only way those facts move.

---

## 1. There is no single source of truth for a Flex Item

**What the code does.** Each child from `newFlexItemObject()` keeps grow, shrink, and basis in three bags at once: `style`, `form`, and `flexulations` ([`js/flexItem.js`](../js/flexItem.js) lines 3–101). The DOM is a fourth copy (`style.flexGrow` / the `<input>`). `updateForm` writes all of them by hand (lines 226–251). The parent also keeps `flexulator.flexItems` (objects) and `flexulator.elements.flexItems` (nodes) as two lists that must be spliced together on remove.

**Why it hurts.** A teaching calculator is only useful if the number in the grow field, the `flex` style, and the formula are the same fact. Today they can drift: `updateFlexItemWidths` even writes `item.flexulations.form.width` (line 45 of [`js/flexulator.js`](../js/flexulator.js)) even though `flexulations` has no `form` key — it creates a fourth side structure at runtime. You cannot answer “what is this item’s basis?” without choosing which copy to trust.

**How we address it.** Canonical state is `{ id, grow, shrink, basis }[]` plus Flex Container width. Derived numbers live on a throwaway snapshot from `calculateFlexValues`. The DOM is written *from* that, not read back (except Measured Width after layout). ADR 0001, 0010, 0011.

**Before / after**

```
BEFORE                          AFTER
item.style.grow = 2             state.items[1] = { id, grow: 2, shrink, basis }
item.form.grow = 2                    |
item.flexulations.grow.value = 2      +-- calculateFlexValues → snapshot
input.value = 2                       +-- applyFlexStyles → card.style.flex
el.style.flexGrow = 2                 +-- paint → [data-field="grow"]
```

```js
// before — one keystroke writes three bags + CSS
this.form.grow = n
this.style.grow = n
this.flexulations.grow.value = n
this.elements.self.style.flexGrow = n

// after — one record; render is the only writer
items[i] = { ...items[i], grow: n }
render(state)
```

---

## 2. The parent is a God Object; initialize is a 20-step ritual

**What the code does.** `flexulator` owns DOM refs, totals, the item array, HTML templating, every event, Grow/Shrink demos, and the example formula panel. `initialize` is a 15-call list mixing boot (listeners) with math (totals) with paint (example formulas) ([`js/flexulator.js`](../js/flexulator.js) lines 16–36). `updateFormValue` after a keystroke is another 8-call list (137–154). Add is yet another (159–171). Resize is a shorter, *different* list (508–514) that skips shrink-basis totals.

**Why it hurts.** You cannot change “how we paint” without reading “how we add.” You cannot test Remaining Space without constructing the whole object and a container. Three user actions (type, add, resize) recompute the world through three similar-but-not-equal pipelines, so bugs show up only on one path (classic: resize looks fine, add does not).

**How we address it.** Main mutates records and always calls `render()`. Render always runs the same sequence. Calculate is the only math. Listeners are registered once at boot, not inside the cycle. ADR 0004, 0006, 0008.

**Before / after**

```
BEFORE (three pipelines)              AFTER (one)

type  → updateFormValue → 8 updates   type  ─┐
add   → 10 updates + timeouts         add   ─┼→ patch state → render()
resize→ 4 updates (skips shrink tot)  resize─┘     │
                                                   v
                                              calculate
                                              sync cards
                                              apply flex
                                              rAF + paint
```

```js
// before — initialize is boot + math + paint in one list
updateWidth(); updateFlexItems(); updateFlexTotalBasis();
createFlexItems(); updateForm(); setupRemoveButton();
updateGrowExample(); updateFlexItemGrowFormulaExample(); // …

// after
bootListenersOnce()
onAnyChange(() => render(state))
```

---

## 3. Math is mixed into DOM writes and cannot be tested

**What the code does.** Grow allocated space is `updatedGrowWidth` on the child object (flexItem.js 194–196): it reads `this.flexulations` and writes back onto the same object, then `writeItemFlexulations` dumps `textContent`. Shrink factor is `updateShrinkFactor` (214–216), which divides by `basisTotal` with no zero guard. `parseFloat(x, 10)` is used as if it took a radix (it does not). Totals are reduced from **DOM** `style.flexBasis` / `style.flexGrow` in the parent (flexulator.js 52–55, 106–108), not from the records.

**Why it hurts.** The product *is* the formulas. If they are glued to querySelector and `textContent`, a maintainer cannot assert “three items, basis 100, width 1440 → Remaining Space 1140” without a browser. `totalGrow === 0` or `totalShrinkBasis === 0` becomes `NaN` on the Item Card. Rounding (`toFixed(0)` then `parseInt`) is buried inside paint.

**How we address it.** `calculateFlexValues(width, items) → snapshot` is pure. Fixture tests are the first automated tests in the repo (ADR 0014). Zero totals yield `0`, not `NaN`. Measured Width stays a DOM read *after* styles are applied, not a field Calculate invents.

**Before / after**

```
BEFORE
  updatedGrowWidth()
    reads this.flexulations.*
    writes this.flexulations.grow.width
    then writeItemFlexulations() → textContent
  (needs a live Item Card)

AFTER
  calculateFlexValues(1440, items) → { remainingSpace: 1140, items: [...] }
  assert in Node — no document
```

```js
// before
let growWidth = (this.flexulations.grow.value / this.flexulations.grow.total)
  * this.flexulations.container.remainingSpace
this.elements.flexulations.grow.width.forEach(el => el.textContent = …)

// after
export function calculateFlexValues(width, items) { /* no DOM */ }
test('three equal items', () => {
  const s = calculateFlexValues(1440, items)
  assert.equal(s.container.remainingSpace, 1140)
  assert.equal(s.items[0].allocatedSpace, 380)
})
```

---

## 4. Layout is synchronized with setTimeout, not with the browser

**What the code does.** After an input change, Measured Width is refreshed in `setTimeout(..., 1000)` (flexulator.js 144–146). After add, buttons are wired in `setTimeout(..., 500)` (398–401). After remove, totals recompute in `setTimeout(..., 500)` (435–443). Those delays exist because Item Cards use `transition: width .5s, flex .5s` in Sass — JS guesses when layout finished.

**Why it hurts.** For one second after a keystroke, the big width can be the *previous* layout. Resize has no timeout and reads `clientWidth` immediately, so resize and typing disagree. Timeouts also hide race conditions: add a card, click increment before 500ms, and the new node has no handler (see issue 6). This is the same class of bug that would make NumberFlow lie later.

**How we address it.** `applyFlexStyles` then `requestAnimationFrame` then read `clientWidth`. No layout CSS transition on flex/width in the JS pass (that fight is documented in the CSS plan). Width itself comes from ResizeObserver on the Flex Container, not `window.resize` plus hope (ADR 0009).

**Before / after**

```
BEFORE                         AFTER
keystroke                      keystroke
  write flex                     applyFlexStyles
  paint formulas now             requestAnimationFrame ──┐
  wait 1000ms ─────┐             read clientWidth        │
  then Measured Width            paint formulas + width ─┘
```

```js
// before
itemToUpdate.updateForm(property)
setTimeout(() => flexulator.updateFlexItemWidths(), 1000)

// after
applyFlexStyles(state.items)
requestAnimationFrame(() => {
  paintItemCards(snapshot) // measuredWidth = card.clientWidth
})
```

---

## 5. Item Cards are copy-pasted four times and rebuilt as a string

**What the code does.** [`index.html`](../index.html) hard-codes three nearly identical `<article class="flex-item">` blocks. `addFlexItem` pastes a ~150-line template string that must stay in sync (flexulator.js 256–394). Selectors live in a third place (`selectors` on the child object). A class rename or a new formula span means three edits or the new card is missing a hook.

**Why it hurts.** The calculator’s UI *is* that card. Drift between the static three and Add is a silent product bug (wrong `data-id`, missing shrink span, opacity copied from demo buttons as a string).

**How we address it.** One `<template>`. State owns the first three Flex Items. `syncItemCards` clones or removes by id (ADR 0002, 0007). Paint finds spans with `data-field` matching snapshot keys (ADR 0012), not a parallel `selectors` tree.

**Before / after**

```
BEFORE                         AFTER
index.html   card × 3          <template id="flex-item">   × 1
addFlexItem  string × 1        state.items                 × N
flexItem.selectors × 1         clone on add / remove node
```

```html
<!-- after: one shape, JS keys on the node -->
<template id="flex-item">
  <article class="flex-item" data-id="">
    <h4 data-field="measuredWidth"></h4>
    <input data-field="grow" type="number">
    <span data-field="remainingSpace"></span>
  </article>
</template>
```

---

## 6. Events are per-node and re-bound; Add is a flag festival

**What the code does.** `updateForm` adds an `input` listener on every Item Card (124–135). Add calls `updateForm()` again (170), so every old card gets another listener. Click handlers for +/- use `data-button-click` to avoid doubles (192–197). Remove uses `data-remove-button`. Hover for steppers is `mouseenter` on every label, also re-run on add (174–185).

**Why it hurts.** Each Add makes typing more expensive and can fire `updateFormValue` more than once per keystroke. The flags are an admission that the team could not tell whether a node was already wired. New cards are deaf until a timeout.

**How we address it.** One delegated `input`/`click` on the Flex Container, registered at boot. Cloning a template does not attach listeners. `render()` never binds events (ADR 0008).

**Before / after**

```
BEFORE (Add clicked twice)          AFTER (boot once)
card0 input × 3                     Flex Container
card1 input × 3                       input  ──┐
card2 input × 3                       click  ──┴─→ read data-id → patch → render
+ data-button-click flags             new card needs no wiring
```

```js
// before — Add calls this again; old cards stack listeners
flexulator.elements.flexItems.forEach(item => {
  item.addEventListener('input', …)
})

// after
container.addEventListener('input', (e) => {
  const card = e.target.closest('[data-id]')
  patchItem(card.dataset.id, e.target.dataset.field, e.target.value)
  render(state)
})
```

---

## 7. Grow / Shrink buttons look like a mode; they actually rewrite Basis

**What the code does.** The buttons set `dataset.active` and flip formula `opacity` (466–475, 496–505). Shrink also sets every basis to `width/n + 100`; Grow sets every basis to `100`. Meanwhile `updateItemContainerFlexulations` still computes **both** grow and shrink (flexItem.js 157–165). Resize updates both example panels regardless of `dataset.active`.

**Why it hurts.** Learners (and future us) read the UI as “shrink mode.” If we branched Calculate on that flag, the columns could grow while the card taught shrink (Remaining Space positive, sticky mode). Opacity-hidden formulas stay in the accessibility tree. The real algorithm is Remaining Space’s sign, which is what the browser uses.

**How we address it.** No `state.mode`. Demos only patch Basis. Visible formula follows Remaining Space. Both formula fields always come from Calculate (ADR 0005).

**Before / after**

```
BEFORE                              AFTER
[GROW] dataset.active=1             [Grow Demo]  every basis = 100
       opacity grow=1 shrink=0      [Shrink Demo] every basis = width/n+100
[SHRINK] also rewrites every basis         |
calculate still runs BOTH                  v
                                    Remaining Space >= 0 → show grow formula
                                    Remaining Space <  0 → show shrink formula
                                    snapshot always has both
```

```js
// before
shrinkButton.dataset.active = 1
growPanel.style.opacity = 0
shrinkPanel.style.opacity = 1

// after
items.forEach(item => { item.basis = 100 }) // Grow Demo
render(state)
growPanel.hidden = snapshot.container.remainingSpace < 0
```

---

## 8. Two lists, string vs number ids, and Measured Width from the wrong node

**What the code does.** Objects use `item.id` as a number (`parseInt`). Markup uses `data-id`. Remove compares with `==`. Add uses `length` as the next id, so after remove-and-add, ids can collide with a leftover object if the two lists disagree. `writeItemFlexulations` sets the big width from `this.elements.form.width.clientWidth` (flexItem.js 171) — that is the **heading** element’s box, not necessarily the Item Card’s `clientWidth`. Final shrink width uses the same heading (185). `updateClientWidth` (222–224) reads `clientWidth` and discards it.

**Why it hurts.** Identity bugs show up as “the wrong card updated.” The headline number of the product (Measured Width) is not even documented as a card measurement. Dead methods stay because nothing tests them.

**How we address it.** Stable string ids on the record; `data-id` matches. One list of Flex Items. Measured Width is `card.clientWidth` after layout, painted to `data-field="measuredWidth"`. Never empty the list; hide Remove at length 1 (ADR 0013) so we do not also have to invent empty-state math.

**Before / after**

```
BEFORE                              AFTER
flexItems[]     id: 0 (number)      items[]  { id: "item-1", grow, shrink, basis }
elements[]      data-id="0" (str)   cards    data-id="item-1"
findIndex with ==                   one list; match by id
width = h4.clientWidth              width = article.clientWidth
```

```js
// before — the "width" heading, not the column
this.elements.form.width.textContent = this.elements.form.width.clientWidth

// after
const measuredWidth = card.clientWidth
card.querySelector('[data-field="measuredWidth"]').textContent = measuredWidth
```

---

## 9. Modules were started and then abandoned

**What the code does.** `flexItem.js` and `flexulator.js` have commented `import`/`export`. [`index.html`](../index.html) loads `js/scripts.min.js` (Terser concat of the three files). `app.js` (tabs + GSAP) is a third global. Order of the concat **is** the dependency graph.

**Why it hurts.** You cannot test Calculate in Node without pretending `document` exists. You cannot see what depends on what. The next feature lands in the God Object because that is the only load path.

**How we address it.** Native ES modules: Calculate, Render, Main. Terser minify from those modules. Render does not import Main (no cycle).

**Before / after**

```
BEFORE                              AFTER
// import …  (commented)            calculate.js  ←── render.js ←── main.js
flexItem.js ─┐                      (no DOM)         (DOM)         (state, events)
flexulator.js┼─ terser ─ scripts.min.js
app.js      ─┘  (order = graph)     <script type="module" src="js/main.js">
```

```js
// before
function newFlexItemObject() { … }  // global
const flexulator = { … }
flexulator.initialize('.flexulator__items-container')

// after
import { calculateFlexValues } from './calculate.js'
import { render } from './render.js'
```

---

## What we are not calling a JS bug (parked)

- Unnamed +/- buttons, `outline: none`, hover-only steppers, formula tabs as `<section>`s — accessibility/UI, later pass.
- Sass `flexulations` class names — mapped in [naming.md](naming.md); rename with CSS layers, not this rewrite.
- Calculator `display: none` below ~1000px — layout/a11y, not the data model.
- GSAP looping demos in `app.js` — page chrome below the calculator.

Those can stay ugly while the calculator’s numbers become honest.

---

## How to use this with the plan

| If you are thinking… | Read |
| --- | --- |
| What is a Flex Item vs Item Card? | CONTEXT.md |
| What did we decide? | docs/adr/0001–0014 |
| What calls what? | architecture.md |
| What are we building for users? | prd-javascript-refactor.md / GitHub #45 |
| Why not EventTarget / Strategy / Orchestrator? | ADRs 0001, 0003, 0004 — those would wrap this audit, not remove it |
