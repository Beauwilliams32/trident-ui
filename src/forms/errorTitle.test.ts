/** GOV.UK error-summary rule: the page <title> starts with "Error: " while the form has errors (G20). */
import { describe, expect, it } from 'vitest'
import { errorCount, errorTitle } from './errorTitle'
import * as root from '../index'

describe('errorTitle()', () => {
  it('prefixes "Error: " when there is at least one error', () => {
    expect(errorTitle('Your profile | Trident NIL', 2)).toBe('Error: Your profile | Trident NIL')
    expect(errorTitle('Sign in', [{ message: 'Enter your email' }])).toBe('Error: Sign in')
    expect(errorTitle('Sign in', { email: 'Enter your email', password: '' })).toBe('Error: Sign in')
  })

  it('returns the title unchanged when there are no errors', () => {
    for (const none of [0, -1, Number.NaN, [], {}, { email: '' }, [{ message: null }], null, undefined])
      expect(errorTitle('Sign in', none as never)).toBe('Sign in')
  })

  it('takes a custom prefix (localised pages)', () => {
    expect(errorTitle('Connexion', 1, 'Erreur')).toBe('Erreur: Connexion')
  })

  it('counts the same entries ErrorSummary would list', () => {
    expect(errorCount({ a: 'x', b: '', c: false, d: 'y' })).toBe(2)
    expect(errorCount([{ message: 'x' }, { message: undefined }])).toBe(1)
    expect(errorCount(3.7)).toBe(3)
  })

  it('is exported from the package root', () => {
    expect(root.errorTitle).toBe(errorTitle)
    expect(root.errorCount).toBe(errorCount)
  })
})
