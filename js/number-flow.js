import 'number-flow'
import 'number-flow/group'

/** Shared curve for spin / transform / opacity. Swap this string to A/B premium easings. */
const EASE = 'cubic-bezier(0.19, 1, 0.22, 1)'

/** Tunable NumberFlow motion. Edit here for visual A/B after v1. */
export const NUMBER_FLOW = {
  spinTiming: { duration: 350, easing: EASE },
  transformTiming: { duration: 350, easing: EASE },
  opacityTiming: { duration: 200, easing: EASE },
  /** true: digits roll on every resize frame. false: freeze while dragging, animate once when width settles. */
  animateDuringResize: true,
}

/** When false, NumberFlow updates snap with no spin (used during resize freeze). */
let numberFlowAnimated = true

/**
 * Toggle NumberFlow animation for the next paints (and any hosts already on the page).
 *
 * @param {boolean} animated
 */
function setNumberFlowAnimated(animated) {
  numberFlowAnimated = animated
  for (const el of document.querySelectorAll('number-flow')) {
    /** @type {any} */ (el).animated = animated
  }
}

let freezeBound = false

/**
 * When `animateDuringResize` is false, freeze digits while the Flex Container
 * is resizing and thaw ~150ms after it settles. Render passes onSettled so
 * the cycle can paint once with animation on. No-op when the flag is true.
 *
 * @param {Element} container Flex Container
 * @param {() => void} [onSettled]
 */
export function observeResizeFreeze(container, onSettled) {
  if (freezeBound || !container) return
  freezeBound = true
  if (NUMBER_FLOW.animateDuringResize) return

  let resizeSettle = 0
  const observer = new ResizeObserver(() => {
    setNumberFlowAnimated(false)
    clearTimeout(resizeSettle)
    resizeSettle = window.setTimeout(() => {
      setNumberFlowAnimated(true)
      onSettled?.()
    }, 150)
  })
  observer.observe(container)
}

const FRACTION_FIELDS = new Set(['growShare', 'shrinkFactor'])

/** @type {WeakMap<Element, number>} */
const lastPainted = new WeakMap()

/**
 * Intl format options for a NumberFlow host from its data-field key.
 *
 * @param {string} key
 * @returns {Intl.NumberFormatOptions}
 */
function numberFlowFormat(key) {
  if (FRACTION_FIELDS.has(key)) {
    return {
      useGrouping: false,
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }
  }
  return {
    useGrouping: false,
    maximumFractionDigits: 0,
  }
}

/**
 * Configure a NumberFlow host once, then update when the value changes.
 *
 * @param {HTMLElement & { update: (value: number) => void, format?: Intl.NumberFormatOptions, spinTiming?: object, transformTiming?: object, opacityTiming?: object, animated?: boolean }} flow
 * @param {string} key
 * @param {number} value
 */
export function paintNumberFlow(flow, key, value) {
  const hasLayout = flow.offsetWidth > 0 && flow.offsetHeight > 0
  if (lastPainted.get(flow) === value && hasLayout) return
  if (!flow.dataset.numberFlowReady) {
    flow.format = numberFlowFormat(key)
    flow.spinTiming = NUMBER_FLOW.spinTiming
    flow.transformTiming = NUMBER_FLOW.transformTiming
    flow.opacityTiming = NUMBER_FLOW.opacityTiming
    flow.dataset.numberFlowReady = '1'
  }
  flow.animated = numberFlowAnimated && hasLayout
  flow.update(value)
  lastPainted.set(flow, value)
}