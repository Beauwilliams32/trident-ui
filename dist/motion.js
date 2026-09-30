import { F as paused, O as subscribeMotion, P as mq, S as MOTION_TOGGLE_ATTR, T as restoreMotionPreference, a as transition, f as isCountable, g as observeReveal, n as armMotion, o as bindTilt, u as countUpWhenVisible, w as handleMotionToggleClick } from "./chunks/motion-lite-CmUY4QUg.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { flushSync } from "react-dom";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, domAnimation as domAnimation$1, m } from "motion/react";
//#region src/motion/hooks.ts
/** useLayoutEffect on the client, nothing on the server (no SSR warning, no flash on mount). */
var useIsoLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;
var REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb) {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
	try {
		const list = window.matchMedia(REDUCE);
		list.addEventListener?.("change", cb);
		return () => list.removeEventListener?.("change", cb);
	} catch {
		return () => {};
	}
}
/** True while html[data-motion="paused"] is set. Server snapshot: false. */
function useMotionPaused() {
	return useSyncExternalStore(subscribeMotion, paused, () => false);
}
/** True while the OS asks for reduced motion. Server snapshot: false. */
function usePrefersReducedMotion() {
	return useSyncExternalStore(subscribeReduced, () => mq(REDUCE), () => false);
}
/** Reduced motion OR Pause: render final states, start no animation. */
function useMotionOff() {
	const isPaused = useMotionPaused();
	const isReduced = usePrefersReducedMotion();
	return isPaused || isReduced;
}
//#endregion
//#region src/motion/MotionRoot.tsx
/**
* App root for motion/react (spec §6.1 tier 2): `<LazyMotion strict>` so only `m.*` components
* work, and `<MotionConfig reducedMotion="user">` — switched to "always" while Pause is on.
* Also restores the stored Pause choice and arms html.ui-motion for [data-reveal].
*/
function MotionRoot({ children, features = domAnimation$1 }) {
	const isPaused = useMotionPaused();
	useIsoLayoutEffect(() => {
		restoreMotionPreference();
		armMotion();
	}, []);
	return /* @__PURE__ */ jsx(LazyMotion, {
		features,
		strict: true,
		children: /* @__PURE__ */ jsx(MotionConfig, {
			reducedMotion: isPaused ? "always" : "user",
			children
		})
	});
}
//#endregion
//#region src/motion/presets.ts
/**
* Motion presets for motion/react (spec §6.2). Values mirror tokens.json `motion` (a test pins
* that they stay equal), in the units motion/react expects: seconds and bezier arrays.
*/
var springs = {
	/** Toggles, menus. */
	snappy: {
		type: "spring",
		stiffness: 520,
		damping: 38,
		mass: .8
	},
	/** Sheets, dialogs. */
	smooth: {
		type: "spring",
		stiffness: 300,
		damping: 34,
		mass: 1
	},
	/** Hero text only. */
	gentle: {
		type: "spring",
		stiffness: 160,
		damping: 26,
		mass: 1
	}
};
/** Durations in seconds (tokens are ms). */
var durations = {
	instant: .08,
	fast: .16,
	base: .2,
	page: .26,
	med: .32,
	slow: .48,
	reveal: .6,
	count: 1.1
};
var easings = {
	ease: [
		.2,
		.8,
		.2,
		1
	],
	emph: [
		.2,
		0,
		0,
		1
	],
	exit: [
		.4,
		0,
		1,
		1
	],
	inout: [
		.4,
		0,
		.2,
		1
	],
	spring: [
		.22,
		1.2,
		.36,
		1
	],
	springPop: [
		.34,
		1.4,
		.64,
		1
	]
};
/** Exits run at about 0.7× their enter (spec §6.3 rule 2). */
var EXIT_RATIO = .7;
var exitDuration = (enterSeconds) => Math.round(enterSeconds * EXIT_RATIO * 1e3) / 1e3;
/** Ready-made enter/exit transitions for m.* components (transform + opacity only). */
var transitions = {
	enter: {
		duration: durations.med,
		ease: easings.emph
	},
	exit: {
		duration: exitDuration(durations.med),
		ease: easings.exit
	},
	page: {
		duration: durations.page,
		ease: easings.ease
	},
	fade: {
		duration: durations.fast,
		ease: easings.ease
	}
};
var distances = {
	reveal: 18,
	stagger: 70,
	staggerMax: 6,
	tiltMax: 7,
	lift: -3
};
//#endregion
//#region src/motion/Reveal.tsx
/**
* Rises into view the first time it is seen. The server renders it visible; it hides only once
* JS armed html.ui-motion and motion is allowed (base.css), with a 2.5s CSS failsafe. Reduced
* motion or Pause: shown immediately, no observer.
*/
function Reveal({ as = "div", index, style, children, ...rest }) {
	const Tag = as;
	const ref = useRef(null);
	useIsoLayoutEffect(() => {
		const el = ref.current;
		if (!el) return void 0;
		armMotion();
		return observeReveal(el);
	}, []);
	const merged = index != null ? {
		...style,
		"--i": index
	} : style;
	return /* @__PURE__ */ jsx(Tag, {
		ref,
		"data-reveal": "",
		style: merged,
		...rest,
		children
	});
}
//#endregion
//#region src/motion/CountUp.tsx
/**
* Renders the final value (SSR and no-JS read it) and counts from 0 the first time 40% of it is
* visible. Screen readers get the final value only; the moving digits are aria-hidden.
* Reduced motion or Pause: the final value, and no requestAnimationFrame.
*/
function CountUp({ value, countable, duration, as = "span", className, style }) {
	const Tag = as;
	const text = String(value ?? "");
	const digits = useRef(null);
	const animates = isCountable(text, countable);
	useEffect(() => {
		const el = digits.current;
		if (!el || !animates) return void 0;
		return countUpWhenVisible(el, {
			value: text,
			countable: true,
			...duration != null ? { duration } : {}
		});
	}, [
		text,
		animates,
		duration
	]);
	if (!animates) return /* @__PURE__ */ jsx(Tag, {
		className,
		style,
		children: text
	});
	return /* @__PURE__ */ jsxs(Tag, {
		className,
		style,
		"data-count": "",
		children: [/* @__PURE__ */ jsx("span", {
			ref: digits,
			className: "ui-count-digits",
			"aria-hidden": "true",
			dangerouslySetInnerHTML: { __html: escapeText(text) }
		}), /* @__PURE__ */ jsx("span", {
			className: "ui-visually-hidden",
			children: text
		})]
	});
}
function escapeText(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
//#endregion
//#region src/motion/Tilt.tsx
/**
* Follows a fine pointer, at most 7deg (spec §6.2). Touch, reduced motion and Pause: flat, and no
* listener or rAF is started. Decorative only: never put the only copy of information in the tilt.
*/
function Tilt({ as = "div", children, ...rest }) {
	const Tag = as;
	const off = useMotionOff();
	useEffect(() => {
		if (!off) bindTilt();
	}, [off]);
	return /* @__PURE__ */ jsx(Tag, {
		"data-tilt": "",
		...rest,
		children
	});
}
//#endregion
//#region src/motion/ViewTransitionLink.tsx
/**
* A real `<a href>` (works without JS, opens in new tabs) that animates SPA route and tab changes
* with document.startViewTransition. Skipped under reduced motion, Pause, or no browser support.
*/
function ViewTransitionLink({ href, onNavigate, transitionName, onClick, children, ...rest }) {
	const handle = (e) => {
		onClick?.(e);
		if (!onNavigate || e.defaultPrevented) return;
		if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		if (rest.target && rest.target !== "_self") return;
		if (rest.download != null) return;
		e.preventDefault();
		transition(() => onNavigate(href), {
			...transitionName ? { name: transitionName } : {},
			flush: flushSync
		});
	};
	return /* @__PURE__ */ jsx("a", {
		href,
		onClick: handle,
		...rest,
		children
	});
}
//#endregion
//#region src/motion/AmbientGlow.tsx
/**
* Decorative CSS-only glow behind a hero or section: no JS, no rAF. Position it inside a
* `position: relative` parent. aria-hidden; transform and opacity only (spec §6.3 rule 1).
*/
function AmbientGlow({ tone = "accent", drift = true, className, style }) {
	return /* @__PURE__ */ jsx("div", {
		"aria-hidden": "true",
		className: className ? `ui-ambient-glow ${className}` : "ui-ambient-glow",
		"data-tone": tone,
		"data-drift": drift ? "" : void 0,
		style
	});
}
//#endregion
//#region src/motion/MotionToggle.tsx
/**
* The persistent "Pause motion" control (spec §6.3 rule 5, WCAG 2.2.2) for the footer or nav.
* Sets html[data-motion="paused"] and stores it in localStorage (try/catch). Its markup is the
* same one motion-lite's initMotion() binds, so a static page without React works too.
*/
function MotionToggle({ label = "Pause motion", className }) {
	const isPaused = useMotionPaused();
	const onClick = (e) => handleMotionToggleClick(e.nativeEvent);
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: className ? `ui-motion-toggle ${className}` : "ui-motion-toggle",
		"aria-pressed": isPaused,
		onClick,
		[MOTION_TOGGLE_ATTR]: "",
		children: [isPaused ? /* @__PURE__ */ jsx(PlayIcon, {
			"aria-hidden": "true",
			size: 14
		}) : /* @__PURE__ */ jsx(PauseIcon, {
			"aria-hidden": "true",
			size: 14
		}), label]
	});
}
//#endregion
export { AmbientGlow, AnimatePresence, CountUp, EXIT_RATIO, MotionRoot, MotionToggle, Reveal, Tilt, ViewTransitionLink, distances, domAnimation, durations, easings, exitDuration, m, springs, transitions, useMotionOff, useMotionPaused, usePrefersReducedMotion };
