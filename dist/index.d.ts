import * as react from 'react';
import { AnchorHTMLAttributes, ReactNode, Ref, HTMLAttributes, ElementType, ReactElement, ButtonHTMLAttributes, InputHTMLAttributes, FormHTMLAttributes, FieldsetHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, MouseEventHandler } from 'react';
import { LucideIcon } from 'lucide-react';

interface SkipLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    /** id of the main landmark to jump to (without '#'). Default "main". */
    targetId?: string;
    /** Link text. Default "Skip to content". */
    children?: ReactNode;
    ref?: Ref<HTMLAnchorElement>;
}
/**
 * First focusable element on every page (WCAG 2.4.1). Off screen until it receives focus, then
 * shown top-left above the sticky nav. A plain anchor: works with no JavaScript.
 * Give the target `tabIndex={-1}` if it is not itself focusable, so focus moves with the jump.
 */
declare function SkipLink({ targetId, children, className, ...rest }: SkipLinkProps): react.JSX.Element;

interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Default "span". */
    as?: ElementType;
    children?: ReactNode;
    ref?: Ref<HTMLElement>;
}
/**
 * Content for assistive technology only: read by screen readers, invisible on screen.
 * If it contains a focusable element it becomes visible while focused (the class uses
 * `:not(:focus):not(:active)`), so keyboard users are never focused on something invisible.
 */
declare function VisuallyHidden({ as, className, ...rest }: VisuallyHiddenProps): react.JSX.Element;

type Politeness = 'polite' | 'assertive';
type Announce = (message: string, politeness?: Politeness) => void;
interface LiveAnnouncerProps {
    children?: ReactNode;
    /** Milliseconds after which an announcement is cleared from the region. Default 7000; 0 keeps it. */
    clearAfter?: number;
}
/**
 * Renders one polite and one assertive live region (both present in the SSR markup, empty) and
 * provides `useAnnouncer()` to its subtree. Mount it once near the root of the app.
 *
 * Each announcement first empties its region, then writes the message on the next tick, so the
 * same message said twice is still read twice.
 */
declare function LiveAnnouncer({ children, clearAfter }: LiveAnnouncerProps): react.JSX.Element;
/** Returns `announce(message, politeness?)`. Outside a LiveAnnouncer it is a no-op (dev warning). */
declare function useAnnouncer(): Announce;

/** Class that draws the Trident focus ring on :focus-visible (2px --ui-focus, 2px offset). */
declare const focusRingClass = "ui-focus-ring";
/** Class that draws the ring on a container while a descendant has keyboard focus. */
declare const focusRingWithinClass = "ui-focus-ring-within";
interface FocusRingProps {
    /** Exactly one element; it receives the focus-ring class. */
    children: ReactElement<{
        className?: string;
        'data-focus-inset'?: string;
    }>;
    /** Draw the ring when any descendant has keyboard focus (e.g. a card wrapping a link). */
    within?: boolean;
    /** Draw the ring inside the element's box, for elements inside an overflow:hidden parent. */
    inset?: boolean;
}
/**
 * Applies the design-system focus ring (spec §7, §9) to its single child: 2px `--ui-focus` with a
 * 2px offset (at least 3:1 in every theme, tested by the contrast matrix), `Highlight` under
 * forced colours, and never animated away. Native controls already get this ring from base.css;
 * use FocusRing for custom focusable elements and for focus-within containers.
 */
declare function FocusRing({ children, within, inset }: FocusRingProps): ReactElement<{
    className?: string;
    'data-focus-inset'?: string;
}, string | react.JSXElementConstructor<any>>;

/** marketing 1080px, app 1280px (spec §5), prose 68ch, full = gutter only. */
type ContainerSize = 'marketing' | 'app' | 'prose' | 'full';
interface ContainerProps extends HTMLAttributes<HTMLElement> {
    size?: ContainerSize;
    /** Element to render. Default "div". */
    as?: ElementType;
    ref?: Ref<HTMLElement>;
}
/** Centred content column with the fluid gutter (clamp(16px, 4vw, 32px); never under 16px). */
declare function Container({ size, as, className, ...rest }: ContainerProps): react.JSX.Element;

/** Spacing steps (spec §5, 4px base). Values map to the --ui-space-* tokens. */
declare const SPACE_STEPS: readonly [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];
type Space = (typeof SPACE_STEPS)[number];

interface StackProps extends HTMLAttributes<HTMLElement> {
    /** Gap between children, as a spacing step. Default 4 (16px). */
    gap?: Space;
    /** Cross-axis alignment. Default "stretch". */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Element to render. Default "div". Use "ul"/"ol" for lists (list semantics are kept). */
    as?: ElementType;
    ref?: Ref<HTMLElement>;
}
/** Vertical flow with a consistent gap. Pure CSS; no inline styles (CSP-safe). */
declare function Stack({ gap, align, as, className, ...rest }: StackProps): react.JSX.Element;

