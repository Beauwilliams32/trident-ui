import { a as loadGeneratedColors, n as generatedColorsIfLoaded, o as onGeneratedColors, s as parseCssColor } from "./colors-C3CMEN7v.js";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
//#region src/three/env.ts
/** Viewport widths from spec §0.2: heroes need 980px; small scenes may go down to 768px. */
var HERO_MIN_WIDTH = 980;
var SMALL_SCENE_MIN_WIDTH = 768;
/** `[data-surface]` values where `<Lazy3D>` refuses to mount (spec §6.8). */
var FORBIDDEN_SURFACES = [
	"money",
	"auth",
	"legal",
	"admin"
];
var isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";
function media(query) {
	if (!isBrowser() || typeof window.matchMedia !== "function") return false;
	try {
		return window.matchMedia(query).matches;
	} catch {
		return false;
	}
}
var prefersReducedMotion = () => media("(prefers-reduced-motion: reduce)");
var isCoarsePointer = () => media("(pointer: coarse)");
/** The persistent "Pause motion" control sets html[data-motion="paused"] (spec §6.3 rule 5). */
function isMotionPaused() {
	if (!isBrowser()) return false;
	return document.documentElement.getAttribute("data-motion") === "paused";
}
/**
* Same thresholds as 07-motion.js (spec §0.2): Save-Data, deviceMemory < 4,
* hardwareConcurrency < 4, or an effective connection type of 2g (or slow-2g).
*/
function lowPower(nav = typeof navigator === "undefined" ? void 0 : navigator) {
	if (!nav) return false;
	const c = nav.connection;
	if (c?.saveData) return true;
	if (typeof c?.effectiveType === "string" && /(^|-)2g$/.test(c.effectiveType)) return true;
	if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return true;
	if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) return true;
	return false;
}
var viewportWidth = () => isBrowser() ? window.innerWidth || document.documentElement.clientWidth || 0 : 0;
var webgl2Cache;
/**
* WebGL2 availability. Only call this after the quality tier is known not to be 'off': the probe
* creates (and immediately releases) a throwaway WebGL2 context.
*/
function hasWebGL2() {
	if (webgl2Cache !== void 0) return webgl2Cache;
	if (!isBrowser() || typeof window.WebGL2RenderingContext === "undefined") return webgl2Cache = false;
	try {
		const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
		webgl2Cache = !!gl;
		gl?.getExtension("WEBGL_lose_context")?.loseContext();
	} catch {
		webgl2Cache = false;
	}
	return webgl2Cache;
}
var NON_FIELD_INPUTS = /* @__PURE__ */ new Set([
	"button",
	"submit",
	"reset",
	"image",
	"hidden"
]);
/** True for elements that count as "a form field has focus" (spec §6.8: no 3D while one does). */
function isFormField(el) {
	if (!el || typeof el.tagName !== "string") return false;
	const tag = el.tagName.toLowerCase();
	if (tag === "textarea" || tag === "select") return true;
	if (tag === "input") return !NON_FIELD_INPUTS.has((el.type || "text").toLowerCase());
	const editable = el.getAttribute("contenteditable");
	return editable !== null && editable !== "false";
}
var formFieldFocused = () => isBrowser() ? isFormField(document.activeElement) : false;
/** The forbidden `[data-surface]` an element sits under, if any. */
function forbiddenSurface(el) {
	let node = el ?? null;
	while (node) {
		const surface = node.getAttribute("data-surface");
		if (surface) {
			for (const token of surface.split(/[\s|,]+/)) if (FORBIDDEN_SURFACES.includes(token)) return token;
		}
		node = node.parentElement;
	}
	return null;
}
/**
* The tier rules (spec §6.4, §6.5). 'off' means no WebGL context may be created at all:
* reduced motion, Pause, lowPower (which "applies the 3D rule too"), or a viewport below 768px.
* 'low' covers the 768–979px band, coarse pointers and a PerformanceMonitor step-down.
*/
function computeQualityTier(i) {
	if (i.reducedMotion || i.paused || i.lowPower) return "off";
	if (i.width < 768) return "off";
	if (i.width < 980 || i.coarsePointer || i.performanceDeclined) return "low";
	return "high";
}
//#endregion
//#region src/three/useQualityTier.ts
var performanceDeclined = false;
var perfListeners = /* @__PURE__ */ new Set();
/** Called by `<SceneCanvas>` when PerformanceMonitor steps down past the dpr stage. */
function reportPerformanceDecline() {
	if (performanceDeclined) return;
	performanceDeclined = true;
	perfListeners.forEach((fn) => fn());
}
/** Test hook: clear the page-wide performance step-down. */
function resetPerformanceDecline() {
	performanceDeclined = false;
	perfListeners.forEach((fn) => fn());
}
/** Current tier, computed from live browser state. 'off' during SSR. */
function readQualityTier() {
	if (!isBrowser()) return "off";
	return computeQualityTier({
		reducedMotion: prefersReducedMotion(),
		paused: isMotionPaused(),
		lowPower: lowPower(),
		width: viewportWidth(),
		coarsePointer: isCoarsePointer(),
		performanceDeclined
	});
}
var QUERIES = ["(prefers-reduced-motion: reduce)", "(pointer: coarse)"];
/** Subscribe to every input of the tier: media queries, resize, Pause (html[data-motion]) and perf. */
function subscribeQuality(onChange) {
	if (!isBrowser()) return () => {};
	const cleanups = [];
	if (typeof window.matchMedia === "function") for (const q of QUERIES) try {
		const mql = window.matchMedia(q);
		if (typeof mql.addEventListener === "function") {
			mql.addEventListener("change", onChange);
			cleanups.push(() => mql.removeEventListener("change", onChange));
		}
	} catch {}
	window.addEventListener("resize", onChange, { passive: true });
	cleanups.push(() => window.removeEventListener("resize", onChange));
	if (typeof MutationObserver === "function") {
		const mo = new MutationObserver(onChange);
		mo.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-motion"]
		});
		cleanups.push(() => mo.disconnect());
	}
	perfListeners.add(onChange);
	cleanups.push(() => perfListeners.delete(onChange));
	return () => cleanups.forEach((fn) => fn());
}
var serverTier = () => "off";
/**
* `off` | `low` | `high` (spec §6.5), from reduced motion, lowPower, viewport width,
* PerformanceMonitor and the Pause state. `off` means no WebGL context may be created.
* Always `off` on the server and during hydration, so SSR renders the poster.
*/
function useQualityTier() {
	return useSyncExternalStore(subscribeQuality, readQualityTier, serverTier);
}
//#endregion
//#region src/three/useTokenColor.ts
/**
* The element whose theme a scene should read. `<Lazy3D>` provides its own container, so a scene
* inside a nested `[data-theme]` (the gallery, a themed card) picks up that theme. R3F 9 bridges
* React context into the canvas, so hooks inside the scene see it too.
*/
var ThemeScopeContext = createContext(null);
/** Returned for a role before the generated map has loaded and no CSS value is available. */
var UNRESOLVED_COLOR = 16777215;
var EMPTY = Object.freeze({});
function scopeElement(scope) {
	if (scope) return scope;
	return isBrowser() ? document.documentElement : null;
}
function themeOf(el, opts) {
	return {
		theme: opts?.theme ?? el?.closest("[data-theme]")?.getAttribute("data-theme") ?? "trident-studio",
		palette: opts?.palette ?? el?.closest("[data-portal-palette]")?.getAttribute("data-portal-palette") ?? void 0
	};
}
function generatedRole(theme, palette, role) {
	return generatedColorsIfLoaded(theme, palette)?.[role] ?? generatedColorsIfLoaded("trident-studio")?.[role] ?? 16777215;
}
/**
* One role as a 0xRRGGBB int. Runtime first (the computed `--ui-<role>` custom property, so a
* tenant accent passed through ensureContrast wins), falling back to the generated
* `@trident/ui/three.mjs` value for the active theme. Never reads the DOM during SSR.
*/
function readTokenColor(role, scope = null, opts) {
	const el = scopeElement(scope);
	const { theme, palette } = themeOf(el, opts);
	if (el && !opts?.theme && typeof getComputedStyle === "function") {
		const live = parseCssColor(getComputedStyle(el).getPropertyValue(`--ui-${role}`));
		if (live !== null) return live;
	}
	return generatedRole(theme, palette, role);
}
/** Every hex role of the active theme as ints, runtime values layered over generated ones. */
function readBrandColors(scope = null, opts) {
	const el = scopeElement(scope);
	const { theme, palette } = themeOf(el, opts);
	const generated = generatedColorsIfLoaded(theme, palette) ?? EMPTY;
	if (!el || opts?.theme || typeof getComputedStyle !== "function") return generated;
	const style = getComputedStyle(el);
	let out = null;
	for (const role of Object.keys(generated)) {
		const live = parseCssColor(style.getPropertyValue(`--ui-${role}`));
		if (live !== null && live !== generated[role]) (out ??= { ...generated })[role] = live;
	}
	return out ? Object.freeze(out) : generated;
}
function subscribeTheme(onChange) {
	const offGenerated = onGeneratedColors(onChange);
	if (!isBrowser() || typeof MutationObserver !== "function") return offGenerated;
	const root = document.documentElement;
	const tree = new MutationObserver(onChange);
	tree.observe(root, {
		attributes: true,
		subtree: true,
		attributeFilter: [
			"data-theme",
			"data-scheme",
			"data-portal-palette"
		]
	});
	const inline = new MutationObserver(onChange);
	inline.observe(root, {
		attributes: true,
		attributeFilter: ["style", "class"]
	});
	return () => {
		offGenerated();
		tree.disconnect();
		inline.disconnect();
	};
}
/** Make sure the generated fallback is (being) fetched once a hook is used on the client. */
function useGeneratedColors() {
	useEffect(() => {
		loadGeneratedColors();
	}, []);
}
/** A single brand/role colour for three.js, e.g. `useTokenColor('accent-1')`. */
function useTokenColor(role, opts) {
	useGeneratedColors();
	const scope = useContext(ThemeScopeContext);
	const theme = opts?.theme;
	const palette = opts?.palette;
	const get = useCallback(() => readTokenColor(role, scope, {
		theme,
		palette
	}), [
		role,
		scope,
		theme,
		palette
	]);
	const server = useCallback(() => generatedRole(theme ?? "trident-studio", palette, role), [
		role,
		theme,
		palette
	]);
	return useSyncExternalStore(subscribeTheme, get, server);
}
var brandCache = /* @__PURE__ */ new Map();
function stable(map) {
	const key = JSON.stringify(map);
	const hit = brandCache.get(key);
	if (hit) return hit;
	if (brandCache.size > 64) brandCache.clear();
	brandCache.set(key, map);
	return map;
}
/** All hex roles of the active theme (bg, ink, accent-1, accent-2, status-live, ...) as ints. */
function useBrandColors(opts) {
	useGeneratedColors();
	const scope = useContext(ThemeScopeContext);
	const theme = opts?.theme;
	const palette = opts?.palette;
	const get = useCallback(() => stable(readBrandColors(scope, {
		theme,
		palette
	})), [
		scope,
		theme,
		palette
	]);
	const server = useCallback(() => generatedColorsIfLoaded(theme ?? "trident-studio", palette) ?? EMPTY, [theme, palette]);
	return useSyncExternalStore(subscribeTheme, get, server);
}
//#endregion
//#region src/three/statusCards.ts
var MAX_STATUS_CARDS = 10;
/** The eight marketed platforms (state unknown, never lit) plus the two workflow cards. */
var FALLBACK_STATUS_ITEMS = Object.freeze([
	{
		id: "instagram",
		label: "Instagram",
		color: "#E1306C",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "tiktok",
		label: "TikTok",
		color: "#010101",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "facebook",
		label: "Facebook",
		color: "#1877F2",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "youtube",
		label: "YouTube",
		color: "#FF0000",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "approved",
		label: "Approved ✓",
		color: "#10b981",
		kind: "workflow",
		live: false,
		state: "workflow"
	},
	{
		id: "linkedin",
		label: "LinkedIn",
		color: "#0A66C2",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "pinterest",
		label: "Pinterest",
		color: "#E60023",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "threads",
		label: "Threads",
		color: "#101010",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "x",
		label: "X",
		color: "#0f1419",
		kind: "platform",
		live: false,
		state: "unknown"
	},
	{
		id: "scheduled",
		label: "Scheduled",
		color: "#7c3aed",
		kind: "workflow",
		live: false,
		state: "workflow"
	}
]);
function cardState(item) {
	if (!item || item.kind === "workflow") return "workflow";
	if (item.live === true) return "live";
	return item.state === "pending" ? "pending" : "unknown";
}
/**
* Caller items first, then the fallback fills the gaps; de-duplicated by id (or label), capped at
* MAX_STATUS_CARDS. `live` survives only when it is literally `true` on a platform item.
*/
function statusCards(items) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const given = Array.isArray(items) ? items : [];
	for (const raw of [...given, ...FALLBACK_STATUS_ITEMS]) {
		if (out.length >= 10) break;
		if (!raw || typeof raw.label !== "string" || !raw.label) continue;
		const key = String(raw.id || raw.label);
		if (seen.has(key)) continue;
		seen.add(key);
		const kind = raw.kind === "workflow" ? "workflow" : "platform";
		const live = kind === "platform" && raw.live === true;
		const state = cardState({
			...raw,
			kind,
			live
		});
		out.push({
			key,
			label: raw.label,
			color: raw.color || "#7c3aed",
			kind,
			live,
			state
		});
	}
	return out;
}
/** Text for the DOM list (and the card's second line). State never relies on colour alone. */
function stateText(state) {
	switch (state) {
		case "live": return "Publishing";
		case "pending": return "In review";
		case "workflow": return "Workflow step";
		default: return "Status not confirmed";
	}
}
/**
* Ring radius multiplier for a scroll offset (hero-3d.js ringScale): 1 at the top, easing to
* `minScale` over the first `span` px (smoothstep, clamped).
*/
function ringScale(scrollY, span = 600, minScale = .7) {
	const p = Math.max(0, Math.min(1, (Number(scrollY) || 0) / (span || 600)));
	const eased = p * p * (3 - 2 * p);
	return 1 - (1 - minScale) * eased;
}
/** Pointer/scroll camera movement inside a decorative canvas is capped at ±4° (spec §6.3 rule 3). */
var MAX_POINTER_TILT = 4 * Math.PI / 180;
/** Pointer position (0..1 across the viewport) to a tilt within ±MAX_POINTER_TILT. */
function pointerTilt(fraction) {
	return ((Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : .5) - .5) * 2 * MAX_POINTER_TILT;
}
//#endregion
//#region src/three/fpsGuard.ts
/**
* Sustained-low-frame-rate detector for `<SceneCanvas>` (spec §6.5: swap to the poster below
* 40fps for 3s). Frame deltas are grouped into ~0.5s buckets; the guard trips once consecutive
* low buckets add up to `windowMs`. A single long gap (tab switch, demand loop) resets it instead
* of counting as slowness. Pure and framework-free, so it is unit-tested directly.
*/
var FpsGuard = class {
	minFps;
	windowMs;
	bucketMs;
	maxGapMs;
	bucketTime = 0;
	bucketFrames = 0;
	lowTime = 0;
	trippedFlag = false;
	constructor(minFps = 40, windowMs = 3e3, bucketMs = 500, maxGapMs = 1e3) {
		this.minFps = minFps;
		this.windowMs = windowMs;
		this.bucketMs = bucketMs;
		this.maxGapMs = maxGapMs;
	}
	get tripped() {
		return this.trippedFlag;
	}
	/** Feed one frame's delta in seconds. Returns true once the guard has tripped. */
	push(deltaSeconds) {
		if (this.trippedFlag) return true;
		const ms = deltaSeconds * 1e3;
		if (!(ms > 0) || ms > this.maxGapMs) {
			this.reset();
			return false;
		}
		this.bucketTime += ms;
		this.bucketFrames += 1;
		if (this.bucketTime >= this.bucketMs) {
			const fps = this.bucketFrames * 1e3 / this.bucketTime;
			this.lowTime = fps < this.minFps ? this.lowTime + this.bucketTime : 0;
			this.bucketTime = 0;
			this.bucketFrames = 0;
			if (this.lowTime >= this.windowMs) this.trippedFlag = true;
		}
		return this.trippedFlag;
	}
	reset() {
		this.bucketTime = 0;
		this.bucketFrames = 0;
		this.lowTime = 0;
		this.trippedFlag = false;
	}
};
//#endregion
export { isMotionPaused as A, computeQualityTier as C, isBrowser as D, hasWebGL2 as E, viewportWidth as M, isCoarsePointer as O, SMALL_SCENE_MIN_WIDTH as S, formFieldFocused as T, reportPerformanceDecline as _, cardState as a, FORBIDDEN_SURFACES as b, stateText as c, UNRESOLVED_COLOR as d, readBrandColors as f, readQualityTier as g, useTokenColor as h, MAX_STATUS_CARDS as i, lowPower as j, isFormField as k, statusCards as l, useBrandColors as m, FALLBACK_STATUS_ITEMS as n, pointerTilt as o, readTokenColor as p, MAX_POINTER_TILT as r, ringScale as s, FpsGuard as t, ThemeScopeContext as u, resetPerformanceDecline as v, forbiddenSurface as w, HERO_MIN_WIDTH as x, useQualityTier as y };
