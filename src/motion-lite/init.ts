/**
 * initMotion(): the one boot call for SSG/marketing pages (and what the /motion wrappers share).
 * It restores the Pause choice, adds html.ui-motion (which arms the base.css reveal-hiding rule),
 * then watches [data-reveal], counts [data-count-up], binds [data-tilt] and every
 * [data-motion-toggle] button. A page where this never runs shows everything: the SSR state is
 * the final state (spec §6.3 rule 10).
 */
import { countUpWhenVisible } from './count'
import { hasDOM } from './env'
import { bindMotionToggle, MOTION_TOGGLE_ATTR, restoreMotionPreference, subscribeMotion } from './pause'
import { revealAll, watchReveals } from './reveal'
import { bindTilt, unbindTilt } from './tilt'

export const MOTION_CLASS = 'ui-motion'

/** Add html.ui-motion (idempotent). Components call this so reveals arm even without initMotion(). */
export function armMotion(): void {
  if (!hasDOM()) return
  const root = document.documentElement
  root.classList.add(MOTION_CLASS)
  if (typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === 'function') root.classList.add('ui-vt')
}

let teardown: (() => void) | null = null

export interface InitMotionOptions {
  /** Where to watch for [data-reveal]; defaults to document.body. */
  root?: Element
}

/** Boot motion-lite once. Returns a teardown function (also idempotent). */
export function initMotion(opts: InitMotionOptions = {}): () => void {
  if (!hasDOM()) return () => {}
  if (teardown) return teardown
  const cleanups: Array<() => void> = []
  restoreMotionPreference()
  armMotion()
  cleanups.push(
    subscribeMotion((isPaused) => {
      if (isPaused) {
        revealAll()
        unbindTilt()
      } else bindTilt()
    }),
  )
  const start = () => {
    cleanups.push(watchReveals(opts.root))
    bindTilt()
    cleanups.push(unbindTilt)
    document.querySelectorAll(`[${MOTION_TOGGLE_ATTR}]`).forEach((b) => {
      if (b.hasAttribute('data-motion-toggle-bound')) return
      b.setAttribute('data-motion-toggle-bound', '')
      const unbind = bindMotionToggle(b)
      cleanups.push(() => {
        unbind()
        b.removeAttribute('data-motion-toggle-bound')
      })
    })
    document.querySelectorAll('[data-count-up]').forEach((el) => cleanups.push(countUpWhenVisible(el)))
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
    cleanups.push(() => document.removeEventListener('DOMContentLoaded', start))
  } else start()
  teardown = () => {
    for (const c of cleanups.splice(0).reverse()) c()
    document.documentElement.classList.remove(MOTION_CLASS, 'ui-vt')
    teardown = null
  }
  return teardown
}
