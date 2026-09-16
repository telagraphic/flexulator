# State list plus one render function, not EventTarget Observer

Grow, shrink, and basis live on a list of Flex Item records. After any mutation, one `render()` writes those records onto Item Cards. We rejected a store class that dispatches events to subscribers, and we rejected giving each card its own object that listens. This page has one screen and one list; `setState` → `render` is enough Observer, and a subscriber graph would be extra code without extra behavior.
