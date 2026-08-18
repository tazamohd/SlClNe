import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'

/** Branches — the Administration module's branch overview
 *  (`project/Branches.dc.html`).
 *
 *  A card per branch: location tile, status pill, headcount and bay count,
 *  and monthly revenue against target. */

type BranchStatus = 'active' | 'setup'

interface Branch {
  name: string
  /** City name — an English source string, translated via t(). */
  city: string
  /** District, Latin — carries dir="ltr" inside Arabic copy. */
  district: string
  staff: number
  bays: number
  /** Compact display string as designed ("SAR 485K"); always LTR. */
  revenue: string
  /** Share of the monthly revenue target, 0–100 — drives the meter. */
  revenuePct: number
  status: BranchStatus
  /** Location-tile tint [background, foreground] from the design's rotation:
   *  blue, cyan, navy, and orange for branches still in setup. */
  tint: readonly [string, string]
}

/** The design bundle has no branch table (`gms-data.js` carries none), so the
 *  rows live here for now. When the repository grows a `branches` collection
 *  this const moves to the data layer and the screen switches to
 *  `useCollection('branches')` — the row shape above is that contract. */
const BRANCHES: readonly Branch[] = [
  {
    name: 'Riyadh Main',
    city: 'Riyadh',
    district: 'Al-Olaya',
    staff: 12,
    bays: 6,
    revenue: 'SAR 485K',
    revenuePct: 85,
    status: 'active',
    tint: ['rgba(10,94,215,.1)', '#0A5ED7'],
  },
  {
    name: 'Riyadh North',
    city: 'Riyadh',
    district: 'Al-Nakheel',
    staff: 8,
    bays: 4,
    revenue: 'SAR 312K',
    revenuePct: 65,
    status: 'active',
    tint: ['rgba(11,179,255,.1)', '#0BB3FF'],
  },
  {
    name: 'Jeddah Branch',
    city: 'Jeddah',
    district: 'Al-Safa',
    staff: 10,
    bays: 5,
    revenue: 'SAR 398K',
    revenuePct: 72,
    status: 'active',
    tint: ['rgba(11,31,59,.1)', '#0B1F3B'],
  },
  {
    name: 'Dammam Branch',
    city: 'Dammam',
    district: 'Al-Faisaliah',
    staff: 6,
    bays: 3,
    revenue: 'SAR 180K',
    revenuePct: 40,
    status: 'setup',
    tint: ['rgba(249,115,22,.1)', '#F97316'],
  },
]

/** Blue = active, orange = still in setup — never green (README §7). */
const STATUS_META: Record<BranchStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Active', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  setup: { label: 'Setup', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
}

export function Branches() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* The design's glowing brand tile — same treatment as PageHeader,
              at this screen's 30px title scale. */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div
              className={cn(
                'relative flex rounded-xl bg-salis-gradient text-white',
                'shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]',
                isMobile ? 'p-2.5' : 'p-3'
              )}
            >
              <Icon name="MapPin" size={isMobile ? 22 : 28} />
            </div>
          </div>
          <div className="min-w-0">
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-3xl'
              )}
            >
              {t('Branches')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        {can('admin', 'c') ? (
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Add Branch')}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {BRANCHES.map((branch) => {
          const status = STATUS_META[branch.status]
          const [tileBg, tileFg] = branch.tint
          return (
            <Card
              key={branch.name}
              className="p-4 transition-all duration-200 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg sm:p-5"
            >
              <div className="mb-3.5 flex items-center gap-2.5">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: tileBg }}
                >
                  <Icon name="MapPin" size={18} style={{ color: tileFg }} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-bold text-heading">{branch.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {t(branch.city)} · <span dir="ltr">{branch.district}</span>
                  </p>
                </div>
                <Badge background={status.bg} color={status.fg}>
                  {t(status.label)}
                </Badge>
              </div>

              <div className="flex gap-4 text-[13px] text-muted">
                <span className="flex items-center gap-1">
                  <Icon name="Users" size={13} />
                  {branch.staff}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Wrench" size={13} />
                  {branch.bays} {t('bays')}
                </span>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-[11px] text-muted">{t('Monthly Revenue')}</p>
                <div className="h-1 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                  <div
                    className="h-full rounded-full bg-salis-gradient-r"
                    style={{ width: `${branch.revenuePct}%` }}
                  />
                </div>
              </div>
              <p className="mt-1.5 font-mono text-sm font-bold text-heading" dir="ltr">
                {branch.revenue}
              </p>
            </Card>
          )
        })}
      </div>
    </>
  )
}
