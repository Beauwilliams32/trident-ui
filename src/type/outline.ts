/** Heading-outline checks behind Heading's dev warnings (spec §7, §9: one h1, no skipped levels). */

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingIssue {
  kind: 'multiple-h1' | 'skipped-level'
  element: Element
  level: HeadingLevel
  /** The level of the heading before this one, for skipped-level issues. */
  previous?: HeadingLevel
  message: string
}

/**
 * Walks the headings under `root` in document order and reports every h1 after the first and
 * every heading more than one level deeper than the heading before it. The first heading may be
 * any level (a fragment may start at h2). SSR-safe: pass a root explicitly outside the browser.
 */
export function checkHeadingOutline(root: ParentNode): HeadingIssue[] {
  const issues: HeadingIssue[] = []
  let previous: HeadingLevel | undefined
  let h1s = 0
  for (const el of Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
    const level = Number(el.tagName.charAt(1)) as HeadingLevel
    if (level === 1 && ++h1s > 1) {
      issues.push({ kind: 'multiple-h1', element: el, level, message: `Found h1 #${h1s} ("${label(el)}"); a page has exactly one h1.` })
    }
    if (previous !== undefined && level > previous + 1) {
      issues.push({
        kind: 'skipped-level',
        element: el,
        level,
        previous,
        message: `Heading level skipped: h${previous} is followed by h${level} ("${label(el)}"). Use h${previous + 1}, and change the look with the size prop.`,
      })
    }
    previous = level
  }
  return issues
}

function label(el: Element): string {
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')
  return text.length > 40 ? `${text.slice(0, 39)}…` : text
}
