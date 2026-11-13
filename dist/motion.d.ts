import { LazyProps } from 'motion/react';
export { AnimatePresence, domAnimation, m } from 'motion/react';
import * as react from 'react';
import { ReactNode, HTMLAttributes, ElementType, CSSProperties, AnchorHTMLAttributes } from 'react';

interface MotionRootProps {
    children?: ReactNode;
    /**
     * Feature bundle. Default `domAnimation` (about 15KB gz). Pass `domMax` (or a lazy
     * `() => import('./features').then(m => m.default)`) only where layout animation or drag is
     * needed: Ops widgets, the portal board, Quorum (spec §6.1).
     */
    features?: LazyProps['features'];
}
/**
 * App root for motion/react (spec §6.1 tier 2): `<LazyMotion strict>` so only `m.*` components
 * work, and `<MotionConfig reducedMotion="user">` — switched to "always" while Pause is on.
 * Also restores the stored Pause choice and arms html.ui-motion for [data-reveal].
 */
declare function MotionRoot({ children, features }: MotionRootProps): react.JSX.Element;

/**
 * Motion presets for motion/react (spec §6.2). Values mirror tokens.json `motion` (a test pins
 * that they stay equal), in the units motion/react expects: seconds and bezier arrays.
 */
declare const springs: {
    /** Toggles, menus. */
    readonly snappy: {
        readonly type: "spring";
        readonly stiffness: 520;
        readonly damping: 38;
        readonly mass: 0.8;
    };
    /** Sheets, dialogs. */
    readonly smooth: {
        readonly type: "spring";
        readonly stiffness: 300;
        readonly damping: 34;
        readonly mass: 1;
    };
    /** Hero text only. */
    readonly gentle: {
        readonly type: "spring";
        readonly stiffness: 160;
        readonly damping: 26;
        readonly mass: 1;
    };
};
/** Durations in seconds (tokens are ms). */
declare const durations: {
    readonly instant: 0.08;
    readonly fast: 0.16;
    readonly 'mobile-fast': 0.16;
    readonly 'mobile-base': 0.24;
    readonly 'mobile-slow': 0.32;
    readonly base: 0.2;
    readonly page: 0.26;
    readonly med: 0.32;
    readonly slow: 0.48;
    readonly reveal: 0.6;
    readonly count: 1.1;
};
declare const easings: {
    readonly ease: readonly [0.2, 0.8, 0.2, 1];
    readonly emph: readonly [0.2, 0, 0, 1];
    readonly exit: readonly [0.4, 0, 1, 1];
    readonly inout: readonly [0.4, 0, 0.2, 1];
    readonly spring: readonly [0.22, 1.2, 0.36, 1];
    readonly springPop: readonly [0.34, 1.4, 0.64, 1];
};
/** Exits run at about 0.7× their enter (spec §6.3 rule 2). */
declare const EXIT_RATIO = 0.7;
declare const exitDuration: (enterSeconds: number) => number;
/** Ready-made enter/exit transitions for m.* components (transform + opacity only). */
declare const transitions: {
    readonly enter: {
        readonly duration: 0.32;
        readonly ease: readonly [0.2, 0, 0, 1];
    };
    readonly exit: {
        readonly duration: number;
        readonly ease: readonly [0.4, 0, 1, 1];
    };
    readonly page: {
        readonly duration: 0.26;
        readonly ease: readonly [0.2, 0.8, 0.2, 1];
    };
    readonly fade: {
        readonly duration: 0.16;
        readonly ease: readonly [0.2, 0.8, 0.2, 1];
    };
};
declare const distances: {
    readonly reveal: 18;
    readonly stagger: 70;
    readonly staggerMax: 6;
    readonly tiltMax: 7;
    readonly lift: -3;
};

/** True while html[data-motion="paused"] is set. Server snapshot: false. */
declare function useMotionPaused(): boolean;
/** True while the OS asks for reduced motion. Server snapshot: false. */
declare function usePrefersReducedMotion(): boolean;
/** Reduced motion OR Pause: render final states, start no animation. */
declare function useMotionOff(): boolean;

