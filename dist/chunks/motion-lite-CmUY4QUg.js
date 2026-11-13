//#region src/motion-lite/env.ts
var hasDOM = () => typeof window !== "undefined" && typeof document !== "undefined";
/** `matchMedia(query).matches`, false without a DOM or when matchMedia throws. */
function mq(query) {
	try {
		return hasDOM() && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
	} catch {
		return false;
	}
}
/** The person asked the OS for less motion. */
var reduced = () => mq("(prefers-reduced-motion: reduce)");
/** The persistent "Pause motion" control is on (`html[data-motion="paused"]`, spec §6.3 rule 5). */
var paused = () => hasDOM() && document.documentElement.getAttribute("data-motion") === "paused";
/** Reduced motion OR paused: movement becomes an instant change (spec §6.4). */
var motionOff = () => reduced() || paused();
/** A mouse or trackpad that can hover: the only input Tilt responds to. */
var finePointer = () => mq("(hover: hover) and (pointer: fine)");
/**
* Low-power heuristic (spec §0.2): any one signal is enough — Save-Data, `deviceMemory < 4`,
* `hardwareConcurrency < 4`, or an effective connection type of 2g / slow-2g.
* lowPower() gates 3D and heavy effects only; micro-transitions stay (spec §6.4).
*/
function lowPower(nav) {
	const n = nav ?? (typeof navigator !== "undefined" ? navigator : {});
	const conn = n.connection ?? n.mozConnection ?? n.webkitConnection ?? {};
	if (conn.saveData) return true;
	if (typeof n.deviceMemory === "number" && n.deviceMemory < 4) return true;
	if (typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency < 4) return true;
	if (typeof conn.effectiveType === "string" && /(^|-)2g$/.test(conn.effectiveType)) return true;
	return false;
}
/** Read a time/number token (`600ms`, `0.6s`, `7deg`, `6`) from :root, falling back when unset. */
function tokenNumber(name, fallback) {
	try {
		const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
		const n = parseFloat(raw);
		if (!Number.isFinite(n)) return fallback;
		return /ms$/.test(raw) ? n : /s$/.test(raw) ? n * 1e3 : n;
	} catch {
		return fallback;
	}
}
//#endregion
//#region src/motion-lite/pause.ts
/**
* "Pause motion" (spec §6.3 rule 5, WCAG 2.2.2). One store for the whole page:
* `html[data-motion="paused"]` is the source of truth, persisted in localStorage (every access in
* try/catch: private windows and blocked storage throw). The CSS kill switch in base.css keys on
* the same attribute, so pausing needs no JS beyond flipping it.
*/
var MOTION_STORAGE_KEY = "ui-motion";
var MOTION_CHANGE_EVENT = "ui:motionchange";
var MOTION_TOGGLE_ATTR = "data-motion-toggle";
var listeners = /* @__PURE__ */ new Set();
function store(value) {
	try {
		window.localStorage.setItem(MOTION_STORAGE_KEY, value);
	} catch {}
}
/** The stored choice, or null when nothing is stored or storage is unavailable. */
function storedMotionPaused() {
	try {
		const v = window.localStorage.getItem(MOTION_STORAGE_KEY);
		return v === "paused" ? true : v === "on" ? false : null;
	} catch {
		return null;
	}
}
function apply(isPaused) {
	const root = document.documentElement;
	if (isPaused) root.setAttribute("data-motion", "paused");
	else if (root.getAttribute("data-motion") === "paused") root.removeAttribute("data-motion");
}
function notify(isPaused) {
	for (const l of [...listeners]) l(isPaused);
	try {
		document.dispatchEvent(new CustomEvent(MOTION_CHANGE_EVENT, { detail: { paused: isPaused } }));
	} catch {}
}
/** Pause or resume all motion on the page, persist the choice and tell subscribers. */
function setMotionPaused(isPaused) {
	if (!hasDOM()) return;
	const changed = paused() !== isPaused;
	apply(isPaused);
	store(isPaused ? "paused" : "on");
	if (changed) notify(isPaused);
}
var toggleMotionPaused = () => setMotionPaused(!paused());
/** Apply the stored choice to <html> (call as early as possible; initMotion() does). */
function restoreMotionPreference() {
	if (!hasDOM()) return false;
	const stored = storedMotionPaused();
	if (stored !== null && stored !== paused()) {
		apply(stored);
		notify(stored);
	}
	return paused();
}
/** Subscribe to pause changes. Returns the unsubscribe function. */
function subscribeMotion(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
var handled = /* @__PURE__ */ new WeakSet();
function handleMotionToggleClick(event) {
	if (handled.has(event)) return;
	handled.add(event);
	toggleMotionPaused();
}
function sync(button) {
	button.setAttribute("aria-pressed", String(paused()));
}
/**
* Wire a server-rendered `<button type="button" data-motion-toggle aria-pressed="false">Pause motion</button>`
* without React. The label stays fixed; `aria-pressed` carries the state. Returns an unbind function.
*/
function bindMotionToggle(button) {
	sync(button);
	const onClick = (e) => handleMotionToggleClick(e);
	button.addEventListener("click", onClick);
	const unsubscribe = subscribeMotion(() => sync(button));
	return () => {
		button.removeEventListener("click", onClick);
		unsubscribe();
	};
}
//#endregion
//#region src/motion-lite/reveal.ts
/**
* [data-reveal] (spec §6.1). base.css hides an unrevealed element only under html.ui-motion +
* scripting + no reduced motion + not paused, with a 2.5s CSS failsafe; this module sets
* `data-revealed` when the element scrolls into view. `--i` on the element staggers siblings
* (70ms × min(--i, 6), in CSS). Reduced motion, Pause, or no IntersectionObserver: reveal at once.
*/
var REVEALED_ATTR = "data-revealed";
var seen = /* @__PURE__ */ new WeakSet();
var io = null;
/** Show an element now. After the enter transition it drops its stagger so hovers stay quick. */
function markRevealed(el) {
	if (el.hasAttribute("data-revealed")) return;
	el.setAttribute(REVEALED_ATTR, "");
	const style = el.style;
	if (!style || motionOff()) return;
	const i = parseFloat(style.getPropertyValue("--i")) || 0;
	if (!i) return;
	const wait = tokenNumber("--ui-dur-reveal", 600) + Math.min(i, 6) * tokenNumber("--ui-stagger", 70) + 40;
	setTimeout(() => style.setProperty("--i", "0"), wait);
}
function observer() {
	if (io) return io;
	if (typeof IntersectionObserver !== "function") return null;
	io = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			markRevealed(entry.target);
			io?.unobserve(entry.target);
		}
	}, {
		rootMargin: "0px 0px -8% 0px",
		threshold: .1
	});
	return io;
}
/** Start watching one element (idempotent). Returns a function that stops watching it. */
function observeReveal(el) {
	if (seen.has(el)) return () => io?.unobserve(el);
	seen.add(el);
	const o = motionOff() ? null : observer();
	if (!o) {
		markRevealed(el);
		return () => {};
	}
	o.observe(el);
	return () => o.unobserve(el);
}
/** Observe every [data-reveal] in scope (the scope itself included). Returns the count. */
function scanReveals(scope) {
	if (!hasDOM()) return 0;
	const node = scope ?? document;
	let count = 0;
	if (node instanceof Element && node.matches("[data-reveal]")) {
		observeReveal(node);
		count++;
	}
	node.querySelectorAll("[data-reveal]").forEach((el) => {
		observeReveal(el);
		count++;
	});
	return count;
}
/** Reveal everything now (used when motion is paused mid-page). */
function revealAll(scope) {
	if (!hasDOM()) return;
	(scope ?? document).querySelectorAll("[data-reveal]").forEach((el) => {
		markRevealed(el);
		io?.unobserve(el);
	});
}
/** Scan now and keep scanning nodes added later (React re-renders). Returns a disconnect function. */
function watchReveals(target) {
	if (!hasDOM()) return () => {};
	const root = target ?? document.body ?? document.documentElement;
	scanReveals(root);
	if (typeof MutationObserver !== "function") return () => {};
	const mo = new MutationObserver((records) => {
		for (const r of records) r.addedNodes.forEach((n) => n.nodeType === 1 && scanReveals(n));
	});
	mo.observe(root, {
		childList: true,
		subtree: true
	});
	return () => mo.disconnect();
}
//#endregion
//#region src/motion-lite/count.ts
/**
* Count-ups (spec §6.1, §6.3 rule 9). Only ONE real quantity counts (isCountable): "2022-2023",
* "1-800-555-0100", "Q4 2025" or "v2.1.3" render static unless the caller opts in. The target is
* always the value the server or props supplied; the animation never invents a number.
* Reduced motion or Pause: the final value is written and no requestAnimationFrame starts.
*/
var NUM_RE = /^([^\d-]*?)(-?\d[\d,]*)(\.\d+)?(.*)$/s;
function parseNumber(text) {
	const m = NUM_RE.exec(String(text ?? "").trim());
	if (!m) return null;
	const whole = (m[2] ?? "").replace(/,/g, "");
	const dec = m[3] ? m[3].slice(1) : "";
	const value = Number(whole + (dec ? "." + dec : ""));
	if (!Number.isFinite(value)) return null;
	return {
		prefix: m[1] ?? "",
		value,
		decimals: dec.length,
		grouped: (m[2] ?? "").includes(","),
		suffix: m[4] ?? ""
	};
}
var COUNTABLE_RE = /^(?:[$€£]|US\$)?-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:%|×|x|[kKmMbB]\+?|\+|\/(?:mo|yr|wk|day|hr))?$/;
/** Is this text one real quantity? `optIn` true forces (if it parses), false forbids. */
function isCountable(text, optIn) {
	if (optIn === false) return false;
	const raw = String(text ?? "").trim();
	if (!raw || !parseNumber(raw)) return false;
	return optIn === true || COUNTABLE_RE.test(raw);
}
function formatNumber(n, spec) {
	const [whole = "0", frac] = Math.abs(n).toFixed(spec.decimals).split(".");
	const w = spec.grouped ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : whole;
	return spec.prefix + (n < 0 ? "-" : "") + w + (frac ? "." + frac : "") + spec.suffix;
}
/** Count `el` from 0 to its value once. Returns a cancel function that leaves the final value. */
function countUp(el, opts = {}) {
	const text = opts.value != null ? String(opts.value) : String(el?.textContent ?? "");
	const write = opts.write ?? ((t) => el && (el.textContent = t));
	const attr = el?.getAttribute("data-countable");
	const spec = isCountable(text, opts.countable ?? (attr === "true" || attr === "" ? true : attr === "false" ? false : void 0)) ? parseNumber(text) : null;
	const done = () => write(text);
	if (!spec || motionOff() || typeof requestAnimationFrame !== "function" || typeof performance === "undefined") {
		done();
		return () => {};
	}
	const duration = opts.duration ?? tokenNumber("--ui-dur-count", 1100);
	const start = performance.now();
	let raf = 0;
	const tick = (now) => {
		const p = Math.min(1, (now - start) / duration);
		if (p >= 1 || motionOff()) {
			raf = 0;
			done();
			return;
		}
		write(formatNumber(spec.value * (1 - Math.pow(1 - p, 3)), spec));
		raf = requestAnimationFrame(tick);
	};
	write(formatNumber(0, spec));
	raf = requestAnimationFrame(tick);
	return () => {
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
		done();
	};
}
/**
* Count up an element the first time 40% of it is visible. Without IntersectionObserver, or with
* motion off, the final value stays and nothing is scheduled. Returns a cleanup function.
*/
function countUpWhenVisible(el, opts = {}) {
	const text = opts.value != null ? String(opts.value) : String(el.textContent ?? "");
	const spec = isCountable(text, opts.countable) ? parseNumber(text) : null;
	if (!spec || motionOff() || typeof IntersectionObserver !== "function") return () => {};
	const write = opts.write ?? ((t) => el.textContent = t);
	let stop = null;
	const local = new IntersectionObserver((entries) => {
		if (!entries.some((e) => e.isIntersecting)) return;
		local.disconnect();
		stop = countUp(el, {
			...opts,
			value: text,
			countable: true,
			write
		});
	}, { threshold: .4 });
	const finish = () => {
		local.disconnect();
		unsubscribe();
		if (stop) stop();
		write(text);
	};
	const unsubscribe = subscribeMotion((isPaused) => isPaused && finish());
	write(formatNumber(0, spec));
	local.observe(el);
	return finish;
}
//#endregion
//#region src/motion-lite/tilt.ts
/**
* [data-tilt] (spec §6.1): cards follow a FINE pointer only, at most --ui-tilt-max (7deg).
* One delegated pointermove listener for the page; work is batched into one rAF per frame.
* Sets --ui-tilt-x/--ui-tilt-y/--ui-glare-x/--ui-glare-y; motion-lite/styles.css does the rest.
* Nothing binds under reduced motion, Pause or a coarse pointer, so no rAF ever starts there.
*/
function resetTilt(el) {
	if (!el) return;
	const style = el.style;
	el.removeAttribute("data-tilting");
	if (!style) return;
	for (const p of [
		"--ui-tilt-x",
		"--ui-tilt-y",
		"--ui-glare-x",
		"--ui-glare-y"
	]) style.removeProperty(p);
}
var unbind = null;
/** Bind the page-wide tilt listener (idempotent). Returns false when tilt must not run. */
function bindTilt() {
	if (unbind) return true;
	if (!hasDOM() || !finePointer() || motionOff()) return false;
	let active = null;
	let raf = 0;
	let px = 0;
	let py = 0;
	const apply = () => {
		raf = 0;
		if (!active) return;
		const r = active.getBoundingClientRect();
		if (!r.width || !r.height) return;
		const x = (px - r.left) / r.width - .5;
		const y = (py - r.top) / r.height - .5;
		const max = Math.min(7, tokenNumber("--ui-tilt-max", 7));
		active.style.setProperty("--ui-tilt-x", (y * -max).toFixed(2) + "deg");
		active.style.setProperty("--ui-tilt-y", (x * max).toFixed(2) + "deg");
		active.style.setProperty("--ui-glare-x", ((x + .5) * 100).toFixed(1) + "%");
		active.style.setProperty("--ui-glare-y", ((y + .5) * 100).toFixed(1) + "%");
	};
	const onMove = (e) => {
		if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
		if (motionOff() || !finePointer()) {
			resetTilt(active);
			active = null;
			return;
		}
		const target = e.target;
		const el = target && typeof target.closest === "function" ? target.closest("[data-tilt]") : null;
		if (el !== active) {
			resetTilt(active);
			active = el;
			active?.setAttribute("data-tilting", "");
		}
		if (!active) return;
		px = e.clientX;
		py = e.clientY;
		if (!raf) raf = requestAnimationFrame(apply);
	};
	const onOut = (e) => {
		if (active && !(e.relatedTarget instanceof Node && active.contains(e.relatedTarget))) {
			resetTilt(active);
			active = null;
		}
	};
	document.addEventListener("pointermove", onMove, { passive: true });
	document.addEventListener("pointerout", onOut, { passive: true });
	unbind = () => {
		document.removeEventListener("pointermove", onMove);
		document.removeEventListener("pointerout", onOut);
		if (raf) cancelAnimationFrame(raf);
		resetTilt(active);
		active = null;
		unbind = null;
	};
	return true;
}
/** Remove the page-wide tilt listener. */
function unbindTilt() {
	unbind?.();
}
//#endregion
//#region src/motion-lite/transition.ts
/**
* View Transitions for route and tab changes (spec §6.1). Skipped (the update runs synchronously)
* under reduced motion, Pause, a hidden document, a programmatic change (no user activation), or
* a browser without document.startViewTransition (spec §6.4).
*/
var active = false;
function canTransition() {
	if (!hasDOM()) return false;
	if (typeof document.startViewTransition !== "function" || motionOff() || document.hidden) return false;
	const ua = navigator.userActivation;
	return !(ua && ua.isActive === false);
}
/** Wrap a state change in a View Transition when allowed; otherwise just run it. */
function transition(update, opts = {}) {
	const run = () => opts.flush ? opts.flush(update) : update();
	if (active || !canTransition()) {
		run();
		return null;
	}
	const root = document.documentElement;
	const name = opts.name ?? "";
	active = true;
	if (name) root.setAttribute("data-vt", name);
	const clear = () => {
		active = false;
		if (name && root.getAttribute("data-vt") === name) root.removeAttribute("data-vt");
	};
	let handle;
	try {
		handle = document.startViewTransition(run);
	} catch {
		clear();
		run();
		return null;
	}
	handle?.ready?.catch(() => {});
	if (handle?.finished) handle.finished.then(clear, clear);
	else clear();
	return handle;
}
//#endregion
//#region src/motion-lite/init.ts
/**
* initMotion(): the one boot call for SSG/marketing pages (and what the /motion wrappers share).
* It restores the Pause choice, adds html.ui-motion (which arms the base.css reveal-hiding rule),
* then watches [data-reveal], counts [data-count-up], binds [data-tilt] and every
* [data-motion-toggle] button. A page where this never runs shows everything: the SSR state is
* the final state (spec §6.3 rule 10).
*/
var MOTION_CLASS = "ui-motion";
/** Add html.ui-motion (idempotent). Components call this so reveals arm even without initMotion(). */
function armMotion() {
	if (!hasDOM()) return;
	const root = document.documentElement;
	root.classList.add(MOTION_CLASS);
	if (typeof document.startViewTransition === "function") root.classList.add("ui-vt");
}
var teardown = null;
/** Boot motion-lite once. Returns a teardown function (also idempotent). */
function initMotion(opts = {}) {
	if (!hasDOM()) return () => {};
	if (teardown) return teardown;
	const cleanups = [];
	restoreMotionPreference();
	armMotion();
	cleanups.push(subscribeMotion((isPaused) => {
		if (isPaused) {
			revealAll();
			unbindTilt();
		} else bindTilt();
	}));
	const start = () => {
		cleanups.push(watchReveals(opts.root));
		bindTilt();
		cleanups.push(unbindTilt);
		document.querySelectorAll(`[${MOTION_TOGGLE_ATTR}]`).forEach((b) => {
			if (b.hasAttribute("data-motion-toggle-bound")) return;
			b.setAttribute("data-motion-toggle-bound", "");
			const unbind = bindMotionToggle(b);
			cleanups.push(() => {
				unbind();
				b.removeAttribute("data-motion-toggle-bound");
			});
		});
		document.querySelectorAll("[data-count-up]").forEach((el) => cleanups.push(countUpWhenVisible(el)));
	};
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start, { once: true });
		cleanups.push(() => document.removeEventListener("DOMContentLoaded", start));
	} else start();
	teardown = () => {
		for (const c of cleanups.splice(0).reverse()) c();
		document.documentElement.classList.remove(MOTION_CLASS, "ui-vt");
		teardown = null;
	};
	return teardown;
}
//#endregion
export { finePointer as A, bindMotionToggle as C, storedMotionPaused as D, setMotionPaused as E, paused as F, reduced as I, tokenNumber as L, lowPower as M, motionOff as N, subscribeMotion as O, mq as P, MOTION_TOGGLE_ATTR as S, restoreMotionPreference as T, revealAll as _, transition as a, MOTION_CHANGE_EVENT as b, unbindTilt as c, formatNumber as d, isCountable as f, observeReveal as g, markRevealed as h, canTransition as i, hasDOM as j, toggleMotionPaused as k, countUp as l, REVEALED_ATTR as m, armMotion as n, bindTilt as o, parseNumber as p, initMotion as r, resetTilt as s, MOTION_CLASS as t, countUpWhenVisible as u, scanReveals as v, handleMotionToggleClick as w, MOTION_STORAGE_KEY as x, watchReveals as y };
