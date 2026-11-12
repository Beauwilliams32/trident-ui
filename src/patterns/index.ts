/**
 * @trident/ui/patterns — navigation and data-display parts that are plain React (spec §7 P1):
 * Breadcrumbs (with JSON-LD), Stepper, DescriptionList, ProgressBar, Meter, Sparkline, Timeline,
 * PageHeader, SideNav and TopBar. No optional peers, so unlike `@trident/ui/app` any page can import
 * them; a separate subpath because the root entry's size budget has no room left. The Radix-backed
 * shell that hosts them (AppShell) is in `@trident/ui/app`.
 */
export { Breadcrumbs } from './Breadcrumbs'
export type { BreadcrumbsProps, Crumb } from './Breadcrumbs'
export { Stepper } from './Stepper'
export type { StepperProps, Step, StepStatus } from './Stepper'
export { DescriptionList } from './DescriptionList'
export type { DescriptionListProps, DescriptionItem } from './DescriptionList'
export { ProgressBar } from './ProgressBar'
export type { ProgressBarProps } from './ProgressBar'
export { Meter, meterState } from './Meter'
export type { MeterProps, MeterState } from './Meter'
export { Sparkline } from './Sparkline'
export type { SparklineProps } from './Sparkline'
export { Timeline } from './Timeline'
export type { TimelineProps, TimelineEvent } from './Timeline'
export { PageHeader } from './PageHeader'
export type { PageHeaderProps } from './PageHeader'
export { SideNav, SideNavSection, SideNavItem } from './SideNav'
export type { SideNavProps, SideNavSectionProps, SideNavItemProps } from './SideNav'
export { TopBar } from './TopBar'
export type { TopBarProps } from './TopBar'
