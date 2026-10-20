// Types for scripts/lib/tokens.mjs (used by the Vitest suites).
// tokens.json is validated by test/tokens.test.ts; its shape is intentionally loose here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tokens = any
export declare const ROOT: string
export declare const HEADER: string
export declare const HEX_RE: RegExp
export declare const DEFAULT_THEME: string
export declare const LEGACY_ALIASES: Record<string, string>
export declare function loadTokens(path?: string): Tokens
export declare function expandHex(hex: string): string
export declare function hexToInt(hex: string): number
export declare function resolveRoles(tokens: Tokens, roles: Record<string, string>): Record<string, string>
export declare function rawThemeRoles(tokens: Tokens, name: string, palette?: string): Record<string, string>
export declare function themeScheme(tokens: Tokens, name: string): 'dark' | 'light'
export declare function resolveTheme(tokens: Tokens, name: string, palette?: string): Record<string, string>
export declare function themeExtra(tokens: Tokens, name: string): Record<string, string>
export declare function themeElevation(tokens: Tokens, name: string): Record<string, string>
export declare function themeVariants(tokens: Tokens): { theme: string; palette: string | undefined; id: string }[]
export declare function durationVar(key: string): string
export declare function easingVar(key: string): string
export declare function bezier(arr: number[]): string
export declare function cssRoleValue(tokens: Tokens, raw: string): string
export declare function globalDecls(tokens: Tokens): string[]
export declare function semanticDecls(tokens: Tokens, name: string, opts?: { palette?: string }): string[]
export declare function buildTokensCss(tokens: Tokens): string
export declare function buildThemeCss(tokens: Tokens, name: string): string
export declare function buildFleetCss(tokens: Tokens): string
export declare function buildLegacyAliasesCss(tokens: Tokens): string
export declare function threeColors(tokens: Tokens): Record<string, Record<string, number>>
export declare function threeColorTable(tokens: Tokens): {
  themes: Record<string, Record<string, number>>
  palettes: Record<string, Record<string, Record<string, number>>>
}
export declare const THREE_COLOR_TABLE_FILE: string
export declare function buildThreeColorTableJson(tokens: Tokens): string
export declare function quorumFallback(tokens: Tokens): Record<string, string>
export declare function jsTokens(tokens: Tokens): Record<string, unknown>
export declare function tsType(value: unknown, indent?: string): string
export declare function buildTokensModule(tokens: Tokens): { js: string; dts: string }
export declare function buildThreeModule(tokens: Tokens): { js: string; dts: string }
export declare function luminance(hex: string): number
export declare function contrast(a: string, b: string): number
export declare function mixHex(a: string, b: string, t: number): string
export declare function highContrastRoles(tokens: Tokens, name: string): Record<string, string>
export declare function resolveHighContrast(tokens: Tokens, name: string): Record<string, string>
