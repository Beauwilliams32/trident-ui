/**
 * Build-time source extraction for the gallery's "Code" disclosure (G4; shadcn's Preview / Code /
 * Copy). Reads each *.gallery.tsx with the TypeScript parser and returns, in array order, the body of
 * every example's `render` function, dedented. The code shown is the code that renders the preview,
 * so it cannot drift from it.
 */
import { readFileSync } from 'node:fs'
import ts from 'typescript'

function dedent(text: string): string {
  const lines = text.replace(/\s+$/, '').split('\n')
  const rest = lines.slice(1).filter((l) => l.trim() !== '')
  const indent = rest.length ? Math.min(...rest.map((l) => /^ */.exec(l)![0].length)) : 0
  return [lines[0]!, ...lines.slice(1).map((l) => l.slice(Math.min(indent, /^ */.exec(l)![0].length)))].join('\n')
}

function unwrap(node: ts.Expression): ts.Expression {
  let n = node
  while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n)) n = n.expression
  return n
}

/** The `examples` array literal of a gallery module, if it has one. */
function examplesArray(sf: ts.SourceFile): ts.ArrayLiteralExpression | undefined {
  let found: ts.ArrayLiteralExpression | undefined
  const visit = (node: ts.Node) => {
    if (found) return
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'examples' && node.initializer) {
      const init = unwrap(node.initializer)
      if (ts.isArrayLiteralExpression(init)) found = init
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
}

/** Every example's render body, in order. A missing body is an empty string (a test fails on it). */
export function exampleSources(file: string): string[] {
  const text = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const arr = examplesArray(sf)
  if (!arr) return []
  return arr.elements.map((el) => {
    if (!ts.isObjectLiteralExpression(el)) return ''
    const render = el.properties.find((p) => p.name && ts.isIdentifier(p.name) && p.name.text === 'render')
    if (!render) return ''
    let fn: ts.Node | undefined
    if (ts.isPropertyAssignment(render)) fn = unwrap(render.initializer)
    else if (ts.isMethodDeclaration(render)) fn = render
    if (!fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isMethodDeclaration(fn)) || !fn.body) return ''
    const body = fn.body
    if (ts.isBlock(body)) return dedent(body.statements.map((s) => s.getText(sf)).join('\n'))
    return dedent(unwrap(body as ts.Expression).getText(sf))
  })
}
