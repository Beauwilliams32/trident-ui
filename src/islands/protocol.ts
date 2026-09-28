/**
 * The island wire protocol, shared by `<Island>` (server) and `hydrateIslands()` (client).
 * Kept in its own dependency-free module so the client entry never pulls server code.
 *
 * Markup written by the server:
 *
 *   <div data-island="Name" data-island-hydrate="load">…server-rendered component…</div>
 *   <script type="application/json" data-island-props>{"…":"…"}</script>
 *
 * The props block is the wrapper's next element sibling, so the wrapper holds exactly what React
 * hydrates. A JSON data block is never executed, so `script-src 'self'` CSPs allow it.
 */
export const ISLAND_ATTR = 'data-island'
export const HYDRATE_ATTR = 'data-island-hydrate'
export const PROPS_ATTR = 'data-island-props'
export const STATE_ATTR = 'data-island-state'

/** When an island hydrates. `load`: at once. `idle`: requestIdleCallback. `visible`: first intersection. `interaction`: first pointer, touch or focus. */
export type HydrateStrategy = 'load' | 'idle' | 'visible' | 'interaction'
export const HYDRATE_STRATEGIES: readonly HydrateStrategy[] = ['load', 'idle', 'visible', 'interaction']

/** Island names become registry keys and attribute values: letters, digits, `-` and `_`, starting with a letter. */
export const ISLAND_NAME = /^[A-Za-z][\w-]{0,63}$/
