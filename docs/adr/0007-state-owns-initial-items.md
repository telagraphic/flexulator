# Initial Flex Items come from state; one template clones Item Cards

The page ships an empty Flex Container and a single `<template>` for an Item Card. `main.js` starts with three Flex Item records (grow 1, shrink 1, basis 100). First `render()` clones cards to match that list. Add uses the same template. We do not keep three hard-coded cards in HTML and a parallel list in JS, and we do not hydrate canonical grow/shrink/basis from the DOM after boot.
