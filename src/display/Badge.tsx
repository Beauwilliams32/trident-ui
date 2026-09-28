import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { normalizeTone, type ToneName } from './tone'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visible label. Required: a badge is never colour alone. */
  children: ReactNode
  /** Colour role. Portal names (violet, blue, gold, success, warning, danger) are accepted. */
  tone?: ToneName
  size?: 'sm' | 'md'
  /** Optional leading icon; rendered aria-hidden. */
  icon?: ReactNode
}

/**
 * Small pill label for counts, categories and inline flags (spec §7 P0; portal `_ds_bundle.js` Badge).
 * Always text plus colour; the tone colours are contrast-tested in every theme (tone.test.ts).
 */
export function Badge({ children, tone = 'neutral', size = 'md', icon, className, ...rest }: BadgeProps) {
  const t = normalizeTone(tone)
  return (
    <span {...rest} className={cx('ui-badge', 'ui-tone', className)} data-tone={t} data-size={size}>
      {icon ? (
        <span className="ui-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
