import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)
afterEach(() => cleanup())

// jsdom has no canvas backend. Return null (what a browser without the context returns) instead of
// jsdom's "Not implemented" error, so axe's colour probe and future WebGL gating tests stay quiet.
// Tests that need to assert "no WebGL context was created" can spy on this.
HTMLCanvasElement.prototype.getContext = function getContext() {
  return null
} as typeof HTMLCanvasElement.prototype.getContext
