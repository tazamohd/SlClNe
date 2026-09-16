#!/usr/bin/env node
/** The native-claims gate: what `/native/android` and `/native/i-os` say,
 *  against the projects and the plugin list they describe.
 *
 *  Those two screens used to be invented store listings — version 3.2.1,
 *  38.2 MB, "Last Updated Aug 12, 2026", 4.6 stars, camera VIN scanning, NFC,
 *  barcode scanning, push notifications, background sync. Not one of those
 *  things existed, and nothing in the build could have said so: a screen that
 *  renders a made-up number renders it perfectly.
 *
 *  So the claims moved into `src/screens/native/native-build.ts` and this
 *  checks them. Both directions matter, and the second is the one that keeps
 *  working a year from now:
 *
 *    - every **capability** must name a plugin that is installed, so the page
 *      cannot advertise something that was removed;
 *    - every **gap** must name a plugin that is *not* installed, so the page
 *      cannot keep apologising for something that has since been built.
 *
 *  Run: node scripts/check-native-claims.mjs   (npm run check-native)
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = join(dirname(fileURLToPath(import.meta.url)), '..')

const failures = []
const note = (message) => failures.push(message)

const read = (relative) => readFileSync(join(APP, relative), 'utf8')

/** Pulls the exported literals out of `native-build.ts` without importing it —
 *  the file is TypeScript, and this script runs in plain node. The shapes are
 *  simple and fixed, so a targeted read is honest here; anything it cannot find
 *  is reported rather than skipped. */
function claims() {
  const source = read('src/screens/native/native-build.ts')

  const constant = (name, field) => {
    const block = source.match(new RegExp(`export const ${name}: PlatformBuild = \\{([\\s\\S]*?)\\n\\}`))
    if (!block) return null
    return block[1].match(new RegExp(`${field}: '([^']*)'`))?.[1] ?? null
  }

  const listed = (name, field) => {
    const block = source.match(new RegExp(`export const ${name}[^=]*= \\[([\\s\\S]*?)\\n\\]`))
    if (!block) return null
    return [...block[1].matchAll(new RegExp(`${field}: (?:'([^']*)'|(null))`, 'g'))].map(
      (m) => (m[2] === 'null' ? null : m[1])
    )
  }

  return {
    android: {
      appId: constant('ANDROID', 'appId'),
      version: constant('ANDROID', 'version'),
      build: constant('ANDROID', 'build'),
      minimumRaw: constant('ANDROID', 'minimumRaw'),
    },
    ios: {
      appId: constant('IOS', 'appId'),
      version: constant('IOS', 'version'),
      build: constant('IOS', 'build'),
      minimumRaw: constant('IOS', 'minimumRaw'),
    },
    scheme: source.match(/export const URL_SCHEME = '([^']*)'/)?.[1] ?? null,
    capabilityPlugins: listed('CAPABILITIES', 'plugin'),
    gapPlugins: listed('GAPS', 'plugin'),
  }
}

const said = claims()
for (const [key, value] of Object.entries({ ...said.android, scheme: said.scheme })) {
  if (value === null) note(`could not read ${key} out of native-build.ts`)
}
if (!said.capabilityPlugins?.length) note('could not read the CAPABILITIES plugin list')
if (!said.gapPlugins?.length) note('could not read the GAPS plugin list')

// ── Android ─────────────────────────────────────────────────────────────────

const variables = read('android/variables.gradle')
const appGradle = read('android/app/build.gradle')
const manifest = read('android/app/src/main/AndroidManifest.xml')
const strings = read('android/app/src/main/res/values/strings.xml')

const minSdk = variables.match(/minSdkVersion\s*=\s*(\d+)/)?.[1]
if (minSdk !== said.android.minimumRaw) {
  note(`Android minimum: the page says API ${said.android.minimumRaw}, variables.gradle says ${minSdk}`)
}
const versionName = appGradle.match(/versionName\s+"([^"]+)"/)?.[1]
if (versionName !== said.android.version) {
  note(`Android version: the page says ${said.android.version}, build.gradle says ${versionName}`)
}
const versionCode = appGradle.match(/versionCode\s+(\d+)/)?.[1]
if (versionCode !== said.android.build) {
  note(`Android build: the page says ${said.android.build}, build.gradle says ${versionCode}`)
}
const packageName = strings.match(/name="package_name">([^<]+)</)?.[1]
if (packageName !== said.android.appId) {
  note(`Android identifier: the page says ${said.android.appId}, strings.xml says ${packageName}`)
}

/* The deep-link claim. Without a VIEW/BROWSABLE intent filter carrying the
 * scheme, Android never routes the URL to the app, and the `appUrlOpen`
 * listener the page describes can never fire. */
