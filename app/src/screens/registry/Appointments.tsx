import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Appointment = RowOf<'appointments'>

/** Booking status palette. No-show is the one that needs chasing, so it takes
 *  the warning orange; confirmed and awaiting sit on the blue scale. */
const STATUS: Record<string, readonly [string, string]> = {
  confirmed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  awaiting: ['rgba(11,179,255,.1)', '#0BB3FF'],
  'no-show': ['rgba(249,115,22,.1)', '#F97316'],
}

const FILTERS = ['all', 'confirmed', 'awaiting', 'no-show'] as const

export function Appointments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: appointments = [], isLoading } = useCollection('appointments')
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)),
    [appointments, filter]
  )

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

      {/* Status filter. The design shipped these as static chips; here they
          actually filter, and the count makes the current view legible. */}
      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const on = filter === option
          const count =
            option === 'all'
              ? appointments.length
              : appointments.filter((a) => a.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium transition-all duration-150',
                on
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              <span>
                {t(
                  option === 'all'
                    ? 'All'
                    : option === 'no-show'
                      ? 'No Show'
                      : option[0].toUpperCase() + option.slice(1)
                )}
              </span>
              <span className="font-mono text-[11px] opacity-70" dir="ltr">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <DataTable
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
