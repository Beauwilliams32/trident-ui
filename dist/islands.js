import { o as STATE_ATTR, r as ISLAND_ATTR } from "./chunks/protocol-BRPdILwH.js";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
//#region src/islands/index.ts
/**
* @trident/ui/islands — hydrateIslands(), about 2KB gz (spec §1, §8).
* Separate subpath entry: NOT re-exported from the package root.
*
* Finds every `[data-island]` written by `<Island>` (from @trident/ui/server), reads its props from
* the JSON block that follows it, and calls `hydrateRoot` when its strategy fires. The module does
* nothing at import (SSR-safe) and emits no inline script, so it runs under `script-src 'self'`.
*/
var INTERACTION_EVENTS = [
	"pointerover",
	"touchstart",
	"focusin"
];
function hydrateIslands(registry, options = {}) {
	const roots = [];
	const cleanups = [];
	const eager = [];
	const onError = options.onError ?? ((error, el) => console.error("[trident-ui islands]", el, error));
	const scope = options.root ?? (typeof document === "undefined" ? void 0 : document);
	const hydrate = async (el) => {
		if (el.getAttribute("data-island-state")) return;
		el.setAttribute(STATE_ATTR, "pending");
		try {
			const name = el.getAttribute(ISLAND_ATTR);
			const entry = Object.prototype.hasOwnProperty.call(registry, name) ? registry[name] : void 0;
			if (!entry) throw new Error(`no island registered as "${name}"`);
			const data = el.nextElementSibling;
			const props = data && data.matches(`script[data-island-props]`) ? JSON.parse(data.textContent || "{}") : {};
			const component = "load" in entry ? await entry.load() : entry;
			roots.push(hydrateRoot(el, createElement(component, props), {
				onRecoverableError: options.onRecoverableError,
				identifierPrefix: options.identifierPrefix
			}));
			el.setAttribute(STATE_ATTR, "hydrated");
		} catch (error) {
			el.setAttribute(STATE_ATTR, "error");
			onError(error, el);
		}
	};
	const schedule = (el, strategy) => {
		const run = () => void hydrate(el);
		if (strategy === "idle") {
			if (typeof requestIdleCallback === "function") {
				const id = requestIdleCallback(run, { timeout: 2e3 });
				cleanups.push(() => cancelIdleCallback(id));
			} else {
				const id = setTimeout(run, 1);
				cleanups.push(() => clearTimeout(id));
			}
		} else if (strategy === "visible" && typeof IntersectionObserver === "function") {
			const io = new IntersectionObserver((entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					io.disconnect();
					run();
				}
			});
			io.observe(el);
			cleanups.push(() => io.disconnect());
		} else if (strategy === "interaction") {
			const fire = () => {
				off();
				run();
			};
			const off = () => INTERACTION_EVENTS.forEach((type) => el.removeEventListener(type, fire));
			INTERACTION_EVENTS.forEach((type) => el.addEventListener(type, fire, { passive: true }));
			cleanups.push(off);
		} else eager.push(hydrate(el));
	};
	scope?.querySelectorAll(`[${ISLAND_ATTR}]`).forEach((el) => {
		if (el.parentElement?.closest(`[data-island]`)) return;
		schedule(el, el.getAttribute("data-island-hydrate") || "load");
	});
	return {
		ready: Promise.all(eager).then(() => void 0),
		roots,
		dispose() {
			cleanups.forEach((fn) => fn());
			roots.splice(0).forEach((root) => root.unmount());
		}
	};
}
//#endregion
export { hydrateIslands };
