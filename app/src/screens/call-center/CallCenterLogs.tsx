import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

/* ---------- types ---------- */

type FilterKey = 'all' | 'in' | 'out' | 'miss' | 'voicemail'
type CallStatus = 'done' | 'missed' | 'voicemail'
type CallDirection = 'in' | 'out' | 'miss'

interface CallLog {
  id: string
  direction: CallDirection
  customer: string
  phone: string
  disposition: string
  agent: string
  when: string
  dur: string
  status: CallStatus
}

interface Kpi {
  icon: string
  label: string
  value: string
  iconBg: string
  iconColor: string
}

/* ---------- fixture data ---------- */

const FIXTURE_KPIS: Kpi[] = [
  { icon: 'PhoneCall', label: 'Total Calls', value: '186', iconBg: 'rgba(10,94,215,.09)', iconColor: 'var(--salis-blue)' },
  { icon: 'Timer', label: 'Avg Handle Time', value: '4:12', iconBg: 'rgba(11,179,255,.09)', iconColor: 'var(--salis-blue-bright)' },
  { icon: 'Gauge', label: 'Service Level', value: '92%', iconBg: 'rgba(11,31,59,.09)', iconColor: 'var(--salis-navy)' },
  { icon: 'PhoneMissed', label: 'Abandoned', value: '3.1%', iconBg: 'rgba(249,115,22,.09)', iconColor: 'var(--salis-orange)' },
]

const FIXTURE_LOGS: CallLog[] = [
  { id: '1', direction: 'in', customer: 'Ahmed Al-Rashid', phone: '+966 55 210 4471', disposition: 'Status Enquiry', agent: 'Fatima Al-Zahrani', when: 'Today 09:14', dur: '3:12', status: 'done' },
  { id: '2', direction: 'out', customer: 'Layla Al-Sulaiman', phone: '+966 50 118 7723', disposition: 'Estimate approval call', agent: 'Omar Al-Ghamdi', when: 'Today 08:52', dur: '5:48', status: 'done' },
  { id: '3', direction: 'in', customer: 'Gulf Transport Co.', phone: '+966 13 445 9900', disposition: 'Fleet — 3 vehicles overdue service', agent: 'Fatima Al-Zahrani', when: 'Today 08:31', dur: '7:04', status: 'done' },
  { id: '4', direction: 'miss', customer: 'Mohammed Hassan', phone: '+966 55 803 2214', disposition: 'No answer — callback queued', agent: '—', when: 'Today 08:12', dur: '0:00', status: 'missed' },
  { id: '5', direction: 'in', customer: 'Sara Al-Mutairi', phone: '+966 55 891 3344', disposition: 'Invoice Query', agent: 'Omar Al-Ghamdi', when: 'Yesterday 16:40', dur: '2:26', status: 'done' },
  { id: '6', direction: 'out', customer: 'Noura Al-Saud', phone: '+966 56 220 7781', disposition: 'Complaint', agent: 'Fatima Al-Zahrani', when: 'Yesterday 15:02', dur: '9:18', status: 'done' },
  { id: '7', direction: 'in', customer: 'Tariq Al-Dosari', phone: '+966 54 667 1200', disposition: 'Quote Requested', agent: '—', when: 'Yesterday 11:20', dur: '0:00', status: 'voicemail' },
  { id: '8', direction: 'in', customer: 'Reem Al-Sultan', phone: '+966 55 990 4412', disposition: 'Appointment Booked', agent: 'Omar Al-Ghamdi', when: 'Yesterday 10:05', dur: '4:33', status: 'done' },
]

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in', label: 'Inbound' },
  { key: 'out', label: 'Outbound' },
  { key: 'miss', label: 'Missed' },
  { key: 'voicemail', label: 'Voicemail' },
]

/* ---------- palette ---------- */

const DIR_ICON: Record<CallDirection, [string, string, string]> = {
  in: ['PhoneIncoming', 'rgba(10,94,215,.09)', 'var(--salis-blue)'],
  out: ['PhoneOutgoing', 'rgba(11,179,255,.09)', 'var(--salis-blue-bright)'],
  miss: ['PhoneMissed', 'rgba(249,115,22,.09)', 'var(--salis-orange)'],
}

const STATUS_STYLE: Record<CallStatus, [string, string, string]> = {
  done: ['Completed', 'rgba(10,94,215,.1)', 'var(--salis-blue)'],
  missed: ['Missed', 'rgba(249,115,22,.1)', 'var(--salis-orange)'],
  voicemail: ['Voicemail', 'rgba(100,116,139,.1)', 'var(--text-muted)'],
}

/* ---------- component ---------- */

