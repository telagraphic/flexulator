import { parseNonNegative } from './utils.js'

/**
 * Find the Flex Item whose id matches an Item Card.
 *
 * @param {{ items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {Element | null} card
 * @returns {{ id: string, grow: number, shrink: number, basis: number } | null}
 */
function itemFromCard(state, card) {
  if (!card) return null
  const item = state.items.find((entry) => entry.id === card.dataset.id)
  if (!item) return null
  return item
}

/**
 * Which Flex Item field a stepper button belongs to, or null if it is not a stepper.
 *
 * @param {Element} button
 * @returns {'grow' | 'shrink' | 'basis' | null}
 */
function stepperField(button) {
  const field = button.dataset.step
  if (field === 'grow' || field === 'shrink' || field === 'basis') return field
  return null
}

/**
 * Pixel or unit change for a stepper click. Basis steps by 50; grow and shrink by 1.
 *
 * @param {Element} button
 * @param {'grow' | 'shrink' | 'basis'} field
 * @returns {number}
 */
function stepperDelta(button, field) {
  const step = field === 'basis' ? 50 : 1
  return button.dataset.dir === 'up' ? step : -step
}

/**
 * Apply a stepper click to that Flex Item. Returns false when the click is not a stepper.
 *
 * @param {{ items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {Element} button
 * @returns {boolean}
 */
function stepperPatch(state, button) {
  const item = itemFromCard(state, button.closest('.flex-item'))
  if (!item) return false

  const field = stepperField(button)
  if (!field) return false

  item[field] = Math.max(0, item[field] + stepperDelta(button, field))
  return true
}

/**
 * Show or hide Grow / Shrink / Basis steppers on a label row.
 *
 * @param {Element} labelContainer
 * @param {boolean} show
 */
function setStepperVisibility(labelContainer, show) {
  for (const button of labelContainer.querySelectorAll('.flex-item__stepper')) {
    button.classList.toggle('flex-item__stepper--show', show)
  }
}

/**
 * Patch grow, shrink, or basis from a keystroke on an Item Card input.
 * Returns true when state changed and Main should schedule a render.
 *
 * @param {{ items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {Event} event
 * @returns {boolean}
 */
export function onItemInput(state, event) {
  const field = event.target.dataset.field
  if (field !== 'grow' && field !== 'shrink' && field !== 'basis') return false
  const item = itemFromCard(state, event.target.closest('.flex-item'))
  if (!item) return false
  const value = parseNonNegative(event.target.value)
  if (value === null) return false
  item[field] = value
  return true
}

/**
 * Handle Remove and stepper clicks delegated from the Flex Container.
 * Returns true when state changed and Main should schedule a render.
 *
 * @param {{ items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {MouseEvent} event
 * @returns {boolean}
 */
export function onItemClick(state, event) {
  if (event.target.closest('.flex-item__remove')) {
    const item = itemFromCard(state, event.target.closest('.flex-item'))
    if (!item || state.items.length === 1) return false
    state.items = state.items.filter((entry) => entry.id !== item.id)
    return true
  }

  const stepper = event.target.closest('.flex-item__stepper')
  if (stepper && stepperPatch(state, stepper)) {
    event.preventDefault()
    return true
  }
  return false
}

/**
 * Reveal steppers when the pointer enters a Grow / Shrink / Basis label row.
 *
 * @param {Element} container
 * @param {MouseEvent} event
 */
export function onFormLabelOver(container, event) {
  const labelContainer = event.target.closest('.flex-item__field-row')
  if (!labelContainer || !container.contains(labelContainer)) return
  const from = event.relatedTarget
  if (from instanceof Node && labelContainer.contains(from)) return
  setStepperVisibility(labelContainer, true)
}

/**
 * Hide steppers when the pointer leaves that label row.
 *
 * @param {Element} container
 * @param {MouseEvent} event
 */
export function onFormLabelOut(container, event) {
  const labelContainer = event.target.closest('.flex-item__field-row')
  if (!labelContainer || !container.contains(labelContainer)) return
  const to = event.relatedTarget
  if (to instanceof Node && labelContainer.contains(to)) return
  setStepperVisibility(labelContainer, false)
}

/** @type {number} */
let readoutAnchorId = 0

/**
 * The Formula row under the pointer or focus, or null.
 *
 * @param {Element} container
 * @param {EventTarget | null} target
 * @returns {HTMLElement | null}
 */
function formulaRowFrom(container, target) {
  if (!(target instanceof Element)) return null
  const row = target.closest('.flex-item__formula-row')
  if (!(row instanceof HTMLElement) || !container.contains(row)) return null
  if (row.closest('[inert]')) return null
  return row
}

/**
 * @param {HTMLElement} row
 * @returns {HTMLElement | null}
 */
function readoutFor(row) {
  const readout = row.querySelector(':scope > .flex-item__formula-readout')
  return readout instanceof HTMLElement ? readout : null
}

/**
 * Give the equation a unique anchor so cloned cards do not share one name.
 *
 * @param {HTMLElement} row
 * @param {HTMLElement} readout
 */
function anchorReadout(row, readout) {
  const equation = row.querySelector('.flex-item__formula-equation')
  if (!(equation instanceof HTMLElement)) return
  if (!row.style.anchorName) {
    readoutAnchorId += 1
    row.style.anchorName = `--formula-row-${readoutAnchorId}`
    readout.id = `formula-readout-${readoutAnchorId}`
    row.setAttribute('aria-controls', readout.id)
  }
  readout.style.positionAnchor = row.style.anchorName
  const rowRect = row.getBoundingClientRect()
  const equationRect = equation.getBoundingClientRect()
  readout.style.setProperty('--equation-offset', `${equationRect.left - rowRect.left}px`)
}

