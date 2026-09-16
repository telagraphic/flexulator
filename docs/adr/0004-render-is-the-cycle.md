# render() is the cycle; there is no Orchestrator object

After any state change, `render()` runs a fixed order: `calculateFlexValues` → sync Item Cards by id → apply `flex` styles → next animation frame → paint Measured Width and formula numbers. Listeners and ResizeObserver are registered once at boot, not inside that loop. A separate Orchestrator class would duplicate this timeline and recreate the current God Object’s long `update*` list.
