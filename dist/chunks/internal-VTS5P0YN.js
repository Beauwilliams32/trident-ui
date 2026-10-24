//#region src/actions/internal.ts
/** Join truthy class names. */
function cx(...parts) {
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
export { mergeRefs as i, devWarn as n, joinIds as r, cx as t };
