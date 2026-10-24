import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
//#region src/a11y/internal.ts
/** Joins class names, skipping falsy values. */
function cx$1(...parts) {
	return parts.filter(Boolean).join(" ");
}
/**
* True outside production builds. Consumers' bundlers replace `process.env.NODE_ENV` statically;
* where nothing replaces it and `process` does not exist (a raw browser), this is false.
*/
function isDev() {
	try {
		return process.env.NODE_ENV !== "production";
	} catch {
		return false;
	}
}
var warned = /* @__PURE__ */ new Set();
/** console.warn once per distinct key, dev builds only. */
function devWarnOnce(key, message) {
	if (!isDev() || warned.has(key)) return;
	warned.add(key);
	console.warn(`[@trident/ui] ${message}`);
}
/** Combines several refs (object or callback) into one callback ref. */
function mergeRefs(...refs) {
	return (node) => {
		for (const ref of refs) if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
}
//#endregion
//#region src/layout/Container.tsx
/** Centred content column with the fluid gutter (clamp(16px, 4vw, 32px); never under 16px). */
function Container({ size = "marketing", as = "div", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$1("ui-container", `ui-container-${size}`, className)
	});
}
//#endregion
//#region src/layout/Section.tsx
/**
* A page band: vertical rhythm, optional background tone and a centred Container.
* A `<section>` is only a landmark when it has an accessible name, so pass `aria-labelledby`
* pointing at its Heading when the band is a meaningful region.
*/
function Section({ space = "md", tone = "default", container = "marketing", as = "section", className, children, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$1("ui-section", `ui-section-${space}`, tone !== "default" && `ui-section-${tone}`, className),
		children: container ? /* @__PURE__ */ jsx(Container, {
			size: container,
			children
		}) : children
	});
}
//#endregion
//#region src/type/outline.ts
/**
* Walks the headings under `root` in document order and reports every h1 after the first and
* every heading more than one level deeper than the heading before it. The first heading may be
* any level (a fragment may start at h2). SSR-safe: pass a root explicitly outside the browser.
*/
function checkHeadingOutline(root) {
	const issues = [];
	let previous;
	let h1s = 0;
	for (const el of Array.from(root.querySelectorAll("h1, h2, h3, h4, h5, h6"))) {
		const level = Number(el.tagName.charAt(1));
		if (level === 1 && ++h1s > 1) issues.push({
			kind: "multiple-h1",
			element: el,
			level,
			message: `Found h1 #${h1s} ("${label(el)}"); a page has exactly one h1.`
		});
		if (previous !== void 0 && level > previous + 1) issues.push({
			kind: "skipped-level",
			element: el,
			level,
			previous,
			message: `Heading level skipped: h${previous} is followed by h${level} ("${label(el)}"). Use h${previous + 1}, and change the look with the size prop.`
		});
		previous = level;
	}
	return issues;
}
function label(el) {
	const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
	return text.length > 40 ? `${text.slice(0, 39)}…` : text;
}
//#endregion
//#region src/type/Heading.tsx
var DEFAULT_SIZE = {
	1: "4xl",
	2: "3xl",
	3: "2xl",
	4: "xl",
	5: "lg",
	6: "md"
};
/**
* Heading with a required level. In development it warns (console.warn, once) when it is a
* second h1 on the page or skips a level after the previous heading (WCAG 1.3.1, spec §9).
*/
function Heading({ level, size, tone = "ink", className, ref, ...rest }) {
	const own = useRef(null);
	useEffect(() => {
		const el = own.current;
		if (!el || !isDev()) return;
		for (const issue of checkHeadingOutline(el.ownerDocument)) if (issue.element === el) devWarnOnce(`heading:${issue.kind}:${issue.message}`, issue.message);
	}, [level]);
	const Tag = `h${level}`;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref: mergeRefs(own, ref),
		className: cx$1("ui-heading", `ui-fs-${size ?? DEFAULT_SIZE[level]}`, tone !== "ink" && `ui-tone-${tone}`, className)
	});
}
//#endregion
//#region src/type/Text.tsx
/** Body text on the type scale. */
function Text({ as = "p", size = "base", tone = "ink", weight, measure, tabular, className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$1("ui-text", `ui-fs-${size}`, tone !== "ink" && `ui-tone-${tone}`, weight && `ui-weight-${weight}`, measure && "ui-measure", tabular && "ui-tabular", className)
	});
}
//#endregion
//#region src/type/Kicker.tsx
/** Eyebrow label above a heading: 12px, 600, +0.14em, uppercase (spec §4). */
function Kicker({ as = "p", tone = "accent", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$1("ui-kicker", `ui-kicker-${tone}`, className)
	});
}
//#endregion
//#region src/display/cx.ts
/** Join class names, skipping falsy values. Internal helper for the display and feedback groups. */
function cx(...parts) {
	return parts.filter(Boolean).join(" ");
}
//#endregion
//#region src/display/tone.ts
var TONES = [
	"neutral",
	"accent",
	"info",
	"ok",
	"warn",
	"danger"
];
var ALIASES = {
	violet: "accent",
	blue: "info",
	gold: "warn",
	success: "ok",
	warning: "warn",
	error: "danger"
};
/** Semantic role (the `--ui-<role>` token) each tone reads. */
var TONE_ROLE = {
	neutral: "ink-2",
	accent: "accent-text",
	info: "info",
	ok: "ok",
	warn: "warn",
	danger: "danger"
};
/** Fill = color-mix(in srgb, <role> TONE_TINT_PCT%, var(--ui-surface)). Mirrored in styles.css. */
var TONE_TINT_PCT = 12;
/** Text = color-mix(in srgb, <role> (100 - TONE_INK_PCT)%, var(--ui-ink)). Mirrored in styles.css. */
var TONE_INK_PCT = 25;
/** Resolve any accepted tone name to a canonical tone. Unknown values fall back to `fallback`. */
function normalizeTone(tone, fallback = "neutral") {
	if (!tone) return fallback;
	if (TONES.includes(tone)) return tone;
	return ALIASES[tone] ?? fallback;
}
/** Plain-language name of a tone, for visually hidden prefixes ("Error: ..."). */
var TONE_LABEL = {
	neutral: "Note",
	accent: "Note",
	info: "Info",
	ok: "Success",
	warn: "Warning",
	danger: "Error"
};
//#endregion
//#region src/display/Badge.tsx
/**
* Small pill label for counts, categories and inline flags (spec §7 P0; portal `_ds_bundle.js` Badge).
* Always text plus colour; the tone colours are contrast-tested in every theme (tone.test.ts).
*/
function Badge({ children, tone = "neutral", size = "md", icon, className, ...rest }) {
	const t = normalizeTone(tone);
	return /* @__PURE__ */ jsxs("span", {
		...rest,
		className: cx("ui-badge", "ui-tone", className),
		"data-tone": t,
		"data-size": size,
		children: [icon ? /* @__PURE__ */ jsx("span", {
			className: "ui-badge__icon",
			"aria-hidden": "true",
			children: icon
		}) : null, children]
	});
}
//#endregion
//#region src/display/motion-gate.ts
/**
* The motion gate (spec §0.2, §6.4) as a runtime check, for pointer effects that need JS (Card tilt).
* Mirrors the CSS gate in styles.css: html.ui-motion, no reduced-motion preference, motion not
* paused, and a fine hover-capable pointer. Safe to import on the server: it reads `window` and
* `document` only when called, and returns false when they are absent.
*/
function pointerMotionAllowed() {
	if (typeof window === "undefined" || typeof document === "undefined") return false;
	const html = document.documentElement;
	if (!html.classList.contains("ui-motion")) return false;
	if (html.getAttribute("data-motion") === "paused") return false;
	if (typeof window.matchMedia !== "function") return false;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
	return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
//#endregion
//#region src/display/Card.tsx
var PADDINGS = [
	"none",
	"sm",
	"md",
	"lg"
];
function setTilt(el, x, y) {
	el.style.setProperty("--ui-tilt-x", x.toFixed(3));
	el.style.setProperty("--ui-tilt-y", y.toFixed(3));
}
/**
* The base surface (spec §7 P0; portal `_ds_bundle.js` Card). SSR renders the final, static card;
* the specular sweep and tilt are enhancements that only run behind the motion gate (spec §6.4), so
* reduced motion, Pause and no-JS all see the same card without movement.
*/
function Card({ children, variant = "solid", interactive = false, accent = false, tilt = false, padding = "md", as, className, style, onPointerMove, onPointerLeave, ...rest }) {
	const Tag = as ?? "div";
	const isInteractive = interactive || variant === "interactive";
	const surface = variant === "glass" ? "glass" : "solid";
	const named = PADDINGS.includes(padding);
	const mergedStyle = named ? style : {
		padding,
		...style
	};
	const handleMove = tilt ? (e) => {
		onPointerMove?.(e);
		if (e.pointerType !== "mouse" || !pointerMotionAllowed()) return;
		const r = e.currentTarget.getBoundingClientRect();
		if (!r.width || !r.height) return;
		setTilt(e.currentTarget, (e.clientY - r.top) / r.height * 2 - 1, (e.clientX - r.left) / r.width * 2 - 1);
	} : onPointerMove;
	const handleLeave = tilt ? (e) => {
		onPointerLeave?.(e);
		setTilt(e.currentTarget, 0, 0);
	} : onPointerLeave;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		className: cx("ui-card", className),
		"data-variant": surface,
		"data-padding": named ? padding : void 0,
		"data-interactive": isInteractive ? "" : void 0,
		"data-accent": accent ? "" : void 0,
		"data-tilt": tilt ? "" : void 0,
		style: mergedStyle,
		onPointerMove: handleMove,
		onPointerLeave: handleLeave,
		children
	});
}
//#endregion
export { cx$1 as _, TONE_INK_PCT as a, TONE_TINT_PCT as c, Kicker as d, Text as f, Container as g, Section as h, TONES as i, normalizeTone as l, checkHeadingOutline as m, pointerMotionAllowed as n, TONE_LABEL as o, Heading as p, Badge as r, TONE_ROLE as s, Card as t, cx as u, devWarnOnce as v };
