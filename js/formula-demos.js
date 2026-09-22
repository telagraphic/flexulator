const TAB_CHANGE = 'formula-tab-change'
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const SWIPE_MS = 280

/**
 * Start formula tabs and the clipped panel stage. Import is inert until this runs.
 *
 * @param {ParentNode | null} examplesRoot Teaching-examples root (`.formula__panels`)
 */
export function startFormulaDemos(examplesRoot) {
  if (!(examplesRoot instanceof HTMLElement)) return

  const formula = examplesRoot.closest('.formula') ?? examplesRoot
  const nav = formula.querySelector('.formula__nav')
  const tabs = [...formula.querySelectorAll('.formula__tab')]
  const panels = [...examplesRoot.querySelectorAll('.formula__panel')]
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let activeIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('formula__tab--active')))
  let swipeGeneration = 0
  let swiping = false

  /**
   * @param {Element} panel
   * @returns {number} Current translateX as a percentage of the panel width.
   */
  function translatePercent(panel) {
    const value = getComputedStyle(panel).transform
    if (!value || value === 'none') return 0
    const width = panel.getBoundingClientRect().width || 1
    return (new DOMMatrixReadOnly(value).m41 / width) * 100
  }

  /**
   * @param {Element} panel
   */
  function clearMotion(panel) {
    for (const animation of panel.getAnimations()) animation.cancel()
    if (panel instanceof HTMLElement) panel.style.transform = ''
  }

  /**
   * @param {Element} panel
   * @param {boolean} active
   */
  function settle(panel, active) {
    clearMotion(panel)
    panel.classList.toggle('formula__panel--active', active)
    if (panel instanceof HTMLElement) {
      panel.style.visibility = active ? '' : 'hidden'
      panel.inert = !active
    }
  }

  /**
   * Match the stage to the active panel. Resize snaps; a tab change eases.
   *
   * @param {boolean} animate
   */
  function syncStageHeight(animate) {
    if (swiping && !animate) return
    const active = panels[activeIndex]
    if (!(active instanceof HTMLElement)) return
    const styles = getComputedStyle(examplesRoot)
    const pad = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom)
    const next = `${Math.ceil(active.offsetHeight + pad)}px`
    if (examplesRoot.style.height === next) return
    if (!animate) examplesRoot.classList.add('is-resizing')
    examplesRoot.style.height = next
    if (!animate) {
      void examplesRoot.offsetWidth
      examplesRoot.classList.remove('is-resizing')
    }
  }

  /**
   * @param {number} index
   */
  function setIndicator(index) {
    if (nav instanceof HTMLElement) nav.style.setProperty('--formula-tab', String(index))
  }

  /**
   * Show the panel for this tab index. Direction comes from the index delta.
   *
   * @param {number} nextIndex
   */
  function goTo(nextIndex) {
    if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= panels.length) return
    const prevIndex = activeIndex
    const fromPanel = panels[prevIndex]
    const toPanel = panels[nextIndex]
    const direction = nextIndex > prevIndex ? 1 : -1
    const generation = ++swipeGeneration
    activeIndex = nextIndex

    tabs.forEach((tab, index) => {
      tab.classList.toggle('formula__tab--active', index === nextIndex)
    })
    setIndicator(nextIndex)
    examplesRoot.dispatchEvent(new Event(TAB_CHANGE, { bubbles: true }))

    if (reduceMotion.matches || !(fromPanel instanceof HTMLElement) || !(toPanel instanceof HTMLElement)) {
      panels.forEach((panel, index) => settle(panel, index === nextIndex))
      syncStageHeight(false)
      return
    }

    const fromStart = translatePercent(fromPanel)
    const toStart = toPanel.getAnimations().length > 0 ? translatePercent(toPanel) : direction * 100
    panels.forEach((panel, index) => {
      if (index !== prevIndex && index !== nextIndex) settle(panel, false)
    })
    clearMotion(fromPanel)
    clearMotion(toPanel)

    fromPanel.classList.remove('formula__panel--active')
    toPanel.classList.add('formula__panel--active')
    fromPanel.style.visibility = 'visible'
    toPanel.style.visibility = 'visible'
    fromPanel.inert = true
    toPanel.inert = false
    swiping = true

    fromPanel.animate(
      [
        { transform: `translateX(${fromStart}%)` },
        { transform: `translateX(${-direction * 100}%)` },
      ],
      { duration: SWIPE_MS, easing: EASE, fill: 'forwards' },
    )
    const incoming = toPanel.animate(
      [
        { transform: `translateX(${toStart}%)` },
        { transform: 'translateX(0%)' },
      ],
      { duration: SWIPE_MS, easing: EASE, fill: 'forwards' },
    )

    syncStageHeight(true)

    incoming.finished.then(() => {
      if (generation !== swipeGeneration) return
      swiping = false
      panels.forEach((panel, index) => settle(panel, index === nextIndex))
    }).catch(() => {})
  }

  panels.forEach((panel, index) => settle(panel, index === activeIndex))
  setIndicator(activeIndex)
  syncStageHeight(false)

  const resizeObserver = new ResizeObserver(() => syncStageHeight(false))
  for (const panel of panels) resizeObserver.observe(panel)

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault()
      goTo(index)
    })
  })
}
