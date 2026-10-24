import { d as Kicker, f as Text, g as Container, h as Section, p as Heading, r as Badge, t as Card } from "./chunks/Card-Chgu1O6M.js";
import { t as cx } from "./chunks/internal-VTS5P0YN.js";
import { c as serializeJsonLd, r as faqPage } from "./chunks/jsonld-BwdAhi-2.js";
import { F as paused, O as subscribeMotion, S as MOTION_TOGGLE_ATTR, w as handleMotionToggleClick } from "./chunks/motion-lite-CmUY4QUg.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useId, useSyncExternalStore } from "react";
import { Check, Pause, Play } from "lucide-react";
//#region src/marketing/Hero.tsx
/**
* Marketing hero (spec §7 P1 Hero): a text H1, a lede, the actions, plus optional decorative
* backdrop and media slots. No animation of its own; reveals are opt-in by the page.
*/
function Hero({ title, kicker, lede, actions, backdrop, media, fullHeight, underNav = false, level = 1, id, className, children }) {
	const auto = useId();
	const headingId = id ? `${id}-heading` : `${auto}-heading`;
	return /* @__PURE__ */ jsxs("section", {
		id,
		className: cx("ui-hero", className),
		"aria-labelledby": headingId,
		"data-full": fullHeight ?? Boolean(backdrop) ? "" : void 0,
		"data-under-nav": underNav ? "" : void 0,
		"data-media": media ? "" : void 0,
		children: [backdrop ? /* @__PURE__ */ jsx("div", {
			className: "ui-hero__backdrop",
			"aria-hidden": "true",
			children: backdrop
		}) : null, /* @__PURE__ */ jsxs(Container, {
			size: "marketing",
			className: "ui-hero__inner",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ui-hero__copy",
				children: [
					kicker ? /* @__PURE__ */ jsx(Kicker, { children: kicker }) : null,
					/* @__PURE__ */ jsx(Heading, {
						level,
						size: "display",
						id: headingId,
						className: "ui-hero__title",
						children: title
					}),
					lede ? /* @__PURE__ */ jsx(Text, {
						size: "md",
						tone: "ink-2",
						className: "ui-hero__lede",
						children: lede
					}) : null,
					actions ? /* @__PURE__ */ jsx("div", {
						className: "ui-hero__actions",
						children: actions
					}) : null,
					children
				]
			}), media ? /* @__PURE__ */ jsx("div", {
				className: "ui-hero__media",
				children: media
			}) : null]
		})]
	});
}
//#endregion
//#region src/marketing/FeatureGrid.tsx
/** A grid of feature cards: icon tile, title, one or two sentences (spec §7 P1 FeatureGrid). */
function FeatureGrid({ heading, headingHidden = false, intro, features, reveal = true, tone = "default", className }) {
	const id = useId();
	return /* @__PURE__ */ jsxs(Section, {
		space: "lg",
		tone,
		"aria-labelledby": id,
		className: cx("ui-features", className),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ui-marketing__head",
			children: [/* @__PURE__ */ jsx(Heading, {
				level: 2,
				size: "3xl",
				id,
				className: headingHidden ? "ui-visually-hidden" : void 0,
				children: heading
			}), intro ? /* @__PURE__ */ jsx(Text, {
				tone: "muted",
				children: intro
			}) : null]
		}), /* @__PURE__ */ jsx("ul", {
			className: "ui-features__list",
			children: features.map(({ icon: Icon, title, body }, i) => /* @__PURE__ */ jsx("li", {
				...reveal ? {
					"data-reveal": "",
					style: { "--i": i }
				} : {},
				children: /* @__PURE__ */ jsxs(Card, {
					padding: "md",
					className: "ui-feature",
					children: [
						Icon ? /* @__PURE__ */ jsx("span", {
							className: "ui-feature__icon",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx(Icon, {
								size: 20,
								strokeWidth: 2,
								"aria-hidden": "true"
							})
						}) : null,
						/* @__PURE__ */ jsx(Heading, {
							level: 3,
							size: "lg",
							children: title
						}),
						/* @__PURE__ */ jsx(Text, {
							size: "sm",
							tone: "muted",
							children: body
						})
					]
				})
			}, title))
		})]
	});
}
//#endregion
//#region src/marketing/PricingTable.tsx
/**
* Plan cards for a pricing section (spec §7 P1 PricingTable). A money surface (spec §6.8): it sets
* data-surface="money", so Lazy3D refuses to mount inside it, and it has no reveal or count-up.
* Prices come only from props.
*/
function PricingTable({ heading, sub, plans, badge, renderCta, note, tone = "alt", className }) {
	const id = useId();
	return /* @__PURE__ */ jsxs(Section, {
		space: "lg",
		tone,
		"aria-labelledby": id,
		"data-surface": "money",
		className: cx("ui-pricing", className),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ui-marketing__head",
				"data-align": "center",
				children: [/* @__PURE__ */ jsx(Heading, {
					level: 2,
					size: "3xl",
					id,
					children: heading
				}), sub ? /* @__PURE__ */ jsx(Text, {
					tone: "muted",
					children: sub
				}) : null]
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "ui-pricing__plans",
				children: plans.map((plan) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Card, {
					padding: "lg",
					accent: Boolean(plan.highlight),
					className: "ui-plan",
					"data-highlight": plan.highlight ? "" : void 0,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "ui-plan__head",
							children: [/* @__PURE__ */ jsx(Heading, {
								level: 3,
								size: "lg",
								children: plan.name
							}), plan.highlight && badge ? /* @__PURE__ */ jsx(Badge, {
								tone: "accent",
								size: "sm",
								children: badge
							}) : null]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "ui-plan__price ui-tabular",
							children: [plan.price, plan.period ? /* @__PURE__ */ jsx("span", {
								className: "ui-plan__period",
								children: plan.period
							}) : null]
						}),
						plan.blurb ? /* @__PURE__ */ jsx(Text, {
							size: "sm",
							tone: "muted",
							children: plan.blurb
						}) : null,
						plan.features?.length ? /* @__PURE__ */ jsx("ul", {
							className: "ui-plan__features",
							children: plan.features.map((f, i) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check, {
								size: 16,
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("span", { children: f })] }, i))
						}) : null,
						/* @__PURE__ */ jsx("div", {
							className: "ui-plan__cta",
							children: renderCta ? renderCta(plan) : plan.cta
						})
					]
				}) }, plan.id))
			}),
			note ? /* @__PURE__ */ jsx(Text, {
				size: "sm",
				tone: "muted",
				className: "ui-pricing__note",
				children: note
			}) : null
		]
	});
}
//#endregion
//#region src/marketing/Faq.tsx
/** Questions and answers in `<details>` (spec §7 P1 FAQ): works without JavaScript. */
function Faq({ heading, items, jsonLd = false, reveal = true, className }) {
	const id = useId();
	const structured = items.filter((it) => typeof it.a === "string" && it.a.trim() !== "");
	return /* @__PURE__ */ jsxs(Section, {
		space: "lg",
		container: "prose",
		"aria-labelledby": id,
		className: cx("ui-faq", className),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "ui-marketing__head",
				"data-align": "center",
				children: /* @__PURE__ */ jsx(Heading, {
					level: 2,
					size: "3xl",
					id,
					children: heading
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ui-faq__list",
				...reveal ? { "data-reveal": "" } : {},
				children: items.map(({ q, a }) => /* @__PURE__ */ jsxs("details", {
					className: "ui-faq__item",
					children: [/* @__PURE__ */ jsx("summary", { children: q }), /* @__PURE__ */ jsx("div", {
						className: "ui-faq__answer",
						children: typeof a === "string" ? /* @__PURE__ */ jsx("p", { children: a }) : a
					})]
				}, q))
			}),
			jsonLd && structured.length > 0 ? /* @__PURE__ */ jsx("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: serializeJsonLd(faqPage(structured.map((it) => ({
					question: it.q,
					answer: it.a
				})))) }
			}) : null
		]
	});
}
//#endregion
//#region src/marketing/CtaBand.tsx
/** A closing call to action: heading, one sentence, one action (spec §7 P1 CtaBand). */
function CtaBand({ heading, body, action, reveal = true, className }) {
	const id = useId();
	return /* @__PURE__ */ jsx(Section, {
		space: "md",
		"aria-labelledby": id,
		className: cx("ui-cta-band", className),
		children: /* @__PURE__ */ jsxs("div", {
			className: "ui-cta-band__panel",
			...reveal ? { "data-reveal": "" } : {},
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ui-cta-band__copy",
				children: [/* @__PURE__ */ jsx(Heading, {
					level: 2,
					size: "2xl",
					id,
					children: heading
				}), body ? /* @__PURE__ */ jsx(Text, {
					tone: "ink-2",
					children: body
				}) : null]
			}), /* @__PURE__ */ jsx("div", {
				className: "ui-cta-band__action",
				children: action
			})]
		})
	});
}
//#endregion
//#region src/marketing/Site.tsx
/** The marketing header (spec §7 P1 SiteHeader): brand left, navigation and actions right. */
function SiteHeader({ brand, brandHref = "/", children, navLabel = "Main", overlay = false, className }) {
	return /* @__PURE__ */ jsx("header", {
		className: cx("ui-site-header", className),
		"data-overlay": overlay ? "" : void 0,
		children: /* @__PURE__ */ jsxs(Container, {
			size: "marketing",
			className: "ui-site-header__inner",
			children: [/* @__PURE__ */ jsx("a", {
				className: "ui-site-header__brand",
				href: brandHref,
				children: brand
			}), children ? /* @__PURE__ */ jsx("nav", {
				className: "ui-site-header__nav",
				"aria-label": navLabel,
				children
			}) : null]
		})
	});
}
/** The marketing footer (spec §7 P1 Footer, which includes the MotionToggle). */
function SiteFooter({ note, children, motionToggle, navLabel = "Footer", className }) {
	return /* @__PURE__ */ jsx("footer", {
		className: cx("ui-site-footer", className),
		children: /* @__PURE__ */ jsxs(Container, {
			size: "marketing",
			className: "ui-site-footer__inner",
			children: [note ? /* @__PURE__ */ jsx("p", {
				className: "ui-site-footer__note",
				children: note
			}) : null, /* @__PURE__ */ jsxs("div", {
				className: "ui-site-footer__end",
				children: [children ? /* @__PURE__ */ jsx("nav", {
					className: "ui-site-footer__links",
					"aria-label": navLabel,
					children
				}) : null, motionToggle]
			})]
		})
	});
}
//#endregion
//#region src/marketing/MotionToggle.tsx
/**
* The persistent "Pause motion" control (spec §6.3 rule 5, WCAG 2.2.2) for static and marketing
* pages. The same markup and store as `@trident/ui/motion`'s MotionToggle, built on motion-lite, so
* it needs no `motion` peer (G6: Ops re-implemented exactly this to keep the library off its landing).
*/
function MotionToggle({ label = "Pause motion", className }) {
	const isPaused = useSyncExternalStore(subscribeMotion, paused, () => false);
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: className ? `ui-motion-toggle ${className}` : "ui-motion-toggle",
		"aria-pressed": isPaused,
		onClick: (e) => handleMotionToggleClick(e.nativeEvent),
		[MOTION_TOGGLE_ATTR]: "",
		children: [isPaused ? /* @__PURE__ */ jsx(Play, {
			"aria-hidden": "true",
			size: 14
		}) : /* @__PURE__ */ jsx(Pause, {
			"aria-hidden": "true",
			size: 14
		}), label]
	});
}
//#endregion
export { CtaBand, Faq, FeatureGrid, Hero, MotionToggle, PricingTable, SiteFooter, SiteHeader };