interface ClusterProps extends HTMLAttributes<HTMLElement> {
    /** Gap between children, as a spacing step. Default 2 (8px). */
    gap?: Space;
    /** Main-axis distribution. Default "start". */
    justify?: 'start' | 'center' | 'end' | 'between';
    /** Cross-axis alignment. Default "center". */
    align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
    /** Wrap onto new lines when out of room. Default true. */
    wrap?: boolean;
    /** Element to render. Default "div". */
    as?: ElementType;
    ref?: Ref<HTMLElement>;
}
/** Horizontal group that wraps: button rows, tag lists, nav links. */
declare function Cluster({ gap, justify, align, wrap, as, className, ...rest }: ClusterProps): react.JSX.Element;

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** Minimum track width for the auto-fit grid: xs 160px, sm 220px, md 280px, lg 340px. */
type GridMin = 'xs' | 'sm' | 'md' | 'lg';
interface GridProps extends HTMLAttributes<HTMLElement> {
    /**
     * Fixed column count (12-column system, spec §5). Collapses to one column below 768px unless
     * `collapse` is false. Omit it for an auto-fit grid driven by `min`.
     */
    columns?: GridColumns;
    /** Auto-fit minimum track width, used when `columns` is omitted. Default "md". */
    min?: GridMin;
    /** Gap as a spacing step. Default 6 (24px). */
    gap?: Space;
    /** With `columns`, stack to one column below 768px. Default true. */
    collapse?: boolean;
    /** Element to render. Default "div". */
    as?: ElementType;
    ref?: Ref<HTMLElement>;
}
/** CSS grid. Either a fixed column count or an auto-fit grid that never overflows at 360px. */
declare function Grid({ columns, min, gap, collapse, as, className, ...rest }: GridProps): react.JSX.Element;

interface SectionProps extends HTMLAttributes<HTMLElement> {
    /** Vertical padding. Default "md". */
    space?: 'none' | 'sm' | 'md' | 'lg';
    /** Background: page bg, the alternate bg-2, or the solid surface. Default "default". */
    tone?: 'default' | 'alt' | 'surface';
    /** Wrap children in a Container of this size, or false for none. Default "marketing". */
    container?: ContainerSize | false;
    /** Element to render. Default "section". */
    as?: ElementType;
    ref?: Ref<HTMLElement>;
}
/**
 * A page band: vertical rhythm, optional background tone and a centred Container.
 * A `<section>` is only a landmark when it has an accessible name, so pass `aria-labelledby`
 * pointing at its Heading when the band is a meaningful region.
 */
declare function Section({ space, tone, container, as, className, children, ...rest }: SectionProps): react.JSX.Element;

/** Heading-outline checks behind Heading's dev warnings (spec §7, §9: one h1, no skipped levels). */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
interface HeadingIssue {
    kind: 'multiple-h1' | 'skipped-level';
    element: Element;
    level: HeadingLevel;
    /** The level of the heading before this one, for skipped-level issues. */
    previous?: HeadingLevel;
    message: string;
}
/**
 * Walks the headings under `root` in document order and reports every h1 after the first and
 * every heading more than one level deeper than the heading before it. The first heading may be
 * any level (a fragment may start at h2). SSR-safe: pass a root explicitly outside the browser.
 */
declare function checkHeadingOutline(root: ParentNode): HeadingIssue[];

/** Type scale steps (spec §4). Values map to the --ui-text-* tokens. */
declare const TEXT_SIZES: readonly ["2xs", "xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "4xl", "display"];
type TextSize = (typeof TEXT_SIZES)[number];
type TextTone = 'ink' | 'ink-2' | 'muted' | 'accent';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    /** Required: the outline level (h1 to h6). Choose it from the document structure, never the look. */
    level: HeadingLevel;
    /** Visual size, independent of level. Defaults: h1 4xl, h2 3xl, h3 2xl, h4 xl, h5 lg, h6 md. */
    size?: TextSize;
    /** Colour. Default "ink". */
    tone?: TextTone;
    ref?: Ref<HTMLHeadingElement>;
}
/**
 * Heading with a required level. In development it warns (console.warn, once) when it is a
 * second h1 on the page or skips a level after the previous heading (WCAG 1.3.1, spec §9).
 */
declare function Heading({ level, size, tone, className, ref, ...rest }: HeadingProps): react.JSX.Element;

interface TextProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Default "p". */
    as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small' | 'figcaption' | 'label' | 'dd' | 'dt' | 'li';
    /** Default "base" (16px, line-height 1.6). Body copy should stay at base or larger (spec §4). */
    size?: TextSize;
    /** Default "ink". "accent" uses --ui-accent-text, which is at least 4.5:1 in every theme. */
    tone?: TextTone;
    weight?: 'body' | 'medium' | 'display' | 'bold';
    /** Cap the line length at 68ch (spec §4). */
    measure?: boolean;
    /** Tabular numerals, for stats and tables. */
    tabular?: boolean;
    ref?: Ref<HTMLElement>;
}
/** Body text on the type scale. */
declare function Text({ as, size, tone, weight, measure, tabular, className, ...rest }: TextProps): react.JSX.Element;

interface KickerProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Default "p". A kicker is never a heading. */
    as?: 'p' | 'span' | 'div';
    /** Default "accent" (--ui-accent-text; the portfolio theme swaps it for ink-2, see styles.css). */
    tone?: 'accent' | 'muted' | 'ink-2';
    ref?: Ref<HTMLElement>;
}
/** Eyebrow label above a heading: 12px, 600, +0.14em, uppercase (spec §4). */
declare function Kicker({ as, tone, className, ...rest }: KickerProps): react.JSX.Element;

interface GradTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** One or two words (spec §4). Plain text only, so screen readers read it normally. */
    children: string;
    ref?: Ref<HTMLSpanElement>;
}
/** Counts words the way a reader would: whitespace-separated runs. */
declare function countWords(text: string): number;
/**
 * Accent-gradient text for one or two words of a display heading. Falls back to the solid
 * `--ui-accent-text` colour where background-clip:text is unsupported, and to CanvasText under
 * forced colours. Use it at display sizes only: the gradient's second stop is a fill colour.
 */
declare function GradText({ children, className, ...rest }: GradTextProps): react.JSX.Element;

interface MonoProps extends HTMLAttributes<HTMLSpanElement> {
    ref?: Ref<HTMLSpanElement>;
}
/** Monospace run with tabular numerals: prices, IDs, timestamps (spec §4). Not code; use Code. */
declare function Mono({ className, ...rest }: MonoProps): react.JSX.Element;

