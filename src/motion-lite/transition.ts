/**
 * View Transitions for route and tab changes (spec §6.1). Skipped (the update runs synchronously)
 * under reduced motion, Pause, a hidden document, a programmatic change (no user activation), or
 * a browser without document.startViewTransition (spec §6.4).
 */
import { hasDOM, motionOff } from './env'

export interface TransitionOptions {
  /** Written to html[data-vt] for the duration, so CSS can target named transitions. */
  name?: string
  /** Run the update synchronously inside the transition, e.g. react-dom's flushSync. */
  flush?: (fn: () => void) => void
}

interface ViewTransitionLike {
  ready?: Promise<unknown>
  finished?: Promise<unknown>
}
type StartViewTransition = (cb: () => void) => ViewTransitionLike

let active = false

export function canTransition(): boolean {
  if (!hasDOM()) return false
  const start = (document as Document & { startViewTransition?: unknown }).startViewTransition
  if (typeof start !== 'function' || motionOff() || document.hidden) return false
  const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation
  return !(ua && ua.isActive === false)
}

/** Wrap a state change in a View Transition when allowed; otherwise just run it. */
export function transition(update: () => void, opts: TransitionOptions = {}): ViewTransitionLike | null {
  const run = () => (opts.flush ? opts.flush(update) : update())
  if (active || !canTransition()) {
    run()
    return null
  }
  const root = document.documentElement
  const name = opts.name ?? ''
  active = true
  if (name) root.setAttribute('data-vt', name)
  const clear = () => {
    active = false
    if (name && root.getAttribute('data-vt') === name) root.removeAttribute('data-vt')
  }
  let handle: ViewTransitionLike
  try {
    handle = (document as Document & { startViewTransition: StartViewTransition }).startViewTransition(run)
  } catch {
    clear()
    run()
    return null
  }
  // A skipped visual transition rejects `ready` even when the update succeeded.
  handle?.ready?.catch(() => {})
  if (handle?.finished) handle.finished.then(clear, clear)
  else clear()
  return handle
}
