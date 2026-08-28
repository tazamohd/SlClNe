import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState, Loading, ErrorState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection } from '@/data/useCollection'
import { isLive, type BranchRow } from '@/data/repository'

interface FixtureBranch {
  name: string
  city: string
  staff: string
  bays: string
  revenue: string
  revPct: number
  status: 'active' | 'setup'
  tone: 'blue' | 'sky' | 'navy' | 'orange'
}

const STATUS_PILL: Record<string, [string, string]> = {
  active: ['var(--tint-blue)', 'var(--salis-blue)'],
  setup: ['var(--tint-orange)', 'var(--salis-orange)'],
}

const ICON_BG: Record<string, [string, string]> = {
  blue: ['var(--tint-blue)', 'var(--salis-blue)'],
  sky: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  navy: ['var(--tint-navy)', 'var(--salis-navy)'],
  orange: ['var(--tint-orange)', 'var(--salis-orange)'],
}

const FIXTURE_BRANCHES: FixtureBranch[] = [
  { name: 'Riyadh Main', city: 'Riyadh · Al-Olaya', staff: '12', bays: '6', revenue: 'SAR 485K', revPct: 85, status: 'active', tone: 'blue' },
  { name: 'Riyadh North', city: 'Riyadh · Al-Nakheel', staff: '8', bays: '4', revenue: 'SAR 312K', revPct: 65, status: 'active', tone: 'sky' },
  { name: 'Jeddah Branch', city: 'Jeddah · Al-Safa', staff: '10', bays: '5', revenue: 'SAR 398K', revPct: 72, status: 'active', tone: 'navy' },
  { name: 'Dammam Branch', city: 'Dammam · Al-Faisaliah', staff: '6', bays: '3', revenue: 'SAR 180K', revPct: 40, status: 'setup', tone: 'orange' },
]

export function Branches() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [q, setQ] = useState('')

  const liveQuery = useCollection('branches')
  const liveBranches = (liveQuery.data ?? []) as readonly BranchRow[]

  const filteredFixture = useMemo(() => {
    if (!q.trim()) return FIXTURE_BRANCHES
    const lower = q.trim().toLowerCase()
    return FIXTURE_BRANCHES.filter(
      (b) => b.name.toLowerCase().includes(lower) || b.city.toLowerCase().includes(lower),
    )
  }, [q])

  const filteredLive = useMemo(() => {
    if (!q.trim()) return liveBranches
    const lower = q.trim().toLowerCase()
    return liveBranches.filter(
      (b) => b.name.toLowerCase().includes(lower) || b.city.toLowerCase().includes(lower),
    )
  }, [q, liveBranches])

  if (isLive && liveQuery.isLoading) return <Loading label={t('Loading branches...')} />
  if (isLive && liveQuery.isError) {
    return <ErrorState description={liveQuery.error?.message} onRetry={() => void liveQuery.refetch()} />
  }

  const showLive = isLive && liveBranches.length > 0

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="MapPin" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Branches')}</h1>
            <p className="mt-1 text-sm text-muted">{t('Administration')}</p>
          </div>
        </div>
        <Button disabled={!isLive}>
          <Icon name="Plus" size={16} />
          {t('Add Branch')}
        </Button>
      </div>

      <Input
        icon="Search"
        inputSize="sm"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('Search branches...')}
        className="w-full sm:w-72"
        aria-label={t('Search branches')}
      />

      {showLive ? (
        filteredLive.length === 0 ? (
          <Card className="p-4">
            <EmptyState
              icon="MapPin"
              title={t('No branches found')}
              description={t('No branches match the current search.')}
            />
          </Card>
        ) : (
          <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-3 gap-5'}>
            {filteredLive.map((b) => (
              <Card
                key={b._id ?? b.name}
                className="cursor-pointer p-5 transition-all hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
              >
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tint-blue">
                    <Icon name="MapPin" size={18} className="text-salis-blue" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-[15px] font-bold text-heading">{b.name}</h2>
                    <p className="m-0 mt-0.5 text-xs text-muted">{b.city}</p>
                  </div>
                  <Badge
                    background={STATUS_PILL[b.isMain ? 'active' : 'active'][0]}
                    color={STATUS_PILL[b.isMain ? 'active' : 'active'][1]}
                  >
                    {t(b.isMain ? 'Main' : 'Active')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : filteredFixture.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="MapPin"
            title={t('No branches found')}
            description={t('No branches match the current search.')}
          />
        </Card>
      ) : (
        <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-3 gap-5'}>
          {filteredFixture.map((b) => {
            const [iconBg, iconFg] = ICON_BG[b.tone]
            const [stBg, stFg] = STATUS_PILL[b.status]
            return (
              <Card
                key={b.name}
                className="cursor-pointer p-5 transition-all hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
              >
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: iconBg }}
                  >
                    <Icon name="MapPin" size={18} style={{ color: iconFg }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-[15px] font-bold text-heading">{b.name}</h2>
                    <p className="m-0 mt-0.5 text-xs text-muted">{t(b.city)}</p>
                  </div>
                  <Badge background={stBg} color={stFg}>
                    {t(b.status)}
                  </Badge>
                </div>
                <div className="flex gap-4 text-[13px] text-muted">
                  <span className="flex items-center gap-1">
                    <Icon name="Users" size={13} />
                    {b.staff}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Wrench" size={13} />
                    {b.bays} {t('bays')}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="m-0 mb-1 text-[11px] text-muted">{t('Monthly Revenue')}</p>
                  <div className="h-1 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                    <div
                      className="h-full rounded-full bg-salis-gradient-r"
                      style={{ width: `${b.revPct}%` }}
                    />
                  </div>
                </div>
                <p className="m-0 mt-1.5 font-mono text-sm font-bold text-heading" dir="ltr">
                  {b.revenue}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