interface CodeProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    /**
     * Render a block (`<pre><code>`) instead of inline `<code>`. The block scrolls horizontally
     * and is keyboard-focusable so its overflow can be scrolled without a mouse (WCAG 2.1.1).
     */
    block?: boolean;
    /** Accessible name for a block, e.g. "Install command". Recommended for blocks. */
    label?: string;
}
/** Inline code or a code block. */
declare function Code({ block, label, className, children, ...rest }: CodeProps): react.JSX.Element;

interface KbdProps extends HTMLAttributes<HTMLElement> {
    /** A single key. Ignored when `keys` is given. */
    children?: ReactNode;
    /** A key combination, e.g. ["Ctrl", "K"]: rendered as nested <kbd> elements joined by "+". */
    keys?: string[];
}
/** Keyboard input. A combination uses nested <kbd> elements, as the HTML spec describes. */
declare function Kbd({ keys, className, children, ...rest }: KbdProps): react.JSX.Element;

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Required: a TextLink is a real `<a href>` and navigates without JavaScript. */
    href: string;
    children?: ReactNode;
    /**
     * "always" (default) for links in running text: the underline means a link is never told apart
     * by colour alone (WCAG 1.4.1). "hover" only where position already says "link" (navigation
     * lists, footers): the underline then appears on hover and keyboard focus.
     */
    underline?: 'always' | 'hover';
    /**
     * "accent" (default) is `--ui-accent-text`, at least 4.5:1 on bg, bg-2 and surface in every theme.
     * "inherit" takes the surrounding text colour, for links inside toned surfaces (Alert, Toast).
     */
    tone?: 'accent' | 'inherit';
    /** Screen-reader hint appended when `target="_blank"`. Default "(opens in a new tab)". */
    newTabHint?: string;
    ref?: Ref<HTMLAnchorElement>;
}
/**
 * A themed inline link (G1; Radix Themes Link, shadcn's link styles). Package components that
 * contain links (Alert actions, Toast, FlashBanner, ViewTransitionLink) use the same `.ui-link`
 * rules, so no link in the system falls back to the browser's default blue.
 */
declare function TextLink({ underline, tone, newTabHint, className, target, rel, children, ref, ...rest }: TextLinkProps): react.JSX.Element;

interface ProseProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Default "div"; use "article" for a standalone document. */
    as?: ElementType;
    ref?: Ref<HTMLElement>;
}
/**
 * Typography for long-form HTML you do not control element by element (legal pages, CMS or
 * Markdown output): rhythm, 68ch measure, underlined links, lists, quotes, code and tables.
 * It styles markup only; it never rewrites heading levels, so the source must be well ordered.
 */
declare function Prose({ as, className, ...rest }: ProseProps): react.JSX.Element;

/**
 * Button variants (spec §7): primary, secondary-glass (`secondary`), ghost, danger, link.
 * Sizes map to the component tokens --ui-btn-h-sm / --ui-btn-h / --ui-btn-h-lg (32 / 36 / 44px).
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';
/** Pixel heights per size, for consumers that need the number (e.g. aligning a sibling input). */
declare const BUTTON_HEIGHTS: Readonly<Record<ButtonSize, number>>;
interface ButtonStyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    iconOnly?: boolean;
    /** Uses the visible 48px minimum target for game controls. */
    gameControl?: boolean;
    className?: string;
}
/** The class list a Button renders. Exported so server templates without React can match it. */
declare function buttonClassName({ variant, size, fullWidth, iconOnly, gameControl, className }?: ButtonStyleOptions): string;
interface CommonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Use the shared visible 48px target for a game action. */
    gameControl?: boolean;
    /** Leading lucide-react icon (decorative; always aria-hidden). */
    icon?: LucideIcon;
    /** Trailing lucide-react icon (decorative; always aria-hidden). */
    iconEnd?: LucideIcon;
    fullWidth?: boolean;
}
interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    /**
     * Native button type. Defaults to "button"; use "submit" (or SubmitButton) for form submission,
     * which works with JavaScript disabled.
     */
    type?: 'button' | 'submit' | 'reset';
    /**
     * Shows a spinner over the label. The label stays in the layout (opacity 0) so the width never
     * changes; the button is aria-disabled + aria-busy and swallows clicks, but keeps focus.
     */
    loading?: boolean;
    /** Accessible name while loading (e.g. "Saving…"). Without it the normal label is kept. */
    loadingLabel?: string;
    ref?: Ref<HTMLButtonElement>;
}
declare function Button({ variant, size, gameControl, icon, iconEnd, fullWidth, loading, loadingLabel, type, className, children, onClick, ref, ...rest }: ButtonProps): react.JSX.Element;
interface LinkButtonProps extends CommonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Required: a LinkButton is a real link and navigates without JavaScript. */
    href: string;
    ref?: Ref<HTMLAnchorElement>;
}
/** An `<a href>` styled as a button. Use for navigation; use Button for actions. */
declare function LinkButton({ variant, size, icon, iconEnd, fullWidth, gameControl, className, children, target, rel, ref, ...rest }: LinkButtonProps): react.JSX.Element;
interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconEnd' | 'children' | 'fullWidth' | 'aria-label' | 'loadingLabel'> {
    /** The lucide-react icon to show. */
    icon: LucideIcon;
    /** Required accessible name — an icon-only button has no visible text (spec §7). */
    'aria-label': string;
    /** Optional native tooltip text; defaults to nothing (use the Tooltip component in apps). */
    title?: string;
    children?: never;
}
/** A square, icon-only button. `aria-label` is required by the type and checked at runtime in dev. */
declare function IconButton({ icon, size, variant, gameControl, loading, type, className, onClick, ref, ...rest }: IconButtonProps): react.JSX.Element;

