import * as react from 'react';
import { ReactNode, ComponentType } from 'react';

interface HeroProps {
    /** Required text H1 (spec §7: a hero is never an image of text). `<em>` inside takes the accent. */
    title: ReactNode;
    kicker?: ReactNode;
    /** One or two sentences under the title. */
    lede?: ReactNode;
    /** One primary and at most one secondary action (LinkButtons). */
    actions?: ReactNode;
    /**
     * Full-bleed decorative layer behind the copy: a `<Lazy3D>` slot, a PosterFallback or a contour.
     * Rendered aria-hidden behind a scrim, so the copy stays legible. Never the LCP element.
     */
    backdrop?: ReactNode;
    /**
     * An image beside the copy (the LCP candidate). Give its `<img>` width, height and
     * `fetchPriority="high"`, never `loading="lazy"` (spec §9).
     */
    media?: ReactNode;
    /** Fill the first viewport (keeps a full-bleed backdrop out of LCP). Default true with a backdrop. */
    fullHeight?: boolean;
    /** Leave room for an overlaid SiteHeader. */
    underNav?: boolean;
    /**
     * The title's heading level. 1 on a landing page (spec §7: the hero carries the page's text H1);
     * lower only when the hero is embedded in another page, such as docs or this gallery.
     */
    level?: 1 | 2 | 3 | 4;
    id?: string;
    className?: string;
    children?: ReactNode;
}
/**
 * Marketing hero (spec §7 P1 Hero): a text H1, a lede, the actions, plus optional decorative
 * backdrop and media slots. No animation of its own; reveals are opt-in by the page.
 */
declare function Hero({ title, kicker, lede, actions, backdrop, media, fullHeight, underNav, level, id, className, children }: HeroProps): react.JSX.Element;

interface Feature {
    /** A lucide-react icon component (decorative). */
    icon?: ComponentType<{
        size?: number;
        strokeWidth?: number;
        'aria-hidden'?: boolean | 'true';
    }>;
    title: string;
    body: ReactNode;
}
interface FeatureGridProps {
    heading: ReactNode;
    /** Keep the heading for screen readers only (the hero already introduces the list). */
    headingHidden?: boolean;
    intro?: ReactNode;
    features: ReadonlyArray<Feature>;
    /** Opt into motion-lite reveals with a 70ms stagger (static without JS). Default true. */
    reveal?: boolean;
    tone?: 'default' | 'alt' | 'surface';
    className?: string;
}
/** A grid of feature cards: icon tile, title, one or two sentences (spec §7 P1 FeatureGrid). */
declare function FeatureGrid({ heading, headingHidden, intro, features, reveal, tone, className }: FeatureGridProps): react.JSX.Element;

interface PricingPlan {
    id: string;
    name: string;
    /**
     * The price exactly as the pricing canon states it ("$49", "Free"). Never computed, rounded or
     * defaulted here: this component renders what it is given (spec §7, §6.3 rule 9).
     */
    price: string;
    /** "/month", "per seat", ... */
    period?: string;
    blurb?: ReactNode;
    features?: ReadonlyArray<ReactNode>;
    /** Mark the recommended plan (accent border plus the `badge` text, never colour alone). */
    highlight?: boolean;
    /** The plan's action, rendered in static markup (a LinkButton to checkout). */
    cta?: ReactNode;
}
interface PricingTableProps {
    heading: ReactNode;
    sub?: ReactNode;
    plans: ReadonlyArray<PricingPlan>;
    /** Text of the badge on highlighted plans, e.g. "Most popular". Required if any plan is highlighted. */
    badge?: ReactNode;
    /** Alternative to `plan.cta`. */
    renderCta?: (plan: PricingPlan) => ReactNode;
    /** Small print under the plans (taxes, trial terms), from the same canon as the prices. */
    note?: ReactNode;
    tone?: 'default' | 'alt' | 'surface';
    className?: string;
}
/**
 * Plan cards for a pricing section (spec §7 P1 PricingTable). A money surface (spec §6.8): it sets
 * data-surface="money", so Lazy3D refuses to mount inside it, and it has no reveal or count-up.
 * Prices come only from props.
 */
declare function PricingTable({ heading, sub, plans, badge, renderCta, note, tone, className }: PricingTableProps): react.JSX.Element;

interface FaqItem {
    q: string;
    /** A string, so the same answer can feed the FAQPage JSON-LD; or rich content without it. */
    a: ReactNode;
}
interface FaqProps {
    heading: ReactNode;
    items: ReadonlyArray<FaqItem>;
    /**
     * Also emit FAQPage JSON-LD built from the same items (spec §7: the structured data must match
     * the visible FAQ). Only items whose answer is a plain string are included.
     */
    jsonLd?: boolean;
    /** Opt into a motion-lite reveal of the list. Default true. */
    reveal?: boolean;
    className?: string;
}
/** Questions and answers in `<details>` (spec §7 P1 FAQ): works without JavaScript. */
declare function Faq({ heading, items, jsonLd, reveal, className }: FaqProps): react.JSX.Element;

interface CtaBandProps {
    heading: ReactNode;
    body?: ReactNode;
    /** One action (a LinkButton). */
    action: ReactNode;
    reveal?: boolean;
    className?: string;
}
/** A closing call to action: heading, one sentence, one action (spec §7 P1 CtaBand). */
declare function CtaBand({ heading, body, action, reveal, className }: CtaBandProps): react.JSX.Element;

interface SiteHeaderProps {
    /** The brand lockup: a mark plus the product name as live text (brand/README.md). */
    brand: ReactNode;
    /** Where the brand links to. Default "/". */
    brandHref?: string;
    /** Navigation and account actions (TextLinks, LinkButtons). */
    children?: ReactNode;
    /** Accessible name of the navigation. Default "Main". */
    navLabel?: string;
    /** Lay the header over the top of a full-bleed Hero instead of above it. */
    overlay?: boolean;
    className?: string;
}
/** The marketing header (spec §7 P1 SiteHeader): brand left, navigation and actions right. */
declare function SiteHeader({ brand, brandHref, children, navLabel, overlay, className }: SiteHeaderProps): react.JSX.Element;
interface SiteFooterProps {
    /** The legal line, e.g. "© 2026 Trident Studio". */
    note?: ReactNode;
    /** Footer links (TextLinks with underline="hover"). */
    children?: ReactNode;
    /** The persistent Pause-motion control (spec §6.3 rule 5): pass <MotionToggle />. */
    motionToggle?: ReactNode;
    navLabel?: string;
    className?: string;
}
/** The marketing footer (spec §7 P1 Footer, which includes the MotionToggle). */
declare function SiteFooter({ note, children, motionToggle, navLabel, className }: SiteFooterProps): react.JSX.Element;

interface MotionToggleProps {
    /** Visible label; fixed while the state changes (aria-pressed carries the state). */
    label?: string;
    className?: string;
}
/**
 * The persistent "Pause motion" control (spec §6.3 rule 5, WCAG 2.2.2) for static and marketing
 * pages. The same markup and store as `@trident/ui/motion`'s MotionToggle, built on motion-lite, so
 * it needs no `motion` peer (G6: Ops re-implemented exactly this to keep the library off its landing).
 */
declare function MotionToggle({ label, className }: MotionToggleProps): react.JSX.Element;

export { CtaBand, type CtaBandProps, Faq, type FaqItem, type FaqProps, type Feature, FeatureGrid, type FeatureGridProps, Hero, type HeroProps, MotionToggle, type MotionToggleProps, type PricingPlan, PricingTable, type PricingTableProps, SiteFooter, type SiteFooterProps, SiteHeader, type SiteHeaderProps };
