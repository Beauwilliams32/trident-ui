/**
 * Environment probes (spec §6.4). Every function is SSR-safe: nothing touches `window` at import
 * time, and each probe returns the "no motion / not low power" answer when there is no DOM.
 */
/** Minimal shape of `navigator` that lowPower() reads (Network Information API is non-standard). */
interface LowPowerNavigator {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: {
        saveData?: boolean;
        effectiveType?: string;
    };
    mozConnection?: {
        saveData?: boolean;
        effectiveType?: string;
    };
    webkitConnection?: {
        saveData?: boolean;
        effectiveType?: string;
    };
}
declare const hasDOM: () => boolean;
/** `matchMedia(query).matches`, false without a DOM or when matchMedia throws. */
declare function mq(query: string): boolean;
/** The person asked the OS for less motion. */
declare const reduced: () => boolean;
/** The persistent "Pause motion" control is on (`html[data-motion="paused"]`, spec §6.3 rule 5). */
declare const paused: () => boolean;
/** Reduced motion OR paused: movement becomes an instant change (spec §6.4). */
declare const motionOff: () => boolean;
/** A mouse or trackpad that can hover: the only input Tilt responds to. */
declare const finePointer: () => boolean;
/**
 * Low-power heuristic (spec §0.2): any one signal is enough — Save-Data, `deviceMemory < 4`,
 * `hardwareConcurrency < 4`, or an effective connection type of 2g / slow-2g.
 * lowPower() gates 3D and heavy effects only; micro-transitions stay (spec §6.4).
 */
declare function lowPower(nav?: LowPowerNavigator): boolean;
/** Read a time/number token (`600ms`, `0.6s`, `7deg`, `6`) from :root, falling back when unset. */
declare function tokenNumber(name: string, fallback: number): number;

declare const MOTION_STORAGE_KEY = "ui-motion";
declare const MOTION_CHANGE_EVENT = "ui:motionchange";
declare const MOTION_TOGGLE_ATTR = "data-motion-toggle";
type Listener = (isPaused: boolean) => void;
/** The stored choice, or null when nothing is stored or storage is unavailable. */
declare function storedMotionPaused(): boolean | null;
/** Pause or resume all motion on the page, persist the choice and tell subscribers. */
declare function setMotionPaused(isPaused: boolean): void;
declare const toggleMotionPaused: () => void;
/** Apply the stored choice to <html> (call as early as possible; initMotion() does). */
declare function restoreMotionPreference(): boolean;
/** Subscribe to pause changes. Returns the unsubscribe function. */
declare function subscribeMotion(listener: Listener): () => void;
declare function handleMotionToggleClick(event: Event): void;
/**
 * Wire a server-rendered `<button type="button" data-motion-toggle aria-pressed="false">Pause motion</button>`
 * without React. The label stays fixed; `aria-pressed` carries the state. Returns an unbind function.
 */
declare function bindMotionToggle(button: Element): () => void;

declare const REVEALED_ATTR = "data-revealed";
/** Show an element now. After the enter transition it drops its stagger so hovers stay quick. */
declare function markRevealed(el: Element): void;
/** Start watching one element (idempotent). Returns a function that stops watching it. */
declare function observeReveal(el: Element): () => void;
/** Observe every [data-reveal] in scope (the scope itself included). Returns the count. */
declare function scanReveals(scope?: ParentNode): number;
/** Reveal everything now (used when motion is paused mid-page). */
declare function revealAll(scope?: ParentNode): void;
/** Scan now and keep scanning nodes added later (React re-renders). Returns a disconnect function. */
declare function watchReveals(target?: Element): () => void;

interface NumberSpec {
    prefix: string;
    value: number;
    decimals: number;
    grouped: boolean;
    suffix: string;
}
declare function parseNumber(text: unknown): NumberSpec | null;
/** Is this text one real quantity? `optIn` true forces (if it parses), false forbids. */
declare function isCountable(text: unknown, optIn?: boolean): boolean;
declare function formatNumber(n: number, spec: NumberSpec): string;
interface CountUpOptions {
    /** The final text; defaults to the element's current text (what the server rendered). */
    value?: string | number;
    /** Milliseconds; defaults to --ui-dur-count (1100ms). */
    duration?: number;
    /** Force (true) or forbid (false) counting; default is the isCountable guard. */
    countable?: boolean;
    /** Called with each frame's text instead of writing textContent. */
    write?: (text: string) => void;
}
/** Count `el` from 0 to its value once. Returns a cancel function that leaves the final value. */
declare function countUp(el: Element | null, opts?: CountUpOptions): () => void;
/**
 * Count up an element the first time 40% of it is visible. Without IntersectionObserver, or with
 * motion off, the final value stays and nothing is scheduled. Returns a cleanup function.
 */
declare function countUpWhenVisible(el: Element, opts?: CountUpOptions): () => void;

declare function resetTilt(el: Element | null): void;
/** Bind the page-wide tilt listener (idempotent). Returns false when tilt must not run. */
declare function bindTilt(): boolean;
/** Remove the page-wide tilt listener. */
declare function unbindTilt(): void;

interface TransitionOptions {
    /** Written to html[data-vt] for the duration, so CSS can target named transitions. */
    name?: string;
    /** Run the update synchronously inside the transition, e.g. react-dom's flushSync. */
    flush?: (fn: () => void) => void;
}
interface ViewTransitionLike {
    ready?: Promise<unknown>;
    finished?: Promise<unknown>;
}
declare function canTransition(): boolean;
/** Wrap a state change in a View Transition when allowed; otherwise just run it. */
declare function transition(update: () => void, opts?: TransitionOptions): ViewTransitionLike | null;

declare const MOTION_CLASS = "ui-motion";
/** Add html.ui-motion (idempotent). Components call this so reveals arm even without initMotion(). */
declare function armMotion(): void;
interface InitMotionOptions {
    /** Where to watch for [data-reveal]; defaults to document.body. */
    root?: Element;
}
/** Boot motion-lite once. Returns a teardown function (also idempotent). */
declare function initMotion(opts?: InitMotionOptions): () => void;

export { type CountUpOptions, type InitMotionOptions, type LowPowerNavigator, MOTION_CHANGE_EVENT, MOTION_CLASS, MOTION_STORAGE_KEY, MOTION_TOGGLE_ATTR, type NumberSpec, REVEALED_ATTR, type TransitionOptions, armMotion, bindMotionToggle, bindTilt, canTransition, countUp, countUpWhenVisible, finePointer, formatNumber, handleMotionToggleClick, hasDOM, initMotion, isCountable, lowPower, markRevealed, motionOff, mq, observeReveal, parseNumber, paused, reduced, resetTilt, restoreMotionPreference, revealAll, scanReveals, setMotionPaused, storedMotionPaused, subscribeMotion, toggleMotionPaused, tokenNumber, transition, unbindTilt, watchReveals };
