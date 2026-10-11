import * as CM from '@radix-ui/react-context-menu'
import * as DM from '@radix-ui/react-dropdown-menu'
import type { ReactElement, ReactNode } from 'react'
import { cx } from '../actions/internal'

/** One menu entry. Data in, markup out, so every menu in the fleet looks and behaves the same. */
export type MenuEntry =
  | {
      type?: 'item'
      label: ReactNode
      onSelect?: () => void
      /** Leading icon (decorative; rendered aria-hidden). */
      icon?: ReactNode
      /** Shown at the end, e.g. "⌘D". Decorative text: the action must also be reachable here. */
      shortcut?: string
      /** Destructive item: danger text. Put it last, after a separator. */
      danger?: boolean
      disabled?: boolean
    }
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode }

export interface DropdownMenuProps {
  /** The element that opens it (a Button or IconButton). */
  trigger: ReactElement
  items: ReadonlyArray<MenuEntry>
  /** Names the menu for screen readers when the trigger's label does not. */
  label?: string
  align?: 'start' | 'center' | 'end'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Default false: the menu-button pattern needs no modality, and a modal menu aria-hides a page
   * that stays focusable (axe aria-hidden-focus). Focus still moves in and returns on Escape.
   */
  modal?: boolean
  className?: string
}

type Parts = typeof DM | typeof CM

function entries(P: Parts, items: ReadonlyArray<MenuEntry>) {
  return items.map((it, i) => {
    if (it.type === 'separator') return <P.Separator key={i} className="ui-menu__separator" />
    if (it.type === 'label') return <P.Label key={i} className="ui-menu__label">{it.label}</P.Label>
    return (
      <P.Item key={i} className="ui-menu__item" disabled={it.disabled} onSelect={it.onSelect} data-danger={it.danger ? '' : undefined}>
        {it.icon ? (
          <span className="ui-menu__icon" aria-hidden="true">
            {it.icon}
          </span>
        ) : null}
        <span className="ui-menu__text">{it.label}</span>
        {it.shortcut ? (
          <span className="ui-menu__shortcut" aria-hidden="true">
            {it.shortcut}
          </span>
        ) : null}
      </P.Item>
    )
  })
}

/**
 * Menu of actions behind a button (spec §7 P1; Radix DropdownMenu): arrow keys move, typeahead
 * jumps, Enter selects, Escape closes and returns focus to the trigger.
 */
export function DropdownMenu({ trigger, items, label, align = 'start', open, onOpenChange, modal = false, className }: DropdownMenuProps) {
  return (
    <DM.Root {...(open === undefined ? {} : { open })} onOpenChange={onOpenChange} modal={modal}>
      <DM.Trigger asChild>{trigger}</DM.Trigger>
      <DM.Portal>
        <DM.Content className={cx('ui-menu', className)} align={align} sideOffset={6} collisionPadding={16} aria-label={label}>
          {entries(DM, items)}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  )
}

export interface ContextMenuProps {
  /** The area that opens the menu on right-click, long-press, Shift+F10 or the Menu key. */
  children: ReactElement
  items: ReadonlyArray<MenuEntry>
  label?: string
  className?: string
}

/**
 * Right-click menu (spec §7 P1; Radix ContextMenu). Every action in it must also be reachable
 * another way (a DropdownMenu or a button): a context menu is a shortcut, never the only path.
 */
export function ContextMenu({ children, items, label, className }: ContextMenuProps) {
  return (
    <CM.Root modal={false}>
      <CM.Trigger asChild>{children}</CM.Trigger>
      <CM.Portal>
        <CM.Content className={cx('ui-menu', className)} collisionPadding={16} aria-label={label}>
          {entries(CM, items)}
        </CM.Content>
      </CM.Portal>
    </CM.Root>
  )
}
