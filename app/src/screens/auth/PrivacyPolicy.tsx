import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public legal document — Privacy Policy. Reached from the auth chain
 *  without signing in, so it renders standalone: no app shell, no role gate,
 *  just the page background and a scrollable document card (the design's
 *  modal-shaped card, kept full-page since there's no screen underneath it
 *  to dismiss back to).
 *
 *  The design generates its body copy from a placeholder loop — six
 *  identically-shaped sections, each just "Privacy Policy — section N.
 *  <tagline>." — rather than shipping final legal text. That's ported here
 *  verbatim: six numbered sections holding that exact generated sentence,
 *  under a heading per section so the structure the design implies (six
 *  distinct sections) stays visible instead of collapsing into one block. */

const SECTION_COUNT = 6

export function PrivacyPolicy() {
  const { t } = usePreferences()

  const sections = Array.from({ length: SECTION_COUNT }, (_, i) => ({
    heading: `${t('Section')} ${i + 1}`,
    body: `${t('Privacy Policy')} — ${t('section')} ${i + 1}. ${t(
      'Integrated automotive workshop management system'
    )}.`,
  }))

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4 font-ui sm:p-6">
      <div className="flex max-h-[80vh] w-full max-w-[640px] animate-fade-up flex-col rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-5 sm:px-6">
          <span className="flex rounded-[10px] bg-[rgba(11,179,255,.12)] p-2.5 text-salis-bright">
            <Icon name="Shield" size={18} />
          </span>
          <h1 className="m-0 font-display text-lg font-bold text-heading">{t('Privacy Policy')}</h1>
        </div>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-5 sm:px-6">
          {sections.map((section, i) => (
            <section key={i} className="flex flex-col gap-1">
              <h2 className="m-0 text-[13px] font-semibold text-heading">{section.heading}</h2>
              <p className="m-0 text-sm leading-[1.7] text-body">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="flex justify-end border-t border-border px-4 py-4 sm:px-6">
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded bg-salis-gradient px-5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
          >
            {t('Continue')}
          </Link>
        </div>
      </div>
    </div>
  )
}
