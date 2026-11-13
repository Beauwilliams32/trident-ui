//#region src/islands/protocol.ts
/**
* The island wire protocol, shared by `<Island>` (server) and `hydrateIslands()` (client).
* Kept in its own dependency-free module so the client entry never pulls server code.
*
* Markup written by the server:
*
*   <div data-island="Name" data-island-hydrate="load">…server-rendered component…</div>
*   <script type="application/json" data-island-props>{"…":"…"}<\/script>
*
* The props block is the wrapper's next element sibling, so the wrapper holds exactly what React
* hydrates. A JSON data block is never executed, so `script-src 'self'` CSPs allow it.
*/
var ISLAND_ATTR = "data-island";
var HYDRATE_ATTR = "data-island-hydrate";
var PROPS_ATTR = "data-island-props";
var STATE_ATTR = "data-island-state";
var HYDRATE_STRATEGIES = [
	"load",
	"idle",
	"visible",
	"interaction"
];
/** Island names become registry keys and attribute values: letters, digits, `-` and `_`, starting with a letter. */
var ISLAND_NAME = /^[A-Za-z][\w-]{0,63}$/;
//#endregion
export { PROPS_ATTR as a, ISLAND_NAME as i, HYDRATE_STRATEGIES as n, STATE_ATTR as o, ISLAND_ATTR as r, HYDRATE_ATTR as t };
