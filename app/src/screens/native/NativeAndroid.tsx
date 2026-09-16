import { NativeAppPage } from './NativeAppPage'
import { ANDROID } from './native-build'

/** `/native/android`.
 *
 *  Was an invented Google Play listing — version 3.2.1, 38.2 MB, updated
 *  "Aug 12, 2026", rated 4.6 stars, advertising camera VIN scanning, NFC tag
 *  reading, digital signatures and background sync. None of it existed, there
 *  is no listing to rate, and the app had not been published at all.
 *
 *  Everything it says now comes from `native-build.ts` and is checked against
 *  the Android project by `scripts/check-native-claims.mjs`. */
export function NativeAndroid() {
  return (
    <NativeAppPage
      icon="Smartphone"
      title="Android App"
      subtitle="SALIS AUTO on Android"
      platformLabel="For Android"
      build={ANDROID}
    />
  )
}
