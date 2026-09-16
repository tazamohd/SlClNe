import { NativeAppPage } from './NativeAppPage'
import { IOS } from './native-build'

/** `/native/i-os`.
 *
 *  Was an invented App Store listing — version 3.2.1, 48.6 MB, rated 4.8 stars,
 *  advertising barcode scanning, push notifications and an offline mode. None
 *  of it existed, and it claimed iOS 16 against a project that targets 15.
 *
 *  Everything it says now comes from `native-build.ts` and is checked against
 *  the Xcode project by `scripts/check-native-claims.mjs`. */
export function NativeIOS() {
  return (
    <NativeAppPage
      icon="Apple"
      title="iOS App"
      subtitle="SALIS AUTO on iPhone and iPad"
      platformLabel="For iPhone and iPad"
      build={IOS}
    />
  )
}
