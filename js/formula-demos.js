import gsap from 'gsap'
import { SlowMo } from 'gsap/EasePack'

gsap.registerPlugin(SlowMo)

const tabs = document.querySelectorAll('.formula__tab')
const panels = document.querySelectorAll('.formula__panel')

/** @type {(() => void) | null} */
let formulaTabChangeHandler = null

/**
 * Main registers a render callback so showing a hidden formula tab paints NumberFlow while it has layout.
 *
 * @param {() => void} handler
 */
export function setFormulaTabChangeHandler(handler) {
  formulaTabChangeHandler = handler
}

tabs.forEach((tab) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault()
    removeActiveTab()
    addActiveTab(tab)
  })
})

/**
 * Clear the active modifier from every formula tab and panel.
 */
function removeActiveTab() {
  tabs.forEach((tab) => {
    tab.classList.remove('formula__tab--active')
  })
  panels.forEach((panel) => {
    panel.classList.remove('formula__panel--active')
  })
}

/**
 * Show the formula panel that matches the clicked tab.
 *
 * @param {Element} tab
 */
function addActiveTab(tab) {
  tab.classList.add('formula__tab--active')
  const id = `#${tab.getAttribute('data-id')}`
  const matchingPanel = document.querySelector(id)
  matchingPanel?.classList.add('formula__panel--active')
  formulaTabChangeHandler?.()
}

const growItems = '.formula__demo--grow .formula__demo-item'
const shrinkItems = '.formula__demo--shrink .formula__demo-item'
const growFrom = window.matchMedia('(width >= 43rem)').matches ? '7rem' : '3rem'

gsap.timeline({
  repeat: -1,
  repeatDelay: window.matchMedia('(width >= 43rem)').matches ? 1 : 2,
})
  .from(growItems, {
    width: growFrom,
    duration: 2,
    delay: 1,
    ease: 'slow',
  })
  .to(growItems, {
    width: '33.33%',
    duration: 2,
    ease: 'slow',
  })

gsap.timeline({
  repeat: -1,
  repeatDelay: 2,
})
  .to(shrinkItems, {
    width: '37.33%',
    duration: 2,
    ease: 'slow',
  })
  .to(shrinkItems, {
    width: '30.66%',
    duration: 2,
    delay: 1,
    ease: 'slow',
  })
