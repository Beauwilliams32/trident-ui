//#region src/three/colors.ts
var DEFAULT_THEME = "trident-studio";
var HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function hexToInt(hex) {
	let body = hex.trim().replace(/^#/, "").toLowerCase();
	if (body.length === 3) body = [...body].map((c) => c + c).join("");
	return Number.parseInt(body, 16);
}
/**
* Parse a computed CSS colour (`#rgb`, `#rrggbb`, `rgb()`/`rgba()`) into a 0xRRGGBB int.
* Anything else (color-mix(), gradients, empty) returns null so callers use the generated value.
*/
function parseCssColor(value) {
	const v = (value ?? "").trim();
	if (!v) return null;
	if (HEX_RE.test(v)) return hexToInt(v);
	const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v);
	if (!m) return null;
	const [r, g, b] = [
		m[1],
		m[2],
		m[3]
	].map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))));
	return r << 16 | g << 8 | b;
}
/** 0xRRGGBB -> [r, g, b] in 0..1 (for shader uniforms). */
function intToRgb(n) {
	return [
		(n >> 16 & 255) / 255,
		(n >> 8 & 255) / 255,
		(n & 255) / 255
	];
}
var generated = null;
var pending = null;
var listeners = /* @__PURE__ */ new Set();
/** Fetch the generated colour map (once). Resolves to the module with generatedColors(). */
function loadGeneratedColors() {
	if (generated) return Promise.resolve(generated);
	pending ??= import("./generated-r2Bdfpg5.js").then((m) => {
		generated = m;
		listeners.forEach((fn) => fn());
		return m;
	});
	return pending;
}
/** The generated map for a theme if it has loaded, else null. */
function generatedColorsIfLoaded(theme, palette) {
	return generated ? generated.generatedColors(theme, palette) : null;
}
function onGeneratedColors(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
//#endregion
export { onGeneratedColors as a, loadGeneratedColors as i, generatedColorsIfLoaded as n, parseCssColor as o, intToRgb as r, DEFAULT_THEME as t };
