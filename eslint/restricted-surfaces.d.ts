export declare const RESTRICTED_SURFACE_IMPORTS: readonly { name: string; message: string }[]
export declare const RESTRICTED_SURFACE_GLOBS: readonly string[]
export declare function restrictedSurfaceRule(extra?: { name: string; message: string }[]): ['error', { paths: { name: string; message: string }[] }]
export declare function restrictedSurfaces(options?: { files?: readonly string[]; extra?: { name: string; message: string }[] }): {
  files: string[]
  rules: { 'no-restricted-imports': ReturnType<typeof restrictedSurfaceRule> }
}
