import { calculateFlexValues } from './calculate.js'
import { paintNumberFlow, observeResizeFreeze } from './number-flow.js'

const FRACTION_FIELDS = new Set(['growShare', 'shrinkFactor'])

/**
 * Format a snapshot or state value for a native input.
 * Grow share and shrink factor keep six decimal places; other numbers stay as-is.
 *
 * @param {string} key
 * @param {unknown} value
 * @returns {string}
 */
function formatField(key, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    if (value == null) {
      return ''
    }
    return String(value)
  }
  if (FRACTION_FIELDS.has(key) && !Number.isInteger(value)) {
    return value.toFixed(6)
  }
  return String(value)
}

/**
 * Write snapshot and state values onto every `[data-field]` hook under root.
 * NumberFlow hosts get `.update(number)`; inputs get string values.
 * Skips the focused input so a keystroke is not overwritten mid-edit.
 *
 * @param {ParentNode} root
 * @param {Record<string, unknown>} values
 * @param {Element | null} focused
 */
function paintFields(root, values, focused) {
  for (const el of root.querySelectorAll('[data-field]')) {
    const key = el.dataset.field
    if (!(key in values)) continue
    if (el === focused) continue
    const raw = values[key]

    if (el.localName === 'number-flow') {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) continue
      paintNumberFlow(/** @type {any} */ (el), key, raw)
      continue
    }

    const text = formatField(key, raw)
    if (el instanceof HTMLInputElement) {
      el.value = text
    } else {
      el.textContent = text
    }
  }
}

/**
 * Match Item Cards to Flex Items by id: clone the template for new ids,
 * remove cards whose id left the list, and keep existing nodes in list order.
 *
 * @param {{ id: string }[]} items
 * @param {{ container: Element, template: HTMLTemplateElement }} els
 */
function syncItemCards(items, els) {
  const { container, template } = els
  const existing = new Map(
    [...container.querySelectorAll('.flex-item')].map((card) => [card.dataset.id, card]),
  )
  const keep = new Set(items.map((item) => item.id))

  for (const [id, card] of existing) {
    if (!keep.has(id)) card.remove()
  }

  items.forEach((item, index) => {
    let card = existing.get(item.id)
    if (!card) {
      card = template.content.firstElementChild.cloneNode(true)
      card.dataset.id = item.id
      container.append(card)
    }
    const current = container.children[index]
    if (current === card) return
    if (current) {
      container.insertBefore(card, current)
    } else {
      container.append(card)
    }
  })
}

/**
 * Apply CSS flex shorthand from Flex Item records. This is the only place
 * that talks to the browser in flexGrow / flexShrink / flexBasis terms.
 *
 * @param {{ id: string, grow: number, shrink: number, basis: number }[]} items
 * @param {Element} container
 */
function applyFlexStyles(items, container) {
  for (const item of items) {
    const card = container.querySelector(`.flex-item[data-id="${item.id}"]`)
    if (!card) continue
    card.style.flex = `${item.grow} ${item.shrink} ${item.basis}px`
  }
}

/**
 * Paint Measured Width and formula numbers onto each Item Card, show the
 * grow or shrink formula from Remaining Space, and hide Remove when last.
 *
 * @param {{ items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {{ container: { remainingSpace: number }, items: { id: string }[] }} snapshot
 * @param {Element} container
 */
function paintItemCards(state, snapshot, container) {
  const focused = document.activeElement
  const showGrow = snapshot.container.remainingSpace >= 0
  const hideRemove = state.items.length === 1

  for (const item of state.items) {
    const card = container.querySelector(`.flex-item[data-id="${item.id}"]`)
    if (!card) continue
    const row = snapshot.items.find((entry) => entry.id === item.id)
    const values = {
      ...snapshot.container,
      ...row,
      grow: item.grow,
      shrink: item.shrink,
      basis: item.basis,
      measuredWidth: card.clientWidth,
    }
    paintFields(card, values, focused)

    const growBox = card.querySelector('.flex-item__formula-grow')
    const shrinkBox = card.querySelector('.flex-item__formula-shrink')
    if (growBox) {
      growBox.style.opacity = showGrow ? '1' : '0'
    }
    if (shrinkBox) {
      shrinkBox.style.opacity = showGrow ? '0' : '1'
    }

    const remove = card.querySelector('.flex-item__remove')
    if (remove) remove.hidden = hideRemove
  }
}

/**
 * Fill the teaching Grow and Shrink panels from the first Flex Item's snapshot.
 *
 * @param {{ container: object, items: { id: string }[] }} snapshot
 * @param {{ id: string, grow: number, shrink: number, basis: number } | undefined} item
 * @param {ParentNode | null} examples
 */
function paintExampleFormulas(snapshot, item, examples) {
  if (!item || !examples) return
  const row = snapshot.items.find((entry) => entry.id === item.id)
  if (!row) return

  const values = {
    ...snapshot.container,
    ...row,
    grow: item.grow,
    shrink: item.shrink,
    basis: item.basis,
  }
  const activeTab = examples.querySelector('.formula__panel--active')
  paintFields(activeTab ?? examples, values, null)
}

let paintGeneration = 0

/** Last cycle args so freeze-thaw can paint without Main importing NumberFlow. */
let latestCycle = /** @type {{ state: object, els: object } | null} */ (null)

/**
 * One render cycle: calculate, sync Item Cards, apply flex, then paint after layout.
 *
 * @param {{ width: number, items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {{ container: Element, template: HTMLTemplateElement, examples: ParentNode | null }} els
 */
export function render(state, els) {
  latestCycle = { state, els }
  observeResizeFreeze(els.container, () => {
    if (latestCycle) render(latestCycle.state, latestCycle.els)
  })
  const snapshot = calculateFlexValues(state.width, state.items)
  syncItemCards(state.items, els)
  applyFlexStyles(state.items, els.container)
  const generation = ++paintGeneration
  requestAnimationFrame(() => {
    if (generation !== paintGeneration) return
    paintItemCards(state, snapshot, els.container)
    paintExampleFormulas(snapshot, state.items[0], els.examples)
  })
}
