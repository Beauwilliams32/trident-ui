/** Toolchain smoke test: React 19 + Testing Library + vitest-axe run in jsdom. */
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import * as ui from '../src/index'

describe('toolchain', () => {
  it('renders React 19 and passes axe', async () => {
    const { container } = render(
      <main>
        <h1>Trident UI</h1>
        <button type="submit">Save</button>
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('root entry exposes the contrast utilities', () => {
    expect(typeof ui.ensureContrast).toBe('function')
    expect(typeof ui.contrastRatio).toBe('function')
  })
})
