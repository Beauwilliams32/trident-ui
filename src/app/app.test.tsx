/**
 * @trident/ui/app (G7; spec §7 P1): the Radix overlay set, Tabs, CommandPalette and the data
 * surfaces. jsdom covers roles, names, focus and keyboard; the real-browser keyboard journeys and
 * axe on open overlays are in gallery/tests/keyboard.spec.ts.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from '../actions/Button'
import {
  CommandPalette,
  ConfirmDialog,
  ContextMenu,
  DataTable,
  Dialog,
  DialogClose,
  DropdownMenu,
  EmptyState,
  Pagination,
  Popover,
  Sheet,
  Skeleton,
  SkeletonGroup,
  Tabs,
  Tooltip,
} from './index'
import * as root from '../index'

const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')
/** Radix restores focus and moves roving focus in a setTimeout: let one macrotask run. */
const tick = () => act(() => new Promise<void>((done) => setTimeout(done, 0)))

beforeAll(() => {
  // jsdom lacks these; Radix (Popper) and cmdk call them.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  Element.prototype.scrollIntoView ??= function scrollIntoView() {}
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.releasePointerCapture ??= () => {}
})

describe('entry isolation', () => {
  it('nothing from /app leaks into the package root', () => {
    for (const name of ['Dialog', 'Sheet', 'ConfirmDialog', 'Popover', 'Tooltip', 'DropdownMenu', 'ContextMenu', 'Tabs', 'CommandPalette', 'DataTable', 'EmptyState', 'Skeleton'])
      expect(root, name).not.toHaveProperty(name)
  })
})

