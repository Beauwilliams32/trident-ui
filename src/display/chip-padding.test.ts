/** G10: a static chip has one inline padding on each side, never the label's extra start inset. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')

describe('Chip padding', () => {
  it('only a removable chip without a toggle gives its first label the start inset back', () => {
    expect(css).not.toMatch(/\.ui-chip:not\(:has\(\.ui-chip__toggle\)\) > \.ui-chip__label:first-child/)
    expect(css).toMatch(/\.ui-chip:has\(\.ui-chip__remove\):not\(:has\(\.ui-chip__toggle\)\) > \.ui-chip__label:first-child/)
  })

  it('interactive chips make room for their 44px touch regions only on a coarse pointer', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'))
    expect(coarse).toMatch(/\.ui-chip:has\(\.ui-chip__toggle, \.ui-chip__remove\) \{\s*margin-block: var\(--ui-space-2\);/)
  })
})
