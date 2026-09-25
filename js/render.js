import { calculateFlexValues } from './calculate.js'
import { paintNumberFlow, observeResizeFreeze } from './number-flow.js'

const FRACTION_DIGITS = {
  growShare: 2,
  shrinkFactor: 2,
}

/**
 * Format a snapshot or state value for a native input.
 * Grow share and shrink factor keep two decimal places. Other numbers stay as-is.
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
  const digits = FRACTION_DIGITS[key]
  if (digits != null && !Number.isInteger(value)) {
    return value.toFixed(digits)
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

const EXIT_CLASS = 'flex-item--exit'
const ENTER_CLASS = 'flex-item--enter'
const REVEAL_CLASS = 'flex-item--reveal'
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

/** True after the first cards exist. Load reveals groups in place; later cards grow in. */
let motionReady = false

/**
 * @param {Element} container
 * @param {number} index
 * @returns {Element | null}
 */
function liveCardAt(container, index) {
  let seen = 0
  for (const child of container.children) {
    if (!(child instanceof HTMLElement)) continue
    if (!child.classList.contains('flex-item') || child.classList.contains(EXIT_CLASS)) continue
    if (seen === index) return child
    seen += 1
  }
  return null
}

/**
 * Collapse a card, then drop the node. A second pass leaves an exit in place.
 *
 * @param {HTMLElement} card
 */
function beginExit(card) {
  if (card.classList.contains(EXIT_CLASS)) return
  card.classList.add(EXIT_CLASS)
  card.style.setProperty('--item-grow', '0')
  card.style.setProperty('--item-basis', '0px')

  let removed = false
  const remove = () => {
    if (removed) return
    removed = true
    card.remove()
  }
  const timer = window.setTimeout(remove, 360)
  card.addEventListener('transitionend', (event) => {
    if (event.target !== card || event.propertyName !== 'opacity') return
    window.clearTimeout(timer)
    remove()
  })
}

/**
 * Fade the card's text groups. Load calls this on the first frame.
 * Add calls it after the width ease. Reduced motion shows them now.
 *
 * @param {HTMLElement} card
 */
function startReveal(card) {
  if (reduceMotion.matches) {
    card.classList.remove(ENTER_CLASS)
    return
  }
  card.classList.add(REVEAL_CLASS)
  window.setTimeout(() => {
    card.classList.remove(ENTER_CLASS, REVEAL_CLASS)
  }, 760)
}

/**
 * Reveal once basis finishes easing. The timeout covers a transition that never starts.
 *
 * @param {HTMLElement} card
 */
function watchEnter(card) {
  let started = false
  const finish = () => {
    if (started) return
    started = true
    card.removeEventListener('transitionend', onEnd)
    startReveal(card)
  }
  const onEnd = (event) => {
    if (event.target !== card || event.propertyName !== '--item-basis') return
    finish()
  }
  card.addEventListener('transitionend', onEnd)
  window.setTimeout(finish, 450)
}

/**
 * Match Item Cards to Flex Items by id: clone the template for new ids,
 * ease out cards whose id left the list, and keep existing nodes in list order.
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
    if (!keep.has(id)) beginExit(/** @type {HTMLElement} */ (card))
  }

  items.forEach((item, index) => {
    let card = existing.get(item.id)
    const isNew = !card
    if (!card) {
      card = /** @type {HTMLElement} */ (template.content.firstElementChild.cloneNode(true))
      card.dataset.id = item.id
      if (!reduceMotion.matches) {
        if (motionReady) card.classList.add(ENTER_CLASS)
        else startReveal(card)
      }
    }
    const anchor = liveCardAt(container, index)
    if (anchor === card) return
    if (isNew || anchor) {
      if (anchor) container.insertBefore(card, anchor)
      else container.append(card)
    }
  })
}

/**
 * @param {HTMLElement} card
 * @param {{ grow: number, shrink: number, basis: number }} item
 */
function commitFlex(card, item) {
  const next = {
    '--item-grow': String(item.grow),
    '--item-shrink': String(item.shrink),
    '--item-basis': `${item.basis}px`,
  }
  for (const [name, value] of Object.entries(next)) {
    if (card.style.getPropertyValue(name) !== value) card.style.setProperty(name, value)
  }
}

