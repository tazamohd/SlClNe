import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public legal document — Terms & Conditions. No app shell, no role check:
 *  reachable pre-login (e.g. from Register) as well as by anyone with the
 *  link. The design generates its body as a repeating section pattern rather
 *  than fixed prose, so we reproduce that same generator here instead of
 *  inventing new legal text. */
const SECTION_COUNT = 6

export function TermsConditions() {
  const { t } = usePreferences()
  const [agreed, setAgreed] = useState(false)

  const sections = Array.from({ length: SECTION_COUNT }, (_, i) => i + 1)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page p-4 font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute end-0 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.08),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex max-h-[80vh] w-full max-w-[640px] animate-fade-up motion-reduce:animate-none flex-col rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-border px-6 py-5">
          <span className="flex rounded-[10px] bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
            <Icon name="FileText" size={18} />
          </span>
          <h1 className="m-0 font-display text-lg font-bold text-heading">
            {t('Terms & Conditions')}
          </h1>
        </div>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-6 py-5 text-sm leading-[1.7] text-body">
          {sections.map((n) => (
            <p key={n} className="m-0">
              {t('Terms & Conditions')} — {t('section')} {n}.{' '}
              {t('Integrated automotive workshop management system')}.
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => setAgreed((v) => !v)}
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-action text-[13px] text-body"
          >
            <span
              className={
                agreed
                  ? 'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-none bg-salis-gradient text-white'
                  : 'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-[1.5px] border-border-strong bg-inset text-transparent'
              }
            >
              <Icon name="Check" size={12} strokeWidth={3} />
            </span>
            <span>
              {t('I have read and agree to the')} {t('Terms & Conditions')}
            </span>
          </button>

          {agreed ? (
            <Link
              to="/onboarding"
              className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded bg-salis-gradient px-5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
            >
              {t('Continue')}
            </Link>
          ) : (
            <span className="inline-flex h-10 shrink-0 cursor-not-allowed items-center justify-center whitespace-nowrap rounded bg-inset px-5 font-action text-[13px] font-semibold text-muted">
              {t('Continue')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
