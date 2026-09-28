/**
 * [data-reveal] (spec §6.1). base.css hides an unrevealed element only under html.ui-motion +
 * scripting + no reduced motion + not paused, with a 2.5s CSS failsafe; this module sets
 * `data-revealed` when the element scrolls into view. `--i` on the element staggers siblings
 * (70ms × min(--i, 6), in CSS). Reduced motion, Pause, or no IntersectionObserver: reveal at once.
 */
import { hasDOM, motionOff, tokenNumber } from './env'

export const REVEALED_ATTR = 'data-revealed'

const seen = new WeakSet<Element>()
let io: IntersectionObserver | null = null

/** Show an element now. After the enter transition it drops its stagger so hovers stay quick. */
export function markRevealed(el: Element): void {
  if (el.hasAttribute(REVEALED_ATTR)) return
  el.setAttribute(REVEALED_ATTR, '')
  const style = (el as HTMLElement).style
  if (!style || motionOff()) return
  const i = parseFloat(style.getPropertyValue('--i')) || 0
  if (!i) return
  const wait = tokenNumber('--ui-dur-reveal', 600) + Math.min(i, 6) * tokenNumber('--ui-stagger', 70) + 40
  setTimeout(() => style.setProperty('--i', '0'), wait)
}

function observer(): IntersectionObserver | null {
  if (io) return io
  if (typeof IntersectionObserver !== 'function') return null
  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        markRevealed(entry.target)
        io?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  )
  return io
}

/** Start watching one element (idempotent). Returns a function that stops watching it. */
export function observeReveal(el: Element): () => void {
  if (seen.has(el)) return () => io?.unobserve(el)
  seen.add(el)
  const o = motionOff() ? null : observer()
  if (!o) {
    markRevealed(el)
    return () => {}
  }
  o.observe(el)
  return () => o.unobserve(el)
}

/** Observe every [data-reveal] in scope (the scope itself included). Returns the count. */
export function scanReveals(scope?: ParentNode): number {
  if (!hasDOM()) return 0
  const node = scope ?? document
  let count = 0
  if (node instanceof Element && node.matches('[data-reveal]')) {
    observeReveal(node)
    count++
  }
  node.querySelectorAll('[data-reveal]').forEach((el) => {
    observeReveal(el)
    count++
  })
  return count
}

/** Reveal everything now (used when motion is paused mid-page). */
export function revealAll(scope?: ParentNode): void {
  if (!hasDOM()) return
  ;(scope ?? document).querySelectorAll('[data-reveal]').forEach((el) => {
    markRevealed(el)
    io?.unobserve(el)
  })
}

/** Scan now and keep scanning nodes added later (React re-renders). Returns a disconnect function. */
export function watchReveals(target?: Element): () => void {
  if (!hasDOM()) return () => {}
  const root = target ?? document.body ?? document.documentElement
  scanReveals(root)
  if (typeof MutationObserver !== 'function') return () => {}
  const mo = new MutationObserver((records) => {
    for (const r of records) r.addedNodes.forEach((n) => n.nodeType === 1 && scanReveals(n as Element))
  })
  mo.observe(root, { childList: true, subtree: true })
  return () => mo.disconnect()
}

/** Test hook: forget the shared observer. */
export function _resetReveals(): void {
  io?.disconnect()
  io = null
}