/** Default CSRF field name. Override per app to match the server (e.g. "csrf_token"). */
declare const DEFAULT_CSRF_FIELD = "_csrf";
interface CsrfFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'name' | 'defaultValue'> {
    /** The token, passed in from server props. Never generated on the client. */
    value: string;
    /** Form field name the server reads. Default "_csrf". */
    name?: string;
}
/** Hidden CSRF input. The value comes from the server render (spec §7, §8 Auth / Money). */
declare function CsrfField({ value, name, ...rest }: CsrfFieldProps): react.JSX.Element;
interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'method'> {
    /** Native method. Defaults to "post" (native POST first, spec §7). Ignored for function actions. */
    method?: 'post' | 'get' | 'dialog';
    /** CSRF token from server props; renders a CsrfField as the first child when set. */
    csrfToken?: string;
    /** CSRF field name. Default "_csrf". */
    csrfFieldName?: string;
    children?: ReactNode;
    ref?: Ref<HTMLFormElement>;
}
/**
 * A native `<form>` that works with JavaScript disabled: method="post" by default, a real `action`,
 * and an optional server-supplied CSRF field. Hydration only adds enhancement (validation, pending).
 */
declare function Form({ method, action, csrfToken, csrfFieldName, className, children, ref, ...rest }: FormProps): react.JSX.Element;

/** Inline field error. "Error:" is announced before the message; the icon is decorative. */
declare function FieldErrorText({ id, className, children }: {
    id?: string;
    className?: string;
    children: ReactNode;
}): react.JSX.Element;
interface FieldProps {
    /** Visible label (required: placeholder is never a label). */
    label: ReactNode;
    /** Form field name. Also the default id, so ErrorSummary can link to it by name. */
    name?: string;
    /** Explicit control id. Default: fieldId(name), else a React useId(). */
    id?: string;
    hint?: ReactNode;
    /** Error message; marks the control aria-invalid and links it via aria-describedby. */
    error?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    /** One control: Input, Textarea or Select. */
    children: ReactNode;
}
/**
 * Label + hint + error around a single control, wired with htmlFor / aria-describedby /
 * aria-invalid / required through context. Pure markup: works in renderToStaticMarkup.
 */
declare function Field({ label, name, id, hint, error, required, disabled, className, children }: FieldProps): react.JSX.Element;
interface FieldsetProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'name'> {
    /** Visible group label, rendered as `<legend>`. */
    legend: ReactNode;
    /** Shared name for the Radio / Checkbox options inside; also the default id (for ErrorSummary). */
    name?: string;
    hint?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    children: ReactNode;
}
/** `<fieldset>` + `<legend>` for a group of Radio, Checkbox or Switch options. */
declare function Fieldset({ legend, name, id, hint, error, required, disabled, className, children, ...rest }: FieldsetProps): react.JSX.Element;

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date' | 'datetime-local' | 'time' | 'month' | 'week' | 'color' | 'file';
    /** Marks the control invalid (aria-invalid). Inside a Field, the Field's error does this. */
    invalid?: boolean;
    ref?: Ref<HTMLInputElement>;
}
/** Native `<input>`. Picks up id, name, required, aria-describedby and aria-invalid from Field. */
declare function Input({ type, invalid, className, ref, ...rest }: InputProps): react.JSX.Element;
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    invalid?: boolean;
    ref?: Ref<HTMLTextAreaElement>;
}
/** Native `<textarea>`, wired like Input. */
declare function Textarea({ invalid, rows, className, ref, ...rest }: TextareaProps): react.JSX.Element;
interface SelectOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /** Options as data. Alternatively pass `<option>` children. */
    options?: ReadonlyArray<SelectOption>;
    /** First, empty-valued option ("Choose…"). Disabled when the select is required. */
    placeholder?: string;
    invalid?: boolean;
    ref?: Ref<HTMLSelectElement>;
}
/**
 * Native `<select>` (spec §7: native everywhere in the root entry; the Radix select belongs to the
 * `/app` entry for desktop app surfaces). Works without JavaScript.
 */
declare function Select({ options, placeholder, invalid, className, children, ref, ...rest }: SelectProps): react.JSX.Element;
interface ChoiceBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
    /** Visible label, rendered as `<label for>`. */
    label: ReactNode;
    hint?: ReactNode;
    /** Inline error for a standalone option (e.g. "You must accept the terms"). */
    error?: ReactNode;
    invalid?: boolean;
    ref?: Ref<HTMLInputElement>;
}
type CheckboxProps = ChoiceBaseProps;
/** Native checkbox with a token-styled box. Submits `name=value` (default "on") without JS. */
declare function Checkbox(props: CheckboxProps): react.JSX.Element;
interface RadioProps extends ChoiceBaseProps {
    /** Submitted value for this option. */
    value: string;
}
/** Native radio. Put several inside a Fieldset (which supplies the shared name and legend). */
declare function Radio(props: RadioProps): react.JSX.Element;
type SwitchProps = ChoiceBaseProps;
/**
 * An on/off switch: a native checkbox with role="switch", so it submits like a checkbox without
 * JavaScript and is announced as a switch. State is shown by thumb position, not colour alone.
 */
declare function Switch(props: SwitchProps): react.JSX.Element;

interface FormErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Optional bold first line. */
    title?: ReactNode;
    /** The message. Nothing renders when empty, so it is safe to always mount with server flash data. */
    children?: ReactNode;
}
/**
 * A form-level error (e.g. "Your session expired, please try again"). role="alert" so a message
 * that appears after an enhanced submit is announced; text is ink on surface, so contrast holds in
 * every theme, and the danger colour is carried by the border and icon (never colour alone).
 */
