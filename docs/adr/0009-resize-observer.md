# Flex Container width comes from ResizeObserver

`state.width` is the Flex Container's `contentRect`/`clientWidth`, not the window. A `ResizeObserver` on that element writes width and coalesces to one `render()` per animation frame. The first callback is also boot width. `calculateFlexValues` still takes width as an argument so math stays DOM-free. `window.resize` is not used.
