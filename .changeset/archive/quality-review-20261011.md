---
'@trident/ui': minor
---

Quality review 2026-10-11 (QUALITY-REVIEW.md G1-G21). New `@trident/ui/app` (Radix overlays, Tabs,
CommandPalette, DataTable, Pagination, EmptyState, Skeleton) and `@trident/ui/marketing` (Hero,
FeatureGrid, PricingTable, Faq, CtaBand, SiteHeader, SiteFooter, MotionToggle without the motion
peer) entries; `TextLink`, `errorTitle()`, `SeoHead errorCount`, `PosterFallback` `loading` and
`fetchPriority`. Rendered colour: links inside Alert, Toast and FlashBanner take the tone ink, and
ViewTransitionLink renders `.ui-link`. Increase Contrast overrides per theme under
`prefers-contrast: more` (no default colour role changes value). 44px touch hit regions on coarse
pointers; Chip padding, procedural poster and RTL dismiss fixes. Root entry stays within 11.9 kB.
