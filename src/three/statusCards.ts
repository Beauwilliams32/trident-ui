/**
 * StatusOrbit honesty rules (spec §6.3 rule 9, §6.5, §10.10), ported from
 * williams-media-portal/src/public/app/hero-3d.js chipList()/cardState(). Pure; shared by the
 * DOM list and the 3D cards so the two can never disagree.
 *
 * A platform card is LIT only when the caller passes `live: true` (literally the boolean), which a
 * consumer derives from `/api/public/platform-status`. Workflow cards are never lit. The built-in
 * fallback list never lights anything: this package cannot know what publishes.
 */

export interface StatusOrbitItem {
  id?: string
  label: string
  /** Brand dot colour. Decorative only; state is always carried by text too. */
  color?: string
  kind?: 'platform' | 'workflow'
  /** Lit only when exactly `true`, and only for platforms. */
  live?: boolean
  /** Known-but-not-live state from the status API. Anything else reads as unknown. */
  state?: 'pending' | 'unknown' | 'workflow'
}

export type StatusCardState = 'live' | 'pending' | 'unknown' | 'workflow'

export interface StatusCard {
  key: string
  label: string
  color: string
  kind: 'platform' | 'workflow'
  live: boolean
  state: StatusCardState
}

export const MAX_STATUS_CARDS = 10

/** The eight marketed platforms (state unknown, never lit) plus the two workflow cards. */
export const FALLBACK_STATUS_ITEMS: readonly StatusOrbitItem[] = Object.freeze([
  { id: 'instagram', label: 'Instagram', color: '#E1306C', kind: 'platform', live: false, state: 'unknown' },
  { id: 'tiktok', label: 'TikTok', color: '#010101', kind: 'platform', live: false, state: 'unknown' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', kind: 'platform', live: false, state: 'unknown' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', kind: 'platform', live: false, state: 'unknown' },
  { id: 'approved', label: 'Approved ✓', color: '#10b981', kind: 'workflow', live: false, state: 'workflow' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', kind: 'platform', live: false, state: 'unknown' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023', kind: 'platform', live: false, state: 'unknown' },
  { id: 'threads', label: 'Threads', color: '#101010', kind: 'platform', live: false, state: 'unknown' },
  { id: 'x', label: 'X', color: '#0f1419', kind: 'platform', live: false, state: 'unknown' },
  { id: 'scheduled', label: 'Scheduled', color: '#7c3aed', kind: 'workflow', live: false, state: 'workflow' },
] satisfies StatusOrbitItem[])

export function cardState(item: StatusOrbitItem | null | undefined): StatusCardState {
  if (!item || item.kind === 'workflow') return 'workflow'
  if (item.live === true) return 'live'
  return item.state === 'pending' ? 'pending' : 'unknown'
}

/**
 * Caller items first, then the fallback fills the gaps; de-duplicated by id (or label), capped at
 * MAX_STATUS_CARDS. `live` survives only when it is literally `true` on a platform item.
 */
export function statusCards(items?: readonly StatusOrbitItem[] | null): StatusCard[] {
  const out: StatusCard[] = []
  const seen = new Set<string>()
  const given = Array.isArray(items) ? items : []
  for (const raw of [...given, ...FALLBACK_STATUS_ITEMS]) {
    if (out.length >= MAX_STATUS_CARDS) break
    if (!raw || typeof raw.label !== 'string' || !raw.label) continue
    const key = String(raw.id || raw.label)
    if (seen.has(key)) continue
    seen.add(key)
    const kind = raw.kind === 'workflow' ? 'workflow' : 'platform'
    const live = kind === 'platform' && raw.live === true
    const state = cardState({ ...raw, kind, live })
    out.push({ key, label: raw.label, color: raw.color || '#7c3aed', kind, live, state })
  }
  return out
}

/** Text for the DOM list (and the card's second line). State never relies on colour alone. */
export function stateText(state: StatusCardState): string {
  switch (state) {
    case 'live':
      return 'Publishing'
    case 'pending':
      return 'In review'
    case 'workflow':
      return 'Workflow step'
    default:
      return 'Status not confirmed'
  }
}

/**
 * Ring radius multiplier for a scroll offset (hero-3d.js ringScale): 1 at the top, easing to
 * `minScale` over the first `span` px (smoothstep, clamped).
 */
export function ringScale(scrollY: number, span = 600, minScale = 0.7): number {
  const p = Math.max(0, Math.min(1, (Number(scrollY) || 0) / (span || 600)))
  const eased = p * p * (3 - 2 * p)
  return 1 - (1 - minScale) * eased
}

/** Pointer/scroll camera movement inside a decorative canvas is capped at ±4° (spec §6.3 rule 3). */
export const MAX_POINTER_TILT = (4 * Math.PI) / 180

/** Pointer position (0..1 across the viewport) to a tilt within ±MAX_POINTER_TILT. */
export function pointerTilt(fraction: number): number {
  const f = Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : 0.5
  return (f - 0.5) * 2 * MAX_POINTER_TILT
}
