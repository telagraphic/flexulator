import { render } from './render.js'
import { NUMBER_FLOW, setNumberFlowAnimated } from './number-flow.js'
import { parseNonNegative } from './utils.js'
import {
  onItemInput,
  onItemClick,
  onFormLabelOver,
  onFormLabelOut,
} from './item-controls.js'
import './formula-demos.js'

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
 * Mark which demo button is active for Grow Demo / Shrink Demo styling.
 *
 * @param {'grow' | 'shrink'} mode
 */
function setDemoActive(mode) {
  const growBtn = document.querySelector('.flexulator__items-container-grow-button')
  const shrinkBtn = document.querySelector('.flexulator__items-container-shrink-button')
  if (growBtn) growBtn.dataset.active = mode === 'grow' ? '1' : '0'
  if (shrinkBtn) shrinkBtn.dataset.active = mode === 'shrink' ? '1' : '0'
}

/**
 * Grow Demo: set every Basis to 100 so Remaining Space is leftover space.
 *
 * @param {Event} event
 */
function onGrowDemo(event) {
  event.preventDefault()
  setDemoActive('grow')
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
  setDemoActive('shrink')
  const count = state.items.length
  const basis = Math.round(state.width / count + 100)
  for (const item of state.items) {
    item.basis = basis
  }
  scheduleRender()
}

/**
 * Register Flex Container, Add form, and demo listeners once.
 */
function setupListeners() {
  els.container.addEventListener('input', (event) => {
    if (onItemInput(state, event)) scheduleRender()
  })
  els.container.addEventListener('click', (event) => {
    if (onItemClick(state, event)) scheduleRender()
  })
  els.container.addEventListener('mouseover', (event) => {
    onFormLabelOver(els.container, event)
  })
  els.container.addEventListener('mouseout', (event) => {
    onFormLabelOut(els.container, event)
  })
  document.querySelector('.flexulator__form-container')
    ?.addEventListener('submit', onAdd)
  document.querySelector('.flexulator__items-container-grow-button')
    ?.addEventListener('click', onGrowDemo)
  document.querySelector('.flexulator__items-container-shrink-button')
    ?.addEventListener('click', onShrinkDemo)
}

/**
 * Observe Flex Container width and schedule render on resize.
 */
function observeContainerWidth() {
  let resizeSettle = 0
  const observer = new ResizeObserver(() => {
    state.width = els.container.clientWidth
    if (!NUMBER_FLOW.animateDuringResize) {
      setNumberFlowAnimated(false)
      clearTimeout(resizeSettle)
      resizeSettle = window.setTimeout(() => {
        setNumberFlowAnimated(true)
        scheduleRender()
      }, 150)
    }
    scheduleRender()
  })
  observer.observe(els.container)
  state.width = els.container.clientWidth
}

/**
 * Register listeners once, observe Flex Container width, and run the first render.
 */
function boot() {
  if (!els.container || !els.template) return
  setupListeners()
  observeContainerWidth()
  scheduleRender()
}

boot()
