# Module boundaries beyond three files

Supersedes [0006](0006-three-es-modules.md). Scripts remain native ES modules. Split by **named job** (two independent reasons to change you can state), not by pattern names (no store, view class, or orchestrator). Leaves never import Main.

Main is the HTML entry: an unexported class. Importing the script constructs one instance and calls `start()`. Session state (Flex Item list, ids, render coalescing) lives on that instance, not in module-scoped lets. `start()` binds calculator listeners, observes Flex Container width, starts formula teaching UI, and schedules the first render. There is no missing-node guard and no public factory.

**Allowlist:** `calculate.js` (math); `render.js` (sync → apply → paint cycle); `number-flow.js` (NumberFlow config, paint, and resize freeze/thaw; called only from Render); `item-controls.js` (Item Card handlers as exported functions; Main wires `addEventListener` and schedules render when they report a change); `utils.js` (pure DOM-free helpers with ≥2 callers only); `main.js` (unexported class: Add, Grow Demo / Shrink Demo, `start`); `formula-demos.js` (formula tabs + GSAP teaching loops; inert until `startFormulaDemos`). Further modules need a new ADR.

**Forbidden:** `createApp` factory; store / EventTarget; Orchestrator; per–Item Card objects; injecting `scheduleRender` into leaves (including a render-callback setter). Formula teaching notifies Main with a bubbling `formula-tab-change` event on the teaching-examples root; Main listens on that node only. NumberFlow is not imported by Main.
