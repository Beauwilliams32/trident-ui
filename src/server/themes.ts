/**
 * Theme names and each theme's native scheme (spec §2.1, §3). Mirrors tokens.json `themes` plus the
 * `fleet` base; src/server/themes.test.ts fails if the two drift. Hard-coded rather than importing
 * tokens.json so the server entry stays small.
 */
export const THEME_SCHEMES = {
  fleet: 'dark',
  'trident-studio': 'dark',
  'trident-nil': 'dark',
  'trident-ops': 'dark',
  'trident-playbook': 'dark',
  'trident-tools': 'dark',
  'trident-agents': 'dark',
  'wmh-portal': 'light',
  'wmh-marketing': 'dark',
  'wmh-dark': 'dark',
  portfolio: 'dark',
  quorum: 'dark',
} as const satisfies Record<string, Scheme>

export type Scheme = 'dark' | 'light'
export type ThemeName = keyof typeof THEME_SCHEMES

export function isThemeName(value: string): value is ThemeName {
  return Object.prototype.hasOwnProperty.call(THEME_SCHEMES, value)
}