declare function FormError({ title, children, className, ...rest }: FormErrorProps): react.JSX.Element | null;

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'loading'> {
    /** Force the pending state (e.g. from your own fetch handler). */
    pending?: boolean;
    /** Accessible name while pending, e.g. "Saving…". */
    pendingLabel?: string;
}
/**
 * A native `<button type="submit">` (works with JavaScript disabled). Once hydrated it:
 * - shows the loading state after its form submits natively, or while a React form action is
 *   pending (useFormStatus), which blocks double submits without removing the button's value;
 * - re-enables on `pageshow`, so a page restored from the back/forward cache is usable again.
 */
declare function SubmitButton({ pending, pendingLabel, variant, ref, ...rest }: SubmitButtonProps): react.JSX.Element;

interface ErrorSummaryItem {
    /** Target element id. */
    id?: string;
    /** Field name; mapped to an id with fieldId(), matching Field / Fieldset defaults. */
    name?: string;
    message: ReactNode;
}
interface ErrorSummaryProps {
    /** Either a list, or a record of field name -> message (empty messages are skipped). */
    errors: ReadonlyArray<ErrorSummaryItem> | Readonly<Record<string, ReactNode>>;
    title?: ReactNode;
    /** Optional line under the title. */
    description?: ReactNode;
    headingLevel?: 2 | 3 | 4;
    /** Move focus to the summary when it mounts (after a failed POST). Default true. */
    focusOnMount?: boolean;
    id?: string;
    className?: string;
    ref?: Ref<HTMLDivElement>;
}
/**
 * Error summary for the top of a form (spec §9: "error summaries link to their fields").
 * Each entry is a real `<a href="#field-id">`, so it works without JavaScript; once hydrated, a
 * click focuses the field (or the first control in a fieldset) and scrolls its label into view.
 */
declare function ErrorSummary({ errors, title, description, headingLevel, focusOnMount, id, className, ref }: ErrorSummaryProps): react.JSX.Element | null;

/**
 * Turn a form field name into the element id that Field, Fieldset and ErrorSummary agree on, so a
 * server that only knows field names can link its error summary to the fields (spec §9).
 * `email` -> `email`, `user[email]` -> `user-email`, `items[0].qty` -> `items-0-qty`.
 */
declare function fieldId(name: string): string;
interface ControlProps {
    id?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
}
/** Merge a control's own props with the enclosing Field's wiring. Explicit props win. */
declare function useFieldControl(props: ControlProps): {
    id: string | undefined;
    name: string | undefined;
    required: boolean | undefined;
    disabled: boolean | undefined;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | "true" | "false" | "grammar" | "spelling" | undefined;
};

/** What errorTitle() can count: a number, or the same errors ErrorSummary takes. */
type ErrorCountInput = number | ReadonlyArray<{
    message: ReactNode;
}> | Readonly<Record<string, ReactNode>> | null | undefined;
/** How many errors ErrorSummary would list for `errors` (empty messages are skipped, as there). */
declare function errorCount(errors: ErrorCountInput): number;
/**
 * The page `<title>` after a failed form POST (GOV.UK error summary pattern): "Error: <title>" when
 * there is at least one error, so screen-reader users hear the failure as soon as the page loads.
 * With no errors the title comes back unchanged. Pass the same `errors` you give ErrorSummary.
 *
 *   <title>{errorTitle('Your profile | Trident NIL', errors)}</title>
 */
declare function errorTitle(title: string, errors: ErrorCountInput, prefix?: string): string;

/**
 * Shared tone model for display and feedback components (Badge, StatusPill, Chip, StatCard trend,
 * Alert, FlashBanner, Toast). Every tone maps to one semantic --ui-* role; the CSS in
 * src/display/styles.css derives the fill and text from that role with the two constants below,
 * and src/display/tone.test.ts proves the result reaches 4.5:1 in every theme and palette.
 */
/** Canonical tones. Each is always paired with visible text (spec §7: text plus colour, never colour alone). */
type Tone = 'neutral' | 'accent' | 'info' | 'ok' | 'warn' | 'danger';
/**
 * Names accepted for compatibility: the portal `_ds_bundle.js` Badge tones (violet, blue, gold,
 * success, warning, danger) and the feedback names (success, warning, error).
 */
type ToneAlias = 'violet' | 'blue' | 'gold' | 'success' | 'warning' | 'error';
type ToneName = Tone | ToneAlias;
declare const TONES: readonly Tone[];
/** Semantic role (the `--ui-<role>` token) each tone reads. */
declare const TONE_ROLE: Record<Tone, string>;
/** Fill = color-mix(in srgb, <role> TONE_TINT_PCT%, var(--ui-surface)). Mirrored in styles.css. */
declare const TONE_TINT_PCT = 12;
/** Text = color-mix(in srgb, <role> (100 - TONE_INK_PCT)%, var(--ui-ink)). Mirrored in styles.css. */
declare const TONE_INK_PCT = 25;
/** Resolve any accepted tone name to a canonical tone. Unknown values fall back to `fallback`. */
declare function normalizeTone(tone: string | undefined | null, fallback?: Tone): Tone;
/** Plain-language name of a tone, for visually hidden prefixes ("Error: ..."). */
declare const TONE_LABEL: Record<Tone, string>;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** Visible label. Required: a badge is never colour alone. */
    children: ReactNode;
    /** Colour role. Portal names (violet, blue, gold, success, warning, danger) are accepted. */
    tone?: ToneName;
    size?: 'sm' | 'md';
    /** Optional leading icon; rendered aria-hidden. */
    icon?: ReactNode;
}
/**
 * Small pill label for counts, categories and inline flags (spec §7 P0; portal `_ds_bundle.js` Badge).
 * Always text plus colour; the tone colours are contrast-tested in every theme (tone.test.ts).
 */
