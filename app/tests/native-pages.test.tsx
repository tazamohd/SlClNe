import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { NativeAndroid } from '@/screens/native/NativeAndroid'
import { NativeIOS } from '@/screens/native/NativeIOS'
import { ANDROID, CAPABILITIES, GAPS, IOS } from '@/screens/native/native-build'
import { renderWithProviders } from './helpers/render'

/** What `/native/android` and `/native/i-os` are allowed to say.
 *
 *  These two screens were invented store listings — version 3.2.1, 38.2 MB,
 *  "Last Updated Aug 12, 2026", 4.6 stars, and six features (camera VIN
 *  scanning, NFC, barcode scanning, push, digital signatures, background sync)
 *  of which not one existed. A screen that renders a made-up number renders it
 *  perfectly, so nothing in the build could ever have objected.
 *
 *  `scripts/check-native-claims.mjs` checks the *source of truth* against the
 *  native projects and the installed plugin list. This checks the other half —
 *  that the page renders that source of truth, and specifically that the
 *  removed fabrications have not come back and that the gaps are still stated
 *  rather than quietly dropped, which is the tempting way to make a page look
 *  better without making the app better.
 */

describe('Android app page', () => {
  it('states the version and minimum from the Android project', () => {
    renderWithProviders(<NativeAndroid />)
    expect(screen.getAllByText(new RegExp(ANDROID.version)).length).toBeGreaterThan(0)
    expect(screen.getByText(ANDROID.minimum)).toBeInTheDocument()
    expect(screen.getByText(ANDROID.appId)).toBeInTheDocument()
  })

  it('says the app is not on a store, rather than implying it is', () => {
    renderWithProviders(<NativeAndroid />)
    expect(screen.getByText(/Not published to Google Play/i)).toBeInTheDocument()
  })

  it('renders no star rating — there is no listing to rate', () => {
    const { container } = renderWithProviders(<NativeAndroid />)
    /* Icons render as inline SVG with the lucide name on the element, so this
     * catches the rating row coming back in any shape. */
    expect(container.querySelectorAll('[class*="lucide-star"]')).toHaveLength(0)
    expect(screen.queryByText(/4\.6|4\.8/)).not.toBeInTheDocument()
  })

  it('renders none of the figures it used to invent', () => {
    renderWithProviders(<NativeAndroid />)
    for (const invented of ['3.2.1', '38.2 MB', 'Aug 12, 2026', 'Android 12+']) {
      expect(screen.queryByText(new RegExp(invented.replace(/[.+]/g, '\\$&')))).not.toBeInTheDocument()
    }
  })
})

describe('iOS app page', () => {
  it('states the version and deployment target from the Xcode project', () => {
    renderWithProviders(<NativeIOS />)
    expect(screen.getByText(IOS.minimum)).toBeInTheDocument()
    expect(screen.getByText(IOS.devices)).toBeInTheDocument()
  })

  it('no longer claims iOS 16, which the project never targeted', () => {
    renderWithProviders(<NativeIOS />)
    expect(screen.queryByText(/iOS 16/)).not.toBeInTheDocument()
  })
})

describe('both pages', () => {
  it('render every capability the build actually has', () => {
    renderWithProviders(<NativeAndroid />)
    for (const capability of CAPABILITIES) {
      expect(screen.getByText(capability.title), capability.title).toBeInTheDocument()
    }
  })

  /** The load-bearing one. Dropping this section is the easy way to make the
   *  page read well, and it would put the reader back where they started —
   *  four of these were advertised as working. */
  it('name what is missing, and what each one needs', () => {
    renderWithProviders(<NativeIOS />)
    const section = screen.getByText('Not in the app yet').closest('div')!
    for (const gap of GAPS) {
      expect(within(section).getByText(gap.title), gap.title).toBeInTheDocument()
      expect(within(section).getByText(new RegExp(gap.needs.slice(0, 30), 'i'))).toBeInTheDocument()
    }
  })

  it('translate their whole body into Arabic', async () => {
    /* These strings reach `t()` through a variable, so `check-i18n` — which
     * only reads literal call sites — cannot see them. Without this test the
     * page would silently stay English for an Arabic user. */
    renderWithProviders(<NativeAndroid />, { language: 'ar' })

    expect(await screen.findByText('ما يفعله التطبيق')).toBeInTheDocument()
    expect(screen.getByText('غير متوفر في التطبيق بعد')).toBeInTheDocument()
    expect(screen.getByText('المنتج كاملًا، وليس نسخة مختصرة')).toBeInTheDocument()
    expect(screen.getByText('مسح رقم الهيكل أو اللوحة بالكاميرا')).toBeInTheDocument()
    expect(screen.getByText(/لم يُنشر بعد/)).toBeInTheDocument()
  })
})
