# Event delegation once at boot, not per Item Card

`main.js` registers listeners once: delegated `input`/`click` on the Flex Container (read `data-id`, patch the Flex Item, `render()`), plus boot-time listeners for the add form, demos, and remove. `render()` never attaches events. Cloning a template does not require wiring. Per-card `addEventListener` and `data-button-click` flags are gone.
