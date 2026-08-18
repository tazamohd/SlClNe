import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'

/** Organizations — the tenant switcher on the Administration module
 *  (`project/Organizations.dc.html`).
 *
 *  A card per organization the signed-in user belongs to: identity tile,
 *  status pill, and branch/employee/user counts. Clicking a card is an
 *  execute-class action (it changes the active tenant), so it is gated on
 *  `can('admin', 'x')` — owner and superadmin only; a manager sees the same
 *  cards as plain, non-interactive divs. */

type OrgStatus = 'active' | 'setup'

interface Organization {
  /** Tenant id — an English/Latin source string, carries dir="ltr". */
  id: string
  /** Organization name — Latin, carries dir="ltr" inside Arabic copy. */
  name: string
  /** Organization type — translated key. */
  type: string
  /** Single-letter identity-tile initial. */
  initial: string
  branches: number
  employees: number
  users: number
  status: OrgStatus
}

/** The design bundle has no organizations table (`gms-data.js` carries none),
 *  so the rows live here for now. When the repository grows an
 *  `organizations` collection this const moves to the data layer and the
 *  screen switches to `useCollection('organizations')` — the row shape above
 *  is that contract. */
const ORGANIZATIONS: readonly Organization[] = [
  {
    id: 'ORG-1001',
    name: 'Al-Amri Auto Center',
    type: 'Main Organization',
    initial: 'A',
    branches: 3,
    employees: 24,
    users: 8,
    status: 'active',
  },
  {
    id: 'ORG-1002',
    name: 'Al-Amri Express Service',
    type: 'Subsidiary',
    initial: 'E',
    branches: 2,
    employees: 12,
    users: 5,
    status: 'active',
  },
  {
    id: 'ORG-1003',
    name: 'AutoCare Training Academy',
    type: 'Training Center',
    initial: 'T',
    branches: 1,
    employees: 6,
    users: 3,
    status: 'setup',
  },
]

/** Blue = active, orange = setup only — never green (README §7). */
const STATUS_META: Record<OrgStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Active', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  setup: { label: 'Setup', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
}

/** Stat tile shared by every card: a big display-font count over a muted
 *  label. The count is a counter digit, so it carries dir="ltr". */
function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-inset px-2.5 py-2.5 text-center">
      <p className="font-display text-xl font-black text-heading" dir="ltr">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  )
}

export function Organizations() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { show } = useToast()
  const isMobile = useIsMobile()

  const interactive = can('admin', 'x')

  const handleSelect = (org: Organization) => {
    if (org.status === 'setup') {
      show({
        title: t('Setup pending'),
        description: `${org.name} — ${t('Finish Setup')}`,
        error: true,
      })
      return
    }
    show({ title: t('Organization switched'), description: org.name })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* The design's glowing brand tile — same treatment as Branches. */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div
              className={cn(
                'relative flex rounded-xl bg-salis-gradient text-white',
                'shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]',
                isMobile ? 'p-2.5' : 'p-3'
              )}
            >
              <Icon name="Building2" size={isMobile ? 22 : 28} />
            </div>
          </div>
          <div className="min-w-0">
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-3xl'
              )}
            >
              {t('Organizations')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        {can('admin', 'c') ? (
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Organization')}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {ORGANIZATIONS.map((org) => {
          const status = STATUS_META[org.status]
          const cardClass = cn(
            'rounded-xl border border-border bg-card p-4 text-start shadow-sm',
            'transition-all duration-200 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg',
            'md:p-6'
          )
          const content = (
            <>
              <div className="mb-4 flex items-center gap-3.5">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-salis-gradient text-lg font-extrabold text-white shadow-[0_8px_20px_rgba(10,94,215,.2)]">
                  {org.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[17px] font-bold text-heading" dir="ltr">
                    {org.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {t(org.type)} ·{' '}
                    <span dir="ltr" className="font-mono">
                      {org.id}
                    </span>
                  </p>
                </div>
                <Badge background={status.bg} color={status.fg}>
                  {t(status.label)}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                <StatCell value={org.branches} label={t('Branches')} />
                <StatCell value={org.employees} label={t('Employees')} />
                <StatCell value={org.users} label={t('Users')} />
              </div>
            </>
          )

          return interactive ? (
            <button
              key={org.id}
              type="button"
              onClick={() => handleSelect(org)}
              className={cn(
                cardClass,
                'w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-page'
              )}
            >
              {content}
            </button>
          ) : (
            <div key={org.id} className={cardClass}>
              {content}
            </div>
          )
        })}
      </div>
    </>
  )
}
