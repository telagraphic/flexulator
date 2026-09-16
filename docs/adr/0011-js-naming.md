# Product words in JS; CSS names only at the DOM boundary

State and `calculateFlexValues` use `grow`, `shrink`, `basis`, and the snapshot names in ADR 0010. `applyFlexStyles` is the only place that uses `flexGrow` / `flexShrink` / `flexBasis` / `flex`. Markup class names stay until UI work; [docs/naming.md](../naming.md) is the map from JS fields to current selectors. Do not put CSS identifiers on Flex Item records.
