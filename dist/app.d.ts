import * as react from 'react';
import { ReactElement, ReactNode, HTMLAttributes } from 'react';
import * as RD from '@radix-ui/react-dialog';
import * as RP from '@radix-ui/react-popover';

type DialogSize = 'sm' | 'md' | 'lg';
type SheetSide = 'right' | 'left' | 'bottom' | 'top';
interface OverlayBaseProps {
    /** Controlled open state. Omit for an uncontrolled dialog opened by `trigger`. */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The element that opens it (a Button). Radix wires aria-haspopup, aria-expanded and focus return. */
    trigger?: ReactElement;
    /** Required visible title: it names the dialog (aria-labelledby). */
    title: ReactNode;
    /** Optional line under the title; it describes the dialog (aria-describedby). */
    description?: ReactNode;
    children?: ReactNode;
    /** Actions row (Buttons). Wrap a closing button in `<DialogClose asChild>`. */
    footer?: ReactNode;
    /** Accessible name of the corner close button. Default "Close". */
    closeLabel?: string;
    className?: string;
}
interface DialogProps extends OverlayBaseProps {
    /** Width: sm 400px, md 560px (default), lg 760px; never wider than the viewport minus 32px. */
    size?: DialogSize;
}
interface SheetProps extends OverlayBaseProps {
    /** The edge the sheet slides from. Default "right". On phones a side sheet is full width. */
    side?: SheetSide;
}
/**
 * Modal dialog (spec §7 P1; Radix Dialog). Focus moves in and is trapped, the page behind is inert,
 * Escape or the close button closes it, and focus returns to the trigger. Solid surface, no blur
 * (spec §5 e3/e4 overlays). For "are you sure?" use ConfirmDialog, which cannot be dismissed by a
 * stray click outside.
 */
declare function Dialog({ size, ...props }: DialogProps): react.JSX.Element;
/** A dialog that slides from an edge (filters, detail panes, mobile navigation). */
declare function Sheet({ side, ...props }: SheetProps): react.JSX.Element;
/** Closes the surrounding Dialog or Sheet. Use with `asChild` around a Button. */
declare const DialogClose: react.ForwardRefExoticComponent<RD.DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;

interface ConfirmDialogProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The element that opens it (a Button). */
    trigger?: ReactElement;
    /** The question, e.g. "Refund this deal?". */
    title: ReactNode;
    /** Required: what happens and whether it can be undone. */
    description: ReactNode;
    /** The confirming action's label, a verb ("Refund $120"), never "OK" or "Yes". */
    confirmLabel: ReactNode;
    /** Default "Cancel". It receives focus first, so Enter never confirms by accident. */
    cancelLabel?: ReactNode;
    /** Runs when the confirm button is pressed (the dialog then closes). */
    onConfirm?: () => void;
    /**
     * The id of a native `<form>` the confirm button submits (`form.requestSubmit()`, so validation
     * and submit handlers run), keeping the server authoritative (spec §7: the NIL refund).
     */
    confirmForm?: string;
    /** Style the confirm button as destructive (danger outline). It is still not the default focus. */
    destructive?: boolean;
    children?: ReactNode;
    className?: string;
}
/**
 * The replacement for `window.confirm()` (spec §7 P1 AlertDialog/ConfirmDialog; Radix AlertDialog).
 * It cannot be dismissed by clicking outside; Escape and Cancel close it; Cancel has initial focus.
 * Destructive actions are styled as danger but never as the primary fill (Apple HIG "Role").
 */
declare function ConfirmDialog({ open, defaultOpen, onOpenChange, trigger, title, description, confirmLabel, cancelLabel, onConfirm, confirmForm, destructive, children, className, }: ConfirmDialogProps): react.JSX.Element;

interface PopoverProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The element that toggles it (a Button). */
    trigger: ReactElement;
    children: ReactNode;
    /** Names the popover content for screen readers. */
    label?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}
/**
 * Non-modal floating panel anchored to its trigger (spec §7 P1; Radix Popover): filters, quick
 * settings, a date. Escape or a click outside closes it and focus returns to the trigger.
 */
declare function Popover({ open, defaultOpen, onOpenChange, trigger, children, label, side, align, className }: PopoverProps): react.JSX.Element;
declare const PopoverClose: react.ForwardRefExoticComponent<RP.PopoverCloseProps & react.RefAttributes<HTMLButtonElement>>;

interface TooltipProps {
    /** The tooltip text. Supplementary only: never the only place information lives. */
    content: ReactNode;
    /** One focusable element (an IconButton). The tooltip shows on hover and on keyboard focus. */
    children: ReactElement;
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Hover delay in ms. Default 400; keyboard focus shows it at once. */
    delay?: number;
    className?: string;
}
/**
 * Tooltip (spec §7 P1, WCAG 1.4.13; Radix Tooltip): appears on hover and focus, can be hovered
 * without vanishing, and Escape dismisses it without moving focus. An IconButton still needs its
 * own aria-label; the tooltip repeats it visually.
 */
declare function Tooltip({ content, children, side, delay, className }: TooltipProps): react.JSX.Element;

