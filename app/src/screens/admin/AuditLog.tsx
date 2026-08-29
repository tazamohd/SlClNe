import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

type FilterKey = 'all' | 'auth' | 'data' | 'system'

interface AuditEntry {
  id: string
  icon: string
  user: string
  action: string
  detail: string
  time: string
  ip: string
  cat: FilterKey
  dotColor: string
  iconBg: string
  iconColor: string
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'auth', label: 'Auth' },
  { key: 'data', label: 'Data' },
  { key: 'system', label: 'System' },
]

const FIXTURE_ENTRIES: AuditEntry[] = [
  { id: '1', icon: 'LogIn', user: 'Khalid Al-Amri', action: 'logged in', detail: 'New session — Chrome browser', time: '10:02 AM', ip: '192.168.1.45', cat: 'auth', dotColor: 'bg-salis-blue', iconBg: 'rgba(10,94,215,.08)', iconColor: 'var(--salis-blue)' },
  { id: '2', icon: 'Plus', user: 'Khalid Al-Amri', action: 'created job card', detail: 'JC-A3F8B2C1 — Ahmed Al-Rashid · Toyota Camry', time: '10:15 AM', ip: '192.168.1.45', cat: 'data', dotColor: 'bg-salis-blue', iconBg: 'rgba(10,94,215,.08)', iconColor: 'var(--salis-blue)' },
  { id: '3', icon: 'UserPlus', user: 'Khalid Al-Amri', action: 'assigned technician', detail: 'Yousef Al-Otaibi → JC-A3F8B2C1', time: '10:18 AM', ip: '192.168.1.45', cat: 'data', dotColor: 'bg-salis-bright', iconBg: 'rgba(11,179,255,.08)', iconColor: 'var(--salis-blue-bright)' },
  { id: '4', icon: 'CheckCircle', user: 'Yousef Al-Otaibi', action: 'completed inspection', detail: 'Multi-point inspection — 18/22 pass', time: '11:45 AM', ip: '192.168.1.102', cat: 'data', dotColor: 'bg-salis-blue', iconBg: 'rgba(10,94,215,.08)', iconColor: 'var(--salis-blue)' },
  { id: '5', icon: 'Receipt', user: 'Khalid Al-Amri', action: 'created estimate', detail: 'EST-0232 — SAR 1,546.75', time: '12:10 PM', ip: '192.168.1.45', cat: 'data', dotColor: 'bg-salis-blue', iconBg: 'rgba(10,94,215,.08)', iconColor: 'var(--salis-blue)' },
  { id: '6', icon: 'Send', user: 'System', action: 'sent estimate to customer', detail: 'Email to ahmed@email.com', time: '12:12 PM', ip: '—', cat: 'system', dotColor: 'bg-muted', iconBg: 'rgba(100,116,139,.06)', iconColor: 'var(--text-muted)' },
  { id: '7', icon: 'Shield', user: 'Khalid Al-Amri', action: 'changed security settings', detail: 'Enabled 2FA', time: '1:30 PM', ip: '192.168.1.45', cat: 'system', dotColor: 'bg-salis-orange', iconBg: 'rgba(249,115,22,.08)', iconColor: 'var(--salis-orange)' },
  { id: '8', icon: 'LogOut', user: 'Layla Al-Sulaiman', action: 'logged out', detail: 'Session expired', time: '2:00 PM', ip: '192.168.1.78', cat: 'auth', dotColor: 'bg-muted', iconBg: 'rgba(100,116,139,.06)', iconColor: 'var(--text-muted)' },
]

export function AuditLog() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let entries = FIXTURE_ENTRIES
    if (filter !== 'all') {
      entries = entries.filter((e) => e.cat === filter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      entries = entries.filter(
        (e) =>
          e.user.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.detail.toLowerCase().includes(q)
      )
    }
    return entries
  }, [filter, search])

  if (!isLive) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="ScrollText" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Audit Log')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Track all system actions')}</p>
          </div>
        </div>
        <Card className="p-4">
          <EmptyState
            icon="ScrollText"
            title={t('Audit log requires a live API')}
            description={t('The audit trail is recorded server-side. Connect a live API to view system actions, login events and data changes.')}
          />
          <p className="mt-1 flex items-start justify-center gap-1.5 text-[11px] text-muted">
            <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            {t('Connect the API — no data source yet:')}{' '}
            <span dir="ltr" className="font-mono text-body">auditLog</span>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex max-w-[1100px] animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="ScrollText" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Audit Log')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Track all system actions')}</p>
          </div>
        </div>
        <Button variant="subtle" disabled={!isLive}>
          <Icon name="Download" size={14} />
          {t('Export')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ChipGroup label={t('Filter by action type')}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={t(f.label)} selected={filter === f.key} onToggle={() => setFilter(f.key)} />
          ))}
        </ChipGroup>
        <Input
          icon="Search"
          inputSize="sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Search audit log...')}
          className="w-full sm:w-64"
          aria-label={t('Search audit log')}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="ScrollText"
            title={t('No audit entries')}
            description={
              search.trim() || filter !== 'all'
                ? t('No entries match the current search and filter.')
                : t('No trail entries recorded yet.')
            }
          />
        </Card>
      ) : isMobile ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((entry) => (
            <Card key={entry.id} className="px-4 py-3">
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex flex-shrink-0 rounded-lg p-1.5"
                      style={{ background: entry.iconBg, color: entry.iconColor }}
                    >
                      <Icon name={entry.icon} size={14} />
                    </span>
                    <span className="text-[13px] font-semibold text-heading">{entry.user}</span>
                  </div>
                }
                trailing={
                  <span className="text-[11px] text-muted">{entry.time}</span>
                }
              />
              <MobileCardRow label={t('Action')} value={t(entry.action)} />
              <MobileCardRow label={t('Details')} value={entry.detail} />
              <MobileCardRow label={t('IP')} value={<span dir="ltr" className="font-mono">{entry.ip}</span>} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="p-6">
            <div className="relative" style={{ paddingInlineStart: '28px' }}>
              <div
                className="absolute bottom-0 top-0 w-0.5 bg-border"
                style={{ insetInlineStart: '13px' }}
              />
              {filtered.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={
                    'relative flex gap-4 py-3.5' +
                    (idx < filtered.length - 1 ? ' border-0 border-b border-solid border-border' : '')
                  }
                >
                  <span
                    className={
                      'absolute h-2.5 w-2.5 rounded-full ' + entry.dotColor
                    }
                    style={{
                      insetInlineStart: '-22px',
                      top: '18px',
                      border: '2px solid var(--bg-page)',
                    }}
                  />
                  <div className="flex flex-1 items-start gap-3">
                    <span
                      className="flex flex-shrink-0 rounded-lg p-1.5"
                      style={{ background: entry.iconBg, color: entry.iconColor }}
                    >
                      <Icon name={entry.icon} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[13px] text-body">
                        <span className="font-semibold text-heading">{entry.user}</span>{' '}
                        {t(entry.action)}
                      </p>
                      <p className="m-0 mt-0.5 text-[11px] text-muted">{entry.detail}</p>
                    </div>
                    <div className="flex-shrink-0 text-end">
                      <span className="text-[11px] text-muted">{entry.time}</span>
                      <p className="m-0 mt-0.5 font-mono text-[10px] text-faint" dir="ltr">
                        {entry.ip}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center border-0 border-t border-solid border-border py-3">
            <Button variant="subtle" size="sm">
              {t('Load more')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
