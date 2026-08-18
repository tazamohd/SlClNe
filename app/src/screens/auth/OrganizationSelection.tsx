import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Demo organizations offered on this screen. Membership counts are static —
 *  there's no backing org-membership endpoint yet, so this mirrors the
 *  prototype's fixture rather than fetching anything real. */
const ORGS = [
  { name: 'SALIS AUTO Holding', members: 24 },
  { name: 'Al-Amri Auto Group', members: 11 },
  { name: 'Najd Motors Est.', members: 6 },
] as const

/** Org picker — third step of the auth chain after signing in, before
 *  landing in the app shell. Filtering is local; picking an org only updates
 *  the selection here, `Continue` is what commits it and moves on. */
export function OrganizationSelection() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string>('SALIS AUTO Holding')

  const orgs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ORGS
    return ORGS.filter((org) => org.name.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute bottom-0 start-0 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.1),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex w-full max-w-[440px] animate-fade-up flex-col gap-5 p-4">
        <div className="text-center">
          <img
            src="/assets/logo-blue-orange.png"
            alt="SALIS AUTO"
            className="mx-auto h-auto w-[100px]"
          />
          <h1 className="mt-3 font-display text-xl font-extrabold text-heading">
            {t('Organization Selection')}
          </h1>
          <p className="mt-1.5 font-action text-[13px] text-muted">
            {t('Select your organization')}
          </p>
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search organizations')}
          icon={<Icon name="Search" size={15} />}
          inputSize="md"
          dir="ltr"
        />

        <div className="flex flex-col gap-2">
          {orgs.map((org) => {
            const on = picked === org.name
            return (
              <button
                key={org.name}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(org.name)}
                className={cn(
                  'box-border flex h-[60px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3.5',
                  'font-action text-sm font-medium transition-all duration-150',
                  on
                    ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue'
                    : 'border border-border bg-card text-body'
                )}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-white">
                  <Icon name="Building2" size={16} />
                </span>
                <span className="flex flex-1 flex-col items-start text-start">
                  <span>{org.name}</span>
                  <span className="font-normal text-[11px] text-muted">
                    {org.members} {t('members')}
                  </span>
                </span>
                {on ? <Icon name="Check" size={16} /> : null}
              </button>
            )
          })}

          <button
            type="button"
            className="box-border flex h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-[1.5px] border-dashed border-border-strong bg-transparent px-3.5 font-action text-[13px] font-medium text-muted"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-inset">
              <Icon name="Plus" size={16} />
            </span>
            <span>{t('Create New Organization')}</span>
          </button>
        </div>

        <Link
          to="/workspace-selection"
          className="box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
      </div>
    </div>
  )
}
