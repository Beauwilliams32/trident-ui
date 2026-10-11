import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** States the situation in a few words: "No invoices yet", "No results for “tacos”". */
  title: ReactNode
  /** One or two sentences: why it is empty and what to do next. */
  description?: ReactNode
  /** A small decorative icon (rendered aria-hidden). */
  icon?: ReactNode
  /**
   * A larger illustration or an app 3D moment (spec §6.7: at most 60KB, demand loop, stops after 3s,
   * through Lazy3D). Decorative: it must not carry information the text lacks.
   */
  media?: ReactNode
  /** The one primary next step (a Button or LinkButton). */
  action?: ReactNode
  /** An optional quieter alternative (a link-variant Button: "Clear filters", "Read the guide"). */
  secondaryAction?: ReactNode
  headingLevel?: 2 | 3 | 4
  /** "md" (default) for a page or panel, "sm" inside a table or card. */
  size?: 'sm' | 'md'
}

/**
 * Empty-state anatomy (spec §7 P1): media, title, description, then one primary action. Use it for
 * first use ("nothing here yet"), for a filter that matched nothing, and after the user cleared
 * everything, each with its own copy and next step. Never fake content to fill the space.
 */
export function EmptyState({ title, description, icon, media, action, secondaryAction, headingLevel = 2, size = 'md', className, ...rest }: EmptyStateProps) {
  const id = useId()
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  return (
    <div {...rest} className={cx('ui-empty', className)} data-size={size} role={rest.role ?? 'group'} aria-labelledby={rest['aria-labelledby'] ?? id}>
      {media ? (
        <div className="ui-empty__media" aria-hidden="true">
          {media}
        </div>
      ) : icon ? (
        <span className="ui-empty__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <H id={id} className="ui-empty__title">
        {title}
      </H>
      {description ? <p className="ui-empty__description">{description}</p> : null}
      {action || secondaryAction ? (
        <div className="ui-empty__actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
