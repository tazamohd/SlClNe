import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ICONS } from './icon-registry'

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : []
  })
}

/** `Icon` renders `null` for a name it cannot resolve, warning only in dev — so
 *  a missing glyph is invisible in production rather than loud. Eight screens
 *  shipped with `CheckCircle`, `AlertTriangle`, `Home` and `FileDown` drawing
 *  nothing, because the generator gated on lucide's canonical-name map and
 *  those are deprecated aliases. This keeps that class of bug from returning. */
describe('icon registry covers every name the screens ask for', () => {
  const referenced = new Map<string, string[]>()
  for (const file of sourceFiles(srcDir)) {
    for (const [, name] of readFileSync(file, 'utf8').matchAll(/\bname="([A-Z][A-Za-z0-9]{2,})"/g)) {
      referenced.set(name, [...(referenced.get(name) ?? []), file.replace(srcDir, 'src')])
    }
  }

  it('finds icon references to check', () => {
    expect(referenced.size).toBeGreaterThan(50)
  })

  it('resolves every referenced name', () => {
    const missing = [...referenced.entries()]
      .filter(([name]) => !ICONS[name])
      .map(([name, files]) => `${name} (${files[0]})`)
    expect(missing, 'these would render nothing at runtime').toEqual([])
  })
})
