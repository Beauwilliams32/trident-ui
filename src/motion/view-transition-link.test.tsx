/** G1: ViewTransitionLink renders the themed .ui-link instead of a bare <a>. */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ViewTransitionLink } from './ViewTransitionLink'

describe('ViewTransitionLink look', () => {
  it('has the .ui-link class by default and keeps extra classes', () => {
    render(
      <>
        <ViewTransitionLink href="#a">Overview</ViewTransitionLink>
        <ViewTransitionLink href="#b" className="nav">
          Reports
        </ViewTransitionLink>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Overview' }).className).toBe('ui-link')
    expect(screen.getByRole('link', { name: 'Reports' }).className).toBe('ui-link nav')
  })

  it('unstyled drops the default look for links styled by their container', () => {
    render(
      <ViewTransitionLink href="#a" unstyled className="tab">
        Tab
      </ViewTransitionLink>,
    )
    expect(screen.getByRole('link', { name: 'Tab' }).className).toBe('tab')
  })
})
