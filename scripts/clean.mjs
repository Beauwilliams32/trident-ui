#!/usr/bin/env node
/** Remove dist/ so every build is from scratch (dist-matches-source depends on it). */
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/tokens.mjs'

rmSync(join(ROOT, 'dist'), { recursive: true, force: true })
