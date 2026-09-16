# Fixture tests for calculateFlexValues; browser tests later

`calculate.js` gets a small fixture file (Node’s built-in test runner, no extra framework) that asserts known snapshots: e.g. three Flex Items, grow 1, basis 100, container width 1440 → remainingSpace 1140, allocatedSpace 380. Tests run on every math change. When `totalGrow` or `totalShrinkBasis` is 0, shares and amounts are 0, not NaN. Browser/integration tests wait until after the UI pass.
