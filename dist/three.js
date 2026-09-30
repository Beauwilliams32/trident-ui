import { a as loadGeneratedColors, i as intToRgb, s as parseCssColor, t as DEFAULT_THEME } from "./chunks/colors-C3CMEN7v.js";
import { C as computeQualityTier, D as isBrowser, E as hasWebGL2, M as viewportWidth, S as SMALL_SCENE_MIN_WIDTH, T as formFieldFocused, _ as reportPerformanceDecline, a as cardState, b as FORBIDDEN_SURFACES, c as stateText, d as UNRESOLVED_COLOR, f as readBrandColors, g as readQualityTier, h as useTokenColor, i as MAX_STATUS_CARDS, j as lowPower, k as isFormField, l as statusCards, m as useBrandColors, n as FALLBACK_STATUS_ITEMS, o as pointerTilt, p as readTokenColor, r as MAX_POINTER_TILT, s as ringScale, t as FpsGuard, u as ThemeScopeContext, v as resetPerformanceDecline, w as forbiddenSurface, x as HERO_MIN_WIDTH, y as useQualityTier } from "./chunks/fpsGuard-H8QJw_5H.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { isValidElement, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
//#region src/three/PosterFallback.tsx
/**
* The poster that paints first and stays whenever 3D does not mount (spec §6.5). With no image it
* paints a procedural token gradient, so it is never empty. SSR-safe; zero JS behaviour.
*/
function PosterFallback({ src, avif, webp, alt = "", width, height, eager = false, className, style, children }) {
	const cls = ["ui-poster", className].filter(Boolean).join(" ");
	if (children) return /* @__PURE__ */ jsx("div", {
		className: cls,
		style,
		"data-poster": "",
		children
	});
	if (!src) return /* @__PURE__ */ jsx("div", {
		className: `${cls} ui-poster--procedural`,
		style,
		"data-poster": "",
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ jsx("div", {
		className: cls,
		style,
		"data-poster": "",
		children: /* @__PURE__ */ jsxs("picture", { children: [
			avif ? /* @__PURE__ */ jsx("source", {
				type: "image/avif",
				srcSet: avif
			}) : null,
			webp ? /* @__PURE__ */ jsx("source", {
				type: "image/webp",
				srcSet: webp
			}) : null,
			/* @__PURE__ */ jsx("img", {
				className: "ui-poster__img",
				src,
				alt,
				width,
				height,
				loading: eager ? "eager" : "lazy",
				decoding: "async"
			})
		] })
	});
}
//#endregion
//#region src/three/Lazy3D.tsx
/** Resolves after `load` and then an idle callback (spec §6.5). Returns a cancel function. */
function afterLoadAndIdle(cb) {
	let cancelled = false;
	let idleId;
	let timeoutId;
	const idle = () => {
		if (cancelled) return;
		const w = window;
		if (typeof w.requestIdleCallback === "function") idleId = w.requestIdleCallback(() => !cancelled && cb(), { timeout: 2e3 });
		else timeoutId = setTimeout(() => !cancelled && cb(), 200);
	};
	if (document.readyState === "complete") idle();
	else window.addEventListener("load", idle, { once: true });
	return () => {
		cancelled = true;
		window.removeEventListener("load", idle);
		const w = window;
		if (idleId !== void 0 && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
		if (timeoutId !== void 0) clearTimeout(timeoutId);
	};
}
function subscribeResize(cb) {
	if (!isBrowser()) return () => {};
	window.addEventListener("resize", cb, { passive: true });
	return () => window.removeEventListener("resize", cb);
}
function renderPoster(poster) {
	if (typeof poster === "string") return /* @__PURE__ */ jsx(PosterFallback, { src: poster });
	if (poster && typeof poster === "object" && !isValidElement(poster) && !Array.isArray(poster)) return /* @__PURE__ */ jsx(PosterFallback, { ...poster });
	return poster ?? /* @__PURE__ */ jsx(PosterFallback, {});
}
function ratioStyle(ratio) {
	if (typeof ratio === "number" && ratio > 0) return String(ratio);
	if (typeof ratio === "string" && ratio.trim()) return ratio;
	return "16 / 9";
}
/**
* The ONLY way to mount a canvas (spec §6.5). The canvas mounts only when every gate holds:
* after `load` plus an idle callback; the slot intersects the viewport and the document is
* visible; WebGL2 exists; `useQualityTier() !== 'off'` (reduced motion, Pause and lowPower all
* make it off); the viewport is at least `minWidth`; no form field has focus; and the slot is not
* inside `[data-surface="money|auth|legal|admin"]`. Otherwise the poster, painted first, stays.
* The three/R3F code is a separate chunk that is imported only once the gates pass.
*/
function Lazy3D({ scene, sceneProps, poster, minWidth = 980, ratio, interactive = false, idleMs, children, className, style, onStateChange }) {
	const [el, setEl] = useState(null);
	const tier = useQualityTier();
	const wide = useSyncExternalStore(subscribeResize, () => viewportWidth() >= minWidth, () => false);
	const [refused, setRefused] = useState(null);
	const [ready, setReady] = useState(false);
	const [inView, setInView] = useState(false);
	const [docVisible, setDocVisible] = useState(false);
	const [fieldFocused, setFieldFocused] = useState(false);
	const [webgl, setWebgl] = useState(null);
	const [failed, setFailed] = useState(false);
	const [everShown, setEverShown] = useState(false);
	const [loaded, setLoaded] = useState(null);
	const sceneRef = useRef(scene);
	useEffect(() => {
		sceneRef.current = scene;
	});
	useEffect(() => {
		if (!el) return;
		const surface = forbiddenSurface(el);
		setRefused(surface);
		if (surface) console.warn(`[@trident/ui] <Lazy3D> refused to mount under [data-surface="${surface}"] (spec §6.8).`);
	}, [el]);
	useEffect(() => {
		if (!isBrowser()) return;
		return afterLoadAndIdle(() => setReady(true));
	}, []);
	useEffect(() => {
		if (!el) return;
		const onVis = () => setDocVisible(document.visibilityState === "visible");
		onVis();
		document.addEventListener("visibilitychange", onVis);
		let io;
		if (typeof IntersectionObserver === "function") {
			io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { threshold: .01 });
			io.observe(el);
		} else setInView(true);
		return () => {
			document.removeEventListener("visibilitychange", onVis);
			io?.disconnect();
		};
	}, [el]);
	useEffect(() => {
		if (!isBrowser()) return;
		setFieldFocused(formFieldFocused());
		const onIn = (e) => setFieldFocused(isFormField(e.target));
		const onOut = (e) => setFieldFocused(isFormField(e.relatedTarget));
		document.addEventListener("focusin", onIn);
		document.addEventListener("focusout", onOut);
		return () => {
			document.removeEventListener("focusin", onIn);
			document.removeEventListener("focusout", onOut);
		};
	}, []);
	const allowed = !!el && refused === null && tier !== "off" && wide && ready && !fieldFocused && !failed;
	const visibleNow = inView && docVisible;
	const candidate = allowed && (everShown || visibleNow);
	useEffect(() => {
		if (candidate && webgl === null) setWebgl(hasWebGL2());
	}, [candidate, webgl]);
	const mount = candidate && webgl === true;
	useEffect(() => {
		if (mount && !everShown) setEverShown(true);
	}, [mount, everShown]);
	useEffect(() => {
		if (!mount || loaded) return;
		let cancelled = false;
		Promise.all([
			import("./chunks/scene-DKnvMJX9.js"),
			sceneRef.current(),
			loadGeneratedColors()
		]).then(([kitModule, sceneModule]) => {
			if (cancelled) return;
			setLoaded({
				kit: kitModule.sceneKit,
				Scene: sceneModule.default
			});
		}).catch((err) => {
			if (cancelled) return;
			console.warn("[@trident/ui] <Lazy3D> scene failed to load; keeping the poster.", err);
			setFailed(true);
		});
		return () => {
			cancelled = true;
		};
	}, [mount, loaded]);
	const onFallback = useCallback((_reason) => setFailed(true), []);
	const state = failed ? "failed" : refused ? "refused" : webgl === false ? "unsupported" : mount ? loaded ? "live" : "loading" : "poster";
	useEffect(() => {
		onStateChange?.(state);
	}, [state, onStateChange]);
	const classes = ["ui-lazy3d", className].filter(Boolean).join(" ");
	const showCanvas = mount && loaded !== null;
	const quality = tier === "high" ? "high" : "low";
	const Kit = loaded?.kit;
	const Scene = loaded?.Scene;
	return /* @__PURE__ */ jsx(ThemeScopeContext.Provider, {
		value: el,
		children: /* @__PURE__ */ jsxs("div", {
			ref: setEl,
			className: classes,
			style: {
				aspectRatio: ratioStyle(ratio),
				...style
			},
			"data-state": state,
			"data-interactive": interactive ? "" : void 0,
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "ui-lazy3d__poster",
					children: renderPoster(poster)
				}),
				showCanvas && Kit && Scene ? /* @__PURE__ */ jsx("div", {
					className: "ui-lazy3d__stage",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Kit.SceneCanvas, {
						active: visibleNow,
						interactive,
						idleMs,
						onFallback,
						children: /* @__PURE__ */ jsx(Scene, {
							kit: Kit,
							quality,
							...sceneProps
						})
					})
				}) : null,
				children
			]
		})
	});
}
//#endregion
//#region src/three/StatusOrbit.tsx
/**
* The DOM equivalent of the orbit (spec §6.5, §9): every card's label and state as text, so 3D
* never carries information the DOM does not. Visually hidden by default.
*/
function StatusOrbitList({ items, label = "Publishing status by platform", visible = false }) {
	const cards = statusCards(items);
	return /* @__PURE__ */ jsx("ul", {
		className: visible ? "ui-status-orbit__list" : "ui-status-orbit__list ui-visually-hidden",
		"aria-label": label,
		children: cards.map((c) => /* @__PURE__ */ jsx("li", {
			"data-state": c.state,
			children: `${c.label}: ${stateText(c.state)}`
		}, c.key))
	});
}
var loadStatusOrbitScene = () => import("./chunks/scene-DKnvMJX9.js").then((m) => ({ default: m.StatusOrbitScene }));
/**
* The WMH hero orbit (a port of hero-3d.js): fresnel core, two tilted rings and status cards,
* mounted through `<Lazy3D>`, with the visually hidden DOM list always rendered.
*/
function StatusOrbit({ items, center, listLabel, children, ...lazy }) {
	return /* @__PURE__ */ jsxs(Lazy3D, {
		...lazy,
		scene: loadStatusOrbitScene,
		sceneProps: {
			items: items ?? null,
			center
		},
		children: [/* @__PURE__ */ jsx(StatusOrbitList, {
			items,
			label: listLabel
		}), children]
	});
}
//#endregion
//#region src/three/index.ts
/** Load the R3F primitives yourself (e.g. to pre-warm after a user gesture). Never call at import. */
var loadSceneKit = () => import("./chunks/scene-DKnvMJX9.js").then((m) => m.sceneKit);
//#endregion
export { DEFAULT_THEME, FALLBACK_STATUS_ITEMS, FORBIDDEN_SURFACES, FpsGuard, HERO_MIN_WIDTH, Lazy3D, MAX_POINTER_TILT, MAX_STATUS_CARDS, PosterFallback, SMALL_SCENE_MIN_WIDTH, StatusOrbit, StatusOrbitList, ThemeScopeContext, UNRESOLVED_COLOR, cardState, computeQualityTier, forbiddenSurface, hasWebGL2, intToRgb, isFormField, loadGeneratedColors, loadSceneKit, lowPower, parseCssColor, pointerTilt, readBrandColors, readQualityTier, readTokenColor, reportPerformanceDecline, resetPerformanceDecline, ringScale, stateText, statusCards, useBrandColors, useQualityTier, useTokenColor };
