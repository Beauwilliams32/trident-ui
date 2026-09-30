/**
 * [data-tilt] (spec §6.1): cards follow a FINE pointer only, at most --ui-tilt-max (7deg).
 * One delegated pointermove listener for the page; work is batched into one rAF per frame.
 * Sets --ui-tilt-x/--ui-tilt-y/--ui-glare-x/--ui-glare-y; motion-lite/styles.css does the rest.
 * Nothing binds under reduced motion, Pause or a coarse pointer, so no rAF ever starts there.
 */
import { finePointer, hasDOM, motionOff, tokenNumber } from './env'

export function resetTilt(el: Element | null): void {
  if (!el) return
  const style = (el as HTMLElement).style
  el.removeAttribute('data-tilting')
  if (!style) return
  for (const p of ['--ui-tilt-x', '--ui-tilt-y', '--ui-glare-x', '--ui-glare-y']) style.removeProperty(p)
}

let unbind: (() => void) | null = null

/** Bind the page-wide tilt listener (idempotent). Returns false when tilt must not run. */
export function bindTilt(): boolean {
  if (unbind) return true
  if (!hasDOM() || !finePointer() || motionOff()) return false
  let active: HTMLElement | null = null
  let raf = 0
  let px = 0
  let py = 0
  const apply = () => {
    raf = 0
    if (!active) return
    const r = active.getBoundingClientRect()
    if (!r.width || !r.height) return
    const x = (px - r.left) / r.width - 0.5
    const y = (py - r.top) / r.height - 0.5
    const max = Math.min(7, tokenNumber('--ui-tilt-max', 7))
    active.style.setProperty('--ui-tilt-x', (y * -max).toFixed(2) + 'deg')
    active.style.setProperty('--ui-tilt-y', (x * max).toFixed(2) + 'deg')
    active.style.setProperty('--ui-glare-x', ((x + 0.5) * 100).toFixed(1) + '%')
    active.style.setProperty('--ui-glare-y', ((y + 0.5) * 100).toFixed(1) + '%')
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    if (motionOff() || !finePointer()) {
      resetTilt(active)
      active = null
      return
    }
    const target = e.target as Element | null
    const el = (target && typeof target.closest === 'function' ? target.closest('[data-tilt]') : null) as HTMLElement | null
    if (el !== active) {
      resetTilt(active)
      active = el
      active?.setAttribute('data-tilting', '')
    }
    if (!active) return
    px = e.clientX
    py = e.clientY
    if (!raf) raf = requestAnimationFrame(apply)
  }
  const onOut = (e: PointerEvent) => {
    if (active && !(e.relatedTarget instanceof Node && active.contains(e.relatedTarget))) {
      resetTilt(active)
      active = null
    }
  }
  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerout', onOut, { passive: true })
  unbind = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerout', onOut)
    if (raf) cancelAnimationFrame(raf)
    resetTilt(active)
    active = null
    unbind = null
  }
  return true
}

/** Remove the page-wide tilt listener. */
export function unbindTilt(): void {
  unbind?.()
}
