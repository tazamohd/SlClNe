import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Centred frame shared by every unauthenticated screen.
 *
 *  Carries the three blurred brand orbs from the design and the floating
 *  language/theme controls, so the ~25 auth screens don't each restate them. */
export function AuthLayout({
  children,
  className,
  /** Some screens (Splash) hide the toggles. */
  controls = true,
}: {
  children: ReactNode
  className?: string
  controls?: boolean
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <AuthBackdrop />
      {controls ? <AuthControls /> : null}
      <main id="main-content" className={cn('relative z-[1] w-full animate-fade-up motion-reduce:animate-none p-4', className)}>{children}</main>
    </div>
  )
}

/** Blue top-end orb, cyan bottom-start orb, faint orange centre. */
function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="absolute end-0 top-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,var(--tint-blue),transparent_65%)] blur-[64px]" />
      <div className="absolute bottom-0 start-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--tint-bright),transparent_65%)] blur-[64px]" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,.05),transparent_65%)] blur-[64px]" />
    </div>
  )
}

/** Language and theme toggles, pinned to the top inline-end corner. */
export function AuthControls() {
  const { t, theme, toggleTheme, rtl, toggleLanguage } = usePreferences()
  return (
    <div className="absolute end-4 top-4 z-50 flex gap-2">
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={t('Toggle language')}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded border border-border bg-card px-2.5 font-action text-xs font-medium text-muted transition-all duration-150 hover:bg-tint-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name="Globe" size={14} />
        <span>{rtl ? 'English' : 'عربي'}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t('Toggle theme')}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-border bg-card text-muted transition-all duration-150 hover:bg-tint-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
      </button>
    </div>
  )
}

/** The logo with its blurred gradient halo, as used on Login and Welcome. */
export function BrandMark({ width = 176 }: { width?: number }) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-xl bg-salis-gradient opacity-20 blur-3xl" aria-hidden />
      <img
        src="/assets/logo-blue-orange.png"
        alt="SALIS AUTO"
        width={1024}
        height={1024}
        style={{ width }}
        className="relative h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,.15)]"
      />
    </div>
  )
}
