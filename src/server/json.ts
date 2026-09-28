/** JSON that is safe to place inside a `<script>` data block (JSON-LD, island props). */

/** A value that survives `JSON.stringify` → `JSON.parse` unchanged. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

const UNSAFE = /[<>&\u2028\u2029]/g
const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/**
 * `JSON.stringify` with `<`, `>`, `&`, U+2028 and U+2029 escaped, so the text can never close the
 * surrounding `<script>` element or open an HTML comment. The result still parses to the same value.
 */
export function safeJson(value: unknown): string {
  const text = JSON.stringify(value)
  if (text === undefined) throw new TypeError('safeJson: value is not JSON-serialisable')
  return text.replace(UNSAFE, (ch) => ESCAPES[ch] ?? ch)
}

/**
 * Throws a TypeError naming the path of the first value that would not round-trip through JSON
 * (functions, symbols, bigints, undefined, non-finite numbers, Dates, Maps, class instances).
 * Island props must round-trip exactly, or the client renders different markup from the server.
 */
export function assertJsonSerializable(value: unknown, path = 'props'): asserts value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} is ${value}, which JSON turns into null`)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertJsonSerializable(item, `${path}[${i}]`))
    return
  }
  if (typeof value === 'object') {
    const proto = Object.getPrototypeOf(value)
    if (proto !== Object.prototype && proto !== null) {
      throw new TypeError(`${path} is a ${proto?.constructor?.name ?? 'non-plain object'}; pass plain JSON (e.g. an ISO string for a Date)`)
    }
    for (const [key, item] of Object.entries(value)) assertJsonSerializable(item, `${path}.${key}`)
    return
  }
  throw new TypeError(`${path} is a ${typeof value}, which cannot be serialised into island props`)
}
