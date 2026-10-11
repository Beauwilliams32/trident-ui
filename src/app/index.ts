/**
 * @trident/ui/app — Radix Primitives and cmdk compositions for app shells (spec §1, §7 P1): the
 * overlay set (Dialog, Sheet, ConfirmDialog, Popover, Tooltip, DropdownMenu, ContextMenu), Tabs,
 * CommandPalette, and the data surfaces (DataTable, Pagination, EmptyState, Skeleton).
 *
 * Radix and cmdk are OPTIONAL peer dependencies, so this is a separate subpath entry and is NOT
 * re-exported from the package root (the root entry's size budget stays untouched). Install the
 * peers you use: @radix-ui/react-dialog, -alert-dialog, -popover, -tooltip, -dropdown-menu,
 * -context-menu, -tabs, and cmdk. Styles ship in @trident/ui/styles.css.
 */
export { Dialog, Sheet, DialogClose } from './Dialog'
export type { DialogProps, DialogSize, SheetProps, SheetSide } from './Dialog'
export { ConfirmDialog } from './ConfirmDialog'
export type { ConfirmDialogProps } from './ConfirmDialog'
export { Popover, PopoverClose } from './Popover'
export type { PopoverProps } from './Popover'
export { Tooltip } from './Tooltip'
export type { TooltipProps } from './Tooltip'
export { DropdownMenu, ContextMenu } from './Menu'
export type { DropdownMenuProps, ContextMenuProps, MenuEntry } from './Menu'
export { Tabs } from './Tabs'
export type { TabsProps, TabItem } from './Tabs'
export { CommandPalette } from './CommandPalette'
export type { CommandPaletteProps, CommandItem } from './CommandPalette'
export { DataTable } from './DataTable'
export type { DataTableProps, DataTableColumn, SortState, SortDirection, TableDensity } from './DataTable'
export { Pagination } from './Pagination'
export type { PaginationProps } from './Pagination'
export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
export { Skeleton, SkeletonGroup } from './Skeleton'
export type { SkeletonProps, SkeletonGroupProps } from './Skeleton'
