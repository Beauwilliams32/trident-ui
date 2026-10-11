/** Package version and recent CHANGELOG entries for the gallery header and Getting started (G17). */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface ChangelogSection {
  title: string
  items: string[]
}

export interface GalleryMeta {
  name: string
  version: string
  /** The newest CHANGELOG sections (Unreleased first, then the latest release). */
  changelog: ChangelogSection[]
  changelogUrl: string
}

export function galleryMeta(root: string): GalleryMeta {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { name: string; version: string; repository?: { url?: string } }
  const md = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
  const sections: ChangelogSection[] = []
  for (const block of md.split(/^## /m).slice(1)) {
    const [title, ...body] = block.split('\n')
    const items: string[] = []
    for (const line of body) {
      if (/^- /.test(line)) items.push(line.slice(2).trim())
      else if (/^ {2,}\S/.test(line) && items.length) items[items.length - 1] += ` ${line.trim()}`
    }
    sections.push({ title: title!.trim(), items })
  }
  const repo = (pkg.repository?.url ?? '').replace(/^git\+/, '').replace(/\.git$/, '')
  return { name: pkg.name, version: pkg.version, changelog: sections.slice(0, 2), changelogUrl: repo ? `${repo}/blob/main/CHANGELOG.md` : 'CHANGELOG.md' }
}
