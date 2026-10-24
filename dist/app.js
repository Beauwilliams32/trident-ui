import { n as devWarn, t as cx } from "./chunks/internal-VTS5P0YN.js";
import { a as buttonClassName, i as LinkButton, n as Button, r as IconButton } from "./chunks/Button-BaAADE7b.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import * as RD from "@radix-ui/react-dialog";
import * as AD from "@radix-ui/react-alert-dialog";
import * as RP from "@radix-ui/react-popover";
import * as RT$1 from "@radix-ui/react-tooltip";
import * as CM from "@radix-ui/react-context-menu";
import * as DM from "@radix-ui/react-dropdown-menu";
import * as RT from "@radix-ui/react-tabs";
import { Command } from "cmdk";
//#region src/app/focus.ts
/**
* Focus return for overlays opened without a Radix Trigger (controlled dialogs, the command
* palette, a dialog opened from a menu item). Radix returns focus to its Trigger; with none, focus
* would fall to <body>. This remembers what had focus when the overlay opened and restores it on
* close (spec §9: "Escape closes overlays and returns focus").
*/
function useReturnFocus(hasTrigger) {
	const returnTo = useRef(null);
	return {
		onOpenAutoFocus: () => {
			const active = document.activeElement;
			returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null;
		},
		onCloseAutoFocus: (event) => {
			if (hasTrigger || !returnTo.current?.isConnected) return;
			event.preventDefault();
			returnTo.current.focus();
			returnTo.current = null;
		}
	};
}
//#endregion
//#region src/app/Dialog.tsx
function Body({ title, description, children, footer, closeLabel = "Close" }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "ui-dialog__header",
			children: [/* @__PURE__ */ jsx(RD.Title, {
				className: "ui-dialog__title",
				children: title
			}), description ? /* @__PURE__ */ jsx(RD.Description, {
				className: "ui-dialog__description",
				children: description
			}) : null]
		}),
		children ? /* @__PURE__ */ jsx("div", {
			className: "ui-dialog__body",
			children
		}) : null,
		footer ? /* @__PURE__ */ jsx("div", {
			className: "ui-dialog__footer",
			children: footer
		}) : null,
		/* @__PURE__ */ jsx(RD.Close, {
			asChild: true,
			children: /* @__PURE__ */ jsx(IconButton, {
				icon: X,
				"aria-label": closeLabel,
				variant: "ghost",
				size: "sm",
				className: "ui-dialog__close"
			})
		})
	] });
}
function Shell({ open, defaultOpen, onOpenChange, trigger, className, contentClass, data, ...body }) {
	const focus = useReturnFocus(Boolean(trigger));
	return /* @__PURE__ */ jsxs(RD.Root, {
		...open === void 0 ? {} : { open },
		defaultOpen,
		onOpenChange,
		children: [trigger ? /* @__PURE__ */ jsx(RD.Trigger, {
			asChild: true,
			children: trigger
		}) : null, /* @__PURE__ */ jsxs(RD.Portal, { children: [/* @__PURE__ */ jsx(RD.Overlay, { className: "ui-overlay" }), /* @__PURE__ */ jsx(RD.Content, {
			className: cx(contentClass, className),
			...data,
			...focus,
			...body.description ? {} : { "aria-describedby": void 0 },
			children: /* @__PURE__ */ jsx(Body, { ...body })
		})] })]
	});
}
/**
* Modal dialog (spec §7 P1; Radix Dialog). Focus moves in and is trapped, the page behind is inert,
* Escape or the close button closes it, and focus returns to the trigger. Solid surface, no blur
* (spec §5 e3/e4 overlays). For "are you sure?" use ConfirmDialog, which cannot be dismissed by a
* stray click outside.
*/
function Dialog({ size = "md", ...props }) {
	return /* @__PURE__ */ jsx(Shell, {
		...props,
		contentClass: "ui-dialog",
		data: { "data-size": size }
	});
}
/** A dialog that slides from an edge (filters, detail panes, mobile navigation). */
function Sheet({ side = "right", ...props }) {
	return /* @__PURE__ */ jsx(Shell, {
		...props,
		contentClass: "ui-dialog ui-sheet",
		data: { "data-side": side }
	});
}
/** Closes the surrounding Dialog or Sheet. Use with `asChild` around a Button. */
var DialogClose = RD.Close;
//#endregion
//#region src/app/ConfirmDialog.tsx
/**
* The replacement for `window.confirm()` (spec §7 P1 AlertDialog/ConfirmDialog; Radix AlertDialog).
* It cannot be dismissed by clicking outside; Escape and Cancel close it; Cancel has initial focus.
* Destructive actions are styled as danger but never as the primary fill (Apple HIG "Role").
*/
function ConfirmDialog({ open, defaultOpen, onOpenChange, trigger, title, description, confirmLabel, cancelLabel = "Cancel", onConfirm, confirmForm, destructive = false, children, className }) {
	const focus = useReturnFocus(Boolean(trigger));
	return /* @__PURE__ */ jsxs(AD.Root, {
		...open === void 0 ? {} : { open },
		defaultOpen,
		onOpenChange,
		children: [trigger ? /* @__PURE__ */ jsx(AD.Trigger, {
			asChild: true,
			children: trigger
		}) : null, /* @__PURE__ */ jsxs(AD.Portal, { children: [/* @__PURE__ */ jsx(AD.Overlay, { className: "ui-overlay" }), /* @__PURE__ */ jsxs(AD.Content, {
			className: cx("ui-dialog", className),
			"data-size": "sm",
			"data-role": "alertdialog",
			onCloseAutoFocus: focus.onCloseAutoFocus,
			onOpenAutoFocus: focus.onOpenAutoFocus,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "ui-dialog__header",
					children: [/* @__PURE__ */ jsx(AD.Title, {
						className: "ui-dialog__title",
						children: title
					}), /* @__PURE__ */ jsx(AD.Description, {
						className: "ui-dialog__description",
						children: description
					})]
				}),
				children ? /* @__PURE__ */ jsx("div", {
					className: "ui-dialog__body",
					children
				}) : null,
				/* @__PURE__ */ jsxs("div", {
					className: "ui-dialog__footer",
					children: [/* @__PURE__ */ jsx(AD.Cancel, {
						className: buttonClassName({ variant: "secondary" }),
						children: /* @__PURE__ */ jsx("span", {
							className: "ui-btn__label",
							children: cancelLabel
						})
					}), /* @__PURE__ */ jsx(AD.Action, {
						className: buttonClassName({ variant: destructive ? "danger" : "primary" }),
						onClick: () => {
							onConfirm?.();
							if (confirmForm) document.getElementById(confirmForm)?.requestSubmit();
						},
						children: /* @__PURE__ */ jsx("span", {
							className: "ui-btn__label",
							children: confirmLabel
						})
					})]
				})
			]
		})] })]
	});
}
//#endregion
//#region src/app/Popover.tsx
/**
* Non-modal floating panel anchored to its trigger (spec §7 P1; Radix Popover): filters, quick
* settings, a date. Escape or a click outside closes it and focus returns to the trigger.
*/
function Popover({ open, defaultOpen, onOpenChange, trigger, children, label, side = "bottom", align = "start", className }) {
	return /* @__PURE__ */ jsxs(RP.Root, {
		...open === void 0 ? {} : { open },
		defaultOpen,
		onOpenChange,
		children: [/* @__PURE__ */ jsx(RP.Trigger, {
			asChild: true,
			children: trigger
		}), /* @__PURE__ */ jsx(RP.Portal, { children: /* @__PURE__ */ jsxs(RP.Content, {
			className: cx("ui-popover", className),
			side,
			align,
			sideOffset: 8,
			collisionPadding: 16,
			"aria-label": label,
			children: [children, /* @__PURE__ */ jsx(RP.Arrow, {
				className: "ui-popover__arrow",
				width: 12,
				height: 6
			})]
		}) })]
	});
}
var PopoverClose = RP.Close;
//#endregion
//#region src/app/Tooltip.tsx
/**
* Tooltip (spec §7 P1, WCAG 1.4.13; Radix Tooltip): appears on hover and focus, can be hovered
* without vanishing, and Escape dismisses it without moving focus. An IconButton still needs its
* own aria-label; the tooltip repeats it visually.
*/
function Tooltip({ content, children, side = "top", delay = 400, className }) {
	return /* @__PURE__ */ jsx(RT$1.Provider, {
		delayDuration: delay,
		skipDelayDuration: 300,
		children: /* @__PURE__ */ jsxs(RT$1.Root, { children: [/* @__PURE__ */ jsx(RT$1.Trigger, {
			asChild: true,
			children
		}), /* @__PURE__ */ jsx(RT$1.Portal, { children: /* @__PURE__ */ jsxs(RT$1.Content, {
			className: cx("ui-tooltip", className),
			side,
			sideOffset: 6,
			collisionPadding: 8,
			children: [content, /* @__PURE__ */ jsx(RT$1.Arrow, {
				className: "ui-tooltip__arrow",
				width: 10,
				height: 5
			})]
		}) })] })
	});
}
//#endregion
//#region src/app/Menu.tsx
function entries(P, items) {
	return items.map((it, i) => {
		if (it.type === "separator") return /* @__PURE__ */ jsx(P.Separator, { className: "ui-menu__separator" }, i);
		if (it.type === "label") return /* @__PURE__ */ jsx(P.Label, {
			className: "ui-menu__label",
			children: it.label
		}, i);
		return /* @__PURE__ */ jsxs(P.Item, {
			className: "ui-menu__item",
			disabled: it.disabled,
			onSelect: it.onSelect,
			"data-danger": it.danger ? "" : void 0,
			children: [
				it.icon ? /* @__PURE__ */ jsx("span", {
					className: "ui-menu__icon",
					"aria-hidden": "true",
					children: it.icon
				}) : null,
				/* @__PURE__ */ jsx("span", {
					className: "ui-menu__text",
					children: it.label
				}),
				it.shortcut ? /* @__PURE__ */ jsx("span", {
					className: "ui-menu__shortcut",
					"aria-hidden": "true",
					children: it.shortcut
				}) : null
			]
		}, i);
	});
}
/**
* Menu of actions behind a button (spec §7 P1; Radix DropdownMenu): arrow keys move, typeahead
* jumps, Enter selects, Escape closes and returns focus to the trigger.
*/
function DropdownMenu({ trigger, items, label, align = "start", open, onOpenChange, modal = false, className }) {
	return /* @__PURE__ */ jsxs(DM.Root, {
		...open === void 0 ? {} : { open },
		onOpenChange,
		modal,
		children: [/* @__PURE__ */ jsx(DM.Trigger, {
			asChild: true,
			children: trigger
		}), /* @__PURE__ */ jsx(DM.Portal, { children: /* @__PURE__ */ jsx(DM.Content, {
			className: cx("ui-menu", className),
			align,
			sideOffset: 6,
			collisionPadding: 16,
			"aria-label": label,
			children: entries(DM, items)
		}) })]
	});
}
/**
* Right-click menu (spec §7 P1; Radix ContextMenu). Every action in it must also be reachable
* another way (a DropdownMenu or a button): a context menu is a shortcut, never the only path.
*/
function ContextMenu({ children, items, label, className }) {
	return /* @__PURE__ */ jsxs(CM.Root, {
		modal: false,
		children: [/* @__PURE__ */ jsx(CM.Trigger, {
			asChild: true,
			children
		}), /* @__PURE__ */ jsx(CM.Portal, { children: /* @__PURE__ */ jsx(CM.Content, {
			className: cx("ui-menu", className),
			collisionPadding: 16,
			"aria-label": label,
			children: entries(CM, items)
		}) })]
	});
}
//#endregion
//#region src/app/Tabs.tsx
/**
* Tabs (spec §7 P1; Radix Tabs): one tab stop, arrow keys move between tabs, the panel follows.
* Use for peer views of one object, never for steps in a flow (use a Stepper) or for navigation
* between pages (use links).
*/
function Tabs({ items, label, value, defaultValue, onValueChange, className }) {
	return /* @__PURE__ */ jsxs(RT.Root, {
		className: cx("ui-tabs", className),
		...value === void 0 ? {} : { value },
		defaultValue: defaultValue ?? items[0]?.value,
		onValueChange,
		children: [/* @__PURE__ */ jsx(RT.List, {
			className: "ui-tabs__list",
			"aria-label": label,
			children: items.map((t) => /* @__PURE__ */ jsx(RT.Trigger, {
				value: t.value,
				disabled: t.disabled,
				className: "ui-tabs__tab",
				children: t.label
			}, t.value))
		}), items.map((t) => /* @__PURE__ */ jsx(RT.Content, {
			value: t.value,
			className: "ui-tabs__panel",
			children: t.content
		}, t.value))]
	});
}
//#endregion
//#region src/app/CommandPalette.tsx
/**
* Command palette (spec §7 P1; cmdk 1.x inside a Radix dialog): type to filter, arrows to move,
* Enter to run, Escape to close with focus returned to whatever had it. Every command must also
* exist in the normal UI; the palette is a shortcut for keyboard users, not the only path.
* (cmdk's own Command.Dialog cannot return focus without a trigger, so the dialog is ours.)
*/
function CommandPalette({ open, onOpenChange, items, label = "Command palette", placeholder = "Type a command or search…", emptyText = "No results.", hotkey = "k" }) {
	useEffect(() => {
		if (!hotkey) return;
		const onKey = (e) => {
			if (e.key.toLowerCase() === hotkey && (e.metaKey || e.ctrlKey) && !e.altKey) {
				e.preventDefault();
				onOpenChange(!open);
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [
		hotkey,
		open,
		onOpenChange
	]);
	const focus = useReturnFocus(false);
	const groups = /* @__PURE__ */ new Map();
	for (const it of items) {
		const g = it.group ?? "";
		groups.set(g, [...groups.get(g) ?? [], it]);
	}
	return /* @__PURE__ */ jsx(RD.Root, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(RD.Portal, { children: [/* @__PURE__ */ jsx(RD.Overlay, { className: "ui-overlay" }), /* @__PURE__ */ jsxs(RD.Content, {
			className: "ui-dialog ui-command",
			"aria-describedby": void 0,
			...focus,
			children: [/* @__PURE__ */ jsx(RD.Title, {
				className: "ui-visually-hidden",
				children: label
			}), /* @__PURE__ */ jsxs(Command, {
				label,
				className: "ui-command__root",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "ui-command__search",
					children: [/* @__PURE__ */ jsx(Search, {
						size: 18,
						"aria-hidden": "true"
					}), /* @__PURE__ */ jsx(Command.Input, {
						className: "ui-command__input",
						placeholder
					})]
				}), /* @__PURE__ */ jsxs(Command.List, {
					className: "ui-command__list",
					children: [/* @__PURE__ */ jsx(Command.Empty, {
						className: "ui-command__empty",
						children: emptyText
					}), [...groups].map(([heading, list]) => /* @__PURE__ */ jsx(Command.Group, {
						heading: heading || void 0,
						className: "ui-command__group",
						children: list.map((it) => /* @__PURE__ */ jsxs(Command.Item, {
							value: `${it.label} ${it.id}`,
							keywords: it.keywords,
							className: "ui-menu__item",
							onSelect: () => {
								it.onSelect();
								onOpenChange(false);
							},
							children: [
								it.icon ? /* @__PURE__ */ jsx("span", {
									className: "ui-menu__icon",
									"aria-hidden": "true",
									children: it.icon
								}) : null,
								/* @__PURE__ */ jsx("span", {
									className: "ui-menu__text",
									children: it.label
								}),
								it.shortcut ? /* @__PURE__ */ jsx("span", {
									className: "ui-menu__shortcut",
									"aria-hidden": "true",
									children: it.shortcut
								}) : null
							]
						}, it.id))
					}, heading || "all"))]
				})]
			})]
		})] })
	});
}
//#endregion
//#region src/app/Skeleton.tsx
var px = (v) => typeof v === "number" ? `${v}px` : v;
/**
* A placeholder shape while content loads (spec §7 P1; Carbon data table loading). Decorative and
* aria-hidden: announce loading once on the container (SkeletonGroup). The shimmer runs once for
* at most 1s and then stays static (spec §6.3 rule 7); none under reduced motion or Pause.
*/
function Skeleton({ width, height, shape = "line", className, style, ...rest }) {
	const s = { ...style };
	if (width !== void 0) s.inlineSize = px(width);
	if (height !== void 0) s.blockSize = px(height);
	return /* @__PURE__ */ jsx("span", {
		...rest,
		"aria-hidden": "true",
		className: cx("ui-skeleton", className),
		"data-shape": shape,
		style: s
	});
}
/** Wraps skeletons: role=status with a visually hidden label and aria-busy while it is shown. */
function SkeletonGroup({ label = "Loading…", className, children, ...rest }) {
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		role: "status",
		"aria-busy": "true",
		className: cx("ui-skeleton-group", className),
		children: [/* @__PURE__ */ jsx("span", {
			className: "ui-visually-hidden",
			children: label
		}), children]
	});
}
//#endregion
//#region src/app/DataTable.tsx
var VIRTUALISE_ABOVE = 200;
function valueOf(row, col) {
	if (typeof col.sort === "function") return col.sort(row);
	const v = row[col.key];
	return typeof v === "number" || typeof v === "string" ? v : v == null ? null : String(v);
}
function compare(a, b) {
	if (a == null && b == null) return 0;
	if (a == null) return 1;
	if (b == null) return -1;
	if (typeof a === "number" && typeof b === "number") return a - b;
	return String(a).localeCompare(String(b), void 0, {
		numeric: true,
		sensitivity: "base"
	});
}
/** none -> ascending -> descending -> none (three-state sortable headers, Carbon). */
function nextSort(current, key) {
	if (!current || current.key !== key) return {
		key,
		direction: "ascending"
	};
	return current.direction === "ascending" ? {
		key,
		direction: "descending"
	} : null;
}
/**
* Data table (spec §7 P1; Carbon data table anatomy): solid rows, a sticky header, three-state
* sortable header buttons with aria-sort, its own keyboard-scrollable container, density tokens,
* skeleton loading and an empty state. Up to 200 rows render directly; page or filter beyond that.
*/
function DataTable({ columns, rows, rowKey, caption, captionHidden = false, sort: controlled, defaultSort = null, onSortChange, density = "default", loading = false, loadingRows = 5, empty, toolbar, footer, maxHeight, className }) {
	const captionId = useId();
	const [own, setOwn] = useState(defaultSort);
	const sort = controlled === void 0 ? own : controlled;
	if (rows.length > VIRTUALISE_ABOVE) devWarn(`DataTable got ${rows.length} rows; page or filter above ${VIRTUALISE_ABOVE} (spec §7).`);
	const sorted = useMemo(() => {
		const col = sort ? columns.find((c) => c.key === sort.key && c.sort) : void 0;
		if (!sort || !col) return rows;
		const dir = sort.direction === "ascending" ? 1 : -1;
		return [...rows].map((r, i) => ({
			r,
			i
		})).sort((x, y) => compare(valueOf(x.r, col), valueOf(y.r, col)) * dir || x.i - y.i).map((x) => x.r);
	}, [
		rows,
		columns,
		sort
	]);
	const onSort = (key) => {
		const next = nextSort(sort, key);
		if (controlled === void 0) setOwn(next);
		onSortChange?.(next);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: cx("ui-table-wrap", className),
		"data-density": density,
		children: [
			toolbar ? /* @__PURE__ */ jsx("div", {
				className: "ui-table-toolbar",
				children: toolbar
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "ui-table-scroll",
				role: "region",
				"aria-labelledby": captionId,
				tabIndex: 0,
				style: maxHeight === void 0 ? void 0 : { maxBlockSize: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight },
				children: /* @__PURE__ */ jsxs("table", {
					className: "ui-table",
					"aria-busy": loading || void 0,
					children: [
						/* @__PURE__ */ jsx("caption", {
							id: captionId,
							className: captionHidden ? "ui-visually-hidden" : "ui-table__caption",
							children: caption
						}),
						/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((c) => {
							const active = sort?.key === c.key ? sort.direction : void 0;
							return /* @__PURE__ */ jsx("th", {
								scope: "col",
								"aria-sort": c.sort ? active ?? "none" : void 0,
								"data-numeric": c.numeric ? "" : void 0,
								style: c.width ? { inlineSize: c.width } : void 0,
								children: c.sort ? /* @__PURE__ */ jsxs("button", {
									type: "button",
									className: "ui-table__sort",
									onClick: () => onSort(c.key),
									children: [/* @__PURE__ */ jsx("span", { children: c.header }), active === "ascending" ? /* @__PURE__ */ jsx(ArrowUp, {
										size: 14,
										"aria-hidden": "true"
									}) : active === "descending" ? /* @__PURE__ */ jsx(ArrowDown, {
										size: 14,
										"aria-hidden": "true"
									}) : /* @__PURE__ */ jsx(ArrowUpDown, {
										size: 14,
										"aria-hidden": "true",
										className: "ui-table__sort-idle"
									})]
								}) : c.header
							}, c.key);
						}) }) }),
						/* @__PURE__ */ jsx("tbody", { children: loading ? Array.from({ length: loadingRows }, (_, i) => /* @__PURE__ */ jsx("tr", {
							"data-loading": "",
							children: columns.map((c) => /* @__PURE__ */ jsx("td", {
								"data-numeric": c.numeric ? "" : void 0,
								children: /* @__PURE__ */ jsx(Skeleton, { width: c.numeric ? "4em" : `${60 + (i * 7 + c.key.length * 5) % 35}%` })
							}, c.key))
						}, `loading-${i}`)) : sorted.length === 0 ? /* @__PURE__ */ jsx("tr", {
							"data-empty": "",
							children: /* @__PURE__ */ jsx("td", {
								colSpan: columns.length,
								children: empty ?? "No rows."
							})
						}) : sorted.map((row, i) => /* @__PURE__ */ jsx("tr", { children: columns.map((c) => {
							const content = c.cell ? c.cell(row) : String(row[c.key] ?? "");
							return c.rowHeader ? /* @__PURE__ */ jsx("th", {
								scope: "row",
								"data-numeric": c.numeric ? "" : void 0,
								children: content
							}, c.key) : /* @__PURE__ */ jsx("td", {
								"data-numeric": c.numeric ? "" : void 0,
								children: content
							}, c.key);
						}) }, rowKey(row, i))) })
					]
				})
			}),
			footer ? /* @__PURE__ */ jsx("div", {
				className: "ui-table-footer",
				children: footer
			}) : null
		]
	});
}
//#endregion
//#region src/app/Pagination.tsx
/**
* Previous / next paging with the position as text ("Page 2 of 7"), at the bottom of a table or
* list (spec §7 P1; Carbon puts pagination below the table). Links when `hrefFor` is given.
*/
function Pagination({ page, pageCount, hrefFor, onPageChange, label = "Pagination", className }) {
	const total = Math.max(1, Math.floor(pageCount));
	const current = Math.min(Math.max(1, Math.floor(page)), total);
	const control = (to, dir) => {
		const disabled = dir === "prev" ? current <= 1 : current >= total;
		const text = dir === "prev" ? "Previous" : "Next";
		const icon = dir === "prev" ? { icon: ChevronLeft } : { iconEnd: ChevronRight };
		if (hrefFor && !disabled) return /* @__PURE__ */ jsx(LinkButton, {
			href: hrefFor(to),
			variant: "secondary",
			size: "sm",
			rel: dir,
			...icon,
			children: text
		});
		return /* @__PURE__ */ jsx(Button, {
			variant: "secondary",
			size: "sm",
			disabled,
			onClick: () => onPageChange?.(to),
			...icon,
			children: text
		});
	};
	return /* @__PURE__ */ jsxs("nav", {
		className: cx("ui-pagination", className),
		"aria-label": label,
		children: [
			control(current - 1, "prev"),
			/* @__PURE__ */ jsxs("span", {
				className: "ui-pagination__status",
				"aria-current": "page",
				children: [
					"Page ",
					current,
					" of ",
					total
				]
			}),
			control(current + 1, "next")
		]
	});
}
//#endregion
//#region src/app/EmptyState.tsx
/**
* Empty-state anatomy (spec §7 P1): media, title, description, then one primary action. Use it for
* first use ("nothing here yet"), for a filter that matched nothing, and after the user cleared
* everything, each with its own copy and next step. Never fake content to fill the space.
*/
function EmptyState({ title, description, icon, media, action, secondaryAction, headingLevel = 2, size = "md", className, ...rest }) {
	const id = useId();
	const H = `h${headingLevel}`;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		className: cx("ui-empty", className),
		"data-size": size,
		role: rest.role ?? "group",
		"aria-labelledby": rest["aria-labelledby"] ?? id,
		children: [
			media ? /* @__PURE__ */ jsx("div", {
				className: "ui-empty__media",
				"aria-hidden": "true",
				children: media
			}) : icon ? /* @__PURE__ */ jsx("span", {
				className: "ui-empty__icon",
				"aria-hidden": "true",
				children: icon
			}) : null,
			/* @__PURE__ */ jsx(H, {
				id,
				className: "ui-empty__title",
				children: title
			}),
			description ? /* @__PURE__ */ jsx("p", {
				className: "ui-empty__description",
				children: description
			}) : null,
			action || secondaryAction ? /* @__PURE__ */ jsxs("div", {
				className: "ui-empty__actions",
				children: [action, secondaryAction]
			}) : null
		]
	});
}
//#endregion
export { CommandPalette, ConfirmDialog, ContextMenu, DataTable, Dialog, DialogClose, DropdownMenu, EmptyState, Pagination, Popover, PopoverClose, Sheet, Skeleton, SkeletonGroup, Tabs, Tooltip };
