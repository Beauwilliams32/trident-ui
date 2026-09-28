#!/usr/bin/env node
/**
 * dist-matches-source (spec §1): a fresh build of the source must equal the dist/ being shipped.
 *
 * dist/ is gitignored on main and force-added only on release tags. So:
 * - When dist/ is tracked (a release commit or tag): rebuild, then fail if git sees any change
 *   under dist/ (hand edits, stale build, or files the build no longer produces).
 * - Otherwise (main, PRs): build twice from a clean dist/ and fail unless both builds are
 *   byte-identical, so the tag-time comparison can never fail for nondeterminism.
 */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ROOT } from './lib/tokens.mjs'

const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' })
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })

function hashTree(dir) {
  const out = {}
  const walk = (d) => {
    for (const f of readdirSync(d).sort()) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else out[relative(dir, p)] = createHash('sha256').update(readFileSync(p)).digest('hex')
    }
  }
  walk(dir)
  return out
}

const tracked = git(['ls-files', '--', 'dist']).trim()
run('npm', ['run', 'build'])

if (tracked) {
  const status = git(['status', '--porcelain', '--untracked-files=all', '--ignored=matching', '--', 'dist'])
  if (status.trim()) {
    console.error('dist-matches-source: committed dist/ differs from a fresh build of the source:')
    console.error(status)
    process.exit(1)
  }
  console.log('dist-matches-source: committed dist/ matches a fresh build')
} else {
  const first = hashTree(join(ROOT, 'dist'))
  run('npm', ['run', 'build'])
  const second = hashTree(join(ROOT, 'dist'))
  const keys = new Set([...Object.keys(first), ...Object.keys(second)])
  const diff = [...keys].filter((k) => first[k] !== second[k])
  if (diff.length) {
    console.error(`dist-matches-source: build is not deterministic; differing files:\n  ${diff.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`dist-matches-source: dist/ untracked on this commit; ${keys.size} files rebuild byte-identically`)
}