/**
 * @param {HTMLElement} readout
 * @param {boolean} instant
 */
function hideReadout(readout, instant) {
  if (!readout.matches(':popover-open')) return
  readout.classList.toggle('is-instant', instant)
  readout.hidePopover()
  readout.closest('.flex-item__formula-row')?.setAttribute('aria-expanded', 'false')
}

/**
 * Open this row's readout. Another open readout hides immediately.
 *
 * @param {HTMLElement} row
 */
function showReadout(row) {
  const readout = readoutFor(row)
  if (!readout) return
  const container = row.closest('.flexulator__items')
  const open = container?.querySelector('.flex-item__formula-readout:popover-open')
  if (open instanceof HTMLElement && open !== readout) hideReadout(open, true)
  if (readout.matches(':popover-open')) return
  anchorReadout(row, readout)
  readout.classList.remove('is-instant')
  readout.showPopover()
  row.setAttribute('aria-expanded', 'true')
}

/**
 * True when the pointer or focus is still inside this row's equation, not its readout.
 *
 * @param {HTMLElement} row
 * @param {EventTarget | null} to
 * @returns {boolean}
 */
function stayedInRow(row, to) {
  if (!(to instanceof Node) || !row.contains(to)) return false
  if (to instanceof Element && to.closest('.flex-item__formula-readout')) return false
  return true
}

/**
 * @param {HTMLElement} row
 * @param {EventTarget | null} to
 * @returns {boolean}
 */
function movedToFormulaRow(row, to) {
  if (!(to instanceof Element)) return false
  const next = to.closest('.flex-item__formula-row')
  return next instanceof HTMLElement && next !== row && !next.closest('[inert]')
}

/**
 * Show the Formula readout when the pointer enters that row.
 *
 * @param {Element} container
 * @param {PointerEvent} event
 */
export function onFormulaRowOver(container, event) {
  if (event.pointerType === 'touch') return
  const row = formulaRowFrom(container, event.target)
  if (!row) return
  if (stayedInRow(row, event.relatedTarget)) return
  showReadout(row)
}

/**
 * Fade the readout closed when the pointer leaves the formulas.
 * Moving to another row lets that row open and hide this one immediately.
 *
 * @param {Element} container
 * @param {PointerEvent} event
 */
export function onFormulaRowOut(container, event) {
  if (event.pointerType === 'touch') return
  const row = formulaRowFrom(container, event.target)
  if (!row) return
  if (stayedInRow(row, event.relatedTarget)) return
  if (movedToFormulaRow(row, event.relatedTarget)) return
  if (document.activeElement === row) return
  const readout = readoutFor(row)
  if (readout) hideReadout(readout, false)
}

/**
 * Keep a mouse click from focusing the row. Hover already opened the readout.
 *
 * @param {Element} container
 * @param {PointerEvent} event
 */
export function onFormulaRowPointerDown(container, event) {
  if (event.pointerType !== 'mouse' && event.pointerType !== 'touch') return
  const row = formulaRowFrom(container, event.target)
  if (!row) return
  event.preventDefault()
}

/**
 * Tap toggles the readout. Mouse clicks do not.
 *
 * @param {Element} container
 * @param {PointerEvent} event
 */
export function onFormulaRowPointerUp(container, event) {
  if (event.pointerType === 'mouse') return
  const row = formulaRowFrom(container, event.target)
  if (!row) return
  const readout = readoutFor(row)
  if (!readout) return
  if (readout.matches(':popover-open')) hideReadout(readout, false)
  else showReadout(row)
}

/**
 * Open the readout when a formula row is focused from the keyboard.
 *
 * @param {Element} container
 * @param {FocusEvent} event
 */
export function onFormulaRowFocusIn(container, event) {
  const row = formulaRowFrom(container, event.target)
  if (!row || event.target !== row) return
  showReadout(row)
}

/**
 * Fade the readout closed when focus leaves the formulas.
 *
 * @param {Element} container
 * @param {FocusEvent} event
 */
export function onFormulaRowFocusOut(container, event) {
  const row = formulaRowFrom(container, event.target)
  if (!row) return
  if (movedToFormulaRow(row, event.relatedTarget)) return
  const readout = readoutFor(row)
  if (readout) hideReadout(readout, false)
}

/**
 * Escape fades the open readout closed.
 *
 * @param {Element} container
 * @param {KeyboardEvent} event
 */
export function onFormulaRowKeyDown(container, event) {
  if (event.key !== 'Escape') return
  const open = container.querySelector('.flex-item__formula-readout:popover-open')
  if (!(open instanceof HTMLElement)) return
  hideReadout(open, false)
  event.preventDefault()
}

/**
 * A pointer down outside the open row fades that readout closed.
 *
 * @param {Element} container
 * @param {PointerEvent} event
 */
export function onFormulaReadoutPointerDown(container, event) {
  const open = container.querySelector('.flex-item__formula-readout:popover-open')
  if (!(open instanceof HTMLElement)) return
  const row = open.closest('.flex-item__formula-row')
  if (row && event.target instanceof Node && row.contains(event.target)) return
  hideReadout(open, false)
}
