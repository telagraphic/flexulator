import { render } from './render.js'
import './app.js'

let nextId = 1

/**
 * Create a Flex Item record with a new stable id.
 *
 * @param {{ grow?: number, shrink?: number, basis?: number }} [fields]
 * @returns {{ id: string, grow: number, shrink: number, basis: number }}
 */
export function createItem({ grow = 1, shrink = 1, basis = 100 } = {}) {
  return {
    id: String(nextId++),
    grow,
    shrink,
    basis,
  }
}

const els = {
  container: document.querySelector('.flexulator__items-container'),
  template: document.querySelector('#flex-item-template'),
  examples: document.querySelector('.formula__tabs-content-container'),
}

const state = {
  width: 0,
  items: [createItem(), createItem(), createItem()],
}

let renderFrame = 0

/**
 * Coalesce mutations to one render per animation frame.
 */
function scheduleRender() {
  if (renderFrame) return
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0
    render(state, els)
  })
}

/**
 * Parse a form value as a number at or above 0. Empty or non-numeric input is ignored.
 *
 * @param {string} value
 * @returns {number | null}
 */
function parseNonNegative(value) {
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return null
  return Math.max(0, n)
}

/**
 * Find the Flex Item whose id matches an Item Card.
 *
 * @param {Element | null} card
 * @returns {{ id: string, grow: number, shrink: number, basis: number } | null}
 */
function itemFromCard(card) {
  if (!card) return null
  const item = state.items.find((entry) => entry.id === card.dataset.id)
  if (!item) return null
  return item
}

/**
 * Patch grow, shrink, or basis from a keystroke on an Item Card input.
 *
 * @param {Event} event
 */
function onItemInput(event) {
  const field = event.target.dataset.field
  if (field !== 'grow' && field !== 'shrink' && field !== 'basis') return
  const item = itemFromCard(event.target.closest('.flex-item'))
  if (!item) return
  const value = parseNonNegative(event.target.value)
  if (value === null) return
  item[field] = value
  scheduleRender()
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
 * @param {Element} button
 * @returns {boolean}
 */
function stepperPatch(button) {
  const item = itemFromCard(button.closest('.flex-item'))
  if (!item) return false

  const field = stepperField(button)
  if (!field) return false

  item[field] = Math.max(0, item[field] + stepperDelta(button, field))
  return true
}

/**
 * Handle Remove and stepper clicks delegated from the Flex Container.
 *
 * @param {MouseEvent} event
 */
function onItemClick(event) {
  if (event.target.closest('.flex-item__remove-button')) {
    const item = itemFromCard(event.target.closest('.flex-item'))
    if (!item || state.items.length === 1) return
    state.items = state.items.filter((entry) => entry.id !== item.id)
    scheduleRender()
    return
  }

  const stepper = event.target.closest('.flex-item__form-button')
  if (stepper && stepperPatch(stepper)) {
    event.preventDefault()
    scheduleRender()
  }
}

/**
 * Read grow, shrink, and basis from the add form. The form is a draft, not a Flex Item.
 *
 * @returns {{ grow: number, shrink: number, basis: number }}
 */
function readAddForm() {
  const form = document.querySelector('.flexulator__form-container')
  const grow = parseNonNegative(form.querySelector('[name="flex-grow"]').value)
  const shrink = parseNonNegative(form.querySelector('[name="flex-shrink"]').value)
  const basis = parseNonNegative(form.querySelector('[name="flex-basis"]').value)
  return {
    grow: grow ?? 1,
    shrink: shrink ?? 1,
    basis: basis ?? 100,
  }
}

/**
 * Append a Flex Item from the add form and render.
 *
 * @param {Event} event
 */
function onAdd(event) {
  event.preventDefault()
  state.items.push(createItem(readAddForm()))
  scheduleRender()
}

/**
 * Grow Demo: set every Basis to 100 so Remaining Space is leftover space.
 *
 * @param {Event} event
 */
function onGrowDemo(event) {
  event.preventDefault()
  for (const item of state.items) {
    item.basis = 100
  }
  scheduleRender()
}

/**
 * Shrink Demo: raise every Basis until the items overflow the Flex Container.
 *
 * @param {Event} event
 */
function onShrinkDemo(event) {
  event.preventDefault()
  const count = state.items.length
  const basis = Math.round(state.width / count + 100)
  for (const item of state.items) {
    item.basis = basis
  }
  scheduleRender()
}

/**
 * Register listeners once, observe Flex Container width, and run the first render.
 */
function boot() {
  if (!els.container || !els.template) return

  els.container.addEventListener('input', onItemInput)
  els.container.addEventListener('click', onItemClick)
  document.querySelector('.flexulator__form-label-button-add-flex-item')
    ?.addEventListener('click', onAdd)
  document.querySelector('.flexulator__form-container')
    ?.addEventListener('submit', onAdd)
  document.querySelector('.flexulator__items-container-grow-button')
    ?.addEventListener('click', onGrowDemo)
  document.querySelector('.flexulator__items-container-shrink-button')
    ?.addEventListener('click', onShrinkDemo)

  const observer = new ResizeObserver(() => {
    state.width = els.container.clientWidth
    scheduleRender()
  })
  observer.observe(els.container)
  state.width = els.container.clientWidth
  scheduleRender()
}

boot()
