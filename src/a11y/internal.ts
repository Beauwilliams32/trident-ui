/**
 * Internal helpers shared by the a11y, layout and type groups. Not part of the public API
 * (not re-exported from src/a11y/index.ts). SSR-safe: nothing here touches window at import.
 */
import type { Ref, RefCallback } from 'react'

/** Joins class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * True outside production builds. Consumers' bundlers replace `process.env.NODE_ENV` statically;
 * where nothing replaces it and `process` does not exist (a raw browser), this is false.
 */
export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

const warned = new Set<string>()

/** console.warn once per distinct key, dev builds only. */
export function devWarnOnce(key: string, message: string): void {
  if (!isDev() || warned.has(key)) return
  warned.add(key)
  console.warn(`[@trident/ui] ${message}`)
}

/** Test hook: forget which dev warnings were already printed. */
export function resetDevWarnings(): void {
  warned.clear()
}

/** Combines several refs (object or callback) into one callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as { current: T | null }).current = node
    }
  }
}
