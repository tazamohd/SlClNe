import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { EmptyState, Loading, ErrorState } from '@/components/ui/States'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { type BranchRow } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Workspace / branch selection after login.
 *
 *  Previously showed three fabricated workspaces ("Al-Amri Auto Center",
 *  "Riyadh North Branch", "Jeddah Service Center") with invented
 *  vehicle/active-job/team counts. `branches` (GET /branches, F-017) is a
 *  real collection — wired to it here — but its row shape
 *  (`BranchRow`: name/nameAr/city/isMain) has no usage-stat fields, so
 *  those counts are dropped rather than re-invented. */
export function WorkspaceSelection() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const [picked, setPicked] = useState<string | null>(null)

  const query = useCollection('branches')
  const branches = (query.data ?? []) as readonly BranchRow[]

  if (query.isLoading) return <Loading label={t('Loading workspaces...')} />
  if (query.isError) {
    return <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[460px]'}>
      <div className={`flex flex-col ${isMobile ? 'gap-4' : 'gap-6'}`}>
        {/* Header */}
        <div className="text-center">
          <BrandMark width={isMobile ? 70 : 90} />
          <h1 className={`mt-3 font-display font-black text-heading ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
            {t('Workspace Selection')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {t('Select a workspace to continue')}
          </p>
        </div>

        {branches.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <EmptyState
              icon="MapPin"
              title={t('No workspaces yet')}
              description={t('No branches are set up on this account yet.')}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {branches.map((ws) => {
              const name = rtl && ws.nameAr ? ws.nameAr : ws.name
              const wsId = ws._id ?? ws.name
              const selected = picked === wsId
              return (
                <button
                  key={wsId}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setPicked(wsId)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3.5',
                    'font-action transition-all duration-200 ease-salis',
                    selected
                      ? 'border-[1.5px] border-salis-blue bg-salis-blue/[.06] text-salis-blue shadow-[0_4px_16px_var(--tint-blue)]'
                      : 'border border-border bg-card text-body hover:border-salis-blue/[.3]'
                  )}
                >
                  {/* Avatar initial */}
                  <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(10,94,215,.2)]">
                    {name[0]}
                  </span>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col text-start">
                    <span className="text-sm font-semibold">{name}</span>
                    <span className="mt-1 flex items-center gap-1 text-[11px] opacity-70">
                      <Icon name="MapPin" size={11} />
                      {ws.city}
                      {ws.isMain ? ` · ${t('Main')}` : ''}
                    </span>
                  </div>

                  {/* Selection indicator */}
                  {selected ? (
                    <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_2px_6px_rgba(10,94,215,.3)]">
                      <Icon name="Check" size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-[22px] w-[22px] flex-shrink-0 rounded-full border-2 border-border-strong" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Continue */}
        <Button size="lg" className="w-full" disabled={!picked}>
          {t('Continue')}
        </Button>
      </div>
    </AuthLayout>
  )
}
