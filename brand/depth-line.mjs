/** Depth Line — the Trident fleet mark. The three filled rails survive at 16px. */
export const DEPTH_LINE_LEFT = 'M20 16 24 12v16c0 7-4 11-10 15l-5 4v-7l3-2c5-4 8-7 8-12z'
export const DEPTH_LINE_CENTER = 'M29 13 32 8l3 5v38h-6z'

/** One mark, per-product accent pair. Background belongs to the application. */
export function depthLineMark({ accent1 = '#2dd4bf', accent2 = '#38bdf8', title = '' } = {}) {
  const safeColor = /^#[\da-f]{6}$/i
  if (!safeColor.test(accent1) || !safeColor.test(accent2)) throw new Error('Depth Line accents must be six-digit hex colors')
  const accessible = title ? ` role="img" aria-label="${title.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}"` : ' aria-hidden="true"'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"${accessible}><defs><linearGradient id="depth-line" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent1}"/><stop offset="1" stop-color="${accent2}"/></linearGradient></defs><g fill="url(#depth-line)"><path d="${DEPTH_LINE_LEFT}"/><path d="${DEPTH_LINE_LEFT}" transform="translate(64 0) scale(-1 1)"/><path d="${DEPTH_LINE_CENTER}"/></g></svg>`
}
