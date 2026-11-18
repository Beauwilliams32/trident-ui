/**
 * @trident/ui/marketing — page compositions for public marketing surfaces (spec §7 P1): Hero,
 * FeatureGrid, PricingTable, Faq, CtaBand, SiteHeader, SiteFooter, plus a MotionToggle that needs
 * no `motion` peer. Built from the root components; React only, no optional peers.
 *
 * A separate subpath entry so the root entry's size budget is untouched. Copy, prices and plans
 * always arrive as props: nothing here authors text a product would ship.
 */
export { Hero } from './Hero'
export type { HeroProps } from './Hero'
export { FeatureGrid } from './FeatureGrid'
export type { FeatureGridProps, Feature } from './FeatureGrid'
export { PricingTable } from './PricingTable'
export type { PricingTableProps, PricingPlan } from './PricingTable'
export { Faq } from './Faq'
export type { FaqProps, FaqItem } from './Faq'
export { CtaBand } from './CtaBand'
export type { CtaBandProps } from './CtaBand'
export { SiteHeader, SiteFooter } from './Site'
export type { SiteHeaderProps, SiteFooterProps } from './Site'
export { MotionToggle } from './MotionToggle'
export type { MotionToggleProps } from './MotionToggle'
export { BrandMark, TridentMark, BrandLockup } from './BrandMark'
export type { BrandMarkProps, BrandLockupProps } from './BrandMark'
