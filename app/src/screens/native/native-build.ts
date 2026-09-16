/** What the mobile app actually is, as of this build.
 *
 *  `/native/android` and `/native/i-os` used to be invented store listings:
 *  version 3.2.1, 38.2 MB, "Last Updated Aug 12, 2026", a 4.6-star rating, and
 *  a feature list — camera VIN scanning, NFC tags, barcode scanning, push
 *  notifications, background sync — of which not one thing existed. There is no
 *  store listing to rate, and the plugins those features need are not
 *  installed.
 *
 *  So every number and claim on those two screens now comes from here, and
 *  everything here is checked against the thing it describes by
 *  `scripts/check-native-claims.mjs`: the version against the native project
 *  files, each capability against the plugin in `package.json` that provides
 *  it, each gap against the *absence* of a plugin, and the deep-link scheme
 *  against its registration in `AndroidManifest.xml` and `Info.plist`.
 *
 *  That last pair is the direction that matters. A capability list is easy to
 *  keep honest while you are writing it and impossible to keep honest a year
 *  later; a gate that fails when someone installs `@capacitor/camera` and
 *  leaves "camera scanning" in the gaps list is what keeps it true.
 */

export interface PlatformBuild {
  /** Store/bundle identifier — `appId` in `capacitor.config.ts`. */
  appId: string
  /** Android `versionName` / iOS `MARKETING_VERSION`. */
  version: string
  /** Android `versionCode` / iOS `CURRENT_PROJECT_VERSION`. */
  build: string
  /** Human-readable floor, and the raw value the gate compares against. */
  minimum: string
  minimumRaw: string
  devices: string
}

export const ANDROID: PlatformBuild = {
  appId: 'com.salisauto.app',
  version: '1.0',
  build: '1',
  // `minSdkVersion = 24` in android/variables.gradle. API 24 is Android 7.0.
  minimum: 'Android 7.0 (API 24)',
  minimumRaw: '24',
  devices: 'Phone and tablet',
}

export const IOS: PlatformBuild = {
  appId: 'com.salisauto.app',
  version: '1.0',
  build: '1',
  // IPHONEOS_DEPLOYMENT_TARGET in ios/App/App.xcodeproj/project.pbxproj.
  minimum: 'iOS 15.0',
  minimumRaw: '15.0',
  devices: 'iPhone and iPad',
}

/** The URL scheme a deep link uses. Registered in `AndroidManifest.xml` (as
 *  `@string/custom_url_scheme`) and in `Info.plist` under `CFBundleURLTypes`. */
export const URL_SCHEME = 'com.salisauto.app'

export interface Capability {
  title: string
  description: string
  icon: string
  /** The npm package that provides it, or `null` where the app's own code
   *  does. The gate requires a non-null value to be a real dependency. */
  plugin: string | null
}

/** What the shell does today. Every plugin-backed line is wired up in
 *  `src/lib/native.ts` and mounted by `src/providers/NativeProvider.tsx`. */
export const CAPABILITIES: readonly Capability[] = [
  {
    title: 'The full product, not a cut-down one',
    description:
      'The same screens as the web app, from the same build — nothing is withheld on mobile.',
    icon: 'LayoutGrid',
    plugin: '@capacitor/core',
  },
  {
    title: 'Launch screen that waits for the app',
    description: 'The splash hides when the first screen is ready, rather than on a fixed timer.',
    icon: 'Sparkles',
    plugin: '@capacitor/splash-screen',
  },
  {
    title: 'Status bar follows the theme',
    description: 'Light and dark are applied to the system bar, not just to the page.',
    icon: 'Sun',
    plugin: '@capacitor/status-bar',
  },
  {
    title: 'Back button behaves',
    description:
      'On Android, back closes an open dialog or drawer first, then navigates, and only leaves the app from a home screen.',
    icon: 'ArrowLeft',
    plugin: '@capacitor/app',
  },
  {
    title: 'Deep links',
    description: `A ${URL_SCHEME}:// link opens the screen it names, checked against the app's own address before it is followed.`,
    icon: 'Link',
    plugin: '@capacitor/app',
  },
  {
    title: 'Keyboard-aware layout',
    description: 'The bottom bars step aside while the on-screen keyboard is up.',
    icon: 'Type',
    plugin: '@capacitor/keyboard',
  },
  {
    title: 'Haptic feedback',
    description: 'A tap when you switch tabs, and a distinct pattern when something succeeds or fails.',
    icon: 'Waves',
    plugin: '@capacitor/haptics',
  },
  {
    title: 'Fits the hardware',
    description: 'Layout clears the notch and the home indicator, in both orientations.',
    icon: 'Smartphone',
    plugin: null,
  },
  {
    title: 'Arabic and English',
    description: 'Both languages throughout, with the layout mirrored for Arabic.',
    icon: 'Languages',
    plugin: null,
  },
  {
    title: 'Opens without a signal',
    description:
      'The interface ships inside the app, so it starts anywhere. Reading and saving records still needs a connection.',
    icon: 'WifiOff',
    plugin: null,
  },
]

export interface Gap {
  title: string
  /** What it would take — the honest answer to "why not?". */
  needs: string
  icon: string
  /** The package that would provide it. The gate requires this to be absent
   *  from `package.json`: install it and this list has to be revisited. */
  plugin: string
}

/** What the app does not do yet, and what each one needs.
 *
 *  Listed rather than quietly dropped. Four of these were advertised as
 *  working, so somebody has been told they exist; saying what is missing and
 *  why is more use to them than a shorter page. */
export const GAPS: readonly Gap[] = [
  {
    title: 'Scanning a VIN or a plate with the camera',
    needs: 'a camera plugin and a camera permission, neither of which this build has',
    icon: 'Camera',
    plugin: '@capacitor/camera',
  },
  {
    title: 'Scanning parts barcodes',
    needs: 'a barcode-scanning plugin on top of camera access',
    icon: 'ScanBarcode',
    plugin: '@capacitor-mlkit/barcode-scanning',
  },
  {
    title: 'Reading vehicle NFC tags',
    needs: 'an NFC plugin, the Android NFC permission and an iOS entitlement',
    icon: 'Radio',
    plugin: '@capawesome-team/capacitor-nfc',
  },
  {
    title: 'Push notifications',
    needs: 'a push plugin plus Firebase and Apple push credentials',
    icon: 'Bell',
    plugin: '@capacitor/push-notifications',
  },
  {
    title: 'Working offline and syncing later',
    needs: 'a local store for records and a sync layer to reconcile them',
    icon: 'RefreshCw',
    plugin: '@capacitor/preferences',
  },
  {
    title: 'Unlocking with a fingerprint or face',
    needs: 'a biometric plugin and a decision about what it may unlock',
    icon: 'Fingerprint',
    plugin: '@aparajita/capacitor-biometric-auth',
  },
]

/** How to get the app. There is no store listing, so saying "download on the
 *  App Store" would be the same kind of invention this file replaced. */
export const DISTRIBUTION = {
  status: 'Not published to Google Play or the App Store yet.',
  build: 'Built from the repository: npm run build, npx cap sync, then open the platform project.',
} as const
