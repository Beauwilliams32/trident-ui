import * as RD from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { useEffect, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { useReturnFocus } from './focus'

export interface CommandItem {
  id: string
  label: string
  /** Heading of the group the item belongs to. */
  group?: string
  /** Extra search terms. */
  keywords?: string[]
  icon?: ReactNode
  /** Decorative hint, e.g. "G then D". */
  shortcut?: string
  onSelect: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ReadonlyArray<CommandItem>
  /** Names the dialog. Default "Command palette". */
  label?: string
  placeholder?: string
  /** Shown when nothing matches. */
  emptyText?: ReactNode
  /** Opens with Cmd+K / Ctrl+K when set (default "k"); pass null to wire your own shortcut. */
  hotkey?: string | null
}

/**
 * Command palette (spec §7 P1; cmdk 1.x inside a Radix dialog): type to filter, arrows to move,
 * Enter to run, Escape to close with focus returned to whatever had it. Every command must also
 * exist in the normal UI; the palette is a shortcut for keyboard users, not the only path.
 * (cmdk's own Command.Dialog cannot return focus without a trigger, so the dialog is ours.)
 */
export function CommandPalette({ open, onOpenChange, items, label = 'Command palette', placeholder = 'Type a command or search…', emptyText = 'No results.', hotkey = 'k' }: CommandPaletteProps) {
  useEffect(() => {
    if (!hotkey) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === hotkey && (e.metaKey || e.ctrlKey) && !e.altKey) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hotkey, open, onOpenChange])

  const focus = useReturnFocus(false)
  const groups = new Map<string, CommandItem[]>()
  for (const it of items) {
    const g = it.group ?? ''
    groups.set(g, [...(groups.get(g) ?? []), it])
  }
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="ui-overlay" />
        <RD.Content className="ui-dialog ui-command" aria-describedby={undefined} {...focus}>
          <RD.Title className="ui-visually-hidden">{label}</RD.Title>
          <Command label={label} className="ui-command__root">
            <div className="ui-command__search">
              <Search size={18} aria-hidden="true" />
              <Command.Input className="ui-command__input" placeholder={placeholder} />
            </div>
            <Command.List className="ui-command__list">
              <Command.Empty className="ui-command__empty">{emptyText}</Command.Empty>
              {[...groups].map(([heading, list]) => (
                <Command.Group key={heading || 'all'} heading={heading || undefined} className="ui-command__group">
                  {list.map((it) => (
                    <Command.Item
                      key={it.id}
                      value={`${it.label} ${it.id}`}
                      keywords={it.keywords}
                      className="ui-menu__item"
                      onSelect={() => {
                        it.onSelect()
                        onOpenChange(false)
                      }}
                    >
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
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  )
}
