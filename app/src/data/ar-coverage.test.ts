import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AR } from './generated/ar'
import { AR_OVERRIDES } from './ar-overrides'

const screensDir = resolve(dirname(fileURLToPath(import.meta.url)), '../screens')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return /\.tsx$/.test(entry.name) ? [full] : []
  })
}

/** `t()` falls back to the English source when a key is missing, so an
 *  untranslated string is invisible in tests and shows up as mixed-language UI
 *  for an Arabic user. This measures the gap instead of leaving it unseen. */
describe('Arabic coverage', () => {
  const used = new Set<string>()
  for (const file of sourceFiles(screensDir)) {
    for (const [, key] of readFileSync(file, 'utf8').matchAll(/\bt\('((?:[^'\\]|\\.)*)'\)/g)) {
      used.add(key)
    }
  }
  const untranslated = [...used].filter((key) => !AR_OVERRIDES[key] && !AR[key])

  it('collects the strings the screens translate', () => {
    expect(used.size).toBeGreaterThan(500)
  })

  it('every override is actually used by a screen, so the file cannot rot', () => {
    const unused = Object.keys(AR_OVERRIDES).filter((key) => !used.has(key))
    expect(unused, 'overrides no screen asks for').toEqual([])
  })

  it('reports the outstanding gap without failing the build', () => {
    const covered = used.size - untranslated.length
    const pct = Math.round((covered / used.size) * 100)
    // Not an assertion on the number: this is a content task for a native
    // reviewer, and failing CI on it would only invite deleting the test.
    // eslint-disable-next-line no-console
    console.log(`Arabic coverage: ${covered}/${used.size} (${pct}%) — ${untranslated.length} strings still English`)
    expect(untranslated.length).toBeLessThan(used.size)
  })
})
