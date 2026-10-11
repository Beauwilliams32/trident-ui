/**
 * Getting started (G14, G17; shadcn's installation page): the pinned install, the CSS import order,
 * the cascade-layer rule that bit Ops, and what is new. Generated from package.json and
 * CHANGELOG.md at build time, so the tag shown is always the current one.
 */
import type { ReactNode } from 'react'
import data from '../galleryData'
import { CodeSample } from '../CodeSample'
import type { RawExample } from '../registry'

const { meta } = data
const v = `v${meta.version}`

export const LAYER_SNIPPET = `/* The very first rule of your first stylesheet (before @trident/ui/styles.css):
   name the layers, lowest priority first. */
@layer legacy, ui-base, ui-components, ui-utilities;

/* Then move old global resets into the lowest layer, so component styles win. */
@layer legacy {
  * { margin: 0; padding: 0; }
  a { color: inherit; }
}`

const Prose = ({ children }: { children: ReactNode }) => <div className="ui-prose" style={{ maxInlineSize: '72ch' }}>{children}</div>

export const examples: RawExample[] = [
  {
    id: 'install',
    title: 'Install the pinned tag',
    description: `The package installs from a git tag with dist/ committed. ${v} is the current release.`,
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-stack">
        <CodeSample label="package.json dependency" language="json" code={`"@trident/ui": "github:Beauwilliams32/trident-ui#${v}"`} />
        <CodeSample label="Install command" language="shell" code={`npm install --allow-git=all github:Beauwilliams32/trident-ui#${v}`} />
        <Prose>
          <p>
            The repository installs from a git tag. npm 12 needs <code>--allow-git=all</code>. Ops vendors the packed release. Keep <code>DESIGN-VERSION</code> in sync with the
            pin. <code>v0.1.0</code> cannot be installed; pin <code>v0.1.1</code> or later.
          </p>
        </Prose>
      </div>
    ),
  },
  {
    id: 'imports',
    title: 'Import the CSS in this order',
    description: 'Fonts, tokens, one theme, then component styles. The server sets the theme on <html>, so nothing flashes.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-stack">
        <CodeSample label="HTML root" language="html" code={`<html lang="en" data-theme="trident-ops" data-scheme="dark">`} />
        <CodeSample
          label="Imports"
          language="ts"
          code={`import '@trident/ui/fonts/fonts.css'      // or one family: fonts/inter.css
import '@trident/ui/tokens.css'
import '@trident/ui/themes/trident-ops.css'
import '@trident/ui/styles.css'
import { Button, TextLink } from '@trident/ui'
import { Dialog, DataTable } from '@trident/ui/app'          // app shells (Radix peers)
import { Hero, PricingTable } from '@trident/ui/marketing'   // marketing pages`}
        />
      </div>
    ),
  },
  {
    id: 'cascade-layers',
    title: 'Keep legacy resets below the component layer',
    description: 'Component CSS lives in @layer ui-components. Any unlayered rule beats every layered rule, whatever its specificity.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-stack">
        <Prose>
          <p>
            <code>styles.css</code> declares <code>@layer ui-base, ui-components, ui-utilities</code>. A global reset outside any layer, such as{' '}
            <code>{'* { margin: 0; padding: 0 }'}</code>, therefore wins over every Button, Card and Container, and zeroes their padding. Ops hit exactly
            this and patched it with <code>margin: revert-layer</code>. The clean fix is to put the old reset in a layer named first:
          </p>
        </Prose>
        <CodeSample label="Cascade layer order" language="css" code={LAYER_SNIPPET} />
        <Prose>
          <p>
            The order statement must come first: a layer named later ranks higher, so declaring <code>legacy</code> after importing{' '}
            <code>styles.css</code> would put the reset above the components again.
          </p>
        </Prose>
      </div>
    ),
  },
  {
    id: 'whats-new',
    title: 'What’s new',
    description: `From CHANGELOG.md at build time. The package is at ${v}.`,
    wide: true,
    showCode: false,
    render: () => (
      <div id="changelog" className="g-stack" tabIndex={-1}>
        {meta.changelog.map((section) => (
          <Prose key={section.title}>
            <h4>{section.title}</h4>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item.replace(/`/g, '')}</li>
              ))}
            </ul>
          </Prose>
        ))}
        <p style={{ margin: 0 }}>
          <a className="ui-link" href={meta.changelogUrl}>
            Full changelog
          </a>
        </p>
      </div>
    ),
  },
]
