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
  const classes = button.classList
  if (classes.contains('flex-item__grow-increment') || classes.contains('flex-item__grow-decrement')) {
    return 'grow'
  }
  if (classes.contains('flex-item__shrink-increment') || classes.contains('flex-item__shrink-decrement')) {
    return 'shrink'
  }
  if (classes.contains('flex-item__basis-increment') || classes.contains('flex-item__basis-decrement')) {
    return 'basis'
  }
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
  const incrementClass = `flex-item__${field}-increment`
  if (button.classList.contains(incrementClass)) {
    return step
  }
  return -step
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
  for (const button of labelContainer.querySelectorAll('.flex-item__form-button')) {
    button.classList.toggle('flex-item__form-button--show', show)
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
  if (event.target.closest('.flex-item__remove-button')) {
    const item = itemFromCard(state, event.target.closest('.flex-item'))
    if (!item || state.items.length === 1) return false
    state.items = state.items.filter((entry) => entry.id !== item.id)
    return true
  }

  const stepper = event.target.closest('.flex-item__form-button')
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
  const labelContainer = event.target.closest('.flex-item__form-label-container')
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
  const labelContainer = event.target.closest('.flex-item__form-label-container')
  if (!labelContainer || !container.contains(labelContainer)) return
  const to = event.relatedTarget
  if (to instanceof Node && labelContainer.contains(to)) return
  setStepperVisibility(labelContainer, false)
}
