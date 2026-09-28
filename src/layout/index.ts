/**
 * @trident/ui — layout group (spec §5, §7). Re-exported from the package root (src/index.ts).
 * Component CSS is in src/layout/styles.css (concatenated into dist/styles.css by the build).
 * Every variant is a class, never an inline style, so pages with a strict style-src CSP work.
 */
export { Container } from './Container'
export type { ContainerProps, ContainerSize } from './Container'
export { Stack } from './Stack'
export type { StackProps } from './Stack'
export { Cluster } from './Cluster'
export type { ClusterProps } from './Cluster'
export { Grid } from './Grid'
export type { GridColumns, GridMin, GridProps } from './Grid'
export { Section } from './Section'
export type { SectionProps } from './Section'
export { SPACE_STEPS } from './space'
export type { Space } from './space'
