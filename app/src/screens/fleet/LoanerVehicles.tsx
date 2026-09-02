import { useMemo, useState } from 'react'
import {
  FeatureHeader,
  SearchField,
  Section,
  StatRow,
  TabBar,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

interface Loaner {
  vehicle: string
  plate: string
  issuedTo: string
  dueBack: string
  status: 'available' | 'on-loan' | 'overdue' | 'maintenance'
}

const TABS = [
  { id: 'all', label: 'All Loaners', icon: 'Car' },
  { id: 'available', label: 'Available', icon: 'CheckCircle' },
  { id: 'on-loan', label: 'On Loan', icon: 'ArrowRight' },
  { id: 'overdue', label: 'Overdue', icon: 'AlertCircle' },
] as const

const DEMO_LOANERS: readonly Loaner[] = []

function LoanerStatusBadge({ status }: { status: Loaner['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'available':
      return (
        <Badge background="var(--tint-blue)" color="var(--salis-blue)">
          {t('Available')}
        </Badge>
      )
    case 'on-loan':
      return (
        <Badge background="var(--tint-blue)" color="var(--salis-blue)">
          {t('On Loan')}
        </Badge>
      )
    case 'overdue':
      return (
        <Badge background="var(--tint-orange)" color="var(--salis-orange)">
          {t('Overdue')}
        </Badge>
      )
    case 'maintenance':
      return (
        <Badge background="var(--tint-orange)" color="var(--salis-orange)">
          {t('Maintenance')}
        </Badge>
      )
  }
}

export function LoanerVehicles() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Loaner[] = DEMO_LOANERS
    if (tab !== 'all') {
      rows = rows.filter((l) => l.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((l) =>
        [l.vehicle, l.plate, l.issuedTo].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const fleetSize = DEMO_LOANERS.length
  const onLoan = DEMO_LOANERS.filter((l) => l.status === 'on-loan').length
  const available = DEMO_LOANERS.filter((l) => l.status === 'available').length
  const overdue = DEMO_LOANERS.filter((l) => l.status === 'overdue').length

  const stats: Stat[] = [
    { label: 'Fleet Size', value: fleetSize, caption: 'Loaner vehicles', highlight: true },
    { label: 'On Loan', value: onLoan, caption: 'Currently issued', tone: 'info' },
    { label: 'Available', value: available, caption: 'Ready to issue' },
    { label: 'Overdue', value: overdue, caption: 'Past return date', tone: 'warning' },
  ]

  const columns: Column<Loaner>[] = [
    { header: 'Vehicle', cell: (l) => <span className="font-medium text-heading">{l.vehicle}</span> },
    { header: 'Plate', cell: (l) => l.plate, code: true },
    { header: 'Issued To', cell: (l) => l.issuedTo || '—' },
    { header: 'Due Back', cell: (l) => l.dueBack || '—' },
    { header: 'Status', cell: (l) => <LoanerStatusBadge status={l.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Car"
        title={t('Loaner Vehicles')}
        subtitle={t('Courtesy cars issued while a customer vehicle is in the workshop')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Issue Loaner')}
          </Button>
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Loaner Register')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search loaners...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(l) => l.plate}
          mobileCard={(l) => (
            <>
              <MobileCardHeader title={l.vehicle} trailing={<LoanerStatusBadge status={l.status} />} />
              <MobileCardRow label={t('Plate')}>
                <span className="font-mono" dir="ltr">{l.plate}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Issued To')}>{l.issuedTo || '—'}</MobileCardRow>
              <MobileCardRow label={t('Due Back')}>{l.dueBack || '—'}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Car"
              title={t('No loaner vehicles')}
              description={t('Add a courtesy car to start issuing loaners.')}
            />
          }
        />
      </Section>
    </>
  )
}
