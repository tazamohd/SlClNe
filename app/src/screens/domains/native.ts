import type { DomainScreens } from '../registry'
import { NativeIOS } from '../native/NativeIOS'
import { NativeAndroid } from '../native/NativeAndroid'

export const SCREENS: DomainScreens = {
  'Native.iOS': NativeIOS,
  'Native.Android': NativeAndroid,
}
