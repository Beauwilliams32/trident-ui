import { useState } from 'react'
import { Code } from '../src/type/Code'

/**
 * A code block with a Copy button (G4, G12). The code is real text in a scrollable, focusable
 * region, so it reads and selects without JavaScript; the button copies with the Clipboard API and
 * says "Copied" through a live region.
 */
export function CodeSample({ code, label, language }: { code: string; label: string; language?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2000)
  }
  return (
    <div className="g-codesample" data-language={language}>
      <div className="g-codesample__bar">
        <span className="g-codesample__lang">{language ?? 'text'}</span>
        <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm g-copy" onClick={copy}>
          <span className="ui-btn__label">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}</span>
        </button>
      </div>
      <Code block label={label}>
        {code}
      </Code>
      <span className="ui-visually-hidden" aria-live="polite">
        {state === 'copied' ? `${label} copied` : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </div>
  )
}
