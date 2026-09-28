import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'
import { Container } from './Container'
import type { ContainerSize } from './Container'

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Vertical padding. Default "md". */
  space?: 'none' | 'sm' | 'md' | 'lg'
  /** Background: page bg, the alternate bg-2, or the solid surface. Default "default". */
  tone?: 'default' | 'alt' | 'surface'
  /** Wrap children in a Container of this size, or false for none. Default "marketing". */
  container?: ContainerSize | false
  /** Element to render. Default "section". */
  as?: ElementType
  ref?: Ref<HTMLElement>
}

/**
 * A page band: vertical rhythm, optional background tone and a centred Container.
 * A `<section>` is only a landmark when it has an accessible name, so pass `aria-labelledby`
 * pointing at its Heading when the band is a meaningful region.
 */
export function Section({
  space = 'md',
  tone = 'default',
  container = 'marketing',
  as: Comp = 'section',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <Comp {...rest} className={cx('ui-section', `ui-section-${space}`, tone !== 'default' && `ui-section-${tone}`, className)}>
      {container ? <Container size={container}>{children}</Container> : children}
    </Comp>
  )
}
