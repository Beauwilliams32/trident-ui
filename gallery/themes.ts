/// <reference types="vite/client" />
// Every theme file is scoped to [data-theme="<name>"], so loading them all is safe. They must come
// AFTER tokens.css: its :root defaults have the same specificity, so source order decides. An
// eager glob is hoisted above sibling imports, hence this separate module (imported after the CSS).
// Exported and referenced by main.tsx: package.json sideEffects marks .ts modules pure.
export const themeStyles = import.meta.glob('../dist/themes/*.css', { eager: true })
