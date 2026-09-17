# Flexulator JS architecture (zoom-out)

Target design after the ADRs. Domain words from [CONTEXT.md](../CONTEXT.md).

## ADR map

```
 0001  records + one render()          (not EventTarget, not per-card objects)
 0002  patch Item Cards by id          (not rebuild innerHTML)
 0003  calculateFlexValues             (not Strategy classes)
 0004  render() is the cycle           (not an Orchestrator)
 0005  no grow/shrink mode             (demos only change Basis)
 0006  three ES modules                (superseded by 0016)
 0007  state owns initial three items  empty container + template
 0008  event delegation once at boot
 0009  width from ResizeObserver
 0010  throwaway snapshot shape
 0011  product words in JS             CSS names only in applyFlexStyles
 0012  paint via data-field
 0013  at least one Flex Item          hide Remove when last
 0014  fixture tests on Calculate      browser tests later
 0015  NumberFlow read-only only       native inputs stay inputs
 0016  module boundaries               calculate / render / number-flow /
                                       item-controls / utils / main /
                                       formula-demos
```


CSS `@layer` work is a separate plan, not this map. Add form / Item Card tag markup: [semantic-control-markup.md](semantic-control-markup.md). NumberFlow: [prd-numberflow.md](prd-numberflow.md).

## Modules and callers

```
                    ┌─────────────────────────────────────┐
                    │              MAIN                   │
                    │  state: width + Flex Item[]         │
                    │  createItem, scheduleRender         │
                    │  Add / Grow Demo / Shrink Demo      │
                    │  boot → setupListeners              │
                    │       → observeContainerWidth       │
                    └───────┬───────────────┬─────────────┘
           import handlers  │               │ render(state, els)
                            ▼               ▼
              ┌─────────────────┐   ┌─────────────────────────────────────┐
              │ ITEM-CONTROLS   │   │             RENDER                  │
              │ onItemInput     │   │  render                             │
              │ onItemClick     │   │    ├─ calculateFlexValues  ─────────│──► CALCULATE
              │ onFormLabel…    │   │    ├─ syncItemCards                 │
              └─────────────────┘   │    ├─ applyFlexStyles               │
                                    │    ├─ rAF                           │
                                    │    ├─ paintItemCards ──► NUMBER-FLOW│
                                    │    └─ paintExampleFormulas ─────────│
                                    └─────────────────────────────────────┘
                                                   │
          ┌────────────────────────────────────────┼────────────────────────┐
          ▼                                        ▼                        ▼
   Flex Container                            Item Cards              Example formulas
   (measures width)                          (one per Flex Item)     (item 0 teaching panel)

  formula-demos.js  — formula tabs + GSAP loops (side-imported from Main; not in render cycle)
  utils.js          — parseNonNegative (Add + Item Card input); pure helpers with ≥2 callers only
```

**Who calls whom**

| Callee | Called by | Never called by |
| --- | --- | --- |
| `calculateFlexValues` | `render` only | event handlers, ResizeObserver, paint |
| `render` | Main mutators and the ResizeObserver callback | itself (no nested render) |
| NumberFlow paint helpers | `render` / paint only | Main, item-controls |
| Item Card handlers | Main’s listeners only | Render |
| `syncItemCards` / `applyFlexStyles` / `paintItemCards` / `paintExampleFormulas` | `render` only | Main |
| `createItem` | Main (boot defaults and Add) | Render, Calculate, item-controls |

Calculate does not import Render or Main. Render does not import Main. Item-controls does not import Main (no `scheduleRender` injection). Main holds state, registers listeners, and calls Render.


## Component flow (what the user sees)

```
  Add form (grow/shrink/basis draft)
           │ Add
           ▼
  Flex Item list in state  ──Grow Demo──►  every Basis = 100
           │               ──Shrink Demo─► every Basis = width/n + 100
           │
           ▼
  Flex Container width (ResizeObserver)
           │
           ▼
  Remaining Space = width − sum(Basis)
           │
     ┌─────┴──────┐
     │  >= 0      │  < 0
     ▼            ▼
   Grow         Shrink
   formula      formula
   visible      visible
           │
           ▼
  Item Card: inputs + Measured Width + formula numbers
```

## Render sequence

```
  [boot]
    createItem × 3  →  state.items
    setupListeners
      register click/input/hover on Flex Container  (once; handlers from item-controls)
      register Add, Demos                           (once)
    observeContainerWidth
      ResizeObserver.observe(Flex Container)        (once)
                    │
                    │  first size  OR  any later mutation
                    ▼

  [render]
    1. snapshot = calculateFlexValues(state.width, state.items)
    2. syncItemCards(state.items)
         existing id → keep node
         new id      → clone <template>
         missing id  → remove node
         length === 1 → hide Remove
    3. applyFlexStyles(state.items)
         card.style.flex = grow shrink basis px
    4. requestAnimationFrame
    5. for each Item Card
         measuredWidth = card.clientWidth
         [data-field]  = snapshot.container | snapshot.item | measuredWidth
         skip writing an input that is focused
    6. paintExampleFormulas(snapshot, items[0])
```

## Event sequence (same render every time)

```
  keystroke on grow/shrink/basis
       → patch that Flex Item
       → render

  Add
       → createItem from add-form values
       → append to state.items
       → render

  Remove  (only if length > 1)
       → drop that id from state.items
       → render

  Grow Demo / Shrink Demo
       → patch every Basis
       → render

  container resized
       → state.width = content width
       → render
```

Nothing else writes grow, shrink, basis, or formula numbers. The DOM is not the database; Measured Width is the only value read back from layout.
