/**
 * Gallery examples for @trident/ui/app (spec §10.6). Overlays render closed (their trigger) so the
 * screenshots are stable; gallery/tests/keyboard.spec.ts opens each one by keyboard, checks axe on
 * the open state, then closes it with Escape and checks focus returns to the trigger.
 */
import { useState, type ReactNode } from 'react'
import { Archive, Copy, FilePlus, Inbox, LayoutDashboard, MoreHorizontal, Pencil, SearchX, Settings, Trash2 } from 'lucide-react'
import { Button, IconButton } from '../actions/Button'
import { Badge } from '../display/Badge'
import { Field } from '../forms/Field'
import { Input } from '../forms/controls'
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

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  /** Span the whole row in the gallery. */
  wide?: boolean
  render: () => ReactNode
}

export const group = 'app'

const row = { display: 'flex', flexWrap: 'wrap', gap: '16px 12px', alignItems: 'center' } as const
const noop = () => {}

interface Client {
  name: string
  plan: string
  status: 'Active' | 'Trial' | 'Paused'
  posts: number
}

/** Sample rows for the table demo (fictional, labelled as sample data in the caption). */
const CLIENTS: Client[] = [
  { name: 'Harbor Coffee', plan: 'Studio', status: 'Active', posts: 128 },
  { name: 'North Gym', plan: 'Starter', status: 'Trial', posts: 12 },
  { name: 'Mesa Florist', plan: 'Studio', status: 'Active', posts: 64 },
  { name: 'Pine Dental', plan: 'Starter', status: 'Paused', posts: 0 },
]
const STATUS_TONE = { Active: 'ok', Trial: 'info', Paused: 'neutral' } as const

function PaletteDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open command palette (Ctrl+K)
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={[
          { id: 'dashboard', label: 'Go to dashboard', group: 'Navigate', icon: <LayoutDashboard size={16} />, onSelect: noop },
          { id: 'settings', label: 'Open settings', group: 'Navigate', icon: <Settings size={16} />, onSelect: noop },
          { id: 'new-post', label: 'New post', group: 'Create', icon: <FilePlus size={16} />, shortcut: 'N', onSelect: noop },
        ]}
      />
    </>
  )
}

