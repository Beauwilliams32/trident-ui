// GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit.

export type ThreeThemeName = "trident-ui" | "trident-ui-light" | "trident-studio" | "trident-nil" | "trident-ops" | "trident-playbook" | "trident-tools" | "trident-agents" | "wmh-portal" | "wmh-marketing" | "wmh-dark" | "portfolio" | "quorum";

export declare const THREE_COLORS: { readonly [K in ThreeThemeName]: { readonly [role: string]: number } };

export declare const QUORUM_FALLBACK: {
  readonly "--bg": "#111728";
  readonly "--bg0": "#0c101c";
  readonly "--bg1": "#171f31";
  readonly "--bg2": "#1e2639";
  readonly "--stage-wall": "#0c101c";
  readonly "--stage-mid": "#171f31";
  readonly "--stage-floor": "#1e2639";
  readonly "--stage-edge": "#252d41";
  readonly "--fg0": "#ffffff";
  readonly "--fg1": "#d2dae9";
  readonly "--fg2": "#9aa7bd";
  readonly "--muted": "#8793ab";
  readonly "--ghost": "#7a8ba9";
  readonly "--accent": "#8fa3c7";
  readonly "--accent-strong": "#bcc8dd";
  readonly "--warn": "#f5b83d";
  readonly "--ok": "#2fd39a";
  readonly "--error": "#ff6b5e";
  readonly "--info": "#3ba8f0";
  readonly "--purple": "#7c89ff";
};

export declare const QUORUM_FALLBACK_INT: { readonly [K in keyof typeof QUORUM_FALLBACK]: number };

export declare function themeColors(name: string): { readonly [role: string]: number };
