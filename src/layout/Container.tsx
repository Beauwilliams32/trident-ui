import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'

/** marketing 1080px, app 1280px (spec §5), prose 68ch, full = gutter only. */
export type ContainerSize = 'marketing' | 'app' | 'prose' | 'full'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  size?: ContainerSize
  /** Element to render. Default "div". */
  as?: ElementType
  ref?: Ref<HTMLElement>
}

/** Centred content column with the fluid gutter (clamp(16px, 4vw, 32px); never under 16px). */
export function Container({ size = 'marketing', as: Comp = 'div', className, ...rest }: ContainerProps) {
  return <Comp {...rest} className={cx('ui-container', `ui-container-${size}`, className)} />
}
