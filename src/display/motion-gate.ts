/**
 * The motion gate (spec §0.2, §6.4) as a runtime check, for pointer effects that need JS (Card tilt).
 * Mirrors the CSS gate in styles.css: html.ui-motion, no reduced-motion preference, motion not
 * paused, and a fine hover-capable pointer. Safe to import on the server: it reads `window` and
 * `document` only when called, and returns false when they are absent.
 */
export function pointerMotionAllowed(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  const html = document.documentElement
  if (!html.classList.contains('ui-motion')) return false
  if (html.getAttribute('data-motion') === 'paused') return false
  if (typeof window.matchMedia !== 'function') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
