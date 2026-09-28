import type { CSSProperties, ElementType, HTMLAttributes, PointerEvent, ReactNode } from 'react'
import { cx } from './cx'
import { pointerMotionAllowed } from './motion-gate'

export type CardVariant = 'solid' | 'glass'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  /**
   * `solid` (default; rows, tables, anything dense) or `glass` (blurred, counts toward the
   * 6-per-viewport blur budget, spec §5). `interactive` is accepted as a variant for the spec's
   * "solid, glass, interactive" wording and means solid + interactive.
   */
  variant?: CardVariant | 'interactive'
  /** Hover lift and specular sweep, both behind the motion gate. */
  interactive?: boolean
  /** Accent-tinted wash for highlighted panels (portal `accent`). */
  accent?: boolean
  /**
   * Pointer tilt (at most --ui-tilt-max, 7deg). Runs only behind the motion gate: html.ui-motion,
   * no reduced-motion preference, not paused, fine hover pointer. Otherwise nothing moves.
   */
  tilt?: boolean
  /** Token step, or any CSS length for portal compatibility (e.g. "var(--space-4)"). */
  padding?: CardPadding | (string & {})
  /** Element to render. Default `div`. */
  as?: ElementType
}

const PADDINGS: readonly string[] = ['none', 'sm', 'md', 'lg']

function setTilt(el: HTMLElement, x: number, y: number) {
  el.style.setProperty('--ui-tilt-x', x.toFixed(3))
  el.style.setProperty('--ui-tilt-y', y.toFixed(3))
}

/**
 * The base surface (spec §7 P0; portal `_ds_bundle.js` Card). SSR renders the final, static card;
 * the specular sweep and tilt are enhancements that only run behind the motion gate (spec §6.4), so
 * reduced motion, Pause and no-JS all see the same card without movement.
 */
export function Card({
  children,
  variant = 'solid',
  interactive = false,
  accent = false,
  tilt = false,
  padding = 'md',
  as,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...rest
}: CardProps) {
  const Tag: ElementType = as ?? 'div'
  const isInteractive = interactive || variant === 'interactive'
  const surface: CardVariant = variant === 'glass' ? 'glass' : 'solid'
  const named = PADDINGS.includes(padding)
  const mergedStyle = named ? style : ({ padding, ...style } as CSSProperties)

  const handleMove = tilt
    ? (e: PointerEvent<HTMLElement>) => {
        onPointerMove?.(e)
        if (e.pointerType !== 'mouse' || !pointerMotionAllowed()) return
        const r = e.currentTarget.getBoundingClientRect()
        if (!r.width || !r.height) return
        // -1..1 from the centre; CSS multiplies by --ui-tilt-max.
        setTilt(e.currentTarget, ((e.clientY - r.top) / r.height) * 2 - 1, ((e.clientX - r.left) / r.width) * 2 - 1)
      }
    : onPointerMove
  const handleLeave = tilt
    ? (e: PointerEvent<HTMLElement>) => {
        onPointerLeave?.(e)
        setTilt(e.currentTarget, 0, 0)
      }
    : onPointerLeave

  return (
    <Tag
      {...rest}
      className={cx('ui-card', className)}
      data-variant={surface}
      data-padding={named ? padding : undefined}
      data-interactive={isInteractive ? '' : undefined}
      data-accent={accent ? '' : undefined}
      data-tilt={tilt ? '' : undefined}
      style={mergedStyle}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </Tag>
  )
}
