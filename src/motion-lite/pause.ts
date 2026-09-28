/**
 * "Pause motion" (spec §6.3 rule 5, WCAG 2.2.2). One store for the whole page:
 * `html[data-motion="paused"]` is the source of truth, persisted in localStorage (every access in
 * try/catch: private windows and blocked storage throw). The CSS kill switch in base.css keys on
 * the same attribute, so pausing needs no JS beyond flipping it.
 */
import { hasDOM, paused } from './env'

export const MOTION_STORAGE_KEY = 'ui-motion'
export const MOTION_CHANGE_EVENT = 'ui:motionchange'
export const MOTION_TOGGLE_ATTR = 'data-motion-toggle'

type Listener = (isPaused: boolean) => void
const listeners = new Set<Listener>()

function store(value: 'paused' | 'on'): void {
  try {
    window.localStorage.setItem(MOTION_STORAGE_KEY, value)
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
}

/** The stored choice, or null when nothing is stored or storage is unavailable. */
export function storedMotionPaused(): boolean | null {
  try {
    const v = window.localStorage.getItem(MOTION_STORAGE_KEY)
    return v === 'paused' ? true : v === 'on' ? false : null
  } catch {
    return null
  }
}

function apply(isPaused: boolean): void {
  const root = document.documentElement
  if (isPaused) root.setAttribute('data-motion', 'paused')
  else if (root.getAttribute('data-motion') === 'paused') root.removeAttribute('data-motion')
}

function notify(isPaused: boolean): void {
  for (const l of [...listeners]) l(isPaused)
  try {
    document.dispatchEvent(new CustomEvent(MOTION_CHANGE_EVENT, { detail: { paused: isPaused } }))
  } catch {
    /* ignore */
  }
}

/** Pause or resume all motion on the page, persist the choice and tell subscribers. */
export function setMotionPaused(isPaused: boolean): void {
  if (!hasDOM()) return
  const changed = paused() !== isPaused
  apply(isPaused)
  store(isPaused ? 'paused' : 'on')
  if (changed) notify(isPaused)
}

export const toggleMotionPaused = (): void => setMotionPaused(!paused())

/** Apply the stored choice to <html> (call as early as possible; initMotion() does). */
export function restoreMotionPreference(): boolean {
  if (!hasDOM()) return false
  const stored = storedMotionPaused()
  if (stored !== null && stored !== paused()) {
    apply(stored)
    notify(stored)
  }
  return paused()
}

/** Subscribe to pause changes. Returns the unsubscribe function. */
export function subscribeMotion(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* One click toggles once, even when both a native binding and a React handler see it. */
const handled = new WeakSet<Event>()
export function handleMotionToggleClick(event: Event): void {
  if (handled.has(event)) return
  handled.add(event)
  toggleMotionPaused()
}

function sync(button: Element): void {
  button.setAttribute('aria-pressed', String(paused()))
}

/**
 * Wire a server-rendered `<button type="button" data-motion-toggle aria-pressed="false">Pause motion</button>`
 * without React. The label stays fixed; `aria-pressed` carries the state. Returns an unbind function.
 */
export function bindMotionToggle(button: Element): () => void {
  sync(button)
  const onClick = (e: Event) => handleMotionToggleClick(e)
  button.addEventListener('click', onClick)
  const unsubscribe = subscribeMotion(() => sync(button))
  return () => {
    button.removeEventListener('click', onClick)
    unsubscribe()
  }
}
