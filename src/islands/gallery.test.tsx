import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import serverExamples from '../server/server.gallery'
import islandExamples, { registry } from './islands.gallery'
import { hydrateIslands } from './index'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('gallery story files', () => {
  it('every server and islands example renders on the server and passes axe', async () => {
    for (const ex of [...serverExamples, ...islandExamples]) {
      document.body.innerHTML = `<main><h1>${ex.title}</h1>${renderToString(<>{ex.render()}</>)}</main>`
      expect(await axe(document.body), ex.id).toHaveNoViolations()
    }
    document.body.innerHTML = ''
  })

  it('islands examples hydrate against the exported registry without recoverable errors', async () => {
    document.body.innerHTML = islandExamples.map((ex) => renderToString(<>{ex.render()}</>)).join('')
    const errors: unknown[] = []
    const consoleError = vi.spyOn(console, 'error')
    for (const el of document.querySelectorAll('[data-island-hydrate]')) el.setAttribute('data-island-hydrate', 'load')
    let handle: ReturnType<typeof hydrateIslands> | undefined
    await act(async () => {
      handle = hydrateIslands(registry, { onRecoverableError: (e) => errors.push(e) })
      await handle.ready
    })
    expect(errors).toEqual([])
    expect(consoleError).not.toHaveBeenCalled()
    expect(handle!.roots).toHaveLength(islandExamples.length)
    act(() => handle!.dispose())
    consoleError.mockRestore()
    document.body.innerHTML = ''
  })
})