declare function Badge({ children, tone, size, icon, className, ...rest }: BadgeProps): react.JSX.Element;

/**
 * Lifecycle states. Portal (`_ds_bundle.js`): draft, review, scheduled, published, connected, failed,
 * warning. Quorum status meanings (spec §2.2): live, attention, ok, error, reasoning.
 */
type Status = 'draft' | 'review' | 'scheduled' | 'published' | 'connected' | 'failed' | 'warning' | 'live' | 'attention' | 'ok' | 'error' | 'reasoning';
interface StatusDef {
    tone: Tone | 'reasoning';
    text: string;
}
declare const STATUS_MAP: Record<Status, StatusDef>;
interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
    /** Unknown values render as draft, matching the portal component. */
    status?: Status | (string & {});
    /** Overrides the default text for the status. The pill always shows text. */
    label?: ReactNode;
}
/**
 * Pill with a leading status dot (spec §7 P0; portal `_ds_bundle.js` StatusPill). The dot is
 * decorative (aria-hidden); the text carries the meaning. It does not animate: "live" is a label for a
 * value the caller already knows is live (spec §6.3 rule 9), not an indicator this component invents.
 */
declare function StatusPill({ status, label, className, ...rest }: StatusPillProps): react.JSX.Element;

interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
    /** Visible label. Required: a chip is never colour alone. */
    children: ReactNode;
    tone?: ToneName;
    /** Optional leading icon; rendered aria-hidden. */
    icon?: ReactNode;
    /**
     * Makes the chip a toggle: the label becomes a `<button type="button" aria-pressed>`.
     * Pass `selected` to reflect state.
     */
    onClick?: MouseEventHandler<HTMLButtonElement>;
    selected?: boolean;
    /** Adds a trailing remove button (at least 24x24, WCAG 2.5.8). */
    onRemove?: MouseEventHandler<HTMLButtonElement>;
    /** Accessible name of the remove button. Default: "Remove <label>" when the label is a string. */
    removeLabel?: string;
    disabled?: boolean;
}
/**
 * Compact tag for filters and selections (spec §7 P0). Static by default; `onClick` turns it into a
 * toggle button and `onRemove` adds a separate remove button, so each control has one job.
 */
declare function Chip({ children, tone, icon, onClick, selected, onRemove, removeLabel, disabled, className, ...rest }: ChipProps): react.JSX.Element;

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
/** Portal `_ds_bundle.js` Avatar dimensions, in px. */
declare const AVATAR_SIZES: Record<AvatarSize, number>;
interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
    /** Image URL. Falls back to initials if missing or if it fails to load. */
    src?: string;
    /** Person or brand name: the image alt text, the initials source and the accessible name. */
    name?: string;
    /** Named size or a pixel number. */
    size?: AvatarSize | number;
    /** `rounded` (brand square, 26% radius) or `circle`. */
    shape?: 'rounded' | 'circle';
    /** Hide from assistive tech when the name is already next to the avatar. */
    decorative?: boolean;
}
/** Up to two initials from a name ("Beau Williams" -> "BW"). */
declare function initialsOf(name: string): string;
/**
 * Image avatar with an initials fallback (spec §7 P0; portal `_ds_bundle.js` Avatar). Initials are
 * `--ui-on-accent` on the accent fill, which the §9 matrix guarantees at 4.5:1. Always has a text
 * alternative (alt text or aria-label) unless `decorative` or there is no name.
 */
declare function Avatar({ src, name, size, shape, decorative, className, style, ...rest }: AvatarProps): react.JSX.Element;

type CardVariant = 'solid' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
interface CardProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    /**
     * `solid` (default; rows, tables, anything dense) or `glass` (blurred, counts toward the
     * 6-per-viewport blur budget, spec §5). `interactive` is accepted as a variant for the spec's
     * "solid, glass, interactive" wording and means solid + interactive.
     */
    variant?: CardVariant | 'interactive';
    /** Hover lift and specular sweep, both behind the motion gate. */
    interactive?: boolean;
    /** Accent-tinted wash for highlighted panels (portal `accent`). */
    accent?: boolean;
    /**
     * Pointer tilt (at most --ui-tilt-max, 7deg). Runs only behind the motion gate: html.ui-motion,
     * no reduced-motion preference, not paused, fine hover pointer. Otherwise nothing moves.
     */
    tilt?: boolean;
    /** Token step, or any CSS length for portal compatibility (e.g. "var(--space-4)"). */
    padding?: CardPadding | (string & {});
    /** Element to render. Default `div`. */
    as?: ElementType;
}
/**
 * The base surface (spec §7 P0; portal `_ds_bundle.js` Card). SSR renders the final, static card;
 * the specular sweep and tilt are enhancements that only run behind the motion gate (spec §6.4), so
 * reduced motion, Pause and no-JS all see the same card without movement.
 */
declare function Card({ children, variant, interactive, accent, tilt, padding, as, className, style, onPointerMove, onPointerLeave, ...rest }: CardProps): react.JSX.Element;

type TrendDir = 'up' | 'down' | 'flat';
interface StatTrend {
    dir: TrendDir;
    /** Visible change, e.g. "+12%". */
    value: ReactNode;
    /** Optional context, e.g. "vs last week". */
    note?: ReactNode;
    /** Override the colour (e.g. `ok` when "down" is good, like churn). Default up=ok, down=danger, flat=neutral. */
    tone?: ToneName;
}
interface StatCardProps extends Omit<CardProps, 'children'> {
    label: ReactNode;
    /**
     * The real value, from an API or props (spec §6.3 rule 9). Numbers are formatted with `locale`.
     * `null`/`undefined` renders an honest "no data" dash, never a placeholder number.
     */
    value: ReactNode | number | null | undefined;
    /** Secondary line, shown when there is no trend (portal behaviour). */
    sub?: ReactNode;
    trend?: StatTrend;
    /** Number formatting. Fixed default so server and client render identical text. */
    locale?: string;
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * Opt in to a motion-lite count-up. SSR still renders the final formatted value as text; this only
     * adds `data-count-to` for motion-lite's CountUp (which honours reduced motion and Pause) to enhance.
     */
    countUp?: boolean;
}
/**
 * KPI tile (spec §7 P0; portal `_ds_bundle.js` StatCard: label, value, sub, trend {dir, value, note}).
 * Real values only, and the server-rendered HTML already holds the final value.
 */
