import { o as parseCssColor, r as intToRgb } from "./colors-Em5MQDRe.js";
import { A as isMotionPaused, D as isBrowser, O as isCoarsePointer, _ as reportPerformanceDecline, c as stateText, h as useTokenColor, l as statusCards, o as pointerTilt, s as ringScale, t as FpsGuard } from "./fpsGuard-Bf-NR34X.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Children, Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CanvasTexture, Quaternion, Vector2, Vector3 } from "three";
import { PerformanceMonitor } from "@react-three/drei";
//#region src/three/scene/FresnelCore.tsx
var CORE_VERTEX = `
varying vec3 vN;
varying vec3 vP;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
var CORE_FRAGMENT = `
precision mediump float;
varying vec3 vN;
varying vec3 vP;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uRim;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vP);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
  float band = 0.5 + 0.5 * sin(n.y * 3.2 + uTime * 0.35 + n.x * 1.7);
  vec3 base = mix(uColorA, uColorB, band * 0.55);
  vec3 l = normalize(vec3(-0.45, 0.85, 0.9));
  float diff = 0.5 + 0.5 * max(dot(n, l), 0.0);
  float spec = pow(max(dot(reflect(-l, n), v), 0.0), 48.0);
  vec3 col = base * diff + uRim * fres * 0.85 + vec3(1.0) * spec * 0.3;
  gl_FragColor = vec4(col, 1.0);
}`;
var HALO_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
var HALO_FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform float uAlpha;
uniform vec3 uColorA;
uniform vec3 uRim;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.3, d);
  a = a * a * uAlpha;
  vec3 c = mix(uColorA, uRim, 1.0 - d);
  gl_FragColor = vec4(c, a);
}`;
var rgb = (n) => new Vector3(...intToRgb(n));
/** Lighten toward white (the hero's lilac rim is violet mixed ~70% with white). */
var tintToWhite = (n, amount) => {
	const [r, g, b] = intToRgb(n);
	return new Vector3(r + (1 - r) * amount, g + (1 - g) * amount, b + (1 - b) * amount);
};
/** A fresnel-lit sphere with a drifting two-colour band and an optional soft halo. */
function FresnelCore({ radius = .88, position = [
	0,
	0,
	0
], colorRole = "accent-1", secondaryRole = "accent-2", rimColor, halo = true, animate = true, segments = 40 }) {
	const a = useTokenColor(colorRole);
	const b = useTokenColor(secondaryRole);
	const core = useRef(null);
	const haloRef = useRef(null);
	const uniforms = useMemo(() => ({
		uTime: { value: 0 },
		uColorA: { value: new Vector3() },
		uColorB: { value: new Vector3() },
		uRim: { value: new Vector3() }
	}), []);
	const haloUniforms = useMemo(() => ({
		uAlpha: { value: .42 },
		uColorA: uniforms.uColorA,
		uRim: uniforms.uRim
	}), [uniforms]);
	useEffect(() => {
		uniforms.uColorA.value.copy(rgb(a));
		uniforms.uColorB.value.copy(rgb(b));
		uniforms.uRim.value.copy(rimColor === void 0 ? tintToWhite(a, .7) : rgb(rimColor));
	}, [
		a,
		b,
		rimColor,
		uniforms
	]);
	useFrame((state, delta) => {
		if (haloRef.current) haloRef.current.quaternion.copy(state.camera.quaternion);
		if (!animate) return;
		uniforms.uTime.value += delta;
		if (core.current) core.current.rotation.y += delta * .12;
	});
	const rings = Math.max(8, Math.round(segments * .7));
	return /* @__PURE__ */ jsxs("group", {
		position,
		children: [halo ? /* @__PURE__ */ jsxs("mesh", {
			ref: haloRef,
			position: [
				0,
				0,
				-.3
			],
			renderOrder: -1,
			children: [/* @__PURE__ */ jsx("planeGeometry", { args: [radius * 5.2, radius * 5.2] }), /* @__PURE__ */ jsx("shaderMaterial", {
				vertexShader: HALO_VERTEX,
				fragmentShader: HALO_FRAGMENT,
				uniforms: haloUniforms,
				transparent: true,
				depthWrite: false,
				depthTest: false
			})]
		}) : null, /* @__PURE__ */ jsxs("mesh", {
			ref: core,
			scale: radius,
			children: [/* @__PURE__ */ jsx("sphereGeometry", { args: [
				1,
				segments,
				rings
			] }), /* @__PURE__ */ jsx("shaderMaterial", {
				vertexShader: CORE_VERTEX,
				fragmentShader: CORE_FRAGMENT,
				uniforms
			})]
		})]
	});
}
//#endregion
//#region src/three/scene/OrbitRing.tsx
/** One ring from hero-3d.js: the inner ring is -0.24/1.08 at 1.85, 46s per turn. */
var INNER_RING = Object.freeze({
	radius: 1.85,
	tilt: -.24,
	lean: 1.08,
	speed: Math.PI * 2 / 46
});
/** The outer ring: 0.38/1.22 at 2.55, 62s per turn the other way. */
var OUTER_RING = Object.freeze({
	radius: 2.55,
	tilt: .38,
	lean: 1.22,
	speed: -(Math.PI * 2) / 62
});
/** Angle of slot `i` of `n` at time `t` (hero-3d.js: speed * t + slot / n * 2π). */
function slotAngle(i, n, t, speed) {
	return speed * t + i / Math.max(1, n) * Math.PI * 2;
}
var parentQuat = new Quaternion();
function RingPath({ radius, colorRole }) {
	const color = useTokenColor(colorRole);
	return /* @__PURE__ */ jsxs("mesh", {
		rotation: [
			Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ jsx("torusGeometry", { args: [
			radius,
			.004,
			4,
			128
		] }), /* @__PURE__ */ jsx("meshBasicMaterial", {
			color,
			transparent: true,
			opacity: .35,
			depthWrite: false
		})]
	});
}
/**
* Places its children evenly on a tilted ring and orbits them (a port of the hero-3d.js rings).
* Children face the camera by default, bob gently, and the radius scales with `tightness`.
*/
function OrbitRing({ children, radius = INNER_RING.radius, tilt = INNER_RING.tilt, lean = INNER_RING.lean, speed = INNER_RING.speed, billboard = true, tightness = 1, animate = true, bob = .07, showPath = false, pathColorRole = "line-strong" }) {
	const items = Children.toArray(children);
	const slots = useRef([]);
	const faces = useRef([]);
	const time = useRef(0);
	const tight = useRef(tightness);
	useFrame((state, delta) => {
		if (animate) time.current += delta;
		tight.current += (tightness - tight.current) * Math.min(1, delta * 6);
		const t = time.current;
		const r = radius * tight.current;
		const n = items.length;
		for (let i = 0; i < n; i++) {
			const slot = slots.current[i];
			if (!slot) continue;
			const a = slotAngle(i, n, t, speed);
			slot.position.set(Math.cos(a) * r, animate ? Math.sin(t * .9 + i * 1.7) * bob : 0, Math.sin(a) * r);
			const face = faces.current[i];
			if (billboard && face && face.parent) {
				face.parent.getWorldQuaternion(parentQuat).invert();
				face.quaternion.copy(parentQuat).multiply(state.camera.quaternion);
			}
		}
	});
	return /* @__PURE__ */ jsx("group", {
		rotation: [
			0,
			0,
			tilt
		],
		children: /* @__PURE__ */ jsxs("group", {
			rotation: [
				lean,
				0,
				0
			],
			children: [showPath ? /* @__PURE__ */ jsx(RingPath, {
				radius: radius * tightness,
				colorRole: pathColorRole
			}) : null, items.map((child, i) => /* @__PURE__ */ jsx("group", {
				position: [
					Math.cos(slotAngle(i, items.length, 0, speed)) * radius * tightness,
					0,
					Math.sin(slotAngle(i, items.length, 0, speed)) * radius * tightness
				],
				ref: (g) => {
					slots.current[i] = g;
				},
				children: /* @__PURE__ */ jsx("group", {
					ref: (g) => {
						faces.current[i] = g;
					},
					children: child
				})
			}, i))]
		})
	});
}
//#endregion
//#region src/three/scene/SceneCanvas.tsx
/** Renderer settings from spec §6.5. Exported so tests can pin them. */
var GL_OPTIONS = Object.freeze({
	antialias: false,
	powerPreference: "low-power",
	alpha: true
});
var DPR_RANGE = [1, 1.5];
var IDLE_MS = 8e3;
/** The frameloop rule: never when off-screen/hidden or paused, demand once idle, else always. */
function frameloopFor(active, paused, idle) {
	if (!active || paused) return "never";
	return idle ? "demand" : "always";
}
var SceneErrorBoundary = class extends Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch(error, _info) {
		console.warn("[@trident/ui] 3D scene crashed; falling back to the poster.", error);
		this.props.onError();
	}
	render() {
		return this.state.failed ? null : this.props.children;
	}
};
function usePaused() {
	const [paused, setPaused] = useState(isMotionPaused);
	useEffect(() => {
		if (!isBrowser() || typeof MutationObserver !== "function") return;
		const mo = new MutationObserver(() => setPaused(isMotionPaused()));
		mo.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-motion"]
		});
		return () => mo.disconnect();
	}, []);
	return paused;
}
/** Continuous frames for `ms` after mount or the last pointer/scroll input, then idle. */
function useIdle(ms) {
	const [idle, setIdle] = useState(false);
	useEffect(() => {
		if (!isBrowser()) return;
		let timer = setTimeout(() => setIdle(true), ms);
		const wake = () => {
			clearTimeout(timer);
			setIdle(false);
			timer = setTimeout(() => setIdle(true), ms);
		};
		window.addEventListener("pointermove", wake, { passive: true });
		window.addEventListener("scroll", wake, { passive: true });
		return () => {
			clearTimeout(timer);
			window.removeEventListener("pointermove", wake);
			window.removeEventListener("scroll", wake);
		};
	}, [ms]);
	return idle;
}
/** Mounts the scene graph in an idle callback, so building it is not one long task on mount. */
function IdleMount({ children }) {
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const w = window;
		if (typeof w.requestIdleCallback === "function") {
			const id = w.requestIdleCallback(() => setReady(true), { timeout: 500 });
			return () => w.cancelIdleCallback?.(id);
		}
		const t = setTimeout(() => setReady(true), 0);
		return () => clearTimeout(t);
	}, []);
	return ready ? /* @__PURE__ */ jsx(Fragment, { children }) : null;
}
/** Watches frame deltas once armed; below 40fps for 3s swaps to the poster. */
function FrameRateGuard({ armed, onTrip }) {
	const guard = useRef(new FpsGuard());
	useEffect(() => {
		guard.current.reset();
	}, [armed]);
	useFrame((_state, delta) => {
		if (armed && guard.current.push(delta)) onTrip();
	});
	return null;
}
/**
* The R3F canvas every scene renders into (spec §6.5). Only `<Lazy3D>` mounts it.
* dpr [1, 1.5] (1 on coarse pointers); antialias off, low-power, alpha. frameloop 'never' when
* off-screen, hidden or paused, 'demand' after 8s idle. PerformanceMonitor steps dpr down, then
* particles (the page-wide quality tier drops to 'low'), then swaps to the poster below 40fps for
* 3s. Context loss and render errors fall back to the poster. Disposes the renderer on unmount.
*/
function SceneCanvas({ children, active = true, interactive = false, idleMs = IDLE_MS, onFallback, camera, className }) {
	const frameloop = frameloopFor(active, usePaused(), useIdle(idleMs));
	const coarse = isCoarsePointer();
	const [step, setStep] = useState(0);
	const glRef = useRef(null);
	const fellBack = useRef(false);
	const fallback = useCallback((reason) => {
		if (fellBack.current) return;
		fellBack.current = true;
		onFallback?.(reason);
	}, [onFallback]);
	const onContextLost = useCallback((e) => {
		e.preventDefault();
		fallback("context-lost");
	}, [fallback]);
	const onCreated = useCallback(({ gl }) => {
		glRef.current = gl;
		const canvas = gl.domElement;
		canvas.setAttribute("aria-hidden", "true");
		canvas.tabIndex = -1;
		canvas.addEventListener("webglcontextlost", onContextLost, false);
	}, [onContextLost]);
	useEffect(() => () => {
		const gl = glRef.current;
		glRef.current = null;
		if (!gl) return;
		gl.domElement.removeEventListener("webglcontextlost", onContextLost, false);
		try {
			gl.dispose();
			gl.forceContextLoss();
		} catch {}
	}, [onContextLost]);
	const onDecline = useCallback(() => {
		setStep((s) => Math.min(s + 1, 2));
	}, []);
	useEffect(() => {
		if (step >= 2) reportPerformanceDecline();
	}, [step]);
	return /* @__PURE__ */ jsx(SceneErrorBoundary, {
		onError: () => fallback("error"),
		children: /* @__PURE__ */ jsx(Canvas, {
			className,
			dpr: coarse || step >= 1 ? 1 : DPR_RANGE,
			gl: { ...GL_OPTIONS },
			frameloop,
			camera: {
				fov: camera?.fov ?? 30,
				position: camera?.position ?? [
					0,
					0,
					9.4
				],
				near: .5,
				far: 40
			},
			onCreated,
			"aria-hidden": "true",
			style: {
				position: "absolute",
				inset: 0,
				pointerEvents: interactive ? "auto" : "none"
			},
			children: /* @__PURE__ */ jsxs(PerformanceMonitor, {
				bounds: () => [40, 58],
				flipflops: 3,
				onDecline,
				children: [/* @__PURE__ */ jsx(FrameRateGuard, {
					armed: step >= 2 && frameloop === "always",
					onTrip: () => fallback("performance")
				}), /* @__PURE__ */ jsx(IdleMount, { children })]
			})
		})
	});
}
//#endregion
//#region src/three/scene/StatusOrbitCards.tsx
var CARD_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
var CARD_FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uHasTex;
uniform float uRadius;
uniform float uAlpha;
uniform vec2 uSize;
uniform vec3 uTint;
uniform float uTintMix;
uniform float uMuted;
uniform vec3 uRim;
float rrect(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = rrect(p, uSize * 0.5, uRadius);
  float s = 0.014;
  float shape = 1.0 - smoothstep(-s, s, d);
  float rim = (1.0 - smoothstep(0.0, 0.045, abs(d + 0.03))) * 0.7;
  float sheen = 0.8 + 0.2 * smoothstep(0.0, 1.0, vUv.x * 0.6 + vUv.y * 0.4);
  vec3 col = mix(vec3(1.0), uTint, uTintMix) * sheen;
  float alpha = 0.68;
  vec4 tex = uHasTex > 0.5 ? texture2D(uTex, vUv) : vec4(0.0);
  col = col * (1.0 - tex.a) + tex.rgb;
  alpha = alpha + tex.a * (1.0 - alpha);
  col += uRim * rim;
  float grey = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(grey), uMuted * 0.75);
  gl_FragColor = vec4(col, shape * alpha * uAlpha);
}`;
var CARD_SIZE = [.96, .6];
var RIM_LIVE = Object.freeze([
	.2,
	.85,
	.55
]);
var RIM_WORKFLOW = Object.freeze([
	.78,
	.66,
	1
]);
var RIM_OFF = Object.freeze([
	.7,
	.7,
	.7
]);
/** Visual parameters per state. Only 'live' gets the green rim and full alpha among platforms. */
function cardLook(card, accent) {
	const lit = card.state === "live" || card.state === "workflow";
	return {
		tint: card.state === "workflow" ? accent : parseCssColor(card.color) ?? accent,
		tintMix: card.state === "workflow" ? .32 : .09,
		muted: lit ? 0 : 1,
		alpha: lit ? 1 : .45,
		rim: card.state === "live" ? RIM_LIVE : card.state === "workflow" ? RIM_WORKFLOW : RIM_OFF
	};
}
function fontStack() {
	if (typeof document === "undefined") return "ui-sans-serif, system-ui, sans-serif";
	return getComputedStyle(document.documentElement).getPropertyValue("--ui-font-body").trim() || "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif";
}
/** Label texture (canvas 2D, no troika). The same text is in the DOM list. */
function labelTexture(card, accentCss) {
	if (typeof document === "undefined") return null;
	const c = document.createElement("canvas");
	c.width = 384;
	c.height = 240;
	const ctx = c.getContext("2d");
	if (!ctx) return null;
	const hasLine = card.state === "live" || card.state === "pending";
	const y = hasLine ? 100 : 122;
	const font = fontStack();
	if (card.state === "workflow") {
		ctx.fillStyle = accentCss;
		ctx.fillRect(38, y - 14, 28, 28);
	} else {
		ctx.beginPath();
		ctx.arc(52, y, 15, 0, Math.PI * 2);
		ctx.fillStyle = card.state === "live" ? card.color : "#9ca3af";
		ctx.fill();
	}
	ctx.fillStyle = card.state === "workflow" ? "#5b21b6" : card.state === "live" ? "#111827" : "#4b5563";
	ctx.font = `800 42px ${font}`;
	ctx.textBaseline = "middle";
	ctx.fillText(card.label, 84, y + 2);
	if (hasLine) {
		ctx.font = `700 28px ${font}`;
		ctx.fillStyle = card.state === "live" ? "#047857" : "#6b7280";
		ctx.fillText(stateText(card.state), 84, 160);
	}
	const tex = new CanvasTexture(c);
	tex.premultiplyAlpha = true;
	return tex;
}
var toCss = (n) => `#${n.toString(16).padStart(6, "0")}`;
function StatusCardMesh({ card }) {
	const accent = useTokenColor("accent-1");
	const look = cardLook(card, accent);
	const tex = useMemo(() => labelTexture(card, toCss(accent)), [card, accent]);
	useEffect(() => () => tex?.dispose(), [tex]);
	const uniforms = useMemo(() => ({
		uTex: { value: tex },
		uHasTex: { value: tex ? 1 : 0 },
		uRadius: { value: .14 },
		uAlpha: { value: look.alpha },
		uSize: { value: new Vector2(...CARD_SIZE) },
		uTint: { value: new Vector3(...intToRgb(look.tint)) },
		uTintMix: { value: look.tintMix },
		uMuted: { value: look.muted },
		uRim: { value: new Vector3(...look.rim) }
	}), [
		tex,
		look.alpha,
		look.tint,
		look.tintMix,
		look.muted,
		look.rim
	]);
	return /* @__PURE__ */ jsxs("mesh", {
		renderOrder: 1,
		children: [/* @__PURE__ */ jsx("planeGeometry", { args: CARD_SIZE }), /* @__PURE__ */ jsx("shaderMaterial", {
			vertexShader: CARD_VERTEX,
			fragmentShader: CARD_FRAGMENT,
			uniforms,
			transparent: true,
			depthWrite: false
		})]
	});
}
/**
* The hero's status cards on two rings. Lit only for `live: true` platform items; the fallback
* list never lights anything (statusCards() enforces both, and is unit-tested).
*/
function StatusOrbitCards({ items, animate = true, tightness = 1 }) {
	const cards = useMemo(() => statusCards(items), [items]);
	const inner = cards.filter((_, i) => i % 2 === 0);
	const outer = cards.filter((_, i) => i % 2 === 1);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(OrbitRing, {
		...INNER_RING,
		animate,
		tightness,
		children: inner.map((c) => /* @__PURE__ */ jsx(StatusCardMesh, { card: c }, c.key))
	}), /* @__PURE__ */ jsx(OrbitRing, {
		...OUTER_RING,
		animate,
		tightness,
		children: outer.map((c) => /* @__PURE__ */ jsx(StatusCardMesh, { card: c }, c.key))
	})] });
}
//#endregion
//#region src/three/scene/StatusOrbitScene.tsx
/**
* Tilts its children toward the pointer, capped at ±4° (spec §6.3 rule 3). The scene rotates in
* place, so there is no camera translation. Listens on window because decorative canvases have
* pointer-events: none.
*/
function PointerTilt({ children, enabled = true }) {
	const group = useRef(null);
	const target = useRef({
		yaw: 0,
		pitch: 0
	});
	useEffect(() => {
		if (!enabled || typeof window === "undefined") return;
		const onMove = (e) => {
			target.current.yaw = pointerTilt(e.clientX / (window.innerWidth || 1));
			target.current.pitch = -pointerTilt(e.clientY / (window.innerHeight || 1));
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => window.removeEventListener("pointermove", onMove);
	}, [enabled]);
	useFrame((_s, delta) => {
		const g = group.current;
		if (!g) return;
		const k = Math.min(1, delta * 3.6);
		g.rotation.y += (target.current.yaw - g.rotation.y) * k;
		g.rotation.x += (target.current.pitch - g.rotation.x) * k;
	});
	return /* @__PURE__ */ jsx("group", {
		ref: group,
		children
	});
}
/** Scroll draws the rings in (hero-3d.js: to ~70% over the first 600px). */
function useScrollTightness() {
	const [t, setT] = useState(() => typeof window === "undefined" ? 1 : ringScale(window.scrollY));
	useEffect(() => {
		const onScroll = () => setT(ringScale(window.scrollY));
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return t;
}
/**
* The WMH hero scene: FresnelCore plus the two status-card rings (spec §6.7). Honesty-gated:
* a card is lit only for a `live: true` platform item.
*/
function StatusOrbitScene({ items, center = [
	0,
	0,
	0
], quality = "high", animate = true, tightness }) {
	const scrollTight = useScrollTightness();
	return /* @__PURE__ */ jsx(PointerTilt, {
		enabled: animate,
		children: /* @__PURE__ */ jsxs("group", {
			position: center,
			children: [/* @__PURE__ */ jsx(FresnelCore, {
				animate,
				segments: quality === "high" ? 40 : 24
			}), /* @__PURE__ */ jsx(StatusOrbitCards, {
				items,
				animate,
				tightness: tightness ?? scrollTight
			})]
		})
	});
}
//#endregion
//#region src/three/scene/index.ts
var sceneKit = Object.freeze({
	SceneCanvas,
	FresnelCore,
	OrbitRing,
	StatusOrbitCards,
	StatusOrbitScene
});
//#endregion
export { DPR_RANGE, FresnelCore, GL_OPTIONS, IDLE_MS, INNER_RING, OUTER_RING, OrbitRing, PointerTilt, SceneCanvas, StatusOrbitCards, StatusOrbitScene, frameloopFor, sceneKit, slotAngle };
