# Three ES modules: calculate, render, main

Scripts load as native ES modules (`type="module"`). Split is by reason to change, not by pattern name: `calculate.js` owns `calculateFlexValues`; `render.js` syncs Item Cards, applies flex styles, and paints numbers; `main.js` owns state, events, and boot and calls `render`. View classes, a store module, and a formula-view module were rejected. Further files are allowed only when one of these three has two reasons to change — not up front.
