import * as RT from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface TabItem {
  value: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: ReadonlyArray<TabItem>
  /** Names the tab list (aria-label). */
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
}

/**
 * Tabs (spec §7 P1; Radix Tabs): one tab stop, arrow keys move between tabs, the panel follows.
 * Use for peer views of one object, never for steps in a flow (use a Stepper) or for navigation
 * between pages (use links).
 */
export function Tabs({ items, label, value, defaultValue, onValueChange, className }: TabsProps) {
  return (
    <RT.Root
      className={cx('ui-tabs', className)}
      {...(value === undefined ? {} : { value })}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
    >
      <RT.List className="ui-tabs__list" aria-label={label}>
        {items.map((t) => (
          <RT.Trigger key={t.value} value={t.value} disabled={t.disabled} className="ui-tabs__tab">
            {t.label}
          </RT.Trigger>
        ))}
      </RT.List>
      {items.map((t) => (
        <RT.Content key={t.value} value={t.value} className="ui-tabs__panel">
          {t.content}
        </RT.Content>
      ))}
    </RT.Root>
  )
}
