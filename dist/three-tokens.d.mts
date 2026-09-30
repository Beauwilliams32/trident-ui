// GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit.

export type ThreeThemeName = "trident-studio" | "trident-nil" | "trident-ops" | "trident-playbook" | "trident-tools" | "trident-agents" | "wmh-portal" | "wmh-marketing" | "wmh-dark" | "portfolio" | "quorum";

export declare const THREE_COLORS: { readonly [K in ThreeThemeName]: { readonly [role: string]: number } };

export declare const QUORUM_FALLBACK: {
  readonly "--bg": "#0b0f14";
  readonly "--bg0": "#070a0e";
  readonly "--bg1": "#111821";
  readonly "--bg2": "#1a232e";
  readonly "--stage-wall": "#070a0e";
  readonly "--stage-mid": "#111821";
  readonly "--stage-floor": "#1a232e";
  readonly "--stage-edge": "#24303d";
  readonly "--fg0": "#e8f0f6";
  readonly "--fg1": "#cbd8e3";
  readonly "--fg2": "#93a6b6";
  readonly "--muted": "#7e909f";
  readonly "--ghost": "#768996";
  readonly "--accent": "#3fd0e0";
  readonly "--accent-strong": "#7ee6f2";
  readonly "--warn": "#f2b544";
  readonly "--ok": "#46d6a0";
  readonly "--error": "#ff7a85";
  readonly "--info": "#8fb4ff";
  readonly "--purple": "#b39dff";
};

export declare const QUORUM_FALLBACK_INT: { readonly [K in keyof typeof QUORUM_FALLBACK]: number };

export declare function themeColors(name: string): { readonly [role: string]: number };
