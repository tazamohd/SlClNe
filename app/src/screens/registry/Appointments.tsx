import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '@/lib/useMediaQuery'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ErrorState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { useCollection, type RowOf } from '@/data/useCollection'

type Appointment = RowOf<'appointments'>

/** Booking status palette. No-show is the one that needs chasing, so it takes
 *  the warning orange; confirmed and awaiting sit on the blue scale. */
const STATUS: Record<string, readonly [string, string]> = {
  confirmed: ['var(--tint-blue)', 'var(--salis-blue)'],
  awaiting: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  'no-show': ['var(--tint-orange)', 'var(--salis-orange)'],
}

const FILTERS = ['all', 'confirmed', 'awaiting', 'no-show'] as const

export function Appointments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data: appointments = [], isLoading, isError, error, refetch } = useCollection('appointments')
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)),
    [appointments, filter]
  )

  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const statusBadge = (value: string) => {
    const [bg, fg] = STATUS[value] ?? STATUS.awaiting
    return (
      <Badge background={bg} color={fg}>
        {t(value === 'no-show' ? 'No Show' : value[0].toUpperCase() + value.slice(1))}
      </Badge>
    )
  }

  const columns: Column<Appointment>[] = [
    { header: 'Time', cell: (a) => <span className="font-mono text-[13px]" dir="ltr">{a.time}</span> },
    { header: 'Customer', cell: (a) => a.cust },
    { header: 'Vehicle', cell: (a) => a.veh },
    { header: 'Plate', cell: (a) => a.plate, code: true },
    { header: 'Service', cell: (a) => t(a.svc) },
    { header: 'Bay', cell: (a) => a.bay },
    { header: 'Technician', cell: (a) => a.tech },
    {
      header: 'Duration',
      cell: (a) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {a.mins}m
        </span>
      ),
    },
    { header: 'Status', cell: (a) => statusBadge(a.status) },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Calendar" title={t('Appointments')} />
        <ChipGroup label={t('Status')}>
          {FILTERS.map((option) => {
            const count = option === 'all' ? appointments.length : appointments.filter((a) => a.status === option).length
            const label = option === 'all' ? 'All' : option === 'no-show' ? 'No Show' : option[0].toUpperCase() + option.slice(1)
            return (
              <Chip
                key={option}
                label={`${t(label)} ${count}`}
                selected={filter === option}
                onToggle={() => setFilter(option)}
              />
            )
          })}
        </ChipGroup>
        <DataTable
          caption="Appointments"
          columns={columns}
          rows={filtered}
          rowKey={(a, index) => `${a.plate}-${index}`}
          loading={isLoading}
          mobileCard={(a) => (
            <>
              <MobileCardHeader title={a.time} code trailing={statusBadge(a.status)} />
              <MobileCardRow>{a.cust}</MobileCardRow>
              <MobileCardRow>{a.veh} · <span className="font-mono" dir="ltr">{a.plate}</span></MobileCardRow>
              <MobileCardRow label={t('Service')}>{t(a.svc)}</MobileCardRow>
              <MobileCardRow label={t('Bay')}>{a.bay} · {a.tech}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="CalendarX" title={t('No appointments in this view')} description={t('Try another status filter, or add a booking.')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Appointments')}
        actions={
          <>
            <Button variant="subtle" size="md" onClick={() => navigate('/appointment-calendar')}>
              <Icon name="Calendar" size={16} />
              {t('Calendar View')}
            </Button>
            {can('appointments', 'c') ? (
              <Button size="md">
                <Icon name="Plus" size={16} />
                {t('New Appointment')}
              </Button>
            ) : null}
          </>
        }
      />

      <ChipGroup label={t('Status')}>
        {FILTERS.map((option) => {
          const count =
            option === 'all'
              ? appointments.length
              : appointments.filter((a) => a.status === option).length
          const label = option === 'all' ? 'All' : option === 'no-show' ? 'No Show' : option[0].toUpperCase() + option.slice(1)
          return (
            <Chip
              key={option}
              label={`${t(label)} ${count}`}
              selected={filter === option}
              onToggle={() => setFilter(option)}
            />
          )
        })}
      </ChipGroup>

      <DataTable
        caption="Appointments"
        columns={columns}
        rows={filtered}
        rowKey={(a, index) => `${a.plate}-${index}`}
        loading={isLoading}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={a.time} code trailing={statusBadge(a.status)} />
            <MobileCardRow>{a.cust}</MobileCardRow>
            <MobileCardRow>
              {a.veh} · <span className="font-mono" dir="ltr">{a.plate}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Service')}>{t(a.svc)}</MobileCardRow>
            <MobileCardRow label={t('Bay')}>
              {a.bay} · {a.tech}
            </MobileCardRow>
          </>
        )}
        empty={
          <EmptyState
            icon="CalendarX"
            title={t('No appointments in this view')}
            description={t('Try another status filter, or add a booking.')}
          />
        }
      />
    </>
  )
}
