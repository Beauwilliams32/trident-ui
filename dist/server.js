import { a as PROPS_ATTR, i as ISLAND_NAME, n as HYDRATE_STRATEGIES, r as ISLAND_ATTR, t as HYDRATE_ATTR } from "./chunks/protocol-BRPdILwH.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createElement } from "react";
import { renderToReadableStream, renderToStaticMarkup, renderToString } from "react-dom/server.edge";
//#region src/server/json.ts
var UNSAFE = /[<>&\u2028\u2029]/g;
var ESCAPES = {
	"<": "\\u003c",
	">": "\\u003e",
	"&": "\\u0026",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
/**
* `JSON.stringify` with `<`, `>`, `&`, U+2028 and U+2029 escaped, so the text can never close the
* surrounding `<script>` element or open an HTML comment. The result still parses to the same value.
*/
function safeJson(value) {
	const text = JSON.stringify(value);
	if (text === void 0) throw new TypeError("safeJson: value is not JSON-serialisable");
	return text.replace(UNSAFE, (ch) => ESCAPES[ch] ?? ch);
}
/**
* Throws a TypeError naming the path of the first value that would not round-trip through JSON
* (functions, symbols, bigints, undefined, non-finite numbers, Dates, Maps, class instances).
* Island props must round-trip exactly, or the client renders different markup from the server.
*/
function assertJsonSerializable(value, path = "props") {
	if (value === null || typeof value === "string" || typeof value === "boolean") return;
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new TypeError(`${path} is ${value}, which JSON turns into null`);
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, i) => assertJsonSerializable(item, `${path}[${i}]`));
		return;
	}
	if (typeof value === "object") {
		const proto = Object.getPrototypeOf(value);
		if (proto !== Object.prototype && proto !== null) throw new TypeError(`${path} is a ${proto?.constructor?.name ?? "non-plain object"}; pass plain JSON (e.g. an ISO string for a Date)`);
		for (const [key, item] of Object.entries(value)) assertJsonSerializable(item, `${path}.${key}`);
		return;
	}
	throw new TypeError(`${path} is a ${typeof value}, which cannot be serialised into island props`);
}
//#endregion
//#region src/server/jsonld.ts
/**
* schema.org JSON-LD builders (spec §7: SeoHead + jsonLd builders; FAQ uses FAQPage JSON-LD;
* Breadcrumbs carry BreadcrumbList; Testimonial/Product never carry aggregateRating).
*
* Honesty rules (spec §6.3-9, §7):
* - Builders only emit what the caller supplies. Nothing is defaulted into existence.
* - `product()` has no rating or review input, and rejects `aggregateRating` / `review` at runtime,
*   so a rating can never be fabricated through this API.
* - Every URL must be absolute http(s); relative URLs are rejected rather than guessed.
*/
var SCHEMA_CONTEXT = "https://schema.org";
function absoluteUrl(value, field) {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new TypeError(`${field} must be an absolute URL, got "${value}"`);
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") throw new TypeError(`${field} must be http(s), got "${value}"`);
	return url.href;
}
function nonEmpty(value, field) {
	const trimmed = value.trim();
	if (!trimmed) throw new TypeError(`${field} must not be empty`);
	return trimmed;
}
/** Drops undefined keys and empty arrays so optional inputs never serialise as null/[]. */
function compact(node) {
	for (const key of Object.keys(node)) {
		const v = node[key];
		if (v === void 0 || Array.isArray(v) && v.length === 0) delete node[key];
	}
	return node;
}
function organization(input) {
	return compact({
		"@context": SCHEMA_CONTEXT,
		"@type": "Organization",
		"@id": input.id && absoluteUrl(input.id, "organization.id"),
		name: nonEmpty(input.name, "organization.name"),
		url: absoluteUrl(input.url, "organization.url"),
		logo: input.logo && absoluteUrl(input.logo, "organization.logo"),
		description: input.description,
		sameAs: input.sameAs?.map((u, i) => absoluteUrl(u, `organization.sameAs[${i}]`)),
		email: input.email,
		telephone: input.telephone
	});
}
function webSite(input) {
	let potentialAction;
	if (input.searchUrlTemplate) {
		if (!input.searchUrlTemplate.includes("{search_term_string}")) throw new TypeError("webSite.searchUrlTemplate must contain {search_term_string}");
		absoluteUrl(input.searchUrlTemplate.replace("{search_term_string}", "q"), "webSite.searchUrlTemplate");
		potentialAction = {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: input.searchUrlTemplate
			},
			"query-input": "required name=search_term_string"
		};
	}
	return compact({
		"@context": SCHEMA_CONTEXT,
		"@type": "WebSite",
		name: nonEmpty(input.name, "webSite.name"),
		url: absoluteUrl(input.url, "webSite.url"),
		description: input.description,
		inLanguage: input.inLanguage,
		publisher: input.publisherId ? { "@id": absoluteUrl(input.publisherId, "webSite.publisherId") } : void 0,
		potentialAction
	});
}
/** FAQPage JSON-LD. The questions and answers must match what the page visibly renders. */
function faqPage(items) {
	if (items.length === 0) throw new TypeError("faqPage needs at least one question");
	return {
		"@context": SCHEMA_CONTEXT,
		"@type": "FAQPage",
		mainEntity: items.map((item, i) => ({
			"@type": "Question",
			name: nonEmpty(item.question, `faqPage[${i}].question`),
			acceptedAnswer: {
				"@type": "Answer",
				text: nonEmpty(item.answer, `faqPage[${i}].answer`)
			}
		}))
	};
}
function breadcrumbList(items) {
	if (items.length === 0) throw new TypeError("breadcrumbList needs at least one item");
	return {
		"@context": SCHEMA_CONTEXT,
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => {
			const last = i === items.length - 1;
			if (!item.url && !last) throw new TypeError(`breadcrumbList[${i}].url is required on every crumb but the last`);
			return compact({
				"@type": "ListItem",
				position: i + 1,
				name: nonEmpty(item.name, `breadcrumbList[${i}].name`),
				item: item.url && absoluteUrl(item.url, `breadcrumbList[${i}].url`)
			});
		})
	};
}
function offer(input) {
	const price = typeof input.price === "string" ? Number(input.price) : input.price;
	if (!Number.isFinite(price) || price < 0) throw new TypeError(`offer.price must be a non-negative number, got "${input.price}"`);
	if (!/^[A-Z]{3}$/.test(input.priceCurrency)) throw new TypeError(`offer.priceCurrency must be ISO 4217 (e.g. USD), got "${input.priceCurrency}"`);
	return compact({
		"@type": "Offer",
		price: String(input.price).trim(),
		priceCurrency: input.priceCurrency,
		availability: input.availability && `https://schema.org/${input.availability}`,
		url: input.url && absoluteUrl(input.url, "offer.url"),
		priceValidUntil: input.priceValidUntil,
		seller: input.sellerName ? {
			"@type": "Organization",
			name: input.sellerName
		} : void 0
	});
}
var FABRICATION_KEYS = [
	"aggregateRating",
	"review",
	"reviews",
	"ratingValue"
];
/**
* Product with Offer(s). **There is deliberately no rating or review input** (spec §7: no
* aggregateRating). Passing one anyway, e.g. from untyped data, throws.
*/
function product(input) {
	for (const key of FABRICATION_KEYS) if (key in input) throw new TypeError(`product.${key} is not accepted: ratings and reviews must never be fabricated (spec §7)`);
	const list = Array.isArray(input.offers) ? input.offers : [input.offers];
	if (list.length === 0) throw new TypeError("product.offers needs at least one offer");
	const offers = list.map((o) => "@type" in o ? o : offer(o));
	const images = input.image === void 0 ? void 0 : Array.isArray(input.image) ? input.image : [input.image];
	return compact({
		"@context": SCHEMA_CONTEXT,
		"@type": "Product",
		name: nonEmpty(input.name, "product.name"),
		description: input.description,
		image: images?.map((u, i) => absoluteUrl(u, `product.image[${i}]`)),
		sku: input.sku,
		brand: input.brand ? {
			"@type": "Brand",
			name: input.brand
		} : void 0,
		url: input.url && absoluteUrl(input.url, "product.url"),
		offers: offers.length === 1 ? offers[0] : offers
	});
}
/** Combines nodes into one `@graph` document with a single `@context`. */
function jsonLdGraph(...nodes) {
	return {
		"@context": SCHEMA_CONTEXT,
		"@graph": nodes.map((node) => {
			const copy = { ...node };
			delete copy["@context"];
			return copy;
		})
	};
}
/** Script-safe JSON text for a `<script type="application/ld+json">` block. */
function serializeJsonLd(data) {
	return safeJson(data);
}
//#endregion
//#region src/server/SeoHead.tsx
function SeoHead(props) {
	const { title, description, canonical, siteName, locale, image, twitter, themeColor } = props;
	const robots = props.robots ?? (props.noindex ? "noindex, nofollow" : void 0);
	const blocks = props.jsonLd === void 0 ? [] : Array.isArray(props.jsonLd) ? props.jsonLd : [props.jsonLd];
	const card = twitter?.card ?? (image ? "summary_large_image" : "summary");
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("title", { children: title }),
		description && /* @__PURE__ */ jsx("meta", {
			name: "description",
			content: description
		}),
		canonical && /* @__PURE__ */ jsx("link", {
			rel: "canonical",
			href: canonical
		}),
		robots && /* @__PURE__ */ jsx("meta", {
			name: "robots",
			content: robots
		}),
		themeColor && /* @__PURE__ */ jsx("meta", {
			name: "theme-color",
			content: themeColor
		}),
		props.alternates?.map((alt) => /* @__PURE__ */ jsx("link", {
			rel: "alternate",
			hrefLang: alt.hrefLang,
			href: alt.href
		}, alt.hrefLang)),
		/* @__PURE__ */ jsx("meta", {
			property: "og:title",
			content: title
		}),
		description && /* @__PURE__ */ jsx("meta", {
			property: "og:description",
			content: description
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:type",
			content: props.type ?? "website"
		}),
		canonical && /* @__PURE__ */ jsx("meta", {
			property: "og:url",
			content: canonical
		}),
		siteName && /* @__PURE__ */ jsx("meta", {
			property: "og:site_name",
			content: siteName
		}),
		locale && /* @__PURE__ */ jsx("meta", {
			property: "og:locale",
			content: locale
		}),
		image && /* @__PURE__ */ jsx("meta", {
			property: "og:image",
			content: image.url
		}),
		image && /* @__PURE__ */ jsx("meta", {
			property: "og:image:alt",
			content: image.alt
		}),
		image?.width !== void 0 && /* @__PURE__ */ jsx("meta", {
			property: "og:image:width",
			content: String(image.width)
		}),
		image?.height !== void 0 && /* @__PURE__ */ jsx("meta", {
			property: "og:image:height",
			content: String(image.height)
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:card",
			content: card
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:title",
			content: title
		}),
		description && /* @__PURE__ */ jsx("meta", {
			name: "twitter:description",
			content: description
		}),
		image && /* @__PURE__ */ jsx("meta", {
			name: "twitter:image",
			content: image.url
		}),
		image && /* @__PURE__ */ jsx("meta", {
			name: "twitter:image:alt",
			content: image.alt
		}),
		twitter?.site && /* @__PURE__ */ jsx("meta", {
			name: "twitter:site",
			content: twitter.site
		}),
		twitter?.creator && /* @__PURE__ */ jsx("meta", {
			name: "twitter:creator",
			content: twitter.creator
		}),
		blocks.map((block, i) => /* @__PURE__ */ jsx("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: serializeJsonLd(block) }
		}, i))
	] });
}
//#endregion
//#region src/server/themes.ts
/**
* Theme names and each theme's native scheme (spec §2.1, §3). Mirrors tokens.json `themes` plus the
* `fleet` base; src/server/themes.test.ts fails if the two drift. Hard-coded rather than importing
* tokens.json so the server entry stays small.
*/
var THEME_SCHEMES = {
	fleet: "dark",
	"trident-studio": "dark",
	"trident-nil": "dark",
	"trident-ops": "dark",
	"trident-playbook": "dark",
	"trident-tools": "dark",
	"trident-agents": "dark",
	"wmh-portal": "light",
	"wmh-marketing": "dark",
	"wmh-dark": "dark",
	portfolio: "dark",
	quorum: "dark"
};
function isThemeName(value) {
	return Object.prototype.hasOwnProperty.call(THEME_SCHEMES, value);
}
//#endregion
//#region src/server/renderPage.tsx
var THEME_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
var MAX_FONT_PRELOADS = 2;
function resolve(props) {
	const { theme } = props;
	if (!THEME_PATTERN.test(theme)) throw new TypeError(`renderPage: invalid theme "${theme}"`);
	const scheme = props.scheme ?? (isThemeName(theme) ? THEME_SCHEMES[theme] : void 0);
	if (!scheme) throw new TypeError(`renderPage: theme "${theme}" is not a package theme, so pass scheme: 'dark' | 'light'`);
	if (scheme !== "dark" && scheme !== "light") throw new TypeError(`renderPage: invalid scheme "${String(scheme)}"`);
	if ((props.preloadFonts?.length ?? 0) > 2) throw new RangeError(`renderPage: at most 2 font preloads per page (spec §4)`);
	if (props.surface === "legal" && props.scripts?.length) throw new TypeError("renderPage: legal pages ship zero <script> (spec §8)");
	return {
		theme,
		scheme
	};
}
/**
* The document tree renderPage() renders. Exported so an app that hydrates the whole document
* (`hydrateRoot(document, <Document …/>)`) renders exactly the same tree on the client.
*/
function Document(props) {
	const { theme, scheme } = resolve(props);
	return /* @__PURE__ */ jsxs("html", {
		lang: props.lang ?? "en",
		dir: props.dir,
		"data-theme": theme,
		"data-scheme": scheme,
		"data-portal-palette": props.portalPalette,
		"data-motion": props.motionPaused ? "paused" : void 0,
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx("meta", {
				name: "color-scheme",
				content: scheme
			}),
			props.preloadFonts?.map((font) => /* @__PURE__ */ jsx("link", {
				rel: "preload",
				as: "font",
				type: font.type ?? "font/woff2",
				href: font.href,
				crossOrigin: "anonymous"
			}, font.href)),
			props.stylesheets?.map((href) => /* @__PURE__ */ jsx("link", {
				rel: "stylesheet",
				href
			}, href)),
			props.seo && /* @__PURE__ */ jsx(SeoHead, { ...props.seo }),
			props.head
		] }), /* @__PURE__ */ jsxs("body", {
			"data-surface": props.surface,
			className: props.bodyClassName,
			children: [props.children, props.scripts?.map((src) => /* @__PURE__ */ jsx("script", {
				type: "module",
				src,
				nonce: props.nonce
			}, src))]
		})]
	});
}
var DOCTYPE = "<!DOCTYPE html>";
var EXECUTABLE_SCRIPT = /<script\b(?![^>]*\btype="application\/(?:ld\+)?json")[^>]*>/i;
function withDoctype(html) {
	return /^<!doctype html>/i.test(html) ? html : DOCTYPE + html;
}
async function streamToString(stream) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let html = "";
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		html += decoder.decode(value, { stream: true });
	}
	return html + decoder.decode();
}
function assertLegalOutput(html, surface) {
	if (surface === "legal" && EXECUTABLE_SCRIPT.test(html)) throw new TypeError("renderPage: legal page output contains an executable <script> (spec §8)");
	return html;
}
/** Renders the full document to an HTML string (with `<!DOCTYPE html>`). */
async function renderPage(options) {
	const mode = options.surface === "legal" ? "static" : options.mode ?? "stream";
	const tree = /* @__PURE__ */ jsx(Document, { ...options });
	if (mode === "static") return assertLegalOutput(withDoctype(renderToStaticMarkup(tree)), options.surface);
	if (mode === "string") return withDoctype(renderToString(tree));
	return withDoctype(await streamToString(await renderPageStream(options)));
}
/**
* Streams the document with `renderToReadableStream`. By default resolves only after `allReady`,
* so the caller can still pick the status code and every byte of <head> is final.
* Legal pages cannot stream (they render static markup): use renderPage() for them.
*/
async function renderPageStream(options) {
	if (options.surface === "legal") throw new TypeError("renderPageStream: legal pages render static markup; use renderPage()");
	resolve(options);
	const stream = await renderToReadableStream(/* @__PURE__ */ jsx(Document, { ...options }), {
		signal: options.signal,
		nonce: options.nonce,
		onError: options.onError
	});
	if (options.waitForAllReady !== false) await stream.allReady;
	return stream;
}
/**
* A Worker-ready `Response`: `text/html; charset=utf-8`, the given status (default 200) and headers.
* Auth, app and admin surfaces also get `X-Robots-Tag: noindex` (spec §8), unless headers set it.
*/
async function renderPageResponse(options, init = {}) {
	const headers = new Headers(init.headers);
	if (!headers.has("content-type")) headers.set("content-type", "text/html; charset=utf-8");
	if (options.surface && [
		"auth",
		"app",
		"admin"
	].includes(options.surface) && !headers.has("x-robots-tag")) headers.set("x-robots-tag", "noindex");
	const body = options.surface === "legal" ? await renderPage(options) : await renderPageStream(options);
	return new Response(body, {
		...init,
		headers
	});
}
//#endregion
//#region src/server/Island.tsx
/**
* <Island>: server-renders an interactive component and writes its props as a JSON data block for
* hydrateIslands() (spec §7, §8). No inline JS is emitted: the props travel in
* `<script type="application/json">`, which browsers never execute, so `script-src 'self'` holds.
*
* The rest of the page stays static HTML; only islands hydrate, and only when their strategy fires.
*/
function Island(islandProps) {
	const { name, component, props, hydrate = "idle", as: Tag = "div", className } = islandProps;
	if (!ISLAND_NAME.test(name)) throw new TypeError(`Island: invalid name "${name}" (letters, digits, - and _; starts with a letter)`);
	if (!HYDRATE_STRATEGIES.includes(hydrate)) throw new TypeError(`Island "${name}": unknown hydrate strategy "${hydrate}"`);
	assertJsonSerializable(props, `Island "${name}" props`);
	const json = safeJson(props);
	const clientProps = JSON.parse(json);
	return /* @__PURE__ */ jsxs(Fragment, { children: [createElement(Tag, {
		[ISLAND_ATTR]: name,
		[HYDRATE_ATTR]: hydrate,
		className
	}, createElement(component, clientProps)), /* @__PURE__ */ jsx("script", {
		type: "application/json",
		[PROPS_ATTR]: "",
		dangerouslySetInnerHTML: { __html: json }
	})] });
}
//#endregion
export { Document, Island, MAX_FONT_PRELOADS, SCHEMA_CONTEXT, SeoHead, THEME_SCHEMES, assertJsonSerializable, breadcrumbList, faqPage, isThemeName, jsonLdGraph, offer, organization, product, renderPage, renderPageResponse, renderPageStream, safeJson, serializeJsonLd, webSite };
