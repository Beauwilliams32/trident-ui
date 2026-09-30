import { r as hexToInt, t as DEFAULT_THEME } from "./colors-C3CMEN7v.js";
//#region tokens.json
var primitives = {
	"color": {
		"navy": {
			"950": "#04040a",
			"925": "#070d16",
			"900": "#0b1422",
			"850": "#0e1a2b",
			"800": "#132238",
			"600": "#5a7591"
		},
		"fleet-ink": {
			"100": "#e9f2fb",
			"300": "#b7c7d8",
			"400": "#8fa5bc"
		},
		"teal": { "400": "#2dd4bf" },
		"sky": {
			"300": "#7dd3fc",
			"400": "#38bdf8",
			"500": "#0ea5e9"
		},
		"amber": { "400": "#fbbf24" },
		"orange": { "500": "#f97316" },
		"emerald": {
			"400": "#34d399",
			"500": "#10b981",
			"700": "#047857"
		},
		"violet": {
			"50": "#f3edff",
			"100": "#e7dcff",
			"300": "#b69bff",
			"400": "#a78bfa",
			"500": "#7c3aed",
			"600": "#6d28d9",
			"700": "#5b21b6"
		},
		"indigo": {
			"400": "#818cf8",
			"500": "#6366f1"
		},
		"fuchsia": { "500": "#d946ef" },
		"purple": { "500": "#8b5cf6" },
		"red": {
			"400": "#f87171",
			"700": "#b91c1c"
		},
		"blue": {
			"400": "#3b7ef8",
			"500": "#2563eb",
			"600": "#174ea6",
			"700": "#1d4ed8"
		},
		"gold": {
			"300": "#e8b84a",
			"400": "#c9a84c",
			"600": "#a17f30"
		},
		"magenta": {
			"700": "#5d0045",
			"900": "#210018"
		},
		"ink": {
			"900": "#0b1220",
			"700": "#1f2a3c",
			"600": "#334155",
			"500": "#475569",
			"400": "#64748b",
			"300": "#94a3b8"
		},
		"paper": {
			"50": "#f7f9fd",
			"100": "#f1f5fb",
			"200": "#e2e8f2",
			"white": "#ffffff"
		},
		"night": {
			"900": "#060e1a",
			"800": "#0b1626",
			"700": "#13202f"
		},
		"warning": { "700": "#b54708" }
	},
	"space": {
		"0": "0px",
		"0-5": "2px",
		"1": "4px",
		"1-5": "6px",
		"2": "8px",
		"3": "12px",
		"4": "16px",
		"5": "20px",
		"6": "24px",
		"8": "32px",
		"10": "40px",
		"12": "48px",
		"16": "64px",
		"20": "80px",
		"24": "96px",
		"32": "128px"
	},
	"radius": {
		"xs": "6px",
		"sm": "10px",
		"md": "16px",
		"lg": "22px",
		"pill": "999px"
	},
	"font-size": {
		"2xs": "12px",
		"xs": "13px",
		"sm": "14px",
		"base": "16px",
		"md": "18px",
		"lg": "20px",
		"xl": "clamp(22px, 2vw, 24px)",
		"2xl": "clamp(26px, 3vw, 30px)",
		"3xl": "clamp(30px, 4vw, 38px)",
		"4xl": "clamp(36px, 5.5vw, 48px)",
		"display": "clamp(40px, 6vw, 76px)"
	},
	"line-height": {
		"base": "1.6",
		"display": "1.02",
		"tight": "1.2",
		"snug": "1.35"
	},
	"tracking": {
		"display": "-0.022em",
		"kicker": "0.14em"
	},
	"font-weight": {
		"body": "400",
		"medium": "500",
		"display": "600",
		"kicker": "600",
		"bold": "700"
	},
	"measure": { "prose": "68ch" },
	"font-stack": {
		"space-grotesk": "'Space Grotesk', 'Space Grotesk Fallback', ui-sans-serif, system-ui, sans-serif",
		"inter": "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif",
		"jetbrains-mono": "'JetBrains Mono', 'JetBrains Mono Fallback', ui-monospace, SFMono-Regular, Menlo, monospace",
		"manrope": "'Manrope', 'Manrope Fallback', ui-sans-serif, system-ui, sans-serif",
		"wmh-display": "Futura, 'Futura PT', 'Manrope', 'Manrope Fallback', ui-sans-serif, system-ui, sans-serif",
		"oswald": "'Oswald', 'Oswald Fallback', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif",
		"system": "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
		"system-display": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
		"system-mono": "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"
	}
};
var base = { "fleet": {
	"scheme": "dark",
	"description": "Trident Studio fleet, dark (trident-glass.css). Every trident-* theme extends this and overrides the accent pair only.",
	"roles": {
		"bg": "#070d16",
		"bg-2": "#0b1422",
		"surface": "#0e1a2b",
		"surface-raised": "#132238",
		"glass": "color-mix(in srgb, #0e1a2b 62%, transparent)",
		"glass-strong": "color-mix(in srgb, #0e1a2b 82%, transparent)",
		"glass-edge": "rgba(255,255,255,.08)",
		"specular": "rgba(255,255,255,.13)",
		"line": "rgba(148,199,255,.12)",
		"line-strong": "#5a7591",
		"ink": "#e9f2fb",
		"ink-2": "#b7c7d8",
		"muted": "#8fa5bc",
		"accent-1": "#2dd4bf",
		"accent-2": "#38bdf8",
		"accent-grad": "linear-gradient(135deg, {accent-1}, {accent-2})",
		"glow": "color-mix(in srgb, {accent-1} 22%, transparent)",
		"on-accent": "#06121d",
		"accent-text": "{accent-1}",
		"focus": "{accent-text}",
		"ok": "#34d399",
		"warn": "#fbbf24",
		"danger": "#f87171",
		"info": "#7dd3fc",
		"status-live": "{accent-text}",
		"status-attention": "{warn}",
		"status-ok": "{ok}",
		"status-error": "{danger}",
		"status-reasoning": "#b69bff",
		"font-display": "{p.font-stack.space-grotesk}",
		"font-body": "{p.font-stack.inter}",
		"font-mono": "{p.font-stack.jetbrains-mono}",
		"r-xs": "6px",
		"r-sm": "10px",
		"r": "16px",
		"r-lg": "22px",
		"r-pill": "999px",
		"blur": "14px",
		"blur-heavy": "24px"
	}
} };
//#endregion
//#region src/three/generated.ts
/**
* three.js colour ints generated from tokens.json (spec §2.1, §6.5). Resolves the same way as
* scripts/lib/tokens.mjs threeColors(), which writes dist/three-tokens.mjs (`@trident/ui/three.mjs`);
* src/three/colors.test.ts pins the two as equal. This module carries the token data, so the light
* entry only reaches it through a dynamic import (loadGeneratedColors) and the scene chunk.
*/
var THEMES = {
	"trident-studio": {
		"extends": "fleet",
		"family": "fleet",
		"description": "Studio hub (and the default :root values). Identity uses these tokens with no accent.",
		"roles": {
			"accent-1": "#2dd4bf",
			"accent-2": "#38bdf8"
		}
	},
	"trident-nil": {
		"extends": "fleet",
		"family": "fleet",
		"roles": {
			"accent-1": "#fbbf24",
			"accent-2": "#f97316"
		}
	},
	"trident-ops": {
		"extends": "fleet",
		"family": "fleet",
		"roles": {
			"accent-1": "#34d399",
			"accent-2": "#10b981"
		}
	},
	"trident-playbook": {
		"extends": "fleet",
		"family": "fleet",
		"roles": {
			"accent-1": "#a78bfa",
			"accent-2": "#818cf8"
		}
	},
	"trident-tools": {
		"extends": "fleet",
		"family": "fleet",
		"roles": {
			"accent-1": "#0ea5e9",
			"accent-2": "#6366f1"
		}
	},
	"trident-agents": {
		"extends": "fleet",
		"family": "fleet",
		"roles": {
			"accent-1": "#d946ef",
			"accent-2": "#8b5cf6"
		}
	},
	"wmh-portal": {
		"scheme": "light",
		"family": "wmh",
		"description": "Williams Media portal, light. Field #f7f9fd, cards #ffffff, ink #0b1220.",
		"roles": {
			"bg": "#f7f9fd",
			"bg-2": "#f1f5fb",
			"surface": "#ffffff",
			"surface-raised": "#ffffff",
			"glass": "color-mix(in srgb, #ffffff 82%, transparent)",
			"glass-strong": "color-mix(in srgb, #ffffff 90%, transparent)",
			"glass-edge": "rgba(15,23,42,.12)",
			"specular": "rgba(255,255,255,.64)",
			"line": "rgba(15,23,42,.12)",
			"line-strong": "#7b8799",
			"ink": "#0b1220",
			"ink-2": "#334155",
			"muted": "#475569",
			"accent-1": "#7c3aed",
			"accent-2": "#2563eb",
			"accent-grad": "linear-gradient(135deg, {accent-1}, {accent-2})",
			"glow": "rgba(124,58,237,.18)",
			"on-accent": "#ffffff",
			"accent-text": "{accent-1}",
			"focus": "{accent-1}",
			"ok": "#047857",
			"warn": "#b54708",
			"danger": "#b91c1c",
			"info": "#1d4ed8",
			"status-live": "{accent-text}",
			"status-attention": "{warn}",
			"status-ok": "{ok}",
			"status-error": "{danger}",
			"status-reasoning": "#6d28d9",
			"font-display": "{p.font-stack.wmh-display}",
			"font-body": "{p.font-stack.manrope}",
			"font-mono": "{p.font-stack.jetbrains-mono}",
			"r-xs": "6px",
			"r-sm": "10px",
			"r": "16px",
			"r-lg": "22px",
			"r-pill": "999px",
			"blur": "18px",
			"blur-heavy": "28px"
		},
		"extra": {
			"eyebrow": "#a17f30",
			"logo-grad": "linear-gradient(135deg, #5d0045, #210018)",
			"link": "#1d4ed8"
		},
		"palettes": {
			"violet": {
				"accent-1": "#7c3aed",
				"accent-2": "#2563eb",
				"accent-text": "#7c3aed",
				"on-accent": "#ffffff",
				"focus": "#7c3aed",
				"glow": "rgba(124,58,237,.16)"
			},
			"ocean": {
				"accent-1": "#2563eb",
				"accent-2": "#7c3aed",
				"accent-text": "#1d4ed8",
				"on-accent": "#ffffff",
				"focus": "#1d4ed8",
				"glow": "rgba(37,99,235,.16)"
			},
			"forest": {
				"accent-1": "#10b981",
				"accent-2": "#2563eb",
				"accent-text": "#047857",
				"on-accent": "#0b1220",
				"focus": "#047857",
				"glow": "rgba(16,185,129,.18)"
			}
		}
	},
	"wmh-marketing": {
		"scheme": "dark",
		"family": "wmh",
		"description": "Williams Media marketing surface. #7c3aed only reaches ~3.3:1 on the void, so accent-text is violet-300. Gold is for eyebrows only.",
		"roles": {
			"bg": "#04040a",
			"bg-2": "#060e1a",
			"surface": "#0b1626",
			"surface-raised": "#13202f",
			"glass": "rgba(11,22,38,.72)",
			"glass-strong": "rgba(19,32,47,.85)",
			"glass-edge": "rgba(124,58,237,.16)",
			"specular": "rgba(255,255,255,.10)",
			"line": "rgba(124,58,237,.16)",
			"line-strong": "#6b5b95",
			"ink": "#f4f6fb",
			"ink-2": "#c9d6e8",
			"muted": "#8fa5bc",
			"accent-1": "#7c3aed",
			"accent-2": "#2563eb",
			"accent-grad": "linear-gradient(135deg, {accent-1}, {accent-2})",
			"glow": "rgba(124,58,237,.18)",
			"on-accent": "#ffffff",
			"accent-text": "#b69bff",
			"focus": "{accent-text}",
			"ok": "#34d399",
			"warn": "#fbbf24",
			"danger": "#f87171",
			"info": "#7dd3fc",
			"status-live": "{accent-text}",
			"status-attention": "{warn}",
			"status-ok": "{ok}",
			"status-error": "{danger}",
			"status-reasoning": "#b69bff",
			"font-display": "{p.font-stack.wmh-display}",
			"font-body": "{p.font-stack.manrope}",
			"font-mono": "{p.font-stack.jetbrains-mono}",
			"r-xs": "6px",
			"r-sm": "10px",
			"r": "16px",
			"r-lg": "22px",
			"r-pill": "999px",
			"blur": "18px",
			"blur-heavy": "28px"
		},
		"extra": {
			"eyebrow": "#e8b84a",
			"eyebrow-2": "#c9a84c",
			"logo-grad": "linear-gradient(135deg, #5d0045, #210018)",
			"link": "#3b7ef8"
		}
	},
	"wmh-dark": {
		"scheme": "dark",
		"family": "wmh",
		"description": "The portal's dark theme (data-portal-theme=wm-dark). Per-client admin accents from bootstrap.portalTheme go through ensureContrast().",
		"roles": {
			"bg": "#070b14",
			"bg-2": "#0a1120",
			"surface": "#0e1626",
			"surface-raised": "#151f31",
			"glass": "color-mix(in srgb, #0e1626 82%, transparent)",
			"glass-strong": "color-mix(in srgb, #151f31 90%, transparent)",
			"glass-edge": "rgba(148,163,184,.16)",
			"specular": "rgba(255,255,255,.10)",
			"line": "rgba(148,163,184,.16)",
			"line-strong": "#5f6f86",
			"ink": "#f4f6fb",
			"ink-2": "#c9d6e8",
			"muted": "#94a3b8",
			"accent-1": "#7c3aed",
			"accent-2": "#2563eb",
			"accent-grad": "linear-gradient(135deg, {accent-1}, {accent-2})",
			"glow": "rgba(124,58,237,.18)",
			"on-accent": "#ffffff",
			"accent-text": "#b69bff",
			"focus": "{accent-text}",
			"ok": "#34d399",
			"warn": "#fbbf24",
			"danger": "#f87171",
			"info": "#7dd3fc",
			"status-live": "{accent-text}",
			"status-attention": "{warn}",
			"status-ok": "{ok}",
			"status-error": "{danger}",
			"status-reasoning": "#b69bff",
			"font-display": "{p.font-stack.wmh-display}",
			"font-body": "{p.font-stack.manrope}",
			"font-mono": "{p.font-stack.jetbrains-mono}",
			"r-xs": "6px",
			"r-sm": "10px",
			"r": "16px",
			"r-lg": "22px",
			"r-pill": "999px",
			"blur": "18px",
			"blur-heavy": "28px"
		},
		"extra": {
			"eyebrow": "#e8b84a",
			"logo-grad": "linear-gradient(135deg, #5d0045, #210018)",
			"link": "#3b7ef8"
		},
		"palettes": {
			"violet": {
				"accent-1": "#7c3aed",
				"accent-2": "#2563eb",
				"accent-text": "#b69bff",
				"on-accent": "#ffffff",
				"focus": "#b69bff",
				"glow": "rgba(124,58,237,.18)"
			},
			"ocean": {
				"accent-1": "#2563eb",
				"accent-2": "#7c3aed",
				"accent-text": "#3b7ef8",
				"on-accent": "#ffffff",
				"focus": "#3b7ef8",
				"glow": "rgba(37,99,235,.18)"
			},
			"forest": {
				"accent-1": "#10b981",
				"accent-2": "#2563eb",
				"accent-text": "#34d399",
				"on-accent": "#0b1220",
				"focus": "#34d399",
				"glow": "rgba(16,185,129,.18)"
			}
		}
	},
	"portfolio": {
		"scheme": "dark",
		"family": "portfolio",
		"description": "beau-portfolio. Accent as text only at >=15px semibold. Runtime site.accent goes through ensureContrast().",
		"roles": {
			"bg": "#0d0a0a",
			"bg-2": "#151010",
			"surface": "#191313",
			"surface-raised": "#221a1a",
			"glass": "color-mix(in srgb, #191313 72%, transparent)",
			"glass-strong": "color-mix(in srgb, #191313 88%, transparent)",
			"glass-edge": "rgba(255,255,255,.08)",
			"specular": "rgba(255,255,255,.10)",
			"line": "rgba(244,238,233,.10)",
			"line-strong": "#75655f",
			"ink": "#f4eee9",
			"ink-2": "#d6cbc4",
			"muted": "#a89a93",
			"accent-1": "#e34c4c",
			"accent-2": "#b93a3a",
			"accent-grad": "linear-gradient(135deg, {accent-1}, {accent-2})",
			"glow": "rgba(227,76,76,.32)",
			"on-accent": "#0b1220",
			"accent-text": "{accent-1}",
			"focus": "{accent-1}",
			"ok": "#34d399",
			"warn": "#fbbf24",
			"danger": "#f87171",
			"info": "#7dd3fc",
			"status-live": "{accent-text}",
			"status-attention": "{warn}",
			"status-ok": "{ok}",
			"status-error": "{danger}",
			"status-reasoning": "#b69bff",
			"font-display": "{p.font-stack.oswald}",
			"font-body": "{p.font-stack.inter}",
			"font-mono": "{p.font-stack.system-mono}",
			"r-xs": "6px",
			"r-sm": "10px",
			"r": "14px",
			"r-lg": "22px",
			"r-pill": "999px",
			"blur": "14px",
			"blur-heavy": "24px"
		},
		"extra": {
			"accent-text-min-size": "15px",
			"accent-text-min-weight": "600"
		}
	},
	"quorum": {
		"scheme": "dark",
		"family": "quorum",
		"description": "Quorum cockpit. System SF stacks, no webfonts. The legacy map below keeps theme.js names (--bg, --fg0, ...) working and generates Quorum's FALLBACK.",
		"roles": {
			"bg": "#0b0f14",
			"bg-2": "#070a0e",
			"surface": "#111821",
			"surface-raised": "#1a232e",
			"glass": "color-mix(in srgb, #111821 72%, transparent)",
			"glass-strong": "color-mix(in srgb, #111821 88%, transparent)",
			"glass-edge": "rgba(255,255,255,.08)",
			"specular": "rgba(255,255,255,.10)",
			"line": "#24303d",
			"line-strong": "#5d6f80",
			"ink": "#e8f0f6",
			"ink-2": "#cbd8e3",
			"muted": "#7e909f",
			"accent-1": "#3fd0e0",
			"accent-2": "#7ee6f2",
			"accent-grad": "linear-gradient(135deg, {accent-1}, {accent-2})",
			"glow": "color-mix(in srgb, {accent-1} 22%, transparent)",
			"on-accent": "#06121d",
			"accent-text": "{accent-1}",
			"focus": "{accent-1}",
			"ok": "#46d6a0",
			"warn": "#f2b544",
			"danger": "#ff7a85",
			"info": "#8fb4ff",
			"status-live": "{accent-1}",
			"status-attention": "{warn}",
			"status-ok": "{ok}",
			"status-error": "{danger}",
			"status-reasoning": "#b39dff",
			"font-display": "{p.font-stack.system-display}",
			"font-body": "{p.font-stack.system}",
			"font-mono": "{p.font-stack.system-mono}",
			"r-xs": "6px",
			"r-sm": "10px",
			"r": "16px",
			"r-lg": "22px",
			"r-pill": "999px",
			"blur": "14px",
			"blur-heavy": "24px"
		},
		"legacy": {
			"--bg": "#0b0f14",
			"--bg0": "#070a0e",
			"--bg1": "#111821",
			"--bg2": "#1a232e",
			"--stage-wall": "#070a0e",
			"--stage-mid": "#111821",
			"--stage-floor": "#1a232e",
			"--stage-edge": "#24303d",
			"--fg0": "#e8f0f6",
			"--fg1": "#cbd8e3",
			"--fg2": "#93a6b6",
			"--muted": "#7e909f",
			"--ghost": "#768996",
			"--accent": "#3fd0e0",
			"--accent-strong": "#7ee6f2",
			"--warn": "#f2b544",
			"--ok": "#46d6a0",
			"--error": "#ff7a85",
			"--info": "#8fb4ff",
			"--purple": "#b39dff"
		}
	}
};
var BASES = base;
var HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function primitive(path) {
	let node = primitives;
	for (const key of path.split(".")) {
		if (node == null || typeof node !== "object" || !(key in node)) return "";
		node = node[key];
	}
	return typeof node === "string" ? node : "";
}
function resolveRoles(roles) {
	const out = {};
	const visiting = /* @__PURE__ */ new Set();
	const resolve = (name) => {
		if (name in out) return out[name];
		if (!(name in roles) || visiting.has(name)) return "";
		visiting.add(name);
		const value = String(roles[name]).replace(/\{([^}]+)\}/g, (_m, ref) => ref.startsWith("p.") ? primitive(ref.slice(2)) : resolve(ref));
		visiting.delete(name);
		out[name] = value;
		return value;
	};
	for (const name of Object.keys(roles)) resolve(name);
	return out;
}
var cache = /* @__PURE__ */ new Map();
/** Theme names that have generated colours. */
var threeThemeNames = Object.freeze(Object.keys(THEMES));
/**
* Resolved hex roles for a theme (and optional `data-portal-palette`) as 0xRRGGBB ints.
* Unknown themes fall back to trident-studio; unknown palettes are ignored.
*/
function generatedColors(theme = DEFAULT_THEME, palette) {
	const name = theme in THEMES ? theme : DEFAULT_THEME;
	const def = THEMES[name];
	const pal = palette && def.palettes?.[palette] ? palette : "";
	const key = `${name}|${pal}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const resolved = resolveRoles({
		...def.extends ? BASES[def.extends]?.roles ?? {} : {},
		...def.roles,
		...pal ? def.palettes?.[pal] : {}
	});
	const ints = {};
	for (const [role, value] of Object.entries(resolved)) if (HEX_RE.test(value)) ints[role] = hexToInt(value);
	const frozen = Object.freeze(ints);
	cache.set(key, frozen);
	return frozen;
}
//#endregion
export { generatedColors, threeThemeNames };