/**
 * Write flex factors as registered custom properties so they can ease.
 * A new card paints at grow 0 and basis 0, then eases to its record.
 * Exiting cards keep the zeros beginExit set.
 *
 * @param {{ id: string, grow: number, shrink: number, basis: number }[]} items
 * @param {Element} container
 */
function applyFlexStyles(items, container) {
  for (const item of items) {
    const card = container.querySelector(`.flex-item[data-id="${item.id}"]`)
    if (!(card instanceof HTMLElement) || card.classList.contains(EXIT_CLASS)) continue
    if (card.classList.contains(ENTER_CLASS) && card.dataset.enterPhase !== 'live') {
      if (card.dataset.enterPhase !== 'from') {
        card.dataset.enterPhase = 'from'
        card.style.setProperty('--item-grow', '0')
        card.style.setProperty('--item-shrink', String(item.shrink))
        card.style.setProperty('--item-basis', '0px')
        requestAnimationFrame(() => {
          if (!card.isConnected || card.classList.contains(EXIT_CLASS)) return
          card.dataset.enterPhase = 'live'
          commitFlex(card, item)
          watchEnter(card)
        })
      }
      continue
    }
    commitFlex(card, item)
  }
}

/**
 * Blue segment of the inspector bar, as a percentage of the track.
 * Grow: track is the final width, blue is the basis.
 * Shrink: track is the basis, blue is the size that remains.
 *
 * @param {boolean} showGrow
 * @param {{ basis: number, growWidth: number, shrinkWidth: number }} values
 * @returns {number}
 */
function inspectorBasisShare(showGrow, values) {
  const total = showGrow ? values.growWidth : values.basis
  const filled = showGrow ? values.basis : values.shrinkWidth
  if (total <= 0) return 0
  return Math.min(Math.max(filled / total, 0), 1) * 100
}

/**
 * Paint Measured Width, the size inspector, and formula numbers onto each
 * Item Card, show the grow or shrink formula from Remaining Space, and hide
 * Remove when last.
 *
 * Measured Width is the snapshot final width (`growWidth` or `shrinkWidth`),
 * the same integer as the formula's final-width line. It is not `clientWidth`:
 * that sample lands mid-transition and truncates subpixels.
 *
 * @param {{ items: { id: string, grow: number, shrink: number, basis: number }[] }} state
 * @param {{ container: { remainingSpace: number }, items: { id: string, growWidth: number, shrinkWidth: number }[] }} snapshot
 * @param {Element} container
 */
function paintItemCards(state, snapshot, container) {
  const focused = document.activeElement
  const showGrow = snapshot.container.remainingSpace >= 0
  const hideRemove = state.items.length === 1
  container.closest('.flexulator')?.classList.toggle('is-shrink', !showGrow)

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
      measuredWidth: showGrow ? row?.growWidth : row?.shrinkWidth,
    }
    paintFields(card, values, focused)

    const inspector = card.querySelector('.flex-item__inspector')
    if (inspector) {
      inspector.classList.toggle('is-shrink', !showGrow)
      inspector.style.setProperty('--inspector-basis', `${inspectorBasisShare(showGrow, values)}%`)
    }

    const growBox = card.querySelector('.flex-item__formula-grow')
    const shrinkBox = card.querySelector('.flex-item__formula-shrink')
    if (growBox) {
      growBox.style.opacity = showGrow ? '1' : '0'
      growBox.toggleAttribute('inert', !showGrow)
    }
    if (shrinkBox) {
      shrinkBox.style.opacity = showGrow ? '0' : '1'
      shrinkBox.toggleAttribute('inert', showGrow)
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
  if (!motionReady) {
    requestAnimationFrame(() => {
      els.container.classList.add('is-motion')
      motionReady = true
    })
  }
  const generation = ++paintGeneration
  requestAnimationFrame(() => {
    if (generation !== paintGeneration) return
    paintItemCards(state, snapshot, els.container)
    paintExampleFormulas(snapshot, state.items[0], els.examples)
  })
}
