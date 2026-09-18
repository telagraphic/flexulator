# Paint through data-field keys that match JS

The Item Card `<template>` and the example formula spans expose `data-field` values equal to snapshot or state keys (`remainingSpace`, `grow`, `measuredWidth`, …). `paintItemCards` writes `textContent`/`value` via those attributes. BEM is skin only: formula numbers share `.flex-item__formula-value`, inputs share `.flex-item__input`. Steppers use `data-step` / `data-dir`, not identity classes.
