# One calculateFlexValues function, not Strategy classes

Grow and shrink are two formulas in the flex spec, not a plugin list. `calculateFlexValues(containerWidth, items)` takes the Flex Container width and the Flex Item list and returns Remaining Space, totals, and per-item formula numbers. Helpers may split totals vs grow vs shrink inside that function. Strategy objects (`GrowCalculator` / `ShrinkCalculator`) would add types without a swap we actually perform — both formulas are defined and both appear in the teaching UI.
