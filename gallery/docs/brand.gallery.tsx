/**
 * Brand (G13): the Depth Line mark (brand/depth-line.mjs) in every product's accent pair from
 * tokens.json, at 16, 32, 48 and 64px, and the contour backdrop on a hero mock. Shown for the
 * owner's creative review; the brand ships in a release only after that review.
 */
import data from '../galleryData'
import '../../brand/depth-line.css'
import { depthLineMark } from '../../brand/depth-line.mjs'
import { Button } from '../../src/actions/Button'
import { Heading } from '../../src/type/Heading'
import { Kicker } from '../../src/type/Kicker'
import { Text } from '../../src/type/Text'
import type { RawExample } from '../registry'

export const PRODUCTS: Array<[theme: string, name: string]> = [
  ['trident-studio', 'Studio hub'],
  ['trident-nil', 'NIL'],
  ['trident-ops', 'Ops'],
  ['trident-playbook', 'Playbook'],
  ['trident-tools', 'Tools'],
  ['trident-agents', 'Agents'],
]
export const MARK_SIZES = [16, 32, 48, 64] as const

const accents = (theme: string) => {
  const roles = data.tokens.themes[theme]!.roles
  const get = (r: string) => roles.find((x) => x.role === r)!.value
  return { accent1: get('accent-1'), accent2: get('accent-2') }
}

function Mark({ theme, size, title }: { theme: string; size: number; title?: string }) {
  const svg = depthLineMark({ ...accents(theme), title: title ?? '' })
  return <span className="g-mark" style={{ inlineSize: size, blockSize: size }} dangerouslySetInnerHTML={{ __html: svg }} />
}

export const examples: RawExample[] = [
  {
    id: 'marks',
    title: 'Depth Line mark: each product’s accent pair',
    description: 'One vector mark; each product keeps its own accent pair from tokens.json. Check the 16px column: the three rails must stay apart.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-api__scroll" role="region" aria-label="Depth Line marks by product" tabIndex={0}>
        <table className="g-api__table g-marks">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Accent pair</th>
              {MARK_SIZES.map((s) => (
                <th scope="col" key={s}>
                  {s}px
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(([theme, name]) => {
              const a = accents(theme)
              return (
                <tr key={theme} data-product={theme}>
                  <th scope="row">{name}</th>
                  <td>
                    <code>
                      {a.accent1} → {a.accent2}
                    </code>
                  </td>
                  {MARK_SIZES.map((s) => (
                    <td key={s}>
                      <Mark theme={theme} size={s} title={s === 64 ? `${name} mark` : undefined} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'contour-hero',
    title: 'Contour backdrop on a hero mock',
    description: 'The decorative contour (brand/depth-line.css) behind a text hero. Public marketing pages only; never on auth, money, legal or admin.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="trident-depth-line g-brand-hero">
        <div className="g-brand-hero__copy">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mark theme={document.documentElement.dataset.theme === 'fleet' ? 'trident-studio' : (PRODUCTS.find(([t]) => t === document.documentElement.dataset.theme)?.[0] ?? 'trident-studio')} size={28} />
            <Kicker>Trident Studio</Kicker>
          </div>
          <Heading level={4} size="3xl">
            Sample hero heading over the contour
          </Heading>
          <Text tone="ink-2">The contour carries no information. Text and controls stay legible without it.</Text>
          <div>
            <Button>Sample action</Button>
          </div>
        </div>
      </div>
    ),
  },
]