declare function StatCard({ label, value, sub, trend, locale, formatOptions, countUp, className, ...rest }: StatCardProps): react.JSX.Element;

/**
 * The motion gate (spec §0.2, §6.4) as a runtime check, for pointer effects that need JS (Card tilt).
 * Mirrors the CSS gate in styles.css: html.ui-motion, no reduced-motion preference, motion not
 * paused, and a fine hover-capable pointer. Safe to import on the server: it reads `window` and
 * `document` only when called, and returns false when they are absent.
 */
declare function pointerMotionAllowed(): boolean;

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** info (default), ok/success, warn/warning, danger/error. */
    tone?: ToneName;
    title?: ReactNode;
    children?: ReactNode;
    /** Custom icon, or `false` for none. Icons are always aria-hidden. */
    icon?: ReactNode | false;
    /** Optional actions (links or buttons) under the message. */
    actions?: ReactNode;
    /** Adds a dismiss button. */
    onDismiss?: () => void;
    dismissLabel?: string;
    /**
     * `true` (default) sets role=alert for danger and role=status otherwise. Set `false` for static
     * content that is already on the page at load and should not be announced (no role).
     */
    live?: boolean;
    /** React 19 ref-as-prop. */
    ref?: Ref<HTMLDivElement>;
}
/**
 * Inline message (spec §7 P0). The tone is always carried by text as well as colour: the title, or a
 * visually hidden "Error:" / "Warning:" prefix when there is no title.
 */
declare function Alert({ tone, title, children, icon, actions, onDismiss, dismissLabel, live, className, role, ref, ...rest }: AlertProps): react.JSX.Element;

/**
 * A server flash message. Matches the NIL `nil_flash` cookie (`{ type, message }`, type success |
 * error | info | warning) and portal toasts (`tone` success | error | info).
 */
interface Flash {
    type?: string;
    tone?: string;
    title?: ReactNode;
    message: ReactNode;
}
interface FlashBannerProps extends Omit<AlertProps, 'tone' | 'title' | 'children'> {
    /** The flash to show. `null`/`undefined` renders nothing, so the server can pass it straight through. */
    flash?: Flash | null;
    /** Alternative to `flash`: explicit tone plus children. */
    tone?: ToneName;
    title?: ReactNode;
    children?: ReactNode;
    /**
     * Move focus to the banner after mount (it gets tabIndex=-1), so keyboard and screen-reader users
     * land on the result of a POST-redirect. Default: true for errors, false otherwise.
     */
    focusOnMount?: boolean;
}
/** Map a flash `type`/`tone` string to a tone. Unknown values are info. */
declare function flashTone(type: string | undefined | null): Tone;
/**
 * Page-level banner for server flash messages after a POST-redirect (spec §7 P0). role=status, or
 * role=alert for errors. Renders complete on the server; no JS is needed to see it.
 */
declare function FlashBanner({ flash, tone, title, children, focusOnMount, className, ...rest }: FlashBannerProps): react.JSX.Element | null;

interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Portal tones: success (default), error, info; also warning and the canonical names. */
    tone?: ToneName;
    title?: ReactNode;
    message?: ReactNode;
    /** Adds a dismiss button, and is what `duration` calls. */
    onClose?: () => void;
    closeLabel?: string;
    /**
     * Auto-dismiss after this many ms (needs `onClose`). The timer pauses while the toast is hovered
     * or holds focus, and never runs for errors, which stay until dismissed. Minimum 4000ms.
     */
    duration?: number;
}
/**
 * CSS toast for islands and SSR pages (spec §7 P0; portal `_ds_bundle.js` Toast: tone, title,
 * message, onClose). No toast library: the enter animation is CSS behind the motion gate. Apps use
 * the sonner wrapper in `@trident/ui/app` instead. role=status, or role=alert for errors.
 */
declare function Toast({ tone, title, message, onClose, closeLabel, duration, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest }: ToastProps): react.JSX.Element;
interface ToastRegionProps extends HTMLAttributes<HTMLElement> {
    /** Accessible name of the region. */
    label?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    children?: ReactNode;
}
/**
 * Fixed stack that holds toasts (the portal's top-right flash stack). Render it on the server,
 * empty, so it exists before the first toast; each Toast carries its own live role.
 */
declare function ToastRegion({ label, position, className, children, ...rest }: ToastRegionProps): react.JSX.Element;

/**
 * WCAG 2.x contrast helpers and runtime accent correction (spec §2.3).
 *
 * `ensureContrast(accent, bg)` takes any accent a tenant or client supplied (Ops
 * `tenant.branding.primary_color`, WMH per-client `portalTheme`, portfolio `site.accent`) and returns
 * values that are safe to write into `--ui-accent-1`, `--ui-on-accent` and `--ui-accent-text`.
 */
