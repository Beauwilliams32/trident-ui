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
export { offer as a, serializeJsonLd as c, safeJson as d, jsonLdGraph as i, webSite as l, breadcrumbList as n, organization as o, faqPage as r, product as s, SCHEMA_CONTEXT as t, assertJsonSerializable as u };
