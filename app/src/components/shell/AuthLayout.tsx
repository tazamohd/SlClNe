import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { BackLink } from '@/components/ui/BackLink'
import { usePreferences } from '@/providers/PreferencesProvider'
import { ShellContext } from './ShellContext'

const AUTH_SHELL = { kind: 'auth' } as const

/** Where a screen sits in the first-run chain (Welcome → Language → Region →
 *  Login). `index` is 1-based so the caption reads "Step 2 of 4". */
export interface AuthStep {
  index: number
  of: number
  /** Route of the previous step. Omitted on the first one. */
  back?: string
  /** English source string for the back link. Default "Back". */
  backLabel?: string
}

/** Centred frame shared by every unauthenticated screen.
 *
 *  Carries the three blurred brand orbs from the design and the floating
 *  language/theme controls, so the ~25 auth screens don't each restate them.
 *  Screens in the first-run chain pass `step`, which draws the dot progress
 *  row and a direction-aware back link above the content. */
export function AuthLayout({
  children,
  className,
  /** Some screens (Splash) hide the toggles. */
  controls = true,
  step,
}: {
  children: ReactNode
  className?: string
  controls?: boolean
  step?: AuthStep
}) {
  return (
    <ShellContext.Provider value={AUTH_SHELL}>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
        <AuthBackdrop />
        {controls ? <AuthControls /> : null}
        <main id="main-content" className={cn('relative z-[1] w-full animate-fade-up motion-reduce:animate-none p-4', className)}>
          {step ? <AuthProgress step={step} /> : null}
          {children}
        </main>
      </div>
    </ShellContext.Provider>
  )
}

/** Four dots and a back link. The dots are decorative for sighted users and a
 *  "Step 2 of 4" caption for everyone else; `aria-current="step"` marks the
 *  one the screen is on. */
export function AuthProgress({ step }: { step: AuthStep }) {
  const { t } = usePreferences()
  const dots = Array.from({ length: step.of }, (_, at) => at + 1)
  return (
    <div className="mb-4 flex min-h-[44px] items-center gap-4">
      {step.back ? (
        <span className="inline-flex min-h-[44px] items-center">
          <BackLink to={step.back} label={step.backLabel ?? 'Back'} />
        </span>
      ) : null}
      <ol
        aria-label={t('Progress')}
        className="flex items-center gap-1.5"
        data-testid="auth-progress"
      >
        {dots.map((at) => {
          const state = at < step.index ? 'done' : at === step.index ? 'current' : 'upcoming'
          return (
            <li
              key={at}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-200',
                state === 'current' ? 'w-5 bg-salis-blue' : 'w-2',
                state === 'done' && 'bg-salis-blue/50',
                state === 'upcoming' && 'bg-border-strong'
              )}
            >
              <span className="sr-only">
                {t('Step')} {at} {t('of')} {step.of}
              </span>
            </li>
          )
        })}
      </ol>
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
        className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded border border-border bg-card px-3 font-action text-xs font-medium text-muted transition-all duration-150 hover:bg-tint-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name="Globe" size={14} />
        <span>{rtl ? 'English' : 'عربي'}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t('Toggle theme')}
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded border border-border bg-card text-muted transition-all duration-150 hover:bg-tint-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
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
