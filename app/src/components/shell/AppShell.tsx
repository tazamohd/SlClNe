import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileHeader } from './MobileShell'

/** The one shell for every operational screen.
 *
 *  In the design this markup was copy-pasted into all 191 desktop files; the
 *  handoff explicitly asks for a single `AppShell` to replace them (README §5).
 *  Below 860px the sidebar becomes an overlay drawer, which is what the
 *  `.Mobile.dc.html` variants did. */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  // A drawer left open across a navigation would cover the screen you just
  // asked for.
  useEffect(() => setDrawerOpen(false), [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-page font-ui">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:start-4 focus:top-4 focus:rounded focus:bg-salis-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {t('Skip to content')}
      </a>
      {isMobile ? (
        <>
          {drawerOpen ? (
            <button
              type="button"
              aria-label={t("Close navigation")}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 cursor-default border-none bg-black/50"
            />
          ) : null}
          <div
            role="dialog"
            aria-modal={drawerOpen ? true : undefined}
            aria-label={t("Navigation")}
            className={cn(
              'fixed inset-y-0 z-50 transition-transform duration-300 ease-salis start-0',
              drawerOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
            )}
          >
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      ) : (
        <Sidebar />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isMobile ? <MobileHeader onOpenNav={() => setDrawerOpen(true)} /> : <Topbar />}
        <main id="main-content" className="relative flex-1 overflow-auto">
          <PageBackdrop />
          <div
            className={cn(
              'relative z-[1] flex animate-fade-up flex-col',
              isMobile ? 'gap-5 p-4' : 'gap-8 p-6'
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/** The two faint brand orbs behind every page body. */
function PageBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute end-0 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.05),transparent_70%)] blur-[64px]" />
      <div className="absolute bottom-0 start-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.05),transparent_70%)] blur-[64px]" />
    </div>
  )
}

/** Page title block: gradient icon tile, gradient-filled heading, subtitle and
 *  right-aligned actions. Shared by the dashboards and list screens. */
export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: string
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
          <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name={icon} size={32} />
          </div>
        </div>
        <div>
          <h1 className="bg-salis-gradient-r bg-clip-text font-display text-2xl font-black leading-[1.1] text-transparent sm:text-4xl xl:text-5xl">
            {title}
          </h1>
          {subtitle ? <p className="font-light text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
