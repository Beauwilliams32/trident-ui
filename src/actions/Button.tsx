import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react'
import { LoaderCircle, type LucideIcon } from 'lucide-react'
import { cx, devWarn } from './internal'

/**
 * Button variants (spec §7): primary, secondary-glass (`secondary`), ghost, danger, link.
 * Sizes map to the component tokens --ui-btn-h-sm / --ui-btn-h / --ui-btn-h-lg (32 / 36 / 44px).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

/** Pixel heights per size, for consumers that need the number (e.g. aligning a sibling input). */
export const BUTTON_HEIGHTS: Readonly<Record<ButtonSize, number>> = { sm: 32, md: 36, lg: 44 }

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 16, lg: 20 }
const ICON_ONLY_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 }

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  iconOnly?: boolean
  /** Uses the visible 48px minimum target for game controls. */
  gameControl?: boolean
  className?: string
}

/** The class list a Button renders. Exported so server templates without React can match it. */
export function buttonClassName({ variant = 'primary', size = 'md', fullWidth, iconOnly, gameControl, className }: ButtonStyleOptions = {}): string {
  return cx('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, fullWidth && 'ui-btn--block', iconOnly && 'ui-btn--icon', gameControl && 'ui-btn--game-control', className)
}

function Icon({ icon: IconComponent, size }: { icon: LucideIcon; size: number }) {
  return <IconComponent className="ui-btn__icon" size={size} strokeWidth={2} aria-hidden="true" focusable="false" />
}

function Spinner({ size }: { size: number }) {
  return (
    <span className="ui-btn__spinner" aria-hidden="true">
      <LoaderCircle size={size} strokeWidth={2.25} focusable="false" />
    </span>
  )
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Use the shared visible 48px target for a game action. */
  gameControl?: boolean
  /** Leading lucide-react icon (decorative; always aria-hidden). */
  icon?: LucideIcon
  /** Trailing lucide-react icon (decorative; always aria-hidden). */
  iconEnd?: LucideIcon
  fullWidth?: boolean
}

export interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * Native button type. Defaults to "button"; use "submit" (or SubmitButton) for form submission,
   * which works with JavaScript disabled.
   */
  type?: 'button' | 'submit' | 'reset'
  /**
   * Shows a spinner over the label. The label stays in the layout (opacity 0) so the width never
   * changes; the button is aria-disabled + aria-busy and swallows clicks, but keeps focus.
   */
  loading?: boolean
  /** Accessible name while loading (e.g. "Saving…"). Without it the normal label is kept. */
  loadingLabel?: string
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'primary',
  size = 'md',
  gameControl = false,
  icon,
  iconEnd,
  fullWidth,
  loading = false,
  loadingLabel,
  type = 'button',
  className,
  children,
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const ariaDisabled = rest['aria-disabled'] === true || rest['aria-disabled'] === 'true'
  const blocked = loading || ariaDisabled
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
  const iconSize = ICON_SIZE[size]
  const swapName = loading && Boolean(loadingLabel)
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, fullWidth, gameControl, className })}
      onClick={handleClick}
      aria-disabled={blocked ? true : rest['aria-disabled']}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
    >
      <span className="ui-btn__label" aria-hidden={swapName || undefined}>
        {icon ? <Icon icon={icon} size={iconSize} /> : null}
        {children}
        {iconEnd ? <Icon icon={iconEnd} size={iconSize} /> : null}
      </span>
      {loading ? <Spinner size={iconSize} /> : null}
      {swapName ? <span className="ui-visually-hidden">{loadingLabel}</span> : null}
    </button>
  )
}

export interface LinkButtonProps extends CommonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Required: a LinkButton is a real link and navigates without JavaScript. */
  href: string
  ref?: Ref<HTMLAnchorElement>
}

/** An `<a href>` styled as a button. Use for navigation; use Button for actions. */
export function LinkButton({ variant = 'primary', size = 'md', icon, iconEnd, fullWidth, gameControl = false, className, children, target, rel, ref, ...rest }: LinkButtonProps) {
  const iconSize = ICON_SIZE[size]
  const safeRel = target === '_blank' && rel === undefined ? 'noopener noreferrer' : rel
  return (
    <a {...rest} ref={ref} target={target} rel={safeRel} className={buttonClassName({ variant, size, fullWidth, gameControl, className })}>
      <span className="ui-btn__label">
        {icon ? <Icon icon={icon} size={iconSize} /> : null}
        {children}
        {iconEnd ? <Icon icon={iconEnd} size={iconSize} /> : null}
      </span>
    </a>
  )
}

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconEnd' | 'children' | 'fullWidth' | 'aria-label' | 'loadingLabel'> {
  /** The lucide-react icon to show. */
  icon: LucideIcon
  /** Required accessible name — an icon-only button has no visible text (spec §7). */
  'aria-label': string
  /** Optional native tooltip text; defaults to nothing (use the Tooltip component in apps). */
  title?: string
  children?: never
}

/** A square, icon-only button. `aria-label` is required by the type and checked at runtime in dev. */
export function IconButton({ icon, size = 'md', variant = 'ghost', gameControl = false, loading = false, type = 'button', className, onClick, ref, ...rest }: IconButtonProps) {
  if (!rest['aria-label'] || rest['aria-label'].trim() === '') {
    devWarn('IconButton requires a non-empty aria-label.')
  }
  const ariaDisabled = rest['aria-disabled'] === true || rest['aria-disabled'] === 'true'
  const blocked = loading || ariaDisabled
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
  const iconSize = ICON_ONLY_SIZE[size]
  const content: ReactNode = <Icon icon={icon} size={iconSize} />
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, iconOnly: true, gameControl, className })}
      onClick={handleClick}
      aria-disabled={blocked ? true : rest['aria-disabled']}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
    >
      <span className="ui-btn__label">{content}</span>
      {loading ? <Spinner size={iconSize} /> : null}
    </button>
  )
}
