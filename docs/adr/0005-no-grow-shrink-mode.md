# Grow and shrink are not a calculation mode

`calculateFlexValues` always returns both grow and shrink fields. Which formula the Item Card shows follows Remaining Space (positive → grow, negative → shrink). The GROW/SHRINK controls are demos: they patch every Flex Item's Basis so leftover space or overflow actually happens. A `state.mode` that selected which formula to run would disagree with the browser whenever Basis no longer matches that mode.
