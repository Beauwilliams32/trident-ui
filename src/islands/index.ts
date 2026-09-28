/**
 * @trident/ui/islands — hydrateIslands(), about 2KB gz (spec §1, §8).
 * Separate subpath entry: NOT re-exported from the package root.
 *
 * Finds every `[data-island]` written by `<Island>` (from @trident/ui/server), reads its props from
 * the JSON block that follows it, and calls `hydrateRoot` when its strategy fires. The module does
 * nothing at import (SSR-safe) and emits no inline script, so it runs under `script-src 'self'`.
 */
import { type ComponentType, createElement } from 'react'
import { hydrateRoot, type HydrationOptions, type Root } from 'react-dom/client'
import { HYDRATE_ATTR, type HydrateStrategy, ISLAND_ATTR, PROPS_ATTR, STATE_ATTR } from './protocol'

export type { HydrateStrategy } from './protocol'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry values take any JSON props
type AnyComponent = ComponentType<any>

/** A component, or `{ load }` to code-split it: `{ load: () => import('./Nav').then((m) => m.Nav) }`. */
export type IslandEntry = AnyComponent | { load: () => Promise<AnyComponent> }
export type IslandRegistry = Record<string, IslandEntry>

export interface HydrateIslandsOptions extends Pick<HydrationOptions, 'onRecoverableError' | 'identifierPrefix'> {
  /** Where to look for islands. Default `document`. */
  root?: ParentNode
  /** An island could not hydrate (unknown name, bad props, loader failure). Default: console.error. */
  onError?: (error: unknown, element: Element) => void
}

export interface IslandsHandle {
  /** Resolves once every `load` island has hydrated (or failed). */
  ready: Promise<void>
  /** Roots hydrated so far. */
  roots: Root[]
  /** Unmounts hydrated islands and cancels pending ones. */
  dispose(): void
}

const INTERACTION_EVENTS = ['pointerover', 'touchstart', 'focusin'] as const

export function hydrateIslands(registry: IslandRegistry, options: HydrateIslandsOptions = {}): IslandsHandle {
  const roots: Root[] = []
  const cleanups: Array<() => void> = []
  const eager: Promise<void>[] = []
  const onError = options.onError ?? ((error: unknown, el: Element) => console.error('[trident-ui islands]', el, error))
  const scope = options.root ?? (typeof document === 'undefined' ? undefined : document)

  const hydrate = async (el: Element): Promise<void> => {
    if (el.getAttribute(STATE_ATTR)) return
    el.setAttribute(STATE_ATTR, 'pending')
    try {
      const name = el.getAttribute(ISLAND_ATTR) as string
      const entry = Object.prototype.hasOwnProperty.call(registry, name) ? registry[name] : undefined
      if (!entry) throw new Error(`no island registered as "${name}"`)
      const data = el.nextElementSibling
      const props = data && data.matches(`script[${PROPS_ATTR}]`) ? JSON.parse(data.textContent || '{}') : {}
      const component = 'load' in entry ? await entry.load() : entry
      roots.push(
        hydrateRoot(el, createElement(component, props), {
          onRecoverableError: options.onRecoverableError,
          identifierPrefix: options.identifierPrefix,
        }),
      )
      el.setAttribute(STATE_ATTR, 'hydrated')
    } catch (error) {
      el.setAttribute(STATE_ATTR, 'error')
      onError(error, el)
    }
  }

  const schedule = (el: Element, strategy: HydrateStrategy): void => {
    const run = () => void hydrate(el)
    if (strategy === 'idle') {
      if (typeof requestIdleCallback === 'function') {
        const id = requestIdleCallback(run, { timeout: 2000 })
        cleanups.push(() => cancelIdleCallback(id))
      } else {
        const id = setTimeout(run, 1)
        cleanups.push(() => clearTimeout(id))
      }
    } else if (strategy === 'visible' && typeof IntersectionObserver === 'function') {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          run()
        }
      })
      io.observe(el)
      cleanups.push(() => io.disconnect())
    } else if (strategy === 'interaction') {
      const fire = () => {
        off()
        run()
      }
      const off = () => INTERACTION_EVENTS.forEach((type) => el.removeEventListener(type, fire))
      INTERACTION_EVENTS.forEach((type) => el.addEventListener(type, fire, { passive: true }))
      cleanups.push(off)
    } else {
      eager.push(hydrate(el))
    }
  }

  scope?.querySelectorAll(`[${ISLAND_ATTR}]`).forEach((el) => {
    // Nested islands hydrate as part of their outer island.
    if (el.parentElement?.closest(`[${ISLAND_ATTR}]`)) return
    schedule(el, (el.getAttribute(HYDRATE_ATTR) || 'load') as HydrateStrategy)
  })

  return {
    ready: Promise.all(eager).then(() => undefined),
    roots,
    dispose() {
      cleanups.forEach((fn) => fn())
      roots.splice(0).forEach((root) => root.unmount())
    },
  }
}