export const examples: GalleryExample[] = [
  {
    id: 'dialog',
    title: 'Dialog',
    description: 'A focused task that needs the page to wait. Focus moves in and is trapped; Escape or Close returns it to the trigger.',
    render: () => (
      <Dialog
        trigger={<Button variant="secondary">Edit profile</Button>}
        title="Edit profile"
        description="Changes are visible to your team straight away."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Save</Button>
            </DialogClose>
          </>
        }
      >
        <Field label="Display name" name="dialog_name">
          <Input defaultValue="Harbor Coffee" />
        </Field>
      </Dialog>
    ),
  },
  {
    id: 'confirm-dialog',
    title: 'ConfirmDialog',
    description: 'The replacement for confirm(). Cancel has focus first; the destructive action is styled as danger, never the primary fill.',
    render: () => (
      <ConfirmDialog
        trigger={
          <Button variant="danger" icon={Trash2}>
            Delete post
          </Button>
        }
        title="Delete this post?"
        description="It is removed from every scheduled platform. This cannot be undone."
        confirmLabel="Delete post"
        destructive
      />
    ),
  },
  {
    id: 'sheet',
    title: 'Sheet',
    description: 'A dialog from an edge for filters, details or navigation on phones. It slides only when motion is allowed.',
    render: () => (
      <Sheet trigger={<Button variant="secondary">Open filters</Button>} title="Filters" description="Narrow the list by status.">
        <p style={{ margin: 0 }}>Filter controls go here.</p>
      </Sheet>
    ),
  },
  {
    id: 'popover',
    title: 'Popover',
    description: 'A small non-modal panel anchored to its trigger. Escape or a click outside closes it.',
    render: () => (
      <Popover trigger={<Button variant="secondary">Share</Button>} label="Share">
        <p style={{ margin: '0 0 8px' }}>Anyone with the link can view this report.</p>
        <Button size="sm" icon={Copy}>
          Copy link
        </Button>
      </Popover>
    ),
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    description: 'Repeats an icon button’s label on hover and focus (WCAG 1.4.13). Never the only place information lives.',
    render: () => (
      <div style={row}>
        <Tooltip content="Archive">
          <IconButton icon={Archive} aria-label="Archive" variant="secondary" />
        </Tooltip>
        <Tooltip content="Edit post">
          <IconButton icon={Pencil} aria-label="Edit post" variant="secondary" />
        </Tooltip>
      </div>
    ),
  },
  {
    id: 'dropdown-menu',
    title: 'DropdownMenu',
    description: 'Secondary actions behind one button. Arrow keys move, typing jumps, Escape closes; the destructive item comes last.',
    render: () => (
      <DropdownMenu
        trigger={<IconButton icon={MoreHorizontal} aria-label="Post actions" variant="secondary" />}
        label="Post actions"
        items={[
          { label: 'Edit', icon: <Pencil size={16} />, shortcut: 'E', onSelect: noop },
          { label: 'Duplicate', icon: <Copy size={16} />, onSelect: noop },
          { label: 'Archive', icon: <Archive size={16} />, onSelect: noop },
          { type: 'separator' },
          { label: 'Delete', icon: <Trash2 size={16} />, danger: true, onSelect: noop },
        ]}
      />
    ),
  },
  {
    id: 'context-menu',
    title: 'ContextMenu',
    description: 'A right-click shortcut for actions that also exist elsewhere (here, in the DropdownMenu). Never the only path.',
    render: () => (
      <ContextMenu
        label="Card actions"
        items={[
          { label: 'Open', onSelect: noop },
          { label: 'Copy link', onSelect: noop },
          { type: 'separator' },
          { label: 'Archive', onSelect: noop },
        ]}
      >
        <div tabIndex={0} style={{ padding: 16, border: '1px dashed var(--ui-line-strong)', borderRadius: 12, color: 'var(--ui-ink-2)' }}>
          Right-click (or Shift+F10) this card
        </div>
      </ContextMenu>
    ),
  },
  {
    id: 'tabs',
    title: 'Tabs',
    description: 'Peer views of one object. One tab stop; arrow keys move between tabs. Not for steps or page navigation.',
    render: () => (
      <Tabs
        label="Client"
        items={[
          { value: 'overview', label: 'Overview', content: 'Plan, owner and posting cadence.' },
          { value: 'billing', label: 'Billing', content: 'Invoices and the card on file.' },
          { value: 'activity', label: 'Activity', content: 'The last 30 days of changes.' },
        ]}
      />
    ),
  },
  {
    id: 'command-palette',
    title: 'CommandPalette',
    description: 'Type to find any command (Cmd/Ctrl+K). Every command also exists in the normal interface.',
    render: () => <PaletteDemo />,
  },
  {
    id: 'data-table',
    title: 'DataTable',
    description: 'Solid rows, a sticky header, three-state sortable columns (aria-sort), numbers right-aligned, its own scroll area and pagination below.',
    wide: true,
    render: () => (
      <DataTable
        caption="Clients (sample data)"
        columns={[
          { key: 'name', header: 'Client', sort: true, rowHeader: true },
          { key: 'plan', header: 'Plan' },
          { key: 'status', header: 'Status', cell: (c: Client) => <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge> },
          { key: 'posts', header: 'Posts', numeric: true, sort: (c: Client) => c.posts },
        ]}
        rows={CLIENTS}
        rowKey={(c) => c.name}
        toolbar={
          <>
            <span style={{ color: 'var(--ui-ink-2)', fontSize: 14 }}>4 clients</span>
            <Button size="sm" icon={FilePlus}>
              Add client
            </Button>
          </>
        }
        footer={<Pagination page={1} pageCount={3} hrefFor={(p) => `#clients-page-${p}`} label="Clients pages" />}
      />
    ),
  },
  {
    id: 'data-table-states',
    title: 'DataTable: loading and empty',
    description: 'Skeleton rows while data loads (aria-busy), and an empty state that says why and what to do next.',
    render: () => (
      <div style={{ display: 'grid', gap: 16 }}>
        <DataTable caption="Invoices (loading)" captionHidden columns={[{ key: 'id', header: 'Invoice' }, { key: 'total', header: 'Total', numeric: true }]} rows={[]} rowKey={(r: { id: string }) => r.id} loading loadingRows={3} density="compact" />
        <DataTable
          caption="Invoices (filtered)"
          captionHidden
          columns={[{ key: 'id', header: 'Invoice' }, { key: 'total', header: 'Total', numeric: true }]}
          rows={[]}
          rowKey={(r: { id: string }) => r.id}
          empty={<EmptyState size="sm" headingLevel={4} icon={<SearchX size={22} />} title="No invoices match “overdue”" description="Clear the filter to see all 12 invoices." secondaryAction={<Button variant="link">Clear filter</Button>} />}
        />
      </div>
    ),
  },
  {
    id: 'empty-state',
    title: 'EmptyState',
    description: 'First use: what the space is for and the one next step. Copy states the situation, never fakes content.',
    render: () => <EmptyState headingLevel={4} icon={<Inbox size={22} />} title="No posts scheduled yet" description="Plan your first week: draft a post, pick platforms and a time." action={<Button icon={FilePlus}>New post</Button>} secondaryAction={<Button variant="link">Import from a spreadsheet</Button>} />,
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    description: 'Placeholder shapes while content loads. The shimmer runs once for at most 1s, then stays static; none under reduced motion.',
    render: () => (
      <SkeletonGroup label="Loading client card…">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton shape="circle" />
          <div style={{ flex: 1, display: 'grid', gap: 8 }}>
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </div>
        </div>
        <Skeleton shape="block" />
      </SkeletonGroup>
    ),
  },
]

export default { group, examples }
