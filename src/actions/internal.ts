/**
 * Small internal helpers shared by the actions and forms groups. Not exported from the package root.
 * SSR-safe: nothing here touches window/document at import time.
 */
import type { Ref, RefCallback } from 'react'

/** Join truthy class names. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Join space-separated id lists (aria-describedby), dropping empties. Returns undefined when empty. */
export function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  const out = ids
    .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    .join(' ')
    .trim()
  return out === '' ? undefined : out
}

/** True outside production builds. Guarded so it never throws where `process` does not exist. */
export function isDev(): boolean {
  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

/** Development-only console warning, prefixed with the package name. */
export function devWarn(message: string): void {
  if (isDev()) console.warn(`[@trident/ui] ${message}`)
}

/** Merge several refs (React 19 passes `ref` as a normal prop) into one callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value)
      else if (ref && typeof ref === 'object') (ref as { current: T | null }).current = value
    }
  }
}
