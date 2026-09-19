import { render } from './render.js'
import { parseNonNegative } from './utils.js'
import {
  onItemInput,
  onItemClick,
  onFormLabelOver,
  onFormLabelOut,
} from './item-controls.js'
import { startFormulaDemos } from './formula-demos.js'

/**
 * HTML entry session: Flex Item list, calculator listeners, and coalesced render.
 * Not exported. Importing this Module constructs one instance and calls start.
 */
class Main {
  #nextId = 1
  #renderFrame = 0
  #els
  #state

  constructor() {
    this.#els = {
      container: document.querySelector('.flexulator__items'),
      template: document.querySelector('#flex-item-template'),
      examples: document.querySelector('.formula__panels'),
      addForm: document.querySelector('.add-form'),
      growDemo: document.querySelector('.flexulator__grow-demo'),
      shrinkDemo: document.querySelector('.flexulator__shrink-demo'),
    }
    this.#state = {
      width: 0,
      items: [this.#createItem(), this.#createItem(), this.#createItem()],
    }
  }

  /**
   * Bind calculator listeners, observe Flex Container width, and run the first render.
   */
  start() {
    this.#setupListeners()
    this.#observeContainerWidth()
    startFormulaDemos(this.#els.examples)
    this.#scheduleRender()
  }

  /**
   * Create a Flex Item record with a new stable id.
   *
   * @param {{ grow?: number, shrink?: number, basis?: number }} [fields]
   * @returns {{ id: string, grow: number, shrink: number, basis: number }}
   */
  #createItem({ grow = 1, shrink = 1, basis = 100 } = {}) {
    return {
      id: String(this.#nextId++),
      grow,
      shrink,
      basis,
    }
  }

  /**
   * Coalesce mutations to one render per animation frame.
   */
  #scheduleRender() {
    if (this.#renderFrame) return
    this.#renderFrame = requestAnimationFrame(() => {
      this.#renderFrame = 0
      render(this.#state, this.#els)
    })
  }

  /**
   * Read grow, shrink, and basis from the add form. The form is a draft, not a Flex Item.
   *
   * @returns {{ grow: number, shrink: number, basis: number }}
   */
  #readAddForm() {
    const form = this.#els.addForm
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
  #onAdd(event) {
    event.preventDefault()
    this.#state.items.push(this.#createItem(this.#readAddForm()))
    this.#scheduleRender()
  }

  /**
   * Mark which demo button is active for Grow Demo / Shrink Demo styling.
   *
   * @param {'grow' | 'shrink'} mode
   */
  #setDemoActive(mode) {
    const { growDemo, shrinkDemo } = this.#els
    if (growDemo) growDemo.dataset.active = mode === 'grow' ? '1' : '0'
    if (shrinkDemo) shrinkDemo.dataset.active = mode === 'shrink' ? '1' : '0'
  }

  /**
   * Grow Demo: set every Basis to 100 so Remaining Space is leftover space.
   *
   * @param {Event} event
   */
  #onGrowDemo(event) {
    event.preventDefault()
    this.#setDemoActive('grow')
    for (const item of this.#state.items) {
      item.basis = 100
    }
    this.#scheduleRender()
  }

  /**
   * Shrink Demo: raise every Basis until the items overflow the Flex Container.
   *
   * @param {Event} event
   */
  #onShrinkDemo(event) {
    event.preventDefault()
    this.#setDemoActive('shrink')
    const count = this.#state.items.length
    const basis = Math.round(this.#state.width / count + 100)
    for (const item of this.#state.items) {
      item.basis = basis
    }
    this.#scheduleRender()
  }

  /**
   * Register Flex Container, Add form, demo, and formula-tab listeners once.
   */
  #setupListeners() {
    const { container, addForm, growDemo, shrinkDemo, examples } = this.#els

    container.addEventListener('input', (event) => {
      if (onItemInput(this.#state, event)) this.#scheduleRender()
    })
    container.addEventListener('click', (event) => {
      if (onItemClick(this.#state, event)) this.#scheduleRender()
    })
    container.addEventListener('mouseover', (event) => {
      onFormLabelOver(container, event)
    })
    container.addEventListener('mouseout', (event) => {
      onFormLabelOut(container, event)
    })
    addForm?.addEventListener('submit', (event) => this.#onAdd(event))
    growDemo?.addEventListener('click', (event) => this.#onGrowDemo(event))
    shrinkDemo?.addEventListener('click', (event) => this.#onShrinkDemo(event))
    examples?.addEventListener('formula-tab-change', () => this.#scheduleRender())
  }

  /**
   * Observe Flex Container width and schedule render on resize.
   */
  #observeContainerWidth() {
    const { container } = this.#els
    const observer = new ResizeObserver(() => {
      this.#state.width = container.clientWidth
      this.#scheduleRender()
    })
    observer.observe(container)
    this.#state.width = container.clientWidth
  }
}

new Main().start()