type Rgb = readonly [r: number, g: number, b: number];
/** AA thresholds used across the package. */
declare const AA_TEXT = 4.5;
declare const AA_LARGE_TEXT = 3;
declare const AA_NON_TEXT = 3;
/** Ink candidates for text on an accent fill (spec §2.3). */
declare const DARK_INK = "#0b1220";
declare const LIGHT_INK = "#ffffff";
declare function parseHex(input: string): Rgb;
declare function isHex(input: string): boolean;
declare function toHex([r, g, b]: Rgb): string;
/** WCAG relative luminance, 0 (black) to 1 (white). */
declare function relativeLuminance(color: string | Rgb): number;
/** WCAG contrast ratio between two opaque colours, 1 to 21. */
declare function contrastRatio(a: string | Rgb, b: string | Rgb): number;
/** Linear sRGB-space mix: t=0 returns a, t=1 returns b. */
declare function mix(a: string, b: string, t: number): string;
/**
 * Move `color` toward white (on a dark bg) or black (on a light bg) by the smallest step that
 * reaches `min` against `bg`. Returns the colour unchanged if it already passes.
 * Binary search over the mix amount keeps the hue and gives the closest passing shade.
 */
declare function adjustToContrast(color: string, bg: string, min: number): string;
/** Whichever of #0b1220 / #ffffff contrasts more with `fill`. */
declare function pickOnAccent(fill: string): string;
interface EnsureContrastOptions {
    /** Minimum for accent used as text (default 4.5, AA body text). */
    textMin?: number;
    /** Minimum for the accent fill against the background (default 3, AA non-text). */
    fillMin?: number;
    /** Minimum for --ui-on-accent text on the fill (default 4.5, spec §9 "on-accent on accent"). */
    onAccentMin?: number;
    /** Extra backgrounds the accent text must also pass on (e.g. --ui-surface). */
    alsoOn?: readonly string[];
}
interface EnsureContrastResult {
    /** The input, normalised to #rrggbb. */
    input: string;
    /** Accent fill for --ui-accent-1: the input, or a clamped shade if it fell below fillMin. */
    fill: string;
    /** Ink for text on the fill (--ui-on-accent). */
    onAccent: string;
    /** Accent shade for text (--ui-accent-text), >= textMin on bg and every alsoOn background. */
    accentText: string;
    /** True when fill or accentText differ from the input. */
    adjusted: boolean;
    ratios: {
        fillOnBg: number;
        onAccentOnFill: number;
        accentTextOnBg: number;
    };
}
/**
 * Make an arbitrary accent safe on a given background (spec §2.3):
 * - clamps a fill that falls below 3:1 against the background;
 * - picks --ui-on-accent as #0b1220 or #ffffff, whichever contrasts more with the fill;
 * - derives an accent-text shade that reaches 4.5:1 on bg (and on every `alsoOn` surface).
 */
declare function ensureContrast(hex: string, bg: string, options?: EnsureContrastOptions): EnsureContrastResult;
/**
 * The CSS custom properties to apply for a runtime accent, e.g.
 * `Object.assign(document.documentElement.style, ...)` via setProperty, or an SSR `style` attribute.
 */
declare function accentVars(hex: string, bg: string, options?: EnsureContrastOptions): Record<string, string>;

export { AA_LARGE_TEXT, AA_NON_TEXT, AA_TEXT, AVATAR_SIZES, Alert, type AlertProps, type Announce, Avatar, type AvatarProps, type AvatarSize, BUTTON_HEIGHTS, Badge, type BadgeProps, Button, type ButtonProps, type ButtonSize, type ButtonStyleOptions, type ButtonVariant, Card, type CardPadding, type CardProps, type CardVariant, Checkbox, type CheckboxProps, Chip, type ChipProps, Cluster, type ClusterProps, Code, type CodeProps, Container, type ContainerProps, type ContainerSize, CsrfField, type CsrfFieldProps, DARK_INK, DEFAULT_CSRF_FIELD, type EnsureContrastOptions, type EnsureContrastResult, type ErrorCountInput, ErrorSummary, type ErrorSummaryItem, type ErrorSummaryProps, Field, FieldErrorText, type FieldProps, Fieldset, type FieldsetProps, type Flash, FlashBanner, type FlashBannerProps, FocusRing, type FocusRingProps, Form, FormError, type FormErrorProps, type FormProps, GradText, type GradTextProps, Grid, type GridColumns, type GridMin, type GridProps, Heading, type HeadingIssue, type HeadingLevel, type HeadingProps, IconButton, type IconButtonProps, Input, type InputProps, Kbd, type KbdProps, Kicker, type KickerProps, LIGHT_INK, LinkButton, type LinkButtonProps, LiveAnnouncer, type LiveAnnouncerProps, Mono, type MonoProps, type Politeness, Prose, type ProseProps, Radio, type RadioProps, type Rgb, SPACE_STEPS, STATUS_MAP, Section, type SectionProps, Select, type SelectOption, type SelectProps, SkipLink, type SkipLinkProps, type Space, Stack, type StackProps, StatCard, type StatCardProps, type StatTrend, type Status, StatusPill, type StatusPillProps, SubmitButton, type SubmitButtonProps, Switch, type SwitchProps, TEXT_SIZES, TONES, TONE_INK_PCT, TONE_LABEL, TONE_ROLE, TONE_TINT_PCT, Text, TextLink, type TextLinkProps, type TextProps, type TextSize, type TextTone, Textarea, type TextareaProps, Toast, type ToastProps, ToastRegion, type ToastRegionProps, type Tone, type ToneAlias, type ToneName, type TrendDir, VisuallyHidden, type VisuallyHiddenProps, accentVars, adjustToContrast, buttonClassName, checkHeadingOutline, contrastRatio, countWords, ensureContrast, errorCount, errorTitle, fieldId, flashTone, focusRingClass, focusRingWithinClass, initialsOf, isHex, mix, normalizeTone, parseHex, pickOnAccent, pointerMotionAllowed, relativeLuminance, toHex, useAnnouncer, useFieldControl };
