import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface Org {
  name: string
  type: string
  initial: string
  branches: string
  employees: string
  users: string
  status: 'active' | 'setup'
}

const STATUS_PILL: Record<string, [string, string]> = {
  active: ['var(--tint-blue)', 'var(--salis-blue)'],
  setup: ['var(--tint-orange)', 'var(--salis-orange)'],
}

const FIXTURE_ORGS: Org[] = [
  { name: 'Al-Amri Auto Center', type: 'Main Organization', initial: 'A', branches: '3', employees: '24', users: '8', status: 'active' },
  { name: 'Al-Amri Express Service', type: 'Subsidiary', initial: 'E', branches: '2', employees: '12', users: '5', status: 'active' },
  { name: 'AutoCare Training Academy', type: 'Training Center', initial: 'T', branches: '1', employees: '6', users: '3', status: 'setup' },
]

export function Organizations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [q, setQ] = useState('')

  const orgs = useMemo(() => {
    if (!q.trim()) return FIXTURE_ORGS
    const lower = q.trim().toLowerCase()
    return FIXTURE_ORGS.filter(
      (o) =>
        o.name.toLowerCase().includes(lower) ||
        o.type.toLowerCase().includes(lower),
    )
  }, [q])

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Building2" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Organizations')}</h1>
            <p className="mt-1 text-sm text-muted">{t('Administration')}</p>
          </div>
        </div>
        <Button disabled={!isLive}>
          <Icon name="Plus" size={16} />
          {t('New Organization')}
        </Button>
      </div>

      <Input
        icon="Search"
        inputSize="sm"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('Search organizations...')}
        className="w-full sm:w-72"
        aria-label={t('Search organizations')}
      />

      {orgs.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="Building2"
            title={t('No organizations found')}
            description={t('No organizations match the current search.')}
          />
        </Card>
      ) : (
        <div className={isMobile ? 'flex flex-col gap-5' : 'grid grid-cols-2 gap-5'}>
          {orgs.map((org) => {
            const [stBg, stFg] = STATUS_PILL[org.status]
            return (
              <Card
                key={org.name}
                className="cursor-pointer p-6 transition-all hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-3.5">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-salis-gradient text-lg font-extrabold text-white shadow-[0_8px_20px_rgba(10,94,215,.2)]">
                    {org.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-[17px] font-bold text-heading">{org.name}</h2>
                    <p className="m-0 mt-0.5 text-xs text-muted">{t(org.type)}</p>
                  </div>
                  <Badge background={stBg} color={stFg}>
                    {t(org.status)}
                  </Badge>
                </div>

                {isMobile ? (
                  <div className="flex flex-col gap-1">
                    <MobileCardRow label={t('Branches')} value={org.branches} />
                    <MobileCardRow label={t('Employees')} value={org.employees} />
                    <MobileCardRow label={t('Users')} value={org.users} />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox value={org.branches} label={t('Branches')} />
                    <StatBox value={org.employees} label={t('Employees')} />
                    <StatBox value={org.users} label={t('Users')} />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-inset p-2.5 text-center">
      <p className="m-0 font-display text-xl font-black text-heading">{value}</p>
      <p className="m-0 mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  )
}
