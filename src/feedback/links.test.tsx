/** G1: links inside messages take the tone ink and an underline, never the browser's link blue. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { LinkButton } from '../actions/Button'
import { TextLink } from '../type/TextLink'
import { Alert } from './Alert'
import { Toast } from './Toast'

const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')

describe('links inside Alert, Toast and FlashBanner', () => {
  it('CSS colours every non-button link with the tone ink, underlined', () => {
    expect(css).toMatch(/\.ui-alert :where\(a:not\(\.ui-btn\)\),\s*\.ui-toast :where\(a:not\(\.ui-btn\)\) \{[^}]*color: var\(--ui-tone-ink\);[^}]*text-decoration-line: underline;/)
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.ui-alert :where\(a:not\(\.ui-btn\)\)/)
  })

  it('the dismiss button tucks into the inline end (logical margins, right to left too)', () => {
    expect(css).toContain('margin-inline: 0 -6px;')
    expect(css).not.toContain('margin: -2px -6px 0 0;')
  })

  it('bare links, TextLinks and LinkButtons in an alert are all reachable and pass axe', async () => {
    const { container } = render(
      <>
        <Alert tone="error" title="Payment failed" actions={<a href="#billing">Update card</a>}>
          See <TextLink href="#help">help</TextLink>.
        </Alert>
        <Toast tone="info" title="Queued" message={<a href="#queue">Open the queue</a>} />
        <Alert tone="warn" actions={<LinkButton href="#x" size="sm">Reconnect</LinkButton>}>Reconnect Instagram.</Alert>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Update card' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Reconnect' }).className).toContain('ui-btn')
    expect(await axe(container)).toHaveNoViolations()
  })
})
