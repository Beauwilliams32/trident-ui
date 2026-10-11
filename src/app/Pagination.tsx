import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, LinkButton } from '../actions/Button'
import { cx } from '../actions/internal'

export interface PaginationProps {
  /** 1-based current page. */
  page: number
  pageCount: number
  /** Real links (works without JavaScript): the URL of a page. Preferred. */
  hrefFor?: (page: number) => string
  /** Client-side paging when there are no URLs. */
  onPageChange?: (page: number) => void
  /** Names the navigation landmark. Default "Pagination". */
  label?: string
  className?: string
}

/**
 * Previous / next paging with the position as text ("Page 2 of 7"), at the bottom of a table or
 * list (spec §7 P1; Carbon puts pagination below the table). Links when `hrefFor` is given.
 */
export function Pagination({ page, pageCount, hrefFor, onPageChange, label = 'Pagination', className }: PaginationProps) {
  const total = Math.max(1, Math.floor(pageCount))
  const current = Math.min(Math.max(1, Math.floor(page)), total)
  const control = (to: number, dir: 'prev' | 'next') => {
    const disabled = dir === 'prev' ? current <= 1 : current >= total
    const text = dir === 'prev' ? 'Previous' : 'Next'
    const icon = dir === 'prev' ? { icon: ChevronLeft } : { iconEnd: ChevronRight }
    if (hrefFor && !disabled)
      return (
        <LinkButton href={hrefFor(to)} variant="secondary" size="sm" rel={dir} {...icon}>
          {text}
        </LinkButton>
      )
    return (
      <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onPageChange?.(to)} {...icon}>
        {text}
      </Button>
    )
  }
  return (
    <nav className={cx('ui-pagination', className)} aria-label={label}>
      {control(current - 1, 'prev')}
      <span className="ui-pagination__status" aria-current="page">
        Page {current} of {total}
      </span>
      {control(current + 1, 'next')}
    </nav>
  )
}
