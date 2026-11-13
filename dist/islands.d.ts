import { ComponentType } from 'react';
import { HydrationOptions, Root } from 'react-dom/client';
export { H as HydrateStrategy } from './protocol-DWCF29MR.js';

/**
 * @trident/ui/islands — hydrateIslands(), about 2KB gz (spec §1, §8).
 * Separate subpath entry: NOT re-exported from the package root.
 *
 * Finds every `[data-island]` written by `<Island>` (from @trident/ui/server), reads its props from
 * the JSON block that follows it, and calls `hydrateRoot` when its strategy fires. The module does
 * nothing at import (SSR-safe) and emits no inline script, so it runs under `script-src 'self'`.
 */

type AnyComponent = ComponentType<any>;
/** A component, or `{ load }` to code-split it: `{ load: () => import('./Nav').then((m) => m.Nav) }`. */
type IslandEntry = AnyComponent | {
    load: () => Promise<AnyComponent>;
};
type IslandRegistry = Record<string, IslandEntry>;
interface HydrateIslandsOptions extends Pick<HydrationOptions, 'onRecoverableError' | 'identifierPrefix'> {
    /** Where to look for islands. Default `document`. */
    root?: ParentNode;
    /** An island could not hydrate (unknown name, bad props, loader failure). Default: console.error. */
    onError?: (error: unknown, element: Element) => void;
}
interface IslandsHandle {
    /** Resolves once every `load` island has hydrated (or failed). */
    ready: Promise<void>;
    /** Roots hydrated so far. */
    roots: Root[];
    /** Unmounts hydrated islands and cancels pending ones. */
    dispose(): void;
}
declare function hydrateIslands(registry: IslandRegistry, options?: HydrateIslandsOptions): IslandsHandle;

export { type HydrateIslandsOptions, type IslandEntry, type IslandRegistry, type IslandsHandle, hydrateIslands };
