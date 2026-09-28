import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { Tone } from '../display/tone'

/** Tone icon for feedback surfaces. Always aria-hidden: the text carries the meaning. */
export function ToneIcon({ tone, size = 18 }: { tone: Tone; size?: number }) {
  const props = { size, strokeWidth: 2, 'aria-hidden': true as const, focusable: 'false' as const }
  switch (tone) {
    case 'ok':
      return <CircleCheck {...props} />
    case 'warn':
      return <TriangleAlert {...props} />
    case 'danger':
      return <CircleAlert {...props} />
    default:
      return <Info {...props} />
  }
}

/** role=alert for errors, role=status for everything else (spec §7 P0). */
export function liveRoleFor(tone: Tone): 'alert' | 'status' {
  return tone === 'danger' ? 'alert' : 'status'
}
