import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The three demo workspaces a signed-in user can switch between. Names are
 *  branch identities (Latin script even in Arabic UI), so they're rendered
 *  raw with `dir="ltr"` rather than run through `t()`. */
const WORKSPACES = [
  { name: 'Al-Amri Auto Center', vehicles: 48, jobs: 12, team: 8 },
  { name: 'Riyadh North Branch', vehicles: 31, jobs: 7, team: 5 },
  { name: 'Jeddah Service Center', vehicles: 22, jobs: 4, team: 4 },
] as const

export function WorkspaceSelection() {
  const { t } = usePreferences()
  const [picked, setPicked] = useState<string>('Al-Amri Auto Center')

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute bottom-0 start-0 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.1),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex w-full max-w-[460px] animate-fade-up flex-col gap-6 p-4">
        <div className="text-center">
          <img
            src="/assets/logo-blue-orange.png"
            alt="SALIS AUTO"
            className="mx-auto h-auto w-[90px]"
          />
          <h1 className="mt-3 font-display text-[22px] font-extrabold text-heading">
            {t('Workspace Selection')}
          </h1>
          <p className="mt-1.5 font-action text-[13px] text-muted">
            {t('Select a workspace to continue')}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {WORKSPACES.map((ws) => {
            const on = picked === ws.name
            return (
              <button
                key={ws.name}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(ws.name)}
                className={cn(
                  'box-border flex w-full cursor-pointer items-center gap-3 rounded-xl p-3.5',
                  'font-action transition-all duration-200',
                  on
                    ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue shadow-[0_4px_16px_rgba(10,94,215,.1)]'
                    : 'border border-border bg-card text-body'
                )}
              >
                <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(10,94,215,.2)]">
                  {ws.name[0]}
                </span>

                <span className="flex min-w-0 flex-1 flex-col text-start">
                  <span className="truncate text-sm font-semibold" dir="ltr">
                    {ws.name}
                  </span>
                  <span className="mt-1 flex gap-3">
                    <span className="flex items-center gap-[3px] text-[11px] opacity-70">
                      <Icon name="Car" size={11} />
                      {ws.vehicles} {t('Vehicles')}
                    </span>
                    <span className="flex items-center gap-[3px] text-[11px] opacity-70">
                      <Icon name="Wrench" size={11} />
                      {ws.jobs} {t('Active Jobs')}
                    </span>
                    <span className="flex items-center gap-[3px] text-[11px] opacity-70">
                      <Icon name="Users" size={11} />
                      {ws.team}
                    </span>
                  </span>
                </span>

                {on ? (
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

        <Link
          to="/dashboard"
          className="box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
      </div>
    </div>
  )
}
