---
"@trident/ui": minor
---

Add a `@trident/ui/patterns` entry: Breadcrumbs (with `BreadcrumbList` JSON-LD), Stepper,
DescriptionList, ProgressBar, Meter, Sparkline, Timeline, PageHeader, SideNav and TopBar, plus seven
marketing components (BrandMark, CaseStudyCard, FactStrip, LegalDoc, LogoWall, ShowcaseMedia,
Testimonial) and `brand/depth-line.d.mts`.

The subpath is a real library entry — registered in `entries.config.mjs` and in the `package.json`
exports — so `@trident/ui/patterns` resolves to `dist/patterns.js` with its own type declarations,
and the size budget is checked like every other entry. Consumers need no new peer dependency.
