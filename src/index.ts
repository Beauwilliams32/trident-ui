/**
 * @trident/ui — React 19 components (spec §1, §7).
 *
 * The root entry re-exports the zero-optional-dependency component groups. The groups that pull
 * optional peers or server-only code (server, islands, motion-lite, motion, three, app) are
 * separate subpath entries — see package.json "exports" and docs/DEVIATIONS.md.
 */
export * from './a11y'
export * from './layout'
export * from './type'
export * from './actions'
export * from './forms'
export * from './display'
export * from './feedback'
export * from './utils'