describe('Dialog', () => {
  it('opens from its trigger, is named and described, closes on Escape and returns focus', async () => {
    render(<Dialog trigger={<Button>Edit profile</Button>} title="Edit profile" description="Changes save when you press Save." footer={<DialogClose asChild><Button>Save</Button></DialogClose>}>
      <p>Body</p>
    </Dialog>)
    const trigger = screen.getByRole('button', { name: 'Edit profile' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' })
    expect(dialog.className).toContain('ui-dialog')
    expect(dialog.getAttribute('data-size')).toBe('md')
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(within(dialog).getByText('Changes save when you press Save.')).toBeTruthy()
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeTruthy()
    expect(dialog.contains(document.activeElement)).toBe(true)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await tick()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('has no description attribute when there is no description, and no axe violations open', async () => {
    render(<Dialog defaultOpen title="Rename" />)
    const dialog = await screen.findByRole('dialog', { name: 'Rename' })
    expect(dialog.hasAttribute('aria-describedby')).toBe(false)
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('Sheet is a dialog that carries its side', async () => {
    render(<Sheet defaultOpen side="left" title="Filters" />)
    const sheet = await screen.findByRole('dialog', { name: 'Filters' })
    expect(sheet.className).toContain('ui-sheet')
    expect(sheet.getAttribute('data-side')).toBe('left')
  })
})

describe('ConfirmDialog (replaces window.confirm)', () => {
  it('is an alertdialog with Cancel focused first; the action confirms and closes', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog trigger={<Button>Refund</Button>} title="Refund this deal?" description="The athlete is notified. This cannot be undone." confirmLabel="Refund $120" destructive onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Refund' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Refund this deal?' })
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    expect(document.activeElement).toBe(cancel)
    const action = within(dialog).getByRole('button', { name: 'Refund $120' })
    expect(action.className).toContain('ui-btn--danger')
    expect(action.className).not.toContain('ui-btn--primary')
    fireEvent.click(action)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await act(async () => {})
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('submits a native form by id so the server stays authoritative', async () => {
    const submit = vi.fn((e: SubmitEvent) => e.preventDefault())
    render(
      <>
        <form id="refund-form" method="post" action="/refund" onSubmit={(e) => submit(e.nativeEvent as SubmitEvent)} />
        <ConfirmDialog defaultOpen title="Refund?" description="Cannot be undone." confirmLabel="Refund" confirmForm="refund-form" />
      </>,
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Refund' }))
    expect(submit).toHaveBeenCalledTimes(1)
  })
})

describe('Popover and Tooltip', () => {
  it('Popover opens from its trigger and closes on Escape with focus returned', async () => {
    render(
      <Popover trigger={<Button>Filters</Button>} label="Filters">
        <p>Status</p>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: 'Filters' })
    trigger.focus()
    fireEvent.click(trigger)
    const panel = await screen.findByRole('dialog', { name: 'Filters' })
    expect(panel.className).toContain('ui-popover')
    fireEvent.keyDown(panel, { key: 'Escape' })
    await tick()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('Tooltip shows on keyboard focus (WCAG 1.4.13) and describes the trigger', async () => {
    render(
      <Tooltip content="Archive post">
        <Button aria-label="Archive">A</Button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Archive' })
    fireEvent.focus(trigger)
    const tip = await screen.findByRole('tooltip')
    expect(tip.textContent).toContain('Archive post')
  })
})

describe('DropdownMenu and ContextMenu', () => {
  it('DropdownMenu opens with the keyboard, runs an item and returns focus', async () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu
        trigger={<Button>Actions</Button>}
        items={[{ label: 'Duplicate', onSelect, shortcut: '⌘D' }, { type: 'separator' }, { label: 'Delete', danger: true }]}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Actions' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const menu = await screen.findByRole('menu')
    const items = within(menu).getAllByRole('menuitem')
    expect(items.map((i) => i.textContent)).toEqual(['Duplicate⌘D', 'Delete'])
    expect(items[1]!.hasAttribute('data-danger')).toBe(true)
    expect(within(menu).getByRole('separator')).toBeTruthy()
    fireEvent.click(items[0]!)
    expect(onSelect).toHaveBeenCalledTimes(1)
    await act(async () => {})
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('ContextMenu opens on contextmenu', async () => {
    render(
      <ContextMenu items={[{ label: 'Open' }]}>
        <div tabIndex={0}>Row</div>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Row'))
    expect(within(await screen.findByRole('menu')).getByRole('menuitem', { name: 'Open' })).toBeTruthy()
  })
})

describe('Tabs', () => {
  it('one tab stop, arrow keys move, the panel follows', async () => {
    render(
      <Tabs
        label="Account"
        items={[
          { value: 'profile', label: 'Profile', content: 'Profile panel' },
          { value: 'billing', label: 'Billing', content: 'Billing panel' },
        ]}
      />,
    )
    const list = screen.getByRole('tablist', { name: 'Account' })
    const [profile, billing] = within(list).getAllByRole('tab')
    expect(profile!.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Profile panel')
    profile!.focus()
    fireEvent.keyDown(profile!, { key: 'ArrowRight' })
    await tick()
    expect(document.activeElement).toBe(billing)
    expect(billing!.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Billing panel')
  })
})

describe('CommandPalette', () => {
  it('filters as you type, runs the item, closes; Cmd/Ctrl+K toggles it', async () => {
    const go = vi.fn()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <CommandPalette open={false} onOpenChange={onOpenChange} items={[{ id: 'dash', label: 'Go to dashboard', group: 'Navigate', onSelect: go }, { id: 'inv', label: 'New invoice', group: 'Create', onSelect: () => {} }]} />,
    )
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    rerender(
      <CommandPalette open onOpenChange={onOpenChange} items={[{ id: 'dash', label: 'Go to dashboard', group: 'Navigate', onSelect: go }, { id: 'inv', label: 'New invoice', group: 'Create', onSelect: () => {} }]} />,
    )
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' })
    const input = within(dialog).getByRole('combobox')
    fireEvent.change(input, { target: { value: 'dash' } })
    await act(async () => {})
    const options = within(dialog).getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual(['Go to dashboard'])
    fireEvent.click(options[0]!)
    expect(go).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})

interface Row {
  name: string
  plan: string
  mrr: number
}
/** Fictional sample rows, matching the sample clients used in the gallery (src/app/app.gallery.tsx). */
const ROWS: Row[] = [
  { name: 'Harbor Coffee', plan: 'Studio', mrr: 120 },
  { name: 'North Gym', plan: 'Starter', mrr: 49 },
  { name: 'Mesa Florist', plan: 'Studio', mrr: 1200 },
]
const COLUMNS = [
  { key: 'name', header: 'Client', sort: true as const, rowHeader: true },
  { key: 'plan', header: 'Plan' },
  { key: 'mrr', header: 'MRR', numeric: true, sort: (r: Row) => r.mrr, cell: (r: Row) => `$${r.mrr}` },
]

describe('DataTable', () => {
  it('is a named, keyboard-scrollable region with a captioned table and row headers', () => {
    render(<DataTable caption="Clients" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.name} />)
    const region = screen.getByRole('region', { name: 'Clients' })
    expect(region.getAttribute('tabindex')).toBe('0')
    const table = within(region).getByRole('table', { name: 'Clients' })
    expect(within(table).getAllByRole('rowheader').map((c) => c.textContent)).toEqual(['Harbor Coffee', 'North Gym', 'Mesa Florist'])
    expect(within(table).getByRole('columnheader', { name: 'Plan' }).hasAttribute('aria-sort')).toBe(false)
    expect(within(table).getByRole('columnheader', { name: 'MRR' }).getAttribute('aria-sort')).toBe('none')
  })

  it('sorts in three states: ascending, descending, then back to the original order', () => {
    render(<DataTable caption="Clients" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.name} />)
    const header = screen.getByRole('columnheader', { name: 'MRR' })
    const button = within(header).getByRole('button', { name: 'MRR' })
    const names = () => screen.getAllByRole('rowheader').map((c) => c.textContent)
    fireEvent.click(button)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
    expect(names()).toEqual(['North Gym', 'Harbor Coffee', 'Mesa Florist'])
    fireEvent.click(button)
    expect(header.getAttribute('aria-sort')).toBe('descending')
    expect(names()).toEqual(['Mesa Florist', 'Harbor Coffee', 'North Gym'])
    fireEvent.click(button)
    expect(header.getAttribute('aria-sort')).toBe('none')
    expect(names()).toEqual(['Harbor Coffee', 'North Gym', 'Mesa Florist'])
  })

  it('reports controlled sort changes without sorting itself', () => {
    const onSortChange = vi.fn()
    render(<DataTable caption="Clients" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.name} sort={null} onSortChange={onSortChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Client' }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' })
    expect(screen.getAllByRole('rowheader')[0]!.textContent).toBe('Harbor Coffee')
  })

  it('shows skeleton rows while loading and an empty state with no rows', () => {
    const { rerender } = render(<DataTable caption="Clients" columns={COLUMNS} rows={[]} rowKey={(r) => r.name} loading loadingRows={3} />)
    expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true')
    expect(document.querySelectorAll('tr[data-loading]')).toHaveLength(3)
    rerender(<DataTable caption="Clients" columns={COLUMNS} rows={[]} rowKey={(r) => r.name} empty={<EmptyState size="sm" title="No clients yet" />} />)
    expect(screen.getByRole('group', { name: 'No clients yet' })).toBeTruthy()
    expect(screen.getByRole('cell').getAttribute('colspan')).toBe('3')
  })

  it('has no axe violations', async () => {
    const { container } = render(<DataTable caption="Clients" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.name} density="compact" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Pagination', () => {
  it('uses real links when it has URLs, and says where you are', () => {
    render(<Pagination page={1} pageCount={3} hrefFor={(p) => `?page=${p}`} />)
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(true)
    expect(within(nav).getByRole('link', { name: 'Next' }).getAttribute('href')).toBe('?page=2')
    expect(nav.textContent).toContain('Page 1 of 3')
  })

  it('calls onPageChange without URLs and clamps the page', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={9} pageCount={3} onPageChange={onPageChange} />)
    expect(screen.getByRole('navigation').textContent).toContain('Page 3 of 3')
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})

describe('EmptyState and Skeleton', () => {
  it('EmptyState is a group named by its title with one primary action', async () => {
    const { container } = render(<EmptyState title="No invoices yet" description="Create one to bill a client." action={<Button>New invoice</Button>} headingLevel={3} />)
    const group = screen.getByRole('group', { name: 'No invoices yet' })
    expect(within(group).getByRole('heading', { level: 3 }).textContent).toBe('No invoices yet')
    expect(within(group).getAllByRole('button')).toHaveLength(1)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Skeleton is hidden from assistive tech; SkeletonGroup announces loading once', () => {
    render(
      <SkeletonGroup>
        <Skeleton width={120} />
        <Skeleton shape="circle" />
      </SkeletonGroup>,
    )
    const status = screen.getByRole('status')
    expect(status.getAttribute('aria-busy')).toBe('true')
    expect(status.textContent).toBe('Loading…')
    for (const s of status.querySelectorAll('.ui-skeleton')) expect(s.getAttribute('aria-hidden')).toBe('true')
    expect((status.querySelector('.ui-skeleton') as HTMLElement).style.inlineSize).toBe('120px')
  })
})

describe('SSR', () => {
  it('renders closed overlays as their triggers only, and the data surfaces in full', () => {
    const html = renderToString(
      <>
        <Dialog trigger={<Button>Open</Button>} title="T" />
        <DataTable caption="C" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.name} />
      </>,
    )
    expect(html).toContain('Open')
    expect(html).not.toContain('role="dialog"')
    expect(html).toContain('<caption')
  })
})

describe('app CSS contract', () => {
  it('overlays are solid (no blur) and animate only behind the motion gate', () => {
    expect(css).not.toMatch(/backdrop-filter/)
    const gated = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference)'))
    for (const name of ['ui-pop-in', 'ui-sheet-in-x', 'ui-skeleton-sweep'])
      expect(css.indexOf(`animation: ${name}`), name).toBeGreaterThanOrEqual(css.length - gated.length)
  })

  it('skeleton shimmer runs once for at most 1s (spec §6.3 rule 7)', () => {
    expect(css).toMatch(/animation: ui-skeleton-sweep 1s var\(--ui-ease-inout\) 1 forwards;/)
  })

  it('exits run at 0.7x the enter (spec §6.3 rule 2)', () => {
    expect(css).toContain('animation: ui-pop-out calc(var(--ui-dur-fast) * 0.7)')
    expect(css).toContain('animation: ui-fade-out calc(var(--ui-dur-med) * 0.7)')
  })
})

describe('focus return without a trigger', () => {
  it('a controlled Dialog returns focus to whatever had it when it opened', async () => {
    function Host({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">Opener</button>
          <Dialog open={open} onOpenChange={() => {}} title="Controlled" />
        </>
      )
    }
    const { rerender } = render(<Host open={false} />)
    const opener = screen.getByRole('button', { name: 'Opener' })
    opener.focus()
    rerender(<Host open />)
    await screen.findByRole('dialog', { name: 'Controlled' })
    rerender(<Host open={false} />)
    await tick()
    expect(document.activeElement).toBe(opener)
  })

  it('the CommandPalette returns focus too', async () => {
    function Host({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">Before</button>
          <CommandPalette open={open} onOpenChange={() => {}} hotkey={null} items={[{ id: 'a', label: 'A', onSelect: () => {} }]} />
        </>
      )
    }
    const { rerender } = render(<Host open={false} />)
    const before = screen.getByRole('button', { name: 'Before' })
    before.focus()
    rerender(<Host open />)
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeTruthy()
    rerender(<Host open={false} />)
    await tick()
    expect(document.activeElement).toBe(before)
  })
})