/** One menu entry. Data in, markup out, so every menu in the fleet looks and behaves the same. */
type MenuEntry = {
    type?: 'item';
    label: ReactNode;
    onSelect?: () => void;
    /** Leading icon (decorative; rendered aria-hidden). */
    icon?: ReactNode;
    /** Shown at the end, e.g. "⌘D". Decorative text: the action must also be reachable here. */
    shortcut?: string;
    /** Destructive item: danger text. Put it last, after a separator. */
    danger?: boolean;
    disabled?: boolean;
} | {
    type: 'separator';
} | {
    type: 'label';
    label: ReactNode;
};
interface DropdownMenuProps {
    /** The element that opens it (a Button or IconButton). */
    trigger: ReactElement;
    items: ReadonlyArray<MenuEntry>;
    /** Names the menu for screen readers when the trigger's label does not. */
    label?: string;
    align?: 'start' | 'center' | 'end';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /**
     * Default false: the menu-button pattern needs no modality, and a modal menu aria-hides a page
     * that stays focusable (axe aria-hidden-focus). Focus still moves in and returns on Escape.
     */
    modal?: boolean;
    className?: string;
}
/**
 * Menu of actions behind a button (spec §7 P1; Radix DropdownMenu): arrow keys move, typeahead
 * jumps, Enter selects, Escape closes and returns focus to the trigger.
 */
declare function DropdownMenu({ trigger, items, label, align, open, onOpenChange, modal, className }: DropdownMenuProps): react.JSX.Element;
interface ContextMenuProps {
    /** The area that opens the menu on right-click, long-press, Shift+F10 or the Menu key. */
    children: ReactElement;
    items: ReadonlyArray<MenuEntry>;
    label?: string;
    className?: string;
}
/**
 * Right-click menu (spec §7 P1; Radix ContextMenu). Every action in it must also be reachable
 * another way (a DropdownMenu or a button): a context menu is a shortcut, never the only path.
 */
declare function ContextMenu({ children, items, label, className }: ContextMenuProps): react.JSX.Element;

interface TabItem {
    value: string;
    label: ReactNode;
    content: ReactNode;
    disabled?: boolean;
}
interface TabsProps {
    items: ReadonlyArray<TabItem>;
    /** Names the tab list (aria-label). */
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}
/**
 * Tabs (spec §7 P1; Radix Tabs): one tab stop, arrow keys move between tabs, the panel follows.
 * Use for peer views of one object, never for steps in a flow (use a Stepper) or for navigation
 * between pages (use links).
 */
declare function Tabs({ items, label, value, defaultValue, onValueChange, className }: TabsProps): react.JSX.Element;

interface CommandItem {
    id: string;
    label: string;
    /** Heading of the group the item belongs to. */
    group?: string;
    /** Extra search terms. */
    keywords?: string[];
    icon?: ReactNode;
    /** Decorative hint, e.g. "G then D". */
    shortcut?: string;
    onSelect: () => void;
}
interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: ReadonlyArray<CommandItem>;
    /** Names the dialog. Default "Command palette". */
    label?: string;
    placeholder?: string;
    /** Shown when nothing matches. */
    emptyText?: ReactNode;
    /** Opens with Cmd+K / Ctrl+K when set (default "k"); pass null to wire your own shortcut. */
    hotkey?: string | null;
}
/**
 * Command palette (spec §7 P1; cmdk 1.x inside a Radix dialog): type to filter, arrows to move,
 * Enter to run, Escape to close with focus returned to whatever had it. Every command must also
 * exist in the normal UI; the palette is a shortcut for keyboard users, not the only path.
 * (cmdk's own Command.Dialog cannot return focus without a trigger, so the dialog is ours.)
 */
declare function CommandPalette({ open, onOpenChange, items, label, placeholder, emptyText, hotkey }: CommandPaletteProps): react.JSX.Element;

type SortDirection = 'ascending' | 'descending';
interface SortState {
    key: string;
    direction: SortDirection;
}
interface DataTableColumn<T> {
    key: string;
    header: ReactNode;
    /** Cell content. Default: the row's `key` property as text. */
    cell?: (row: T) => ReactNode;
    /**
     * Makes the column sortable. Return a string (compared with the locale, numeric-aware) or a
     * number; null and undefined sort last. `true` sorts by the row's `key` property.
     */
    sort?: ((row: T) => string | number | null | undefined) | true;
    /** Numbers, money, dates: right-aligned with tabular figures (spec §4). */
    numeric?: boolean;
    /** The cell that names the row (th scope=row). Usually the first column. */
    rowHeader?: boolean;
    /** CSS width, e.g. "30%" or "8rem". */
    width?: string;
}
type TableDensity = 'compact' | 'default' | 'comfortable';
interface DataTableProps<T> {
    columns: ReadonlyArray<DataTableColumn<T>>;
    rows: ReadonlyArray<T>;
    /** Stable key per row. */
    rowKey: (row: T, index: number) => string;
    /** Required: names the table (and its scroll region). */
    caption: ReactNode;
    /** Keep the caption for screen readers only (when a visible heading already says the same). */
    captionHidden?: boolean;
    /** Controlled sort. Pair with onSortChange; omit both for built-in sorting. */
    sort?: SortState | null;
    defaultSort?: SortState | null;
    onSortChange?: (sort: SortState | null) => void;
    /** Row height: compact 32px, default 40px, comfortable 48px (Carbon's density scale). */
    density?: TableDensity;
    /** Shows skeleton rows (aria-busy) instead of data. */
    loading?: boolean;
    loadingRows?: number;
    /** Shown in one full-width row when there are no rows (an EmptyState, size "sm"). */
    empty?: ReactNode;
    /** Filters, search and batch actions above the table. */
    toolbar?: ReactNode;
    /** Pagination or a summary below the table. */
    footer?: ReactNode;
    /** Scroll inside the table past this height; the header stays put. */
    maxHeight?: number | string;
    className?: string;
}
/**
 * Data table (spec §7 P1; Carbon data table anatomy): solid rows, a sticky header, three-state
 * sortable header buttons with aria-sort, its own keyboard-scrollable container, density tokens,
 * skeleton loading and an empty state. Up to 200 rows render directly; page or filter beyond that.
 */
