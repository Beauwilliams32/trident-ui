/** Design tokens (G8): read from tokens.json at build time; the live swatches use this theme's CSS. */
import data from '../galleryData'
import type { RawExample } from '../registry'
import { ColorRoles, ComponentTokens, Elevation, MotionScale, ShapeRoles, SpaceScale } from './TokenDocs'

const docs = data.tokens
const current = () => docs.themes[document.documentElement.dataset.theme ?? 'fleet'] ?? docs.themes.fleet!

export const examples: RawExample[] = [
  {
    id: 'color-roles',
    title: 'Colour roles and contrast',
    description: 'Every fill has a foreground. Each colour role with its value in this theme, its Increase Contrast value, and the lowest ratio among the pairs tokens.json requires.',
    wide: true,
    showCode: false,
    render: () => <ColorRoles theme={current()} />,
  },
  {
    id: 'type-radius',
    title: 'Fonts, radii and blur',
    description: 'The non-colour semantic roles of this theme. Radius steps: chips and kbd, inputs and buttons, cards, hero panels, pills.',
    showCode: false,
    render: () => <ShapeRoles theme={current()} />,
  },
  {
    id: 'space',
    title: 'Spacing scale',
    description: 'A 4px base. Use the steps, never ad-hoc pixel values; at least 16px of page padding on phones.',
    showCode: false,
    render: () => <SpaceScale docs={docs} />,
  },
  {
    id: 'elevation',
    title: 'Elevation',
    description: 'e1 for resting cards, e2 for glass, e3 for hover, e4 for overlays. Overlays sit on solid surfaces, never blur.',
    showCode: false,
    render: () => <Elevation docs={docs} scheme={current().scheme} />,
  },
  {
    id: 'motion',
    title: 'Motion: durations, easings, springs',
    description: 'UI feedback takes 160-320ms; exits run at 0.7x the enter. Only reveals and count-ups run longer.',
    wide: true,
    showCode: false,
    render: () => <MotionScale docs={docs} />,
  },
  {
    id: 'component-tokens',
    title: 'Component tokens',
    description: 'Sizes the components share: button and input heights, radii, focus ring, the 24px and 44px target sizes.',
    showCode: false,
    render: () => <ComponentTokens docs={docs} />,
  },
]
