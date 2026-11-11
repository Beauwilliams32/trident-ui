# Williams Media mobile design system

Shared mobile behavior and craft live alongside each product's existing brand tokens. This is a coordination layer, not a shared palette: a Williams Media surface and a Trident, Poseidon, Portal, game, or native app retain their own color, typography, imagery, and interaction identity.

## Shared mobile contract

- Use the existing 4px spacing scale and safe-area insets. At phone widths, preserve readable content measure and prevent horizontal page overflow; dense data can use a labeled, keyboard-accessible scroll region.
- Interactive controls have a 44px minimum touch area. Game controls use the 48px `target-game` token. Keep visible hit areas, labels, and destructive confirmations clear.
- Keyboard focus uses the existing 2px focus ring with a 2px offset. Focus must remain visible around sticky navigation and overlays. Preserve contrast, forced-colors behavior, accessible names, status announcements, and keyboard alternatives to gestures.
- Mobile feedback uses the shared 160ms fast, 240ms base, and 320ms slow durations. Scroll reveals may be staggered, but must not delay content, obscure controls, or animate essential purchase, authentication, consent, or game outcomes.
- Honor `prefers-reduced-motion` and data-saver preferences. Disable decorative parallax/autoplay when requested; retain manual playback and readable poster imagery. Pause offscreen media and restore a usable still state.
- Cards, inputs, buttons, navigation, status, empty, error, loading, and confirmation states share semantic behavior and sizing. Their surface treatments remain brand-specific. In the shared React library, set `gameControl` on Button, LinkButton, or IconButton for the visible 48px action target.

## Brand layers

| Surface | Token family / identity to preserve | Mobile expression |
| --- | --- | --- |
| Williams Media Portal | `wmh-portal`; light paper, violet/blue accents, Manrope body | Clear forms, account and billing states, comfortable cards, persistent primary actions |
| Williams Media marketing | `wmh-marketing`; near-black, violet/blue, gold editorial accent | Cinematic sections, restrained scroll reveal, accessible fixed navigation |
| Poseidon | Product-owned monochrome photo-commerce palette; black/white, real event imagery | Guest gallery, consent, match review, order/payment states, download recovery and photographer tools |
| Trident Studio / fleet | `trident-studio` and `fleet`; deep navy, teal/sky glass, Space Grotesk/Inter | Compact utility surfaces, legible status and restrained glass effects |
| Trident products and tools | Existing `trident-*` theme accents | Keep each tool's accent and workflow; shared controls and touch targets only |
| Trident games | Each game's existing art direction and landscape play surface | 48px gameplay actions, portrait/landscape transitions, pause/resume and save recovery |
| Native apps and Learnify | Product-owned palette and native platform conventions | Safe areas, system sheets/share behavior, resilient import/save states, accessible native controls |

## Component contract

The existing `@trident/ui` components stay the source for web behavior: Button, LinkButton, IconButton, FormField, focus/accessibility utilities, navigation, cards, feedback and motion. Native SwiftUI screens use the same sizing, focus/contrast, semantic state, and motion contract through native controls. Do not replace app-level components or palettes with a cross-brand wrapper.

The [component atlas](TOTAL-MOBILE-COMPONENT-ATLAS.svg) shows the shared interaction rules with Portal, Poseidon, Trident, Learnify, games, and native surfaces. It is a visual review sheet, not a native Figma component library.

## Review rule

Figma mobile boards describe source-backed screens and states; label proposed states as proposed and keep unsupported features out. Review Figma and local responsive/device evidence before deployment or App Store submission. Figma vector imports are visual review artifacts until native components, variables, and prototype connections are verified in the editor.