const schemeString = strings.match(/name="custom_url_scheme">([^<]+)</)?.[1]
if (schemeString !== said.scheme) {
  note(`Android scheme: the page says ${said.scheme}, strings.xml says ${schemeString}`)
}
if (!/android\.intent\.action\.VIEW/.test(manifest) || !/android\.intent\.category\.BROWSABLE/.test(manifest)) {
  note('Android: no VIEW/BROWSABLE intent filter — a deep link cannot reach the app')
}
if (!/android:scheme="@string\/custom_url_scheme"/.test(manifest)) {
  note('Android: the intent filter does not carry @string/custom_url_scheme')
}

// ── iOS ─────────────────────────────────────────────────────────────────────

const pbxproj = read('ios/App/App.xcodeproj/project.pbxproj')
const plist = read('ios/App/App/Info.plist')

const deploymentTargets = [...pbxproj.matchAll(/IPHONEOS_DEPLOYMENT_TARGET = ([\d.]+);/g)].map(
  (m) => m[1]
)
if (!deploymentTargets.length) note('iOS: no IPHONEOS_DEPLOYMENT_TARGET in the Xcode project')
else if (!deploymentTargets.every((target) => target === said.ios.minimumRaw)) {
  note(
    `iOS minimum: the page says ${said.ios.minimumRaw}, the project says ` +
      `${[...new Set(deploymentTargets)].join(', ')}`
  )
}
const marketing = [...pbxproj.matchAll(/MARKETING_VERSION = ([\d.]+);/g)].map((m) => m[1])
if (!marketing.every((version) => version === said.ios.version)) {
  note(`iOS version: the page says ${said.ios.version}, the project says ${[...new Set(marketing)].join(', ')}`)
}
const projectVersion = [...pbxproj.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)].map((m) => m[1])
if (!projectVersion.every((v) => v === said.ios.build)) {
  note(`iOS build: the page says ${said.ios.build}, the project says ${[...new Set(projectVersion)].join(', ')}`)
}
if (!plist.includes('CFBundleURLTypes') || !plist.includes(`<string>${said.scheme}</string>`)) {
  note(`iOS: ${said.scheme}:// is not registered in Info.plist — a deep link cannot reach the app`)
}

/* The identifier both pages print. `capacitor.config.ts` is what actually sets
 * it on both platforms, so it is the thing worth comparing against. */
const appId = read('capacitor.config.ts').match(/appId:\s*'([^']+)'/)?.[1]
if (appId !== said.ios.appId || appId !== said.android.appId) {
  note(`identifier: the pages say ${said.android.appId}/${said.ios.appId}, capacitor.config.ts says ${appId}`)
}

// ── Plugins, in both directions ─────────────────────────────────────────────

const pkg = JSON.parse(read('package.json'))
const installed = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
])

for (const plugin of said.capabilityPlugins ?? []) {
  if (plugin === null) continue // the app's own code provides it
  if (!installed.has(plugin)) {
    note(`capability claims ${plugin}, which is not a dependency — the page promises what is not there`)
  }
}
for (const plugin of said.gapPlugins ?? []) {
  if (installed.has(plugin)) {
    note(
      `${plugin} is installed, but the page still lists it as missing — ` +
        'move the entry from GAPS to CAPABILITIES'
    )
  }
}

/** The fabrications that were there before, so they cannot come back by hand.
 *  A star rating is the clearest: there is no listing to be rated.
 *
 *  Comments are stripped first. The doc comment on each page names the
 *  invented figures it replaced — "38.2 MB", "Last Updated Aug 12, 2026" — and
 *  that history is worth keeping; the ban is on what the page *renders*. */
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const pages = ['NativeAppPage.tsx', 'NativeAndroid.tsx', 'NativeIOS.tsx']
  .map((file) => stripComments(read(`src/screens/native/${file}`)))
  .join('\n')
const banned = [
  [/name="Star"/, 'a star rating for a store listing that does not exist'],
  [/\b\d+(\.\d+)?\s?MB\b/, 'an invented download size'],
  [/Last Updated/, 'an invented release date'],
]
for (const [pattern, what] of banned) {
  if (pattern.test(pages)) note(`the native pages render ${what}`)
}

if (failures.length) {
  console.error('check-native: FAIL\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}

console.log(
  `check-native: OK — Android ${said.android.version} (API ${said.android.minimumRaw}+), ` +
    `iOS ${said.ios.version} (${said.ios.minimumRaw}+), ${said.scheme}:// registered on both, ` +
    `${said.capabilityPlugins.filter(Boolean).length} plugin-backed claims, ` +
    `${said.gapPlugins.length} gaps still uninstalled`
)