declare function DataTable<T>({ columns, rows, rowKey, caption, captionHidden, sort: controlled, defaultSort, onSortChange, density, loading, loadingRows, empty, toolbar, footer, maxHeight, className, }: DataTableProps<T>): react.JSX.Element;

interface PaginationProps {
    /** 1-based current page. */
    page: number;
    pageCount: number;
    /** Real links (works without JavaScript): the URL of a page. Preferred. */
    hrefFor?: (page: number) => string;
    /** Client-side paging when there are no URLs. */
    onPageChange?: (page: number) => void;
    /** Names the navigation landmark. Default "Pagination". */
    label?: string;
    className?: string;
}
/**
 * Previous / next paging with the position as text ("Page 2 of 7"), at the bottom of a table or
 * list (spec §7 P1; Carbon puts pagination below the table). Links when `hrefFor` is given.
 */
declare function Pagination({ page, pageCount, hrefFor, onPageChange, label, className }: PaginationProps): react.JSX.Element;

interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** States the situation in a few words: "No invoices yet", "No results for “tacos”". */
    title: ReactNode;
    /** One or two sentences: why it is empty and what to do next. */
    description?: ReactNode;
    /** A small decorative icon (rendered aria-hidden). */
    icon?: ReactNode;
    /**
     * A larger illustration or an app 3D moment (spec §6.7: at most 60KB, demand loop, stops after 3s,
     * through Lazy3D). Decorative: it must not carry information the text lacks.
     */
    media?: ReactNode;
    /** The one primary next step (a Button or LinkButton). */
    action?: ReactNode;
    /** An optional quieter alternative (a link-variant Button: "Clear filters", "Read the guide"). */
    secondaryAction?: ReactNode;
    headingLevel?: 2 | 3 | 4;
    /** "md" (default) for a page or panel, "sm" inside a table or card. */
    size?: 'sm' | 'md';
}
/**
 * Empty-state anatomy (spec §7 P1): media, title, description, then one primary action. Use it for
 * first use ("nothing here yet"), for a filter that matched nothing, and after the user cleared
 * everything, each with its own copy and next step. Never fake content to fill the space.
 */
declare function EmptyState({ title, description, icon, media, action, secondaryAction, headingLevel, size, className, ...rest }: EmptyStateProps): react.JSX.Element;

interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
    /** CSS width (number = px). Default 100%. */
    width?: number | string;
    /** CSS height (number = px). Default 1em (a line of text). */
    height?: number | string;
    shape?: 'line' | 'block' | 'pill' | 'circle';
}
/**
 * A placeholder shape while content loads (spec §7 P1; Carbon data table loading). Decorative and
 * aria-hidden: announce loading once on the container (SkeletonGroup). The shimmer runs once for
 * at most 1s and then stays static (spec §6.3 rule 7); none under reduced motion or Pause.
 */
declare function Skeleton({ width, height, shape, className, style, ...rest }: SkeletonProps): react.JSX.Element;
interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Announced once to screen readers. Default "Loading…". */
    label?: string;
    children?: ReactNode;
}
/** Wraps skeletons: role=status with a visually hidden label and aria-busy while it is shown. */
declare function SkeletonGroup({ label, className, children, ...rest }: SkeletonGroupProps): react.JSX.Element;

export { type CommandItem, CommandPalette, type CommandPaletteProps, ConfirmDialog, type ConfirmDialogProps, ContextMenu, type ContextMenuProps, DataTable, type DataTableColumn, type DataTableProps, Dialog, DialogClose, type DialogProps, type DialogSize, DropdownMenu, type DropdownMenuProps, EmptyState, type EmptyStateProps, type MenuEntry, Pagination, type PaginationProps, Popover, PopoverClose, type PopoverProps, Sheet, type SheetProps, type SheetSide, Skeleton, SkeletonGroup, type SkeletonGroupProps, type SkeletonProps, type SortDirection, type SortState, type TabItem, type TableDensity, Tabs, type TabsProps, Tooltip, type TooltipProps };
