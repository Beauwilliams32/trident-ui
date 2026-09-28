/** Gallery examples for the type group (see src/a11y/a11y.gallery.tsx for the contract). */
import type { GalleryExample } from '../a11y/a11y.gallery'
import { Code } from './Code'
import { GradText } from './GradText'
import { Heading } from './Heading'
import { Kbd } from './Kbd'
import { Kicker } from './Kicker'
import { Mono } from './Mono'
import { Prose } from './Prose'
import { Text } from './Text'
import { TEXT_SIZES } from './scale'

export const group = 'type'

export const examples: GalleryExample[] = [
  {
    id: 'hero-heading',
    title: 'Kicker + Heading + GradText',
    render: () => (
      <div>
        <Kicker>Trident Studio</Kicker>
        <Heading level={2} size="display">
          Ship the <GradText>whole fleet</GradText>
        </Heading>
        <Text tone="ink-2" size="md" measure>
          One token source, one type system, every product.
        </Text>
      </div>
    ),
  },
  {
    id: 'scale',
    title: 'Type scale',
    render: () => (
      <div>
        {TEXT_SIZES.map((s) => (
          <Text key={s} size={s}>
            {s}: The quick brown fox
          </Text>
        ))}
      </div>
    ),
  },
  {
    id: 'tones',
    title: 'Text tones',
    render: () => (
      <div>
        <Text>ink</Text>
        <Text tone="ink-2">ink-2</Text>
        <Text tone="muted">muted</Text>
        <Text tone="accent" weight="display">
          accent-text
        </Text>
      </div>
    ),
  },
  {
    id: 'mono-code-kbd',
    title: 'Mono, Code, Kbd',
    render: () => (
      <div>
        <Text>
          Order <Mono>#A-10294</Mono> total <Mono>$1,240.00</Mono>
        </Text>
        <Text>
          Run <Code>npm run check</Code>, then press <Kbd keys={['Ctrl', 'K']} /> or <Kbd>Esc</Kbd>.
        </Text>
        <Code block label="Install command">
          npm install github:Beauwilliams32/trident-ui#v0.1.0
        </Code>
      </div>
    ),
  },
  {
    id: 'prose',
    title: 'Prose',
    render: () => (
      <Prose>
        <h2>Terms of service</h2>
        <p>
          These terms apply to every <a href="#terms">Trident product</a>. Read them with <code>care</code>.
        </p>
        <ul>
          <li>Plain language first.</li>
          <li>Links are always underlined.</li>
        </ul>
        <blockquote>Quotes get a rule, not a colour.</blockquote>
        <h3>Changes</h3>
        <p>We announce changes 30 days ahead.</p>
      </Prose>
    ),
  },
]
