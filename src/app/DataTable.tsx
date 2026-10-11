import { useId, useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cx, devWarn } from '../actions/internal'
import { Skeleton } from './Skeleton'

export type SortDirection = 'ascending' | 'descending'
export interface SortState {
  key: string
  direction: SortDirection
}

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  /** Cell content. Default: the row's `key` property as text. */
  cell?: (row: T) => ReactNode
  /**
   * Makes the column sortable. Return a string (compared with the locale, numeric-aware) or a
   * number; null and undefined sort last. `true` sorts by the row's `key` property.
   */
  sort?: ((row: T) => string | number | null | undefined) | true
  /** Numbers, money, dates: right-aligned with tabular figures (spec §4). */
  numeric?: boolean
  /** The cell that names the row (th scope=row). Usually the first column. */
  rowHeader?: boolean
  /** CSS width, e.g. "30%" or "8rem". */
  width?: string
}

export type TableDensity = 'compact' | 'default' | 'comfortable'

export interface DataTableProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>
  rows: ReadonlyArray<T>
  /** Stable key per row. */
  rowKey: (row: T, index: number) => string
  /** Required: names the table (and its scroll region). */
  caption: ReactNode
  /** Keep the caption for screen readers only (when a visible heading already says the same). */
  captionHidden?: boolean
  /** Controlled sort. Pair with onSortChange; omit both for built-in sorting. */
  sort?: SortState | null
  defaultSort?: SortState | null
  onSortChange?: (sort: SortState | null) => void
  /** Row height: compact 32px, default 40px, comfortable 48px (Carbon's density scale). */
  density?: TableDensity
  /** Shows skeleton rows (aria-busy) instead of data. */
  loading?: boolean
  loadingRows?: number
  /** Shown in one full-width row when there are no rows (an EmptyState, size "sm"). */
  empty?: ReactNode
  /** Filters, search and batch actions above the table. */
  toolbar?: ReactNode
  /** Pagination or a summary below the table. */
  footer?: ReactNode
  /** Scroll inside the table past this height; the header stays put. */
  maxHeight?: number | string
  className?: string
}

const VIRTUALISE_ABOVE = 200

function valueOf<T>(row: T, col: DataTableColumn<T>): string | number | null | undefined {
  if (typeof col.sort === 'function') return col.sort(row)
  const v = (row as Record<string, unknown>)[col.key]
  return typeof v === 'number' || typeof v === 'string' ? v : v == null ? null : String(v)
}

function compare(a: string | number | null | undefined, b: string | number | null | undefined): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/** none -> ascending -> descending -> none (three-state sortable headers, Carbon). */
function nextSort(current: SortState | null, key: string): SortState | null {
  if (!current || current.key !== key) return { key, direction: 'ascending' }
  return current.direction === 'ascending' ? { key, direction: 'descending' } : null
}

/**
 * Data table (spec §7 P1; Carbon data table anatomy): solid rows, a sticky header, three-state
 * sortable header buttons with aria-sort, its own keyboard-scrollable container, density tokens,
 * skeleton loading and an empty state. Up to 200 rows render directly; page or filter beyond that.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  captionHidden = false,
  sort: controlled,
  defaultSort = null,
  onSortChange,
  density = 'default',
  loading = false,
  loadingRows = 5,
  empty,
  toolbar,
  footer,
  maxHeight,
  className,
}: DataTableProps<T>) {
  const captionId = useId()
  const [own, setOwn] = useState<SortState | null>(defaultSort)
  const sort = controlled === undefined ? own : controlled
  if (rows.length > VIRTUALISE_ABOVE) devWarn(`DataTable got ${rows.length} rows; page or filter above ${VIRTUALISE_ABOVE} (spec §7).`)

  const sorted = useMemo(() => {
    const col = sort ? columns.find((c) => c.key === sort.key && c.sort) : undefined
    if (!sort || !col) return rows
    const dir = sort.direction === 'ascending' ? 1 : -1
    return [...rows].map((r, i) => ({ r, i })).sort((x, y) => compare(valueOf(x.r, col), valueOf(y.r, col)) * dir || x.i - y.i).map((x) => x.r)
  }, [rows, columns, sort])

  const onSort = (key: string) => {
    const next = nextSort(sort, key)
    if (controlled === undefined) setOwn(next)
    onSortChange?.(next)
  }

  return (
    <div className={cx('ui-table-wrap', className)} data-density={density}>
      {toolbar ? <div className="ui-table-toolbar">{toolbar}</div> : null}
      <div
        className="ui-table-scroll"
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        style={maxHeight === undefined ? undefined : { maxBlockSize: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <table className="ui-table" aria-busy={loading || undefined}>
          <caption id={captionId} className={captionHidden ? 'ui-visually-hidden' : 'ui-table__caption'}>
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key ? sort.direction : undefined
                return (
                  <th key={c.key} scope="col" aria-sort={c.sort ? (active ?? 'none') : undefined} data-numeric={c.numeric ? '' : undefined} style={c.width ? { inlineSize: c.width } : undefined}>
                    {c.sort ? (
                      <button type="button" className="ui-table__sort" onClick={() => onSort(c.key)}>
                        <span>{c.header}</span>
                        {active === 'ascending' ? (
                          <ArrowUp size={14} aria-hidden="true" />
                        ) : active === 'descending' ? (
                          <ArrowDown size={14} aria-hidden="true" />
                        ) : (
                          <ArrowUpDown size={14} aria-hidden="true" className="ui-table__sort-idle" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }, (_, i) => (
                  <tr key={`loading-${i}`} data-loading="">
                    {columns.map((c) => (
                      <td key={c.key} data-numeric={c.numeric ? '' : undefined}>
                        <Skeleton width={c.numeric ? '4em' : `${60 + ((i * 7 + c.key.length * 5) % 35)}%`} />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.length === 0
                ? (
                    <tr data-empty="">
                      <td colSpan={columns.length}>{empty ?? 'No rows.'}</td>
                    </tr>
                  )
                : sorted.map((row, i) => (
                    <tr key={rowKey(row, i)}>
                      {columns.map((c) => {
                        const content = c.cell ? c.cell(row) : String((row as Record<string, unknown>)[c.key] ?? '')
                        return c.rowHeader ? (
                          <th key={c.key} scope="row" data-numeric={c.numeric ? '' : undefined}>
                            {content}
                          </th>
                        ) : (
                          <td key={c.key} data-numeric={c.numeric ? '' : undefined}>
                            {content}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="ui-table-footer">{footer}</div> : null}
    </div>
  )
}
