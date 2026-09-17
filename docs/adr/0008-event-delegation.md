# Event delegation once at boot, not per Item Card

`main.js` registers listeners once: delegated `input`/`click` (and label hover) on the Flex Container, plus boot-time listeners for the Add form and demos. Item Card mutation logic lives in `item-controls.js` as exported handlers; Main calls them and then `scheduleRender`. `render()` never attaches events. Cloning a template does not require wiring. Per-card `addEventListener` and `data-button-click` flags are gone.
