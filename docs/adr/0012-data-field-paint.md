# Paint through data-field keys that match JS

The Item Card `<template>` and the example formula spans expose `data-field` values equal to snapshot or state keys (`remainingSpace`, `grow`, `measuredWidth`, …). `paintItemCards` writes `textContent`/`value` via those attributes. Existing BEM classes stay for styling and are not the paint API. Renaming `flexulations` classes is UI work.
