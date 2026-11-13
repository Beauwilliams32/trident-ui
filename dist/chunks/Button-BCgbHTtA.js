import { n as devWarn, t as cx } from "./internal-VTS5P0YN.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { LoaderCircle } from "lucide-react";
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
function buttonClassName({ variant = "primary", size = "md", fullWidth, iconOnly, gameControl, className } = {}) {
	return cx("ui-btn", `ui-btn--${variant}`, `ui-btn--${size}`, fullWidth && "ui-btn--block", iconOnly && "ui-btn--icon", gameControl && "ui-btn--game-control", className);
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
function Button({ variant = "primary", size = "md", gameControl = false, icon, iconEnd, fullWidth, loading = false, loadingLabel, type = "button", className, children, onClick, ref, ...rest }) {
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
			gameControl,
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
function LinkButton({ variant = "primary", size = "md", icon, iconEnd, fullWidth, gameControl = false, className, children, target, rel, ref, ...rest }) {
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
			gameControl,
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
function IconButton({ icon, size = "md", variant = "ghost", gameControl = false, loading = false, type = "button", className, onClick, ref, ...rest }) {
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
			gameControl,
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
export { buttonClassName as a, LinkButton as i, Button as n, IconButton as r, BUTTON_HEIGHTS as t };
