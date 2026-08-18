import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'

interface Workspace {
  id: string
  name: string
  vehicles: string
  activeJobs: string
  team: string
}

const WORKSPACES: Workspace[] = [
  { id: 'w1', name: 'Al-Amri Auto Center', vehicles: '48', activeJobs: '12', team: '8' },
  { id: 'w2', name: 'Riyadh North Branch', vehicles: '31', activeJobs: '7', team: '5' },
  { id: 'w3', name: 'Jeddah Service Center', vehicles: '22', activeJobs: '4', team: '4' },
]

/** Workspace / branch selection after login. */
export function WorkspaceSelection() {
  const { t } = usePreferences()
  const [picked, setPicked] = useState('w1')

  return (
    <AuthLayout className="mx-auto max-w-[460px]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <BrandMark width={90} />
          <h1 className="mt-3 font-display text-[22px] font-black text-heading">
            {t('Workspace Selection')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {t('Select a workspace to continue')}
          </p>
        </div>

        {/* Workspace list */}
        <div className="flex flex-col gap-2.5">
          {WORKSPACES.map((ws) => {
            const selected = picked === ws.id
            return (
              <button
                key={ws.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPicked(ws.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3.5',
                  'font-action transition-all duration-200 ease-salis',
                  selected
                    ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue shadow-[0_4px_16px_rgba(10,94,215,.1)]'
                    : 'border border-border bg-card text-body hover:border-[rgba(10,94,215,.3)]'
                )}
              >
                {/* Avatar initial */}
                <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(10,94,215,.2)]">
                  {ws.name[0]}
                </span>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col text-start">
                  <span className="text-sm font-semibold">{ws.name}</span>
                  <div className="mt-1 flex gap-3">
                    <span className="flex items-center gap-1 text-[11px] opacity-70">
                      <Icon name="Car" size={11} />
                      {ws.vehicles} {t('Vehicles')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] opacity-70">
                      <Icon name="Wrench" size={11} />
                      {ws.activeJobs} {t('Active Jobs')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] opacity-70">
                      <Icon name="Users" size={11} />
                      {ws.team}
                    </span>
                  </div>
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

        {/* Continue */}
        <Button size="lg" className="w-full" disabled={!isLive}>
          {t('Continue')}
        </Button>
      </div>
    </AuthLayout>
  )
}
