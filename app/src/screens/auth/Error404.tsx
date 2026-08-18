import { Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** 404 — the router's `*` catch-all lands here for any unknown route.
 *
 *  Public terminal state: no app shell, no role check. Because every
 *  unmatched path redirects here already, this screen must never itself
 *  navigate to an unknown route — "Go Back" uses history (`navigate(-1)`),
 *  matching the prototype's `history.back()`, and "Go to Dashboard" points at
 *  the one route every session can resolve. */
export function Error404() {
  const { t } = usePreferences()
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-page p-6 font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.06),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex max-w-[400px] animate-fade-up flex-col items-center gap-6 text-center">
        <span className="bg-salis-gradient-r bg-clip-text font-display text-[90px] font-black leading-none text-transparent drop-shadow-[0_4px_20px_rgba(10,94,215,.2)] sm:text-[120px]">
          404
        </span>

        <div>
          <h1 className="font-display text-[22px] font-extrabold text-heading">
            {t('Page Not Found')}
          </h1>
          <p className="mt-2 font-action text-sm leading-[1.5] text-muted">
            {t("The page you're looking for doesn't exist or has been moved.")}
          </p>
        </div>

        <div className="flex w-full gap-2.5">
          <Link
            to="/dashboard"
            className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-salis-gradient px-5 font-action text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
          >
            <Home size={16} aria-hidden />
            {t('Go to Dashboard')}
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-[1.5px] border-border-strong bg-transparent px-5 font-action text-sm font-medium text-body"
          >
            <Icon name="ArrowLeft" size={16} />
            {t('Go Back')}
          </button>
        </div>
      </div>
    </div>
  )
}