export function CallCenterLogs() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let entries = FIXTURE_LOGS

    if (filter !== 'all') {
      if (filter === 'voicemail') {
        entries = entries.filter((e) => e.status === 'voicemail')
      } else {
        entries = entries.filter((e) => e.direction === filter)
      }
    }

    const q = search.trim().toLowerCase()
    if (q) {
      entries = entries.filter(
        (e) =>
          e.customer.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          e.disposition.toLowerCase().includes(q) ||
          e.agent.toLowerCase().includes(q)
      )
    }
    return entries
  }, [filter, search])

  const filterCounts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: FIXTURE_LOGS.length, in: 0, out: 0, miss: 0, voicemail: 0 }
    for (const log of FIXTURE_LOGS) {
      if (log.direction === 'in') c.in++
      if (log.direction === 'out') c.out++
      if (log.direction === 'miss') c.miss++
      if (log.status === 'voicemail') c.voicemail++
    }
    return c
  }, [])

  const columns: Column<CallLog>[] = [
    {
      header: '',
      cell: (log) => {
        const [dirIcon, dirBg, dirFg] = DIR_ICON[log.direction]
        return (
          <span
            className="flex flex-shrink-0 rounded-[10px] p-2"
            style={{ background: dirBg, color: dirFg }}
          >
            <Icon name={dirIcon} size={13} />
          </span>
        )
      },
    },
    {
      header: 'Customer',
      cell: (log) => (
        <>
          <p className="m-0 text-[13px] font-medium text-heading">{log.customer}</p>
          <p className="m-0 mt-0.5 font-mono text-[11px] text-muted" dir="ltr">{log.phone}</p>
        </>
      ),
    },
    { header: 'Disposition', cell: (log) => t(log.disposition) },
    { header: 'Agent', cell: (log) => log.agent },
    { header: 'When', cell: (log) => log.when },
    { header: 'Duration', cell: (log) => log.dur, code: true, className: 'text-end' },
    {
      header: 'Status',
      cell: (log) => {
        const [stLabel, stBg, stFg] = STATUS_STYLE[log.status]
        return (
          <div className="flex items-center gap-2">
            <Badge background={stBg} color={stFg}>{t(stLabel)}</Badge>
            {log.status === 'done' && (
              <button
                type="button"
                disabled={!isLive}
                className="flex h-[26px] w-[26px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-[rgba(10,94,215,.07)] text-salis-blue disabled:cursor-default disabled:opacity-60"
                aria-label={t('Play recording for') + ' ' + log.customer}
              >
                <Icon name="Play" size={12} />
              </button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_16px_22px_-6px_rgba(10,94,215,.25)]">
            <Icon name="List" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Call Logs')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Every inbound and outbound call with disposition and recording')}</p>
          </div>
        </div>
        <Button variant="outline" disabled={!isLive}>
          <Icon name="Download" size={15} />
          {t('Export')}
        </Button>
      </div>

      {/* KPIs */}
      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
        {FIXTURE_KPIS.map((k) => (
          <Card key={k.icon} className="p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex flex-shrink-0 rounded-[10px] p-2"
                style={{ background: k.iconBg, color: k.iconColor }}
              >
                <Icon name={k.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{t(k.label)}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading" dir="ltr">{k.value}</h4>
          </Card>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ChipGroup label={t('Filter by call type')}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={`${t(f.label)} ${filterCounts[f.key]}`} selected={filter === f.key} onToggle={() => setFilter(f.key)} />
          ))}
        </ChipGroup>
        <Input
          icon="Search"
          inputSize="sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Search calls...')}
          className="w-full sm:w-64"
          aria-label={t('Search call logs')}
        />
      </div>

      {/* Table / list */}
      <DataTable
        caption="Call logs"
        columns={columns}
        rows={filtered}
        rowKey={(log) => log.id}
        empty={
          <EmptyState
            icon="PhoneOff"
            title={t('No call logs')}
            description={
              search.trim() || filter !== 'all'
                ? t('No calls match the current search and filter.')
                : t('No calls have been recorded yet.')
            }
          />
        }
        mobileCard={(log) => {
          const [dirIcon, dirBg, dirFg] = DIR_ICON[log.direction]
          const [stLabel, stBg, stFg] = STATUS_STYLE[log.status]
          return (
            <>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex flex-shrink-0 rounded-lg p-1.5"
                      style={{ background: dirBg, color: dirFg }}
                    >
                      <Icon name={dirIcon} size={14} />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[13px] font-semibold text-heading">{log.customer}</span>
                      <span className="block font-mono text-[11px] text-muted" dir="ltr">{log.phone}</span>
                    </div>
                  </div>
                }
                trailing={
                  <Badge background={stBg} color={stFg}>{t(stLabel)}</Badge>
                }
              />
              <MobileCardRow label={t('Disposition')} value={t(log.disposition)} />
              <MobileCardRow label={t('Agent')} value={log.agent} />
              <MobileCardRow label={t('When')} value={log.when} />
              <MobileCardRow label={t('Duration')} value={<span dir="ltr" className="font-mono">{log.dur}</span>} />
            </>
          )
        }}
        footer={
          <div className="flex items-center border-0 border-t border-solid border-border px-5 py-3">
            <span className="text-xs text-muted">
              {t('Showing')} 1&ndash;{filtered.length} {t('of')} 186
            </span>
            <span className="flex-1" />
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled aria-label={t('Previous page')}>
                <Icon name="ChevronLeft" size={13} />
              </Button>
              <Button variant="outline" size="sm" disabled={!isLive} aria-label={t('Next page')}>
                <Icon name="ChevronRight" size={13} />
              </Button>
            </div>
          </div>
        }
      />
    </div>
  )
}
