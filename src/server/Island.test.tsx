import { renderToString } from 'react-dom/server'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { Island } from './Island'

function Greeting({ who, tags }: { who: string; tags: string[] }) {
  return (
    <p>
      Hello {who} ({tags.join(', ')})
    </p>
  )
}

describe('Island', () => {
  it('wraps the server-rendered component and writes props as a JSON data block right after it', () => {
    const html = renderToString(<Island name="Greeting" component={Greeting} props={{ who: 'Beau', tags: ['a', 'b'] }} hydrate="visible" />)
    const host = document.createElement('div')
    host.innerHTML = html
    const wrapper = host.querySelector('[data-island="Greeting"]')!
    expect(wrapper.getAttribute('data-island-hydrate')).toBe('visible')
    expect(wrapper.textContent).toBe('Hello Beau (a, b)')
    const data = wrapper.nextElementSibling!
    expect(data.tagName).toBe('SCRIPT')
    expect(data.getAttribute('type')).toBe('application/json')
    expect(data.hasAttribute('data-island-props')).toBe(true)
    expect(JSON.parse(data.textContent!)).toEqual({ who: 'Beau', tags: ['a', 'b'] })
  })

  it('defaults to idle hydration and a div wrapper; supports span, className', () => {
    const html = renderToString(<Island name="G" component={Greeting} props={{ who: 'x', tags: [] }} as="span" className="nav-slot" />)
    expect(html).toMatch(/^<span data-island="G" data-island-hydrate="idle" class="nav-slot">/)
  })

  it('is CSP-safe: no executable inline script, no inline handlers, hostile props escaped', () => {
    const html = renderToString(<Island name="G" component={Greeting} props={{ who: '</script><script>alert(1)</script>', tags: ['<!--', '\u2028'] }} />)
    expect(html.match(/<script/g)).toHaveLength(1)
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(html).toContain('<script type="application/json"')
    expect(html).not.toMatch(/\son[a-z]+=/i)
    const host = document.createElement('div')
    host.innerHTML = html
    expect(JSON.parse(host.querySelector('script')!.textContent!).who).toBe('</script><script>alert(1)</script>')
  })

  it('rejects props that would not round-trip through JSON (they would mismatch on hydrate)', () => {
    const bad: Array<[string, unknown]> = [
      ['function', { onClick: () => {} }],
      ['Date', { at: new Date() }],
      ['undefined', { x: undefined }],
      ['NaN', { n: Number.NaN }],
      ['bigint', { n: BigInt(1) }],
      ['Map', { m: new Map() }],
    ]
    for (const [label, props] of bad) {
      expect(() => renderToString(<Island name="G" component={Greeting as never} props={props as never} />), label).toThrow(TypeError)
    }
  })

  it('rejects bad names and strategies', () => {
    expect(() => renderToString(<Island name="1bad" component={Greeting} props={{ who: '', tags: [] }} />)).toThrow(/invalid name/)
    expect(() => renderToString(<Island name='a"b' component={Greeting} props={{ who: '', tags: [] }} />)).toThrow(/invalid name/)
    expect(() => renderToString(<Island name="G" component={Greeting} props={{ who: '', tags: [] }} hydrate={'eager' as never} />)).toThrow(/strategy/)
  })

  it('passes axe inside a themed document', async () => {
    document.documentElement.dataset.theme = 'trident-ops'
    document.documentElement.dataset.scheme = 'dark'
    document.body.innerHTML = `<main><h1>Ops</h1>${renderToString(<Island name="G" component={Greeting} props={{ who: 'Ops', tags: [] }} />)}</main>`
    expect(await axe(document.body)).toHaveNoViolations()
    document.body.innerHTML = ''
  })
})