interface RevealProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Default `div`. */
    as?: ElementType;
    /** Stagger index: 70ms × min(index, 6) delay (spec §6.2). */
    index?: number;
    children?: ReactNode;
}
/**
 * Rises into view the first time it is seen. The server renders it visible; it hides only once
 * JS armed html.ui-motion and motion is allowed (base.css), with a 2.5s CSS failsafe. Reduced
 * motion or Pause: shown immediately, no observer.
 */
declare function Reveal({ as, index, style, children, ...rest }: RevealProps): react.JSX.Element;

interface CountUpProps {
    /**
     * The real value, from props only (spec §6.3 rule 9): an API result or server data, never an
     * invented number. Prefix, suffix, decimals and thousands separators are kept ("$1,500/mo").
     */
    value: string | number;
    /** Force (true) or forbid (false) counting. Default: only a single real quantity counts. */
    countable?: boolean;
    /** Milliseconds. Default --ui-dur-count (1100ms). */
    duration?: number;
    as?: ElementType;
    className?: string;
    style?: CSSProperties;
}
/**
 * Renders the final value (SSR and no-JS read it) and counts from 0 the first time 40% of it is
 * visible. Screen readers get the final value only; the moving digits are aria-hidden.
 * Reduced motion or Pause: the final value, and no requestAnimationFrame.
 */
declare function CountUp({ value, countable, duration, as, className, style }: CountUpProps): react.JSX.Element;

interface TiltProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType;
    children?: ReactNode;
}
/**
 * Follows a fine pointer, at most 7deg (spec §6.2). Touch, reduced motion and Pause: flat, and no
 * listener or rAF is started. Decorative only: never put the only copy of information in the tilt.
 */
declare function Tilt({ as, children, ...rest }: TiltProps): react.JSX.Element;

interface ViewTransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    /**
     * Client-side navigation (your router's navigate). When given, a plain same-tab left click runs
     * it inside a View Transition; without it this is an ordinary link.
     */
    onNavigate?: (href: string) => void;
    /** Written to html[data-vt] during the transition. */
    transitionName?: string;
    /**
     * Drop the default `.ui-link` look (accent text, underline) when the link is styled by its
     * container, e.g. a tab or a nav item. Default false.
     */
    unstyled?: boolean;
    children?: ReactNode;
}
/**
 * A real `<a href>` (works without JS, opens in new tabs) that animates SPA route and tab changes
 * with document.startViewTransition. Skipped under reduced motion, Pause, or no browser support.
 */
declare function ViewTransitionLink({ href, onNavigate, transitionName, unstyled, className, onClick, children, ...rest }: ViewTransitionLinkProps): react.JSX.Element;

interface AmbientGlowProps {
    /** Which accent tints the glow. Default `accent`. */
    tone?: 'accent' | 'accent-2' | 'glow';
    /** Drifting loop (longer than 5s, so Pause and reduced motion make it static). Default true. */
    drift?: boolean;
    className?: string;
    style?: CSSProperties;
}
/**
 * Decorative CSS-only glow behind a hero or section: no JS, no rAF. Position it inside a
 * `position: relative` parent. aria-hidden; transform and opacity only (spec §6.3 rule 1).
 */
declare function AmbientGlow({ tone, drift, className, style }: AmbientGlowProps): react.JSX.Element;

interface MotionToggleProps {
    /** Visible label; fixed while the state changes (aria-pressed carries the state). */
    label?: string;
    className?: string;
}
/**
 * The persistent "Pause motion" control (spec §6.3 rule 5, WCAG 2.2.2) for the footer or nav.
 * Sets html[data-motion="paused"] and stores it in localStorage (try/catch). Its markup is the
 * same one motion-lite's initMotion() binds, so a static page without React works too.
 */
declare function MotionToggle({ label, className }: MotionToggleProps): react.JSX.Element;

export { AmbientGlow, type AmbientGlowProps, CountUp, type CountUpProps, EXIT_RATIO, MotionRoot, type MotionRootProps, MotionToggle, type MotionToggleProps, Reveal, type RevealProps, Tilt, type TiltProps, ViewTransitionLink, type ViewTransitionLinkProps, distances, durations, easings, exitDuration, springs, transitions, useMotionOff, useMotionPaused, usePrefersReducedMotion };
