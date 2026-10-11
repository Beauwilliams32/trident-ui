/** Gallery examples for the type group (see src/a11y/a11y.gallery.tsx for the contract). */
import pkg from '../../package.json'
import { CodeSample } from '../../gallery/CodeSample'
import type { GalleryExample } from '../a11y/a11y.gallery'
import { Code } from './Code'
import { GradText } from './GradText'
import { Heading } from './Heading'
import { Kbd } from './Kbd'
import { Kicker } from './Kicker'
import { Mono } from './Mono'
import { Prose } from './Prose'
import { Text } from './Text'
import { TextLink } from './TextLink'
import { TEXT_SIZES } from './scale'

export const group = 'type'

export const examples: GalleryExample[] = [
  {
    id: 'hero-heading',
    title: 'Kicker + Heading + GradText',
    description: 'A display heading with its level set by the outline, not the look. GradText is for one or two words only.',
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
    description: 'The fluid scale (ratio 1.25 on phones, 1.333 on desktop). Body text never goes below 16px.',
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
    description: 'ink for primary text, ink-2 for secondary, muted for hints. Each is at least 4.5:1 on every background.',
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
    description: 'Tabular figures for IDs and money, inline code, key caps, and a scrollable code block that never breaks a word.',
    render: () => (
      <div>
        <Text>
          Order <Mono>#A-10294</Mono> total <Mono>$1,240.00</Mono>
        </Text>
        <Text>
          Run <Code>npm run check</Code>, then press <Kbd keys={['Ctrl', 'K']} /> or <Kbd>Esc</Kbd>.
        </Text>
        <CodeSample label="Install command" language="shell" code={`npm install github:Beauwilliams32/trident-ui#v${pkg.version}`} />
      </div>
    ),
  },
  {
    id: 'text-link',
    title: 'TextLink',
    description: 'The themed link: accent text and an underline in running text; underline on hover only in navigation. New tabs are announced.',
    render: () => (
      <div className="g-stack">
        <Text>
          Read the <TextLink href="#terms">terms of service</TextLink> before you publish.
        </Text>
        <Text size="sm">
          <TextLink href="#pricing" underline="hover">
            Pricing
          </TextLink>{' '}
          ·{' '}
          <TextLink href="#docs" underline="hover">
            Docs
          </TextLink>{' '}
          ·{' '}
          <TextLink href="https://example.com/status" target="_blank">
            Status page
          </TextLink>
        </Text>
      </div>
    ),
  },
  {
    id: 'prose',
    title: 'Prose',
    description: 'Long-form HTML from a CMS or Markdown: headings, lists, quotes and links styled without classes.',
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
