import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Fragment as Fragment$1, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, CircleAlert, CircleCheck, Info, LoaderCircle, Minus, TriangleAlert, X } from "lucide-react";
import { useFormStatus } from "react-dom";
//#region src/a11y/internal.ts
/** Joins class names, skipping falsy values. */
function cx$2(...parts) {
	return parts.filter(Boolean).join(" ");
}
/**
* True outside production builds. Consumers' bundlers replace `process.env.NODE_ENV` statically;
* where nothing replaces it and `process` does not exist (a raw browser), this is false.
*/
function isDev$1() {
	try {
		return process.env.NODE_ENV !== "production";
	} catch {
		return false;
	}
}
var warned = /* @__PURE__ */ new Set();
/** console.warn once per distinct key, dev builds only. */
function devWarnOnce(key, message) {
	if (!isDev$1() || warned.has(key)) return;
	warned.add(key);
	console.warn(`[@trident/ui] ${message}`);
}
/** Combines several refs (object or callback) into one callback ref. */
function mergeRefs$1(...refs) {
	return (node) => {
		for (const ref of refs) if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
}
//#endregion
//#region src/a11y/SkipLink.tsx
/**
* First focusable element on every page (WCAG 2.4.1). Off screen until it receives focus, then
* shown top-left above the sticky nav. A plain anchor: works with no JavaScript.
* Give the target `tabIndex={-1}` if it is not itself focusable, so focus moves with the jump.
*/
function SkipLink({ targetId = "main", children = "Skip to content", className, ...rest }) {
	return /* @__PURE__ */ jsx("a", {
		...rest,
		href: `#${targetId}`,
		className: cx$2("ui-skip-link", className),
		children
	});
}
//#endregion
//#region src/a11y/VisuallyHidden.tsx
/**
* Content for assistive technology only: read by screen readers, invisible on screen.
* If it contains a focusable element it becomes visible while focused (the class uses
* `:not(:focus):not(:active)`), so keyboard users are never focused on something invisible.
*/
function VisuallyHidden({ as = "span", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-visually-hidden", className)
	});
}
//#endregion
//#region src/a11y/LiveAnnouncer.tsx
var AnnouncerContext = createContext(null);
/**
* Renders one polite and one assertive live region (both present in the SSR markup, empty) and
* provides `useAnnouncer()` to its subtree. Mount it once near the root of the app.
*
* Each announcement first empties its region, then writes the message on the next tick, so the
* same message said twice is still read twice.
*/
function LiveAnnouncer({ children, clearAfter = 7e3 }) {
	const [polite, setPolite] = useState("");
	const [assertive, setAssertive] = useState("");
	const timers = useRef({
		polite: [],
		assertive: []
	});
	useEffect(() => {
		const t = timers.current;
		return () => {
			for (const id of [...t.polite, ...t.assertive]) clearTimeout(id);
		};
	}, []);
	const announce = useCallback((message, politeness = "polite") => {
		const set = politeness === "assertive" ? setAssertive : setPolite;
		const own = timers.current[politeness];
		for (const id of own.splice(0)) clearTimeout(id);
		set("");
		own.push(setTimeout(() => set(message), 50));
		if (clearAfter > 0) own.push(setTimeout(() => set(""), 50 + clearAfter));
	}, [clearAfter]);
	const value = useMemo(() => announce, [announce]);
	return /* @__PURE__ */ jsxs(AnnouncerContext.Provider, {
		value,
		children: [
			children,
			/* @__PURE__ */ jsx("div", {
				className: "ui-visually-hidden",
				"aria-live": "polite",
				"aria-atomic": "true",
				"data-ui-live": "polite",
				children: polite
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ui-visually-hidden",
				"aria-live": "assertive",
				"aria-atomic": "true",
				"data-ui-live": "assertive",
				children: assertive
			})
		]
	});
}
var noop = () => {
	devWarnOnce("announcer-missing", "useAnnouncer() was called outside <LiveAnnouncer>; the message was not announced.");
};
/** Returns `announce(message, politeness?)`. Outside a LiveAnnouncer it is a no-op (dev warning). */
function useAnnouncer() {
	return useContext(AnnouncerContext) ?? noop;
}
//#endregion
//#region src/a11y/FocusRing.tsx
/** Class that draws the Trident focus ring on :focus-visible (2px --ui-focus, 2px offset). */
var focusRingClass = "ui-focus-ring";
/** Class that draws the ring on a container while a descendant has keyboard focus. */
var focusRingWithinClass = "ui-focus-ring-within";
/**
* Applies the design-system focus ring (spec §7, §9) to its single child: 2px `--ui-focus` with a
* 2px offset (at least 3:1 in every theme, tested by the contrast matrix), `Highlight` under
* forced colours, and never animated away. Native controls already get this ring from base.css;
* use FocusRing for custom focusable elements and for focus-within containers.
*/
function FocusRing({ children, within = false, inset = false }) {
	if (!isValidElement(children)) {
		devWarnOnce("focusring-child", "FocusRing expects exactly one React element child.");
		return children;
	}
	const props = children.props;
	return cloneElement(children, {
		className: cx$2(props.className, within ? focusRingWithinClass : focusRingClass),
		...inset ? { "data-focus-inset": "" } : {}
	});
}
//#endregion
//#region src/layout/Container.tsx
/** Centred content column with the fluid gutter (clamp(16px, 4vw, 32px); never under 16px). */
function Container({ size = "marketing", as = "div", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-container", `ui-container-${size}`, className)
	});
}
//#endregion
//#region src/layout/space.ts
/** Spacing steps (spec §5, 4px base). Values map to the --ui-space-* tokens. */
var SPACE_STEPS = [
	0,
	.5,
	1,
	1.5,
	2,
	3,
	4,
	5,
	6,
	8,
	10,
	12,
	16,
	20,
	24,
	32
];
/** Class for a gap step, e.g. 4 -> "ui-gap-4", 0.5 -> "ui-gap-0-5". */
function gapClass(step) {
	return `ui-gap-${String(step).replace(".", "-")}`;
}
//#endregion
//#region src/layout/Stack.tsx
/** Vertical flow with a consistent gap. Pure CSS; no inline styles (CSP-safe). */
function Stack({ gap = 4, align = "stretch", as = "div", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-stack", gapClass(gap), `ui-align-${align}`, className)
	});
}
//#endregion
//#region src/layout/Cluster.tsx
/** Horizontal group that wraps: button rows, tag lists, nav links. */
function Cluster({ gap = 2, justify = "start", align = "center", wrap = true, as = "div", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-cluster", gapClass(gap), `ui-justify-${justify}`, `ui-align-${align}`, !wrap && "ui-nowrap", className)
	});
}
//#endregion
//#region src/layout/Grid.tsx
/** CSS grid. Either a fixed column count or an auto-fit grid that never overflows at 360px. */
function Grid({ columns, min = "md", gap = 6, collapse = true, as = "div", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-grid", gapClass(gap), columns ? `ui-grid-cols-${columns}` : `ui-grid-min-${min}`, columns && collapse && "ui-grid-collapse", className)
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
		className: cx$2("ui-section", `ui-section-${space}`, tone !== "default" && `ui-section-${tone}`, className),
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
		if (!el || !isDev$1()) return;
		for (const issue of checkHeadingOutline(el.ownerDocument)) if (issue.element === el) devWarnOnce(`heading:${issue.kind}:${issue.message}`, issue.message);
	}, [level]);
	const Tag = `h${level}`;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref: mergeRefs$1(own, ref),
		className: cx$2("ui-heading", `ui-fs-${size ?? DEFAULT_SIZE[level]}`, tone !== "ink" && `ui-tone-${tone}`, className)
	});
}
//#endregion
//#region src/type/Text.tsx
/** Body text on the type scale. */
function Text({ as = "p", size = "base", tone = "ink", weight, measure, tabular, className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-text", `ui-fs-${size}`, tone !== "ink" && `ui-tone-${tone}`, weight && `ui-weight-${weight}`, measure && "ui-measure", tabular && "ui-tabular", className)
	});
}
//#endregion
//#region src/type/Kicker.tsx
/** Eyebrow label above a heading: 12px, 600, +0.14em, uppercase (spec §4). */
function Kicker({ as = "p", tone = "accent", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-kicker", `ui-kicker-${tone}`, className)
	});
}
//#endregion
//#region src/type/GradText.tsx
/** Counts words the way a reader would: whitespace-separated runs. */
function countWords(text) {
	const t = text.trim();
	return t ? t.split(/\s+/).length : 0;
}
/**
* Accent-gradient text for one or two words of a display heading. Falls back to the solid
* `--ui-accent-text` colour where background-clip:text is unsupported, and to CanvasText under
* forced colours. Use it at display sizes only: the gradient's second stop is a fill colour.
*/
function GradText({ children, className, ...rest }) {
	if (countWords(children) > 2) devWarnOnce(`gradtext:${children}`, `GradText is for one or two words; got "${children}". Wrap only the key word(s).`);
	return /* @__PURE__ */ jsx("span", {
		...rest,
		className: cx$2("ui-grad-text", className),
		children
	});
}
//#endregion
//#region src/type/Mono.tsx
/** Monospace run with tabular numerals: prices, IDs, timestamps (spec §4). Not code; use Code. */
function Mono({ className, ...rest }) {
	return /* @__PURE__ */ jsx("span", {
		...rest,
		className: cx$2("ui-mono", className)
	});
}
//#endregion
//#region src/type/Code.tsx
/** Inline code or a code block. */
function Code({ block = false, label, className, children, ...rest }) {
	if (!block) return /* @__PURE__ */ jsx("code", {
		...rest,
		className: cx$2("ui-code", className),
		children
	});
	return /* @__PURE__ */ jsx("pre", {
		className: cx$2("ui-code-block", className),
		tabIndex: 0,
		...label ? {
			role: "region",
			"aria-label": label
		} : {},
		children: /* @__PURE__ */ jsx("code", {
			...rest,
			children
		})
	});
}
//#endregion
//#region src/type/Kbd.tsx
/** Keyboard input. A combination uses nested <kbd> elements, as the HTML spec describes. */
function Kbd({ keys, className, children, ...rest }) {
	if (!keys || keys.length === 0) return /* @__PURE__ */ jsx("kbd", {
		...rest,
		className: cx$2("ui-kbd", className),
		children
	});
	return /* @__PURE__ */ jsx("kbd", {
		...rest,
		className: cx$2("ui-kbd-combo", className),
		children: keys.map((k, i) => /* @__PURE__ */ jsxs(Fragment$1, { children: [i > 0 && /* @__PURE__ */ jsx("span", {
			className: "ui-kbd-sep",
			children: "+"
		}), /* @__PURE__ */ jsx("kbd", {
			className: "ui-kbd",
			children: k
		})] }, `${k}-${i}`))
	});
}
//#endregion
//#region src/type/Prose.tsx
/**
* Typography for long-form HTML you do not control element by element (legal pages, CMS or
* Markdown output): rhythm, 68ch measure, underlined links, lists, quotes, code and tables.
* It styles markup only; it never rewrites heading levels, so the source must be well ordered.
*/
function Prose({ as = "div", className, ...rest }) {
	return /* @__PURE__ */ jsx(as, {
		...rest,
		className: cx$2("ui-prose", className)
	});
}
//#endregion
//#region src/type/scale.ts
/** Type scale steps (spec §4). Values map to the --ui-text-* tokens. */
var TEXT_SIZES = [
	"2xs",
	"xs",
	"sm",
	"base",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"display"
];
//#endregion
//#region src/actions/internal.ts
/** Join truthy class names. */
function cx$1(...parts) {
	return parts.filter(Boolean).join(" ");
}
/** Join space-separated id lists (aria-describedby), dropping empties. Returns undefined when empty. */
function joinIds(...ids) {
	const out = ids.filter((v) => typeof v === "string" && v.trim() !== "").join(" ").trim();
	return out === "" ? void 0 : out;
}
/** True outside production builds. Guarded so it never throws where `process` does not exist. */
function isDev() {
	try {
		return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
	} catch {
		return false;
	}
}
/** Development-only console warning, prefixed with the package name. */
function devWarn(message) {
	if (isDev()) console.warn(`[@trident/ui] ${message}`);
}
/** Merge several refs (React 19 passes `ref` as a normal prop) into one callback ref. */
function mergeRefs(...refs) {
	return (value) => {
		for (const ref of refs) if (typeof ref === "function") ref(value);
		else if (ref && typeof ref === "object") ref.current = value;
	};
}
//#endregion
//#region src/actions/Button.tsx
/** Pixel heights per size, for consumers that need the number (e.g. aligning a sibling input). */
var BUTTON_HEIGHTS = {
	sm: 32,
	md: 36,
	lg: 44
};
var ICON_SIZE = {
	sm: 16,
	md: 16,
	lg: 20
};
var ICON_ONLY_SIZE = {
	sm: 16,
	md: 18,
	lg: 20
};
/** The class list a Button renders. Exported so server templates without React can match it. */
function buttonClassName({ variant = "primary", size = "md", fullWidth, iconOnly, className } = {}) {
	return cx$1("ui-btn", `ui-btn--${variant}`, `ui-btn--${size}`, fullWidth && "ui-btn--block", iconOnly && "ui-btn--icon", className);
}
function Icon({ icon: IconComponent, size }) {
	return /* @__PURE__ */ jsx(IconComponent, {
		className: "ui-btn__icon",
		size,
		strokeWidth: 2,
		"aria-hidden": "true",
		focusable: "false"
	});
}
function Spinner({ size }) {
	return /* @__PURE__ */ jsx("span", {
		className: "ui-btn__spinner",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx(LoaderCircle, {
			size,
			strokeWidth: 2.25,
			focusable: "false"
		})
	});
}
function Button({ variant = "primary", size = "md", icon, iconEnd, fullWidth, loading = false, loadingLabel, type = "button", className, children, onClick, ref, ...rest }) {
	const ariaDisabled = rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
	const blocked = loading || ariaDisabled;
	const handleClick = (event) => {
		if (blocked) {
			event.preventDefault();
			return;
		}
		onClick?.(event);
	};
	const iconSize = ICON_SIZE[size];
	const swapName = loading && Boolean(loadingLabel);
	return /* @__PURE__ */ jsxs("button", {
		...rest,
		ref,
		type,
		className: buttonClassName({
			variant,
			size,
			fullWidth,
			className
		}),
		onClick: handleClick,
		"aria-disabled": blocked ? true : rest["aria-disabled"],
		"aria-busy": loading || void 0,
		"data-loading": loading ? "" : void 0,
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "ui-btn__label",
				"aria-hidden": swapName || void 0,
				children: [
					icon ? /* @__PURE__ */ jsx(Icon, {
						icon,
						size: iconSize
					}) : null,
					children,
					iconEnd ? /* @__PURE__ */ jsx(Icon, {
						icon: iconEnd,
						size: iconSize
					}) : null
				]
			}),
			loading ? /* @__PURE__ */ jsx(Spinner, { size: iconSize }) : null,
			swapName ? /* @__PURE__ */ jsx("span", {
				className: "ui-visually-hidden",
				children: loadingLabel
			}) : null
		]
	});
}
/** An `<a href>` styled as a button. Use for navigation; use Button for actions. */
function LinkButton({ variant = "primary", size = "md", icon, iconEnd, fullWidth, className, children, target, rel, ref, ...rest }) {
	const iconSize = ICON_SIZE[size];
	const safeRel = target === "_blank" && rel === void 0 ? "noopener noreferrer" : rel;
	return /* @__PURE__ */ jsx("a", {
		...rest,
		ref,
		target,
		rel: safeRel,
		className: buttonClassName({
			variant,
			size,
			fullWidth,
			className
		}),
		children: /* @__PURE__ */ jsxs("span", {
			className: "ui-btn__label",
			children: [
				icon ? /* @__PURE__ */ jsx(Icon, {
					icon,
					size: iconSize
				}) : null,
				children,
				iconEnd ? /* @__PURE__ */ jsx(Icon, {
					icon: iconEnd,
					size: iconSize
				}) : null
			]
		})
	});
}
/** A square, icon-only button. `aria-label` is required by the type and checked at runtime in dev. */
function IconButton({ icon, size = "md", variant = "ghost", loading = false, type = "button", className, onClick, ref, ...rest }) {
	if (!rest["aria-label"] || rest["aria-label"].trim() === "") devWarn("IconButton requires a non-empty aria-label.");
	const ariaDisabled = rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
	const blocked = loading || ariaDisabled;
	const handleClick = (event) => {
		if (blocked) {
			event.preventDefault();
			return;
		}
		onClick?.(event);
	};
	const iconSize = ICON_ONLY_SIZE[size];
	const content = /* @__PURE__ */ jsx(Icon, {
		icon,
		size: iconSize
	});
	return /* @__PURE__ */ jsxs("button", {
		...rest,
		ref,
		type,
		className: buttonClassName({
			variant,
			size,
			iconOnly: true,
			className
		}),
		onClick: handleClick,
		"aria-disabled": blocked ? true : rest["aria-disabled"],
		"aria-busy": loading || void 0,
		"data-loading": loading ? "" : void 0,
		children: [/* @__PURE__ */ jsx("span", {
			className: "ui-btn__label",
			children: content
		}), loading ? /* @__PURE__ */ jsx(Spinner, { size: iconSize }) : null]
	});
}
//#endregion
//#region src/forms/Form.tsx
/** Default CSRF field name. Override per app to match the server (e.g. "csrf_token"). */
var DEFAULT_CSRF_FIELD = "_csrf";
/** Hidden CSRF input. The value comes from the server render (spec §7, §8 Auth / Money). */
function CsrfField({ value, name = DEFAULT_CSRF_FIELD, ...rest }) {
	if (!value) devWarn("CsrfField rendered without a token value; the server will reject this POST.");
	return /* @__PURE__ */ jsx("input", {
		...rest,
		type: "hidden",
		name,
		value,
		autoComplete: "off"
	});
}
/**
* A native `<form>` that works with JavaScript disabled: method="post" by default, a real `action`,
* and an optional server-supplied CSRF field. Hydration only adds enhancement (validation, pending).
*/
function Form({ method = "post", action, csrfToken, csrfFieldName, className, children, ref, ...rest }) {
	const isFunctionAction = typeof action === "function";
	return /* @__PURE__ */ jsxs("form", {
		...rest,
		ref,
		action,
		method: isFunctionAction ? void 0 : method,
		className: cx$1("ui-form", className),
		children: [csrfToken !== void 0 ? /* @__PURE__ */ jsx(CsrfField, {
			value: csrfToken,
			name: csrfFieldName
		}) : null, children]
	});
}
//#endregion
//#region src/forms/context.ts
/**
* Turn a form field name into the element id that Field, Fieldset and ErrorSummary agree on, so a
* server that only knows field names can link its error summary to the fields (spec §9).
* `email` -> `email`, `user[email]` -> `user-email`, `items[0].qty` -> `items-0-qty`.
*/
function fieldId(name) {
	const id = name.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
	return id === "" ? "field" : id;
}
var FieldContext = createContext(null);
var ChoiceGroupContext = createContext(null);
/** Merge a control's own props with the enclosing Field's wiring. Explicit props win. */
function useFieldControl(props) {
	const field = useContext(FieldContext);
	const invalid = Boolean(props.invalid ?? field?.invalid);
	return {
		id: props.id ?? field?.id,
		name: props.name ?? field?.name,
		required: props.required ?? (field?.required || void 0),
		disabled: props.disabled ?? (field?.disabled || void 0),
		"aria-describedby": joinIds(field?.hintId, field?.errorId, props["aria-describedby"]),
		"aria-invalid": invalid ? true : props["aria-invalid"]
	};
}
//#endregion
//#region src/forms/Field.tsx
/** Inline field error. "Error:" is announced before the message; the icon is decorative. */
function FieldErrorText({ id, className, children }) {
	return /* @__PURE__ */ jsxs("p", {
		id,
		className: cx$1("ui-field__error", className),
		children: [/* @__PURE__ */ jsx(CircleAlert, {
			className: "ui-field__error-icon",
			size: 16,
			strokeWidth: 2,
			"aria-hidden": "true",
			focusable: "false"
		}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
			className: "ui-visually-hidden",
			children: "Error: "
		}), children] })]
	});
}
function RequiredMark() {
	return /* @__PURE__ */ jsx("span", {
		className: "ui-field__req",
		"aria-hidden": "true",
		children: " *"
	});
}
/**
* Label + hint + error around a single control, wired with htmlFor / aria-describedby /
* aria-invalid / required through context. Pure markup: works in renderToStaticMarkup.
*/
function Field({ label, name, id, hint, error, required = false, disabled = false, className, children }) {
	const autoId = useId();
	const controlId = id ?? (name ? fieldId(name) : autoId);
	const hasError = error !== void 0 && error !== null && error !== false && error !== "";
	const hintId = hint ? `${controlId}-hint` : void 0;
	const errorId = hasError ? `${controlId}-error` : void 0;
	const ctx = {
		id: controlId,
		name,
		hintId,
		errorId,
		invalid: hasError,
		required,
		disabled
	};
	return /* @__PURE__ */ jsxs("div", {
		className: cx$1("ui-field", className),
		"data-invalid": hasError ? "" : void 0,
		children: [
			/* @__PURE__ */ jsxs("label", {
				className: "ui-field__label",
				htmlFor: controlId,
				children: [label, required ? /* @__PURE__ */ jsx(RequiredMark, {}) : null]
			}),
			hint ? /* @__PURE__ */ jsx("p", {
				id: hintId,
				className: "ui-field__hint",
				children: hint
			}) : null,
			hasError ? /* @__PURE__ */ jsx(FieldErrorText, {
				id: errorId,
				children: error
			}) : null,
			/* @__PURE__ */ jsx(FieldContext.Provider, {
				value: ctx,
				children
			})
		]
	});
}
/** `<fieldset>` + `<legend>` for a group of Radio, Checkbox or Switch options. */
function Fieldset({ legend, name, id, hint, error, required = false, disabled = false, className, children, ...rest }) {
	const autoId = useId();
	const groupId = id ?? (name ? fieldId(name) : autoId);
	const hasError = error !== void 0 && error !== null && error !== false && error !== "";
	const hintId = hint ? `${groupId}-hint` : void 0;
	const errorId = hasError ? `${groupId}-error` : void 0;
	const ctx = {
		name,
		invalid: hasError,
		required,
		disabled
	};
	const describedBy = [
		hintId,
		errorId,
		rest["aria-describedby"]
	].filter(Boolean).join(" ") || void 0;
	return /* @__PURE__ */ jsxs("fieldset", {
		...rest,
		id: groupId,
		disabled: disabled || void 0,
		"aria-describedby": describedBy,
		className: cx$1("ui-fieldset", className),
		"data-invalid": hasError ? "" : void 0,
		children: [
			/* @__PURE__ */ jsxs("legend", {
				className: "ui-fieldset__legend",
				children: [legend, required ? /* @__PURE__ */ jsx(RequiredMark, {}) : null]
			}),
			hint ? /* @__PURE__ */ jsx("p", {
				id: hintId,
				className: "ui-field__hint",
				children: hint
			}) : null,
			hasError ? /* @__PURE__ */ jsx(FieldErrorText, {
				id: errorId,
				children: error
			}) : null,
			/* @__PURE__ */ jsx(ChoiceGroupContext.Provider, {
				value: ctx,
				children: /* @__PURE__ */ jsx("div", {
					className: "ui-fieldset__options",
					children
				})
			})
		]
	});
}
//#endregion
//#region src/forms/controls.tsx
/** Native `<input>`. Picks up id, name, required, aria-describedby and aria-invalid from Field. */
function Input({ type = "text", invalid, className, ref, ...rest }) {
	const wired = useFieldControl({
		...rest,
		invalid
	});
	return /* @__PURE__ */ jsx("input", {
		...rest,
		...wired,
		ref,
		type,
		className: cx$1("ui-input", className)
	});
}
/** Native `<textarea>`, wired like Input. */
function Textarea({ invalid, rows = 4, className, ref, ...rest }) {
	const wired = useFieldControl({
		...rest,
		invalid
	});
	return /* @__PURE__ */ jsx("textarea", {
		...rest,
		...wired,
		ref,
		rows,
		className: cx$1("ui-input", "ui-textarea", className)
	});
}
/**
* Native `<select>` (spec §7: native everywhere in the root entry; the Radix select belongs to the
* `/app` entry for desktop app surfaces). Works without JavaScript.
*/
function Select({ options, placeholder, invalid, className, children, ref, ...rest }) {
	const wired = useFieldControl({
		...rest,
		invalid
	});
	const uncontrolled = rest.value === void 0 && rest.defaultValue === void 0;
	const defaultValue = placeholder !== void 0 && uncontrolled && !rest.multiple ? "" : rest.defaultValue;
	return /* @__PURE__ */ jsxs("span", {
		className: cx$1("ui-select", className),
		children: [/* @__PURE__ */ jsxs("select", {
			...rest,
			...wired,
			ref,
			defaultValue,
			className: "ui-input ui-select__control",
			children: [
				placeholder !== void 0 ? /* @__PURE__ */ jsx("option", {
					value: "",
					disabled: Boolean(wired.required),
					children: placeholder
				}) : null,
				options?.map((o) => /* @__PURE__ */ jsx(Option, {
					value: o.value,
					disabled: o.disabled,
					children: o.label
				}, o.value)),
				children
			]
		}), /* @__PURE__ */ jsx(ChevronDown, {
			className: "ui-select__icon",
			size: 18,
			strokeWidth: 2,
			"aria-hidden": "true",
			focusable: "false"
		})]
	});
}
function Option(props) {
	return /* @__PURE__ */ jsx("option", { ...props });
}
function useChoice(props) {
	const group = useContext(ChoiceGroupContext);
	const autoId = useId();
	const id = props.id ?? autoId;
	const hasError = props.error !== void 0 && props.error !== null && props.error !== false && props.error !== "";
	const hintId = props.hint ? `${id}-hint` : void 0;
	const errorId = hasError ? `${id}-error` : void 0;
	const invalid = Boolean(props.invalid ?? (hasError || group?.invalid));
	return {
		id,
		hasError,
		hintId,
		errorId,
		attrs: {
			id,
			name: props.name ?? group?.name,
			required: props.required ?? (group?.required || void 0),
			disabled: props.disabled ?? (group?.disabled || void 0),
			"aria-describedby": joinIds(hintId, errorId, props["aria-describedby"]),
			"aria-invalid": invalid ? true : props["aria-invalid"]
		}
	};
}
function ChoiceText({ id, label, hint, hintId, error, errorId, hasError }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("label", {
			className: "ui-choice__label",
			htmlFor: id,
			children: label
		}),
		hint ? /* @__PURE__ */ jsx("p", {
			id: hintId,
			className: "ui-choice__hint",
			children: hint
		}) : null,
		hasError ? /* @__PURE__ */ jsx(FieldErrorText, {
			id: errorId,
			className: "ui-choice__error",
			children: error
		}) : null
	] });
}
/** Native checkbox with a token-styled box. Submits `name=value` (default "on") without JS. */
function Checkbox(props) {
	const { label, hint, error, invalid: _invalid, className, ref, ...rest } = props;
	const c = useChoice(props);
	return /* @__PURE__ */ jsxs("div", {
		className: cx$1("ui-choice", "ui-choice--checkbox", className),
		children: [/* @__PURE__ */ jsxs("span", {
			className: "ui-choice__control",
			children: [/* @__PURE__ */ jsx("input", {
				...rest,
				...c.attrs,
				ref,
				type: "checkbox",
				className: "ui-choice__input"
			}), /* @__PURE__ */ jsx("span", {
				className: "ui-choice__box",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(Check, {
					className: "ui-choice__mark",
					size: 14,
					strokeWidth: 3,
					focusable: "false"
				})
			})]
		}), /* @__PURE__ */ jsx(ChoiceText, {
			id: c.id,
			label,
			hint,
			hintId: c.hintId,
			error,
			errorId: c.errorId,
			hasError: c.hasError
		})]
	});
}
/** Native radio. Put several inside a Fieldset (which supplies the shared name and legend). */
function Radio(props) {
	const { label, hint, error, invalid: _invalid, className, ref, ...rest } = props;
	const c = useChoice(props);
	return /* @__PURE__ */ jsxs("div", {
		className: cx$1("ui-choice", "ui-choice--radio", className),
		children: [/* @__PURE__ */ jsxs("span", {
			className: "ui-choice__control",
			children: [/* @__PURE__ */ jsx("input", {
				...rest,
				...c.attrs,
				ref,
				type: "radio",
				className: "ui-choice__input"
			}), /* @__PURE__ */ jsx("span", {
				className: "ui-choice__box",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx("span", { className: "ui-choice__dot" })
			})]
		}), /* @__PURE__ */ jsx(ChoiceText, {
			id: c.id,
			label,
			hint,
			hintId: c.hintId,
			error,
			errorId: c.errorId,
			hasError: c.hasError
		})]
	});
}
/**
* An on/off switch: a native checkbox with role="switch", so it submits like a checkbox without
* JavaScript and is announced as a switch. State is shown by thumb position, not colour alone.
*/
function Switch(props) {
	const { label, hint, error, invalid: _invalid, className, ref, ...rest } = props;
	const c = useChoice(props);
	return /* @__PURE__ */ jsxs("div", {
		className: cx$1("ui-choice", "ui-choice--switch", className),
		children: [/* @__PURE__ */ jsxs("span", {
			className: "ui-choice__control ui-switch",
			children: [/* @__PURE__ */ jsx("input", {
				...rest,
				...c.attrs,
				ref,
				type: "checkbox",
				role: "switch",
				className: "ui-choice__input"
			}), /* @__PURE__ */ jsx("span", {
				className: "ui-switch__track",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx("span", { className: "ui-switch__thumb" })
			})]
		}), /* @__PURE__ */ jsx(ChoiceText, {
			id: c.id,
			label,
			hint,
			hintId: c.hintId,
			error,
			errorId: c.errorId,
			hasError: c.hasError
		})]
	});
}
//#endregion
//#region src/forms/FormError.tsx
/**
* A form-level error (e.g. "Your session expired, please try again"). role="alert" so a message
* that appears after an enhanced submit is announced; text is ink on surface, so contrast holds in
* every theme, and the danger colour is carried by the border and icon (never colour alone).
*/
function FormError({ title, children, className, ...rest }) {
	const empty = children === void 0 || children === null || children === false || children === "";
	if (empty && !title) return null;
	return /* @__PURE__ */ jsxs("div", {
		role: "alert",
		...rest,
		className: cx$1("ui-form-error", className),
		children: [/* @__PURE__ */ jsx(CircleAlert, {
			className: "ui-form-error__icon",
			size: 20,
			strokeWidth: 2,
			"aria-hidden": "true",
			focusable: "false"
		}), /* @__PURE__ */ jsxs("div", {
			className: "ui-form-error__body",
			children: [title ? /* @__PURE__ */ jsx("p", {
				className: "ui-form-error__title",
				children: title
			}) : null, empty ? null : /* @__PURE__ */ jsx("div", {
				className: "ui-form-error__message",
				children
			})]
		})]
	});
}
//#endregion
//#region src/forms/SubmitButton.tsx
/**
* A native `<button type="submit">` (works with JavaScript disabled). Once hydrated it:
* - shows the loading state after its form submits natively, or while a React form action is
*   pending (useFormStatus), which blocks double submits without removing the button's value;
* - re-enables on `pageshow`, so a page restored from the back/forward cache is usable again.
*/
function SubmitButton({ pending, pendingLabel, variant = "primary", ref, ...rest }) {
	const status = useFormStatus();
	const [submitted, setSubmitted] = useState(false);
	const own = useRef(null);
	useEffect(() => {
		const form = own.current?.form ?? null;
		const timers = /* @__PURE__ */ new Set();
		const onSubmit = (event) => {
			const timer = setTimeout(() => {
				timers.delete(timer);
				if (!event.defaultPrevented) setSubmitted(true);
			}, 0);
			timers.add(timer);
		};
		const onPageShow = () => setSubmitted(false);
		form?.addEventListener("submit", onSubmit);
		window.addEventListener("pageshow", onPageShow);
		return () => {
			form?.removeEventListener("submit", onSubmit);
			window.removeEventListener("pageshow", onPageShow);
			timers.forEach(clearTimeout);
		};
	}, []);
	const isPending = Boolean(pending) || status.pending || submitted;
	return /* @__PURE__ */ jsx(Button, {
		...rest,
		ref: mergeRefs(own, ref),
		type: "submit",
		variant,
		loading: isPending,
		loadingLabel: pendingLabel
	});
}
//#endregion
//#region src/forms/ErrorSummary.tsx
var isEmpty = (m) => m === void 0 || m === null || m === false || m === "";
function normalise(errors) {
	return (Array.isArray(errors) ? [...errors] : Object.entries(errors).map(([name, message]) => ({
		name,
		message
	}))).filter((e) => !isEmpty(e.message)).map((e) => ({
		href: `#${e.id ?? fieldId(e.name ?? "")}`,
		message: e.message
	}));
}
var FOCUSABLE = "input:not([type=\"hidden\"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
/**
* Error summary for the top of a form (spec §9: "error summaries link to their fields").
* Each entry is a real `<a href="#field-id">`, so it works without JavaScript; once hydrated, a
* click focuses the field (or the first control in a fieldset) and scrolls its label into view.
*/
function ErrorSummary({ errors, title = "There is a problem", description, headingLevel = 2, focusOnMount = true, id, className, ref }) {
	const items = normalise(errors);
	const headingId = useId();
	const own = useRef(null);
	const count = items.length;
	useEffect(() => {
		if (focusOnMount && count > 0) own.current?.focus();
	}, [focusOnMount, count]);
	if (count === 0) return null;
	const onLinkClick = (event, href) => {
		const target = document.getElementById(decodeURIComponent(href.slice(1)));
		if (!target) return;
		const control = target.matches(FOCUSABLE) ? target : target.querySelector(FOCUSABLE);
		if (!control) return;
		event.preventDefault();
		(target.closest(".ui-field, .ui-fieldset, .ui-choice") ?? target).scrollIntoView({ block: "start" });
		control.focus({ preventScroll: true });
	};
	const Heading = `h${headingLevel}`;
	return /* @__PURE__ */ jsxs("div", {
		ref: mergeRefs(own, ref),
		id,
		className: cx$1("ui-error-summary", className),
		role: "alert",
		"aria-labelledby": headingId,
		tabIndex: -1,
		children: [
			/* @__PURE__ */ jsx(Heading, {
				id: headingId,
				className: "ui-error-summary__title",
				children: title
			}),
			description ? /* @__PURE__ */ jsx("p", {
				className: "ui-error-summary__description",
				children: description
			}) : null,
			/* @__PURE__ */ jsx("ul", {
				className: "ui-error-summary__list",
				children: items.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
					href: item.href,
					onClick: (e) => onLinkClick(e, item.href),
					children: item.message
				}) }, item.href))
			})
		]
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
//#region src/display/StatusPill.tsx
var STATUS_MAP = {
	draft: {
		tone: "neutral",
		text: "Draft"
	},
	review: {
		tone: "accent",
		text: "In review"
	},
	scheduled: {
		tone: "accent",
		text: "Scheduled"
	},
	published: {
		tone: "ok",
		text: "Published"
	},
	connected: {
		tone: "ok",
		text: "Connected"
	},
	failed: {
		tone: "danger",
		text: "Failed"
	},
	warning: {
		tone: "warn",
		text: "Needs attention"
	},
	live: {
		tone: "accent",
		text: "Live"
	},
	attention: {
		tone: "warn",
		text: "Attention"
	},
	ok: {
		tone: "ok",
		text: "OK"
	},
	error: {
		tone: "danger",
		text: "Error"
	},
	reasoning: {
		tone: "reasoning",
		text: "Reasoning"
	}
};
/**
* Pill with a leading status dot (spec §7 P0; portal `_ds_bundle.js` StatusPill). The dot is
* decorative (aria-hidden); the text carries the meaning. It does not animate: "live" is a label for a
* value the caller already knows is live (spec §6.3 rule 9), not an indicator this component invents.
*/
function StatusPill({ status = "draft", label, className, ...rest }) {
	const key = status in STATUS_MAP ? status : "draft";
	const def = STATUS_MAP[key];
	return /* @__PURE__ */ jsxs("span", {
		...rest,
		className: cx("ui-status", "ui-tone", className),
		"data-tone": def.tone,
		"data-status": key,
		children: [/* @__PURE__ */ jsx("span", {
			className: "ui-status__dot",
			"aria-hidden": "true"
		}), label ?? def.text]
	});
}
//#endregion
//#region src/display/Chip.tsx
/**
* Compact tag for filters and selections (spec §7 P0). Static by default; `onClick` turns it into a
* toggle button and `onRemove` adds a separate remove button, so each control has one job.
*/
function Chip({ children, tone = "neutral", icon, onClick, selected, onRemove, removeLabel, disabled, className, ...rest }) {
	const t = normalizeTone(tone);
	const content = /* @__PURE__ */ jsxs(Fragment, { children: [icon ? /* @__PURE__ */ jsx("span", {
		className: "ui-chip__icon",
		"aria-hidden": "true",
		children: icon
	}) : null, /* @__PURE__ */ jsx("span", {
		className: "ui-chip__label",
		children
	})] });
	const removeName = removeLabel ?? (typeof children === "string" || typeof children === "number" ? `Remove ${children}` : "Remove");
	return /* @__PURE__ */ jsxs("span", {
		...rest,
		className: cx("ui-chip", "ui-tone", className),
		"data-tone": t,
		"data-selected": selected ? "" : void 0,
		"data-disabled": disabled ? "" : void 0,
		children: [onClick ? /* @__PURE__ */ jsx("button", {
			type: "button",
			className: "ui-chip__toggle",
			"aria-pressed": selected ?? false,
			onClick,
			disabled,
			children: content
		}) : content, onRemove ? /* @__PURE__ */ jsx("button", {
			type: "button",
			className: "ui-chip__remove",
			"aria-label": removeName,
			onClick: onRemove,
			disabled,
			children: /* @__PURE__ */ jsx(X, {
				"aria-hidden": "true",
				size: 14,
				strokeWidth: 2.25
			})
		}) : null]
	});
}
//#endregion
//#region src/display/Avatar.tsx
/** Portal `_ds_bundle.js` Avatar dimensions, in px. */
var AVATAR_SIZES = {
	xs: 30,
	sm: 42,
	md: 58,
	lg: 94
};
/** Up to two initials from a name ("Beau Williams" -> "BW"). */
function initialsOf(name) {
	return name.trim().split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
/**
* Image avatar with an initials fallback (spec §7 P0; portal `_ds_bundle.js` Avatar). Initials are
* `--ui-on-accent` on the accent fill, which the §9 matrix guarantees at 4.5:1. Always has a text
* alternative (alt text or aria-label) unless `decorative` or there is no name.
*/
function Avatar({ src, name = "", size = "md", shape = "rounded", decorative, className, style, ...rest }) {
	const [failed, setFailed] = useState(null);
	const px = typeof size === "number" ? size : AVATAR_SIZES[size] ?? AVATAR_SIZES.md;
	const showImage = Boolean(src) && failed !== src;
	const initials = initialsOf(name) || "?";
	const hidden = decorative || !name.trim();
	const vars = {
		"--ui-avatar-size": `${px}px`,
		...style
	};
	return /* @__PURE__ */ jsx("span", {
		...rest,
		className: cx("ui-avatar", className),
		"data-shape": shape,
		"data-fallback": showImage ? void 0 : "",
		style: vars,
		title: rest.title ?? (name || void 0),
		role: showImage || hidden ? void 0 : "img",
		"aria-label": showImage || hidden ? void 0 : name,
		"aria-hidden": hidden ? true : void 0,
		children: showImage ? /* @__PURE__ */ jsx("img", {
			className: "ui-avatar__img",
			src,
			alt: hidden ? "" : name,
			width: px,
			height: px,
			decoding: "async",
			onError: () => setFailed(src ?? null)
		}) : /* @__PURE__ */ jsx("span", {
			className: "ui-avatar__initials",
			"aria-hidden": "true",
			children: initials
		})
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
//#region src/display/StatCard.tsx
var TREND_TEXT = {
	up: "Up",
	down: "Down",
	flat: "No change"
};
var TREND_TONE = {
	up: "ok",
	down: "danger",
	flat: "neutral"
};
/**
* KPI tile (spec §7 P0; portal `_ds_bundle.js` StatCard: label, value, sub, trend {dir, value, note}).
* Real values only, and the server-rendered HTML already holds the final value.
*/
function StatCard({ label, value, sub, trend, locale = "en-US", formatOptions, countUp = false, className, ...rest }) {
	const labelId = useId();
	const isNumber = typeof value === "number" && Number.isFinite(value);
	const empty = value === null || value === void 0 || value === "" || typeof value === "number" && !Number.isFinite(value);
	const text = isNumber ? new Intl.NumberFormat(locale, formatOptions).format(value) : value;
	const dir = trend && trend.dir in TREND_TEXT ? trend.dir : "flat";
	const TrendIcon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus;
	return /* @__PURE__ */ jsxs(Card, {
		...rest,
		className: cx("ui-stat", className),
		role: "group",
		"aria-labelledby": labelId,
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "ui-stat__label",
				id: labelId,
				children: label
			}),
			/* @__PURE__ */ jsx("p", {
				className: "ui-stat__value ui-tabular",
				"data-count-to": countUp && isNumber ? String(value) : void 0,
				children: empty ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
					"aria-hidden": "true",
					children: "—"
				}), /* @__PURE__ */ jsx("span", {
					className: "ui-visually-hidden",
					children: "No data"
				})] }) : text
			}),
			trend ? /* @__PURE__ */ jsxs("p", {
				className: "ui-stat__trend ui-tone",
				"data-tone": normalizeTone(trend.tone, TREND_TONE[dir]),
				"data-dir": dir,
				children: [
					/* @__PURE__ */ jsx(TrendIcon, {
						"aria-hidden": "true",
						size: 14,
						strokeWidth: 2.5
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "ui-visually-hidden",
						children: [TREND_TEXT[dir], " "]
					}),
					/* @__PURE__ */ jsx("span", { children: trend.value }),
					trend.note ? /* @__PURE__ */ jsx("span", {
						className: "ui-stat__note",
						children: trend.note
					}) : null
				]
			}) : sub ? /* @__PURE__ */ jsx("p", {
				className: "ui-stat__sub",
				children: sub
			}) : null
		]
	});
}
//#endregion
//#region src/feedback/tone-icon.tsx
/** Tone icon for feedback surfaces. Always aria-hidden: the text carries the meaning. */
function ToneIcon({ tone, size = 18 }) {
	const props = {
		size,
		strokeWidth: 2,
		"aria-hidden": true,
		focusable: "false"
	};
	switch (tone) {
		case "ok": return /* @__PURE__ */ jsx(CircleCheck, { ...props });
		case "warn": return /* @__PURE__ */ jsx(TriangleAlert, { ...props });
		case "danger": return /* @__PURE__ */ jsx(CircleAlert, { ...props });
		default: return /* @__PURE__ */ jsx(Info, { ...props });
	}
}
/** role=alert for errors, role=status for everything else (spec §7 P0). */
function liveRoleFor(tone) {
	return tone === "danger" ? "alert" : "status";
}
//#endregion
//#region src/feedback/Alert.tsx
/**
* Inline message (spec §7 P0). The tone is always carried by text as well as colour: the title, or a
* visually hidden "Error:" / "Warning:" prefix when there is no title.
*/
function Alert({ tone = "info", title, children, icon, actions, onDismiss, dismissLabel = "Dismiss", live = true, className, role, ref, ...rest }) {
	const t = normalizeTone(tone, "info");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		role: role ?? (live ? liveRoleFor(t) : void 0),
		className: cx("ui-alert", "ui-tone", className),
		"data-tone": t,
		children: [
			icon === false ? null : /* @__PURE__ */ jsx("span", {
				className: "ui-alert__icon",
				"aria-hidden": "true",
				children: icon ?? /* @__PURE__ */ jsx(ToneIcon, { tone: t })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ui-alert__body",
				children: [
					title ? /* @__PURE__ */ jsx("p", {
						className: "ui-alert__title",
						children: title
					}) : null,
					children ? /* @__PURE__ */ jsxs("div", {
						className: "ui-alert__message",
						children: [title ? null : /* @__PURE__ */ jsxs("span", {
							className: "ui-visually-hidden",
							children: [TONE_LABEL[t], ": "]
						}), children]
					}) : null,
					actions ? /* @__PURE__ */ jsx("div", {
						className: "ui-alert__actions",
						children: actions
					}) : null
				]
			}),
			onDismiss ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ui-alert__dismiss",
				"aria-label": dismissLabel,
				onClick: onDismiss,
				children: /* @__PURE__ */ jsx(X, {
					"aria-hidden": "true",
					size: 16,
					strokeWidth: 2.25
				})
			}) : null
		]
	});
}
//#endregion
//#region src/feedback/FlashBanner.tsx
var FLASH_TYPES = {
	success: "ok",
	ok: "ok",
	error: "danger",
	danger: "danger",
	warning: "warn",
	warn: "warn",
	info: "info",
	notice: "info"
};
/** Map a flash `type`/`tone` string to a tone. Unknown values are info. */
function flashTone(type) {
	if (!type) return "info";
	return FLASH_TYPES[type] ?? normalizeTone(type, "info");
}
/**
* Page-level banner for server flash messages after a POST-redirect (spec §7 P0). role=status, or
* role=alert for errors. Renders complete on the server; no JS is needed to see it.
*/
function FlashBanner({ flash, tone, title, children, focusOnMount, className, ...rest }) {
	const ref = useRef(null);
	const message = flash ? flash.message : children;
	const t = flash ? flashTone(flash.type ?? flash.tone) : normalizeTone(tone, "info");
	const shouldFocus = focusOnMount ?? t === "danger";
	const present = message !== null && message !== void 0 && message !== "";
	useEffect(() => {
		if (present && shouldFocus) ref.current?.focus();
	}, [present, shouldFocus]);
	if (!present) return null;
	return /* @__PURE__ */ jsx(Alert, {
		...rest,
		ref,
		tone: t,
		title: flash?.title ?? title,
		className: cx("ui-flash", className),
		tabIndex: -1,
		children: message
	});
}
//#endregion
//#region src/feedback/Toast.tsx
var MIN_DURATION = 4e3;
/**
* CSS toast for islands and SSR pages (spec §7 P0; portal `_ds_bundle.js` Toast: tone, title,
* message, onClose). No toast library: the enter animation is CSS behind the motion gate. Apps use
* the sonner wrapper in `@trident/ui/app` instead. role=status, or role=alert for errors.
*/
function Toast({ tone = "success", title, message, onClose, closeLabel = "Dismiss", duration, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest }) {
	const t = normalizeTone(tone, "ok");
	const [paused, setPaused] = useState(false);
	const auto = Boolean(onClose && duration && duration > 0 && t !== "danger");
	useEffect(() => {
		if (!auto || paused || !onClose) return;
		const id = setTimeout(onClose, Math.max(MIN_DURATION, duration ?? 0));
		return () => clearTimeout(id);
	}, [
		auto,
		paused,
		onClose,
		duration
	]);
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		role: rest.role ?? liveRoleFor(t),
		className: cx("ui-toast", "ui-tone", className),
		"data-tone": t,
		onMouseEnter: (e) => {
			onMouseEnter?.(e);
			setPaused(true);
		},
		onMouseLeave: (e) => {
			onMouseLeave?.(e);
			setPaused(false);
		},
		onFocus: (e) => {
			onFocus?.(e);
			setPaused(true);
		},
		onBlur: (e) => {
			onBlur?.(e);
			if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
		},
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "ui-toast__icon",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(ToneIcon, { tone: t })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ui-toast__body",
				children: [title ? /* @__PURE__ */ jsx("p", {
					className: "ui-toast__title",
					children: title
				}) : /* @__PURE__ */ jsxs("span", {
					className: "ui-visually-hidden",
					children: [TONE_LABEL[t], ": "]
				}), message ? /* @__PURE__ */ jsx("p", {
					className: "ui-toast__message",
					children: message
				}) : null]
			}),
			onClose ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ui-toast__close",
				"aria-label": closeLabel,
				onClick: onClose,
				children: /* @__PURE__ */ jsx(X, {
					"aria-hidden": "true",
					size: 16,
					strokeWidth: 2.25
				})
			}) : null
		]
	});
}
/**
* Fixed stack that holds toasts (the portal's top-right flash stack). Render it on the server,
* empty, so it exists before the first toast; each Toast carries its own live role.
*/
function ToastRegion({ label = "Notifications", position = "top-right", className, children, ...rest }) {
	return /* @__PURE__ */ jsx("section", {
		...rest,
		"aria-label": label,
		className: cx("ui-toast-region", className),
		"data-position": position,
		children
	});
}
//#endregion
//#region src/utils/contrast.ts
/** AA thresholds used across the package. */
var AA_TEXT = 4.5;
var AA_LARGE_TEXT = 3;
var AA_NON_TEXT = 3;
/** Ink candidates for text on an accent fill (spec §2.3). */
var DARK_INK = "#0b1220";
var LIGHT_INK = "#ffffff";
var HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function parseHex(input) {
	const m = HEX.exec(input.trim());
	if (!m) throw new TypeError(`ensureContrast: expected #rgb or #rrggbb, got ${JSON.stringify(input)}`);
	let body = m[1].toLowerCase();
	if (body.length === 3) body = [...body].map((c) => c + c).join("");
	const n = Number.parseInt(body, 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
}
function isHex(input) {
	return HEX.test(input.trim());
}
function toHex([r, g, b]) {
	const c = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
	return `#${c(r)}${c(g)}${c(b)}`;
}
function channel(v) {
	const s = v / 255;
	return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
}
/** WCAG relative luminance, 0 (black) to 1 (white). */
function relativeLuminance(color) {
	const [r, g, b] = typeof color === "string" ? parseHex(color) : color;
	return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
}
/** WCAG contrast ratio between two opaque colours, 1 to 21. */
function contrastRatio(a, b) {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const [hi, lo] = la > lb ? [la, lb] : [lb, la];
	return (hi + .05) / (lo + .05);
}
/** Linear sRGB-space mix: t=0 returns a, t=1 returns b. */
function mix(a, b, t) {
	const ca = parseHex(a);
	const cb = parseHex(b);
	return toHex([
		ca[0] + (cb[0] - ca[0]) * t,
		ca[1] + (cb[1] - ca[1]) * t,
		ca[2] + (cb[2] - ca[2]) * t
	]);
}
/**
* Move `color` toward white (on a dark bg) or black (on a light bg) by the smallest step that
* reaches `min` against `bg`. Returns the colour unchanged if it already passes.
* Binary search over the mix amount keeps the hue and gives the closest passing shade.
*/
function adjustToContrast(color, bg, min) {
	const start = toHex(parseHex(color));
	if (contrastRatio(start, bg) >= min) return start;
	const target = relativeLuminance(bg) < .18 ? "#ffffff" : "#000000";
	if (contrastRatio(target, bg) < min) return target;
	let lo = 0;
	let hi = 1;
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (contrastRatio(mix(start, target, mid), bg) >= min) hi = mid;
		else lo = mid;
	}
	let t = hi;
	let out = mix(start, target, t);
	while (contrastRatio(out, bg) < min && t < 1) {
		t = Math.min(1, t + .005);
		out = mix(start, target, t);
	}
	return out;
}
/** Whichever of #0b1220 / #ffffff contrasts more with `fill`. */
function pickOnAccent(fill) {
	return contrastRatio("#0b1220", fill) >= contrastRatio("#ffffff", fill) ? DARK_INK : LIGHT_INK;
}
/**
* Make an arbitrary accent safe on a given background (spec §2.3):
* - clamps a fill that falls below 3:1 against the background;
* - picks --ui-on-accent as #0b1220 or #ffffff, whichever contrasts more with the fill;
* - derives an accent-text shade that reaches 4.5:1 on bg (and on every `alsoOn` surface).
*/
function ensureContrast(hex, bg, options = {}) {
	const { textMin = AA_TEXT, fillMin = 3, onAccentMin = AA_TEXT, alsoOn = [] } = options;
	const input = toHex(parseHex(hex));
	const bgHex = toHex(parseHex(bg));
	let fill = adjustToContrast(input, bgHex, fillMin);
	const onAccent = pickOnAccent(fill);
	const inked = adjustToContrast(fill, onAccent, onAccentMin);
	if (contrastRatio(inked, bgHex) >= fillMin) fill = inked;
	let accentText = adjustToContrast(input, bgHex, textMin);
	for (const surface of alsoOn) accentText = adjustToContrast(accentText, surface, textMin);
	accentText = adjustToContrast(accentText, bgHex, textMin);
	return {
		input,
		fill,
		onAccent,
		accentText,
		adjusted: fill !== input || accentText !== input,
		ratios: {
			fillOnBg: contrastRatio(fill, bgHex),
			onAccentOnFill: contrastRatio(onAccent, fill),
			accentTextOnBg: contrastRatio(accentText, bgHex)
		}
	};
}
/**
* The CSS custom properties to apply for a runtime accent, e.g.
* `Object.assign(document.documentElement.style, ...)` via setProperty, or an SSR `style` attribute.
*/
function accentVars(hex, bg, options) {
	const r = ensureContrast(hex, bg, options);
	return {
		"--ui-accent-1": r.fill,
		"--ui-on-accent": r.onAccent,
		"--ui-accent-text": r.accentText,
		"--ui-focus": r.accentText
	};
}
//#endregion
export { AA_LARGE_TEXT, AA_NON_TEXT, AA_TEXT, AVATAR_SIZES, Alert, Avatar, BUTTON_HEIGHTS, Badge, Button, Card, Checkbox, Chip, Cluster, Code, Container, CsrfField, DARK_INK, DEFAULT_CSRF_FIELD, ErrorSummary, Field, FieldErrorText, Fieldset, FlashBanner, FocusRing, Form, FormError, GradText, Grid, Heading, IconButton, Input, Kbd, Kicker, LIGHT_INK, LinkButton, LiveAnnouncer, Mono, Prose, Radio, SPACE_STEPS, STATUS_MAP, Section, Select, SkipLink, Stack, StatCard, StatusPill, SubmitButton, Switch, TEXT_SIZES, TONES, TONE_INK_PCT, TONE_LABEL, TONE_ROLE, TONE_TINT_PCT, Text, Textarea, Toast, ToastRegion, VisuallyHidden, accentVars, adjustToContrast, buttonClassName, checkHeadingOutline, contrastRatio, countWords, ensureContrast, fieldId, flashTone, focusRingClass, focusRingWithinClass, initialsOf, isHex, mix, normalizeTone, parseHex, pickOnAccent, pointerMotionAllowed, relativeLuminance, toHex, useAnnouncer, useFieldControl };
