/**
 * Props tables generated from the shipped declaration files (G4; Radix Themes / Material Web API
 * tables). Types and descriptions come from dist/*.d.ts through the TypeScript checker, so the
 * table is exactly what a consumer's editor shows; defaults come from the source's destructuring
 * initialisers (declaration files drop them). Run after `npm run build:lib`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

export interface PropRow {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export interface ComponentApi {
  name: string
  /** The import path, e.g. "@trident/ui" or "@trident/ui/app". */
  entry: string
  /** The gallery group it belongs to (its src/<group>/ folder). */
  group: string
  description: string
  props: PropRow[]
  /** True when the props also accept the native element's attributes (className, aria-*, ...). */
  native: boolean
}

export const API_ENTRIES: Record<string, { dts: string; entry: string }> = {
  index: { dts: 'dist/index.d.ts', entry: '@trident/ui' },
  app: { dts: 'dist/app.d.ts', entry: '@trident/ui/app' },
  marketing: { dts: 'dist/marketing.d.ts', entry: '@trident/ui/marketing' },
}

/** Component name -> src group, from each group's index.ts re-exports. */
function groupOf(root: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const g of readdirSync(join(root, 'src'), { withFileTypes: true })) {
    const index = join(root, 'src', g.name, 'index.ts')
    if (!g.isDirectory() || !existsSync(index)) continue
    for (const m of readFileSync(index, 'utf8').matchAll(/export\s*\{([^}]*)\}\s*from/g))
      for (const part of m[1]!.split(',')) {
        const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()!.trim()
        if (/^[A-Z]/.test(name) && !out.has(name)) out.set(name, g.name)
      }
  }
  return out
}

/** Defaults from `export function Name({ a = 1, b = 'x' }: Props)` in the source files. */
function sourceDefaults(root: string): Map<string, Record<string, string>> {
  const out = new Map<string, Record<string, string>>()
  for (const g of readdirSync(join(root, 'src'), { withFileTypes: true })) {
    if (!g.isDirectory()) continue
    for (const f of readdirSync(join(root, 'src', g.name))) {
      if (!/\.tsx?$/.test(f) || /\.(test|gallery)\.tsx?$/.test(f)) continue
      const file = join(root, 'src', g.name, f)
      const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      for (const st of sf.statements) {
        if (!ts.isFunctionDeclaration(st) || !st.name || !/^[A-Z]/.test(st.name.text)) continue
        const p = st.parameters[0]
        if (!p || !ts.isObjectBindingPattern(p.name)) continue
        const d: Record<string, string> = {}
        for (const el of p.name.elements) {
          if (!el.initializer) continue
          const key = el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : ts.isIdentifier(el.name) ? el.name.text : ts.isStringLiteral(el.propertyName ?? el.name) ? (el.propertyName as ts.StringLiteral).text : ''
          if (key) d[key] = el.initializer.getText(sf)
        }
        out.set(st.name.text, d)
      }
    }
  }
  return out
}

const FORMAT = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | ts.TypeFormatFlags.WriteArrowStyleSignature

/** Every exported React component of the given entries, with its own props. */
export function componentApis(root: string, entries: string[] = Object.keys(API_ENTRIES)): ComponentApi[] {
  const files = entries.map((e) => join(root, API_ENTRIES[e]!.dts))
  for (const f of files) if (!existsSync(f)) throw new Error(`props tables: ${f} is missing; run npm run build:lib first`)
  const program = ts.createProgram(files, {
    strict: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: true,
    noEmit: true,
  })
  const checker = program.getTypeChecker()
  const groups = groupOf(root)
  const defaults = sourceDefaults(root)
  const own = new Set(files.map((f) => f.replace(/\\/g, '/')))
  const ownFile = (sf: ts.SourceFile) => own.has(sf.fileName.replace(/\\/g, '/')) || /\/dist\/[^/]+\.d\.ts$/.test(sf.fileName)
  const out: ComponentApi[] = []
  for (const [i, entryKey] of entries.entries()) {
    const sf = program.getSourceFile(files[i]!)
    const mod = sf && checker.getSymbolAtLocation(sf)
    if (!mod) continue
    for (let sym of checker.getExportsOfModule(mod)) {
      const name = sym.getName()
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue
      if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym)
      const decl = sym.valueDeclaration ?? sym.declarations?.[0]
      if (!decl || !(sym.flags & ts.SymbolFlags.Function || sym.flags & ts.SymbolFlags.Variable)) continue
      const sig = checker.getTypeOfSymbolAtLocation(sym, decl).getCallSignatures()[0]
      if (!sig) continue
      const ret = checker.typeToString(sig.getReturnType())
      if (!/Element|ReactNode|ReactElement|null/.test(ret)) continue
      const param = sig.getParameters()[0]
      if (!param || sig.getParameters().length > 1) continue
      const pType = checker.getTypeOfSymbolAtLocation(param, decl)
      let native = false
      const props: PropRow[] = []
      for (const p of checker.getPropertiesOfType(pType)) {
        const pd = p.getDeclarations() ?? []
        if (!pd.some((d) => ownFile(d.getSourceFile()))) {
          native = true
          continue
        }
        const d0 = pd.find((d) => ownFile(d.getSourceFile()))!
        const optional = Boolean(p.flags & ts.SymbolFlags.Optional)
        let type = checker.typeToString(checker.getTypeOfSymbolAtLocation(p, d0), undefined, FORMAT)
        if (optional) type = type.replace(/ \| undefined$/, '')
        props.push({
          name: p.getName(),
          type,
          required: !optional,
          ...(defaults.get(name)?.[p.getName()] !== undefined ? { default: defaults.get(name)![p.getName()]! } : {}),
          description: ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim(),
        })
      }
      out.push({
        name,
        entry: API_ENTRIES[entryKey]!.entry,
        group: entryKey === 'index' ? (groups.get(name) ?? 'utils') : entryKey,
        description: ts.displayPartsToString(sym.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim(),
        props,
        native,
      })
    }
  }
  return out
}
