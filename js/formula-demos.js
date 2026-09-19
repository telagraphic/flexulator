import gsap from 'gsap'
import { SlowMo } from 'gsap/EasePack'

const TAB_CHANGE = 'formula-tab-change'

/**
 * Start formula tabs and GSAP teaching loops. Import is inert until this runs.
 *
 * @param {ParentNode | null} examplesRoot Teaching-examples root (`.formula__panels`)
 */
export function startFormulaDemos(examplesRoot) {
  if (!examplesRoot) return

  gsap.registerPlugin(SlowMo)

  const formula = examplesRoot.closest('.formula') ?? examplesRoot
  const tabs = formula.querySelectorAll('.formula__tab')
  const panels = examplesRoot.querySelectorAll('.formula__panel')

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
   * Show the formula panel that matches the clicked tab, then ask Main to render.
   *
   * @param {Element} tab
   */
  function addActiveTab(tab) {
    tab.classList.add('formula__tab--active')
    const id = tab.getAttribute('data-id')
    const matchingPanel = id ? examplesRoot.querySelector(`#${id}`) : null
    matchingPanel?.classList.add('formula__panel--active')
    examplesRoot.dispatchEvent(new Event(TAB_CHANGE, { bubbles: true }))
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault()
      removeActiveTab()
      addActiveTab(tab)
    })
  })

  startTeachingLoops()
}

/**
 * Infinite Grow / Shrink teaching loops. Called from start, not at import.
 */
function startTeachingLoops() {
  const growItems = '.formula__demo--grow .formula__demo-item'
  const shrinkItems = '.formula__demo--shrink .formula__demo-item'
  const wide = window.matchMedia('(width >= 43rem)').matches
  const growFrom = wide ? '7rem' : '3rem'

  gsap.timeline({
    repeat: -1,
    repeatDelay: wide ? 1 : 2,
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
}
