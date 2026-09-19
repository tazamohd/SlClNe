import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState, Loading } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { auditLogApi, isLive, type AuditLogEntry } from '@/data/repository'

type FilterKey = 'all' | 'auth' | 'data' | 'system'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'auth', label: 'Auth' },
  { key: 'data', label: 'Data' },
  { key: 'system', label: 'System' },
]

const CATEGORY_STYLE: Record<AuditLogEntry['category'], { dot: string; bg: string; color: string }> = {
  auth: { dot: 'bg-salis-blue', bg: 'rgba(10,94,215,.08)', color: 'var(--salis-blue)' },
  data: { dot: 'bg-salis-bright', bg: 'rgba(11,179,255,.08)', color: 'var(--salis-blue-bright)' },
  system: { dot: 'bg-muted', bg: 'rgba(100,116,139,.06)', color: 'var(--text-muted)' },
}

/** The entry's action icon. Session/password-reset entities get a distinct
 *  icon per event (login vs. logout vs. reset); every other row is keyed off
 *  its mutation verb, since that is what the audit log actually records. */
function iconFor(entry: AuditLogEntry): string {
  if (entry.entity === 'session') {
    if (entry.action === 'create') return 'LogIn'
    if (entry.action === 'delete') return 'LogOut'
    return 'RefreshCw'
  }
  if (entry.entity === 'password_reset') return 'KeyRound'
  switch (entry.action) {
    case 'create': return 'Plus'
    case 'update': return 'Pencil'
    case 'delete': return 'Trash2'
    case 'restore': return 'RotateCcw'
    case 'approve': return 'CheckCircle'
    case 'reject':
    case 'decline': return 'XCircle'
    case 'transition': return 'ArrowRightCircle'
    case 'assign': return 'UserPlus'
    case 'post':
    case 'issue': return 'Receipt'
    case 'pay': return 'CreditCard'
    case 'export': return 'Download'
    default: return 'FileText'
  }
}

const ACTION_VERBS: Record<string, string> = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
  restore: 'restored',
  bulk_update: 'bulk-updated',
  bulk_delete: 'bulk-deleted',
  transition: 'moved',
  assign: 'assigned',
  approve: 'approved',
  reject: 'rejected',
  decline: 'declined',
  post: 'posted',
  issue: 'issued',
  pay: 'recorded payment on',
  movement: 'recorded a stock movement on',
  receive: 'received',
  reserve: 'reserved',
  release: 'released',
  command: 'sent a command to',
  export: 'exported',
  seed: 'seeded',
}

/** What the row reads as: "logged in" / "signed out" for the session
 *  entity, "requested a password reset" for that entity, and otherwise the
 *  mutation verb plus the entity it acted on — exactly what the row's own
 *  `action`/`entity` columns say, never invented detail. */
function describe(entry: AuditLogEntry, t: (s: string) => string): string {
  if (entry.entity === 'session') {
    if (entry.action === 'create') return t('logged in')
    if (entry.action === 'delete') return t('logged out')
    if (entry.action === 'reject') return t('had a session revoked for reuse')
    if (entry.action === 'update') return t('refreshed a session')
  }
  if (entry.entity === 'password_reset') return t('requested a password reset')
  const verb = t(ACTION_VERBS[entry.action] ?? entry.action)
  return `${verb} ${entry.entity.replace(/_/g, ' ')}`
}

function detailOf(entry: AuditLogEntry): string {
  return [entry.entityId, entry.reason].filter(Boolean).join(' — ')
}

function timeOf(entry: AuditLogEntry): string {
  return new Date(entry.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/* This screen was MOCK_ONLY (BLK-004): it already had an honest offline
 * gap branch ("Audit log requires a live API"), but the "live" branch
 * still rendered hardcoded `FIXTURE_ENTRIES` — invented users ("Khalid
 * Al-Amri", "Yousef Al-Otaibi", "Layla Al-Sulaiman"), IPs, job-card codes
 * and estimate amounts. That branch was never actually reachable
 * honestly: there is no general audit-log collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — `history` exists
 * only as a per-record (estimate/job) trail, not a system-wide feed.
 *
 * Now an honest GAP state unconditionally, following
 * CallCenterLogs.tsx's pattern, rather than a live/offline branch where
 * "live" meant "fabricated". */
export function AuditLog() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const query = useQuery<AuditLogEntry[]>({
    queryKey: ['audit-log', filter],
    queryFn: () => auditLogApi!.list({ category: filter === 'all' ? undefined : filter }),
    enabled: auditLogApi !== null,
  })

  const filtered = useMemo(() => {
    const entries = query.data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        (e.actorName ?? '').toLowerCase().includes(q) ||
        describe(e, t).toLowerCase().includes(q) ||
        detailOf(e).toLowerCase().includes(q),
    )
  }, [query.data, search, t])

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ScrollText" title={t('Audit Log')} subtitle={t('Track all system actions')} />
        {gap}
      </div>
    )
  }

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

      {query.isPending ? (
        <Card className="p-4">
          <Loading label={t('Loading the audit trail...')} />
        </Card>
      ) : query.isError ? (
        <Card className="p-4">
          <EmptyState
            icon="ScrollText"
            title={t('The audit trail could not be loaded')}
            description={t('Something went wrong reaching the server. Try again in a moment.')}
          />
        </Card>
      ) : filtered.length === 0 ? (
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
          {filtered.map((entry) => {
            const style = CATEGORY_STYLE[entry.category]
            return (
              <Card key={entry.id} className="px-4 py-3">
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex flex-shrink-0 rounded-lg p-1.5"
                        style={{ background: style.bg, color: style.color }}
                      >
                        <Icon name={iconFor(entry)} size={14} />
                      </span>
                      <span className="text-[13px] font-semibold text-heading">
                        {entry.actorName ?? t('System')}
                      </span>
                    </div>
                  }
                  trailing={<span className="text-[11px] text-muted">{timeOf(entry)}</span>}
                />
                <MobileCardRow label={t('Action')} value={describe(entry, t)} />
                <MobileCardRow label={t('Details')} value={detailOf(entry) || '—'} />
                <MobileCardRow
                  label={t('IP')}
                  value={<span dir="ltr" className="font-mono">{entry.ip ?? '—'}</span>}
                />
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="p-6">
            <div className="relative" style={{ paddingInlineStart: '28px' }}>
              <div
                className="absolute bottom-0 top-0 w-0.5 bg-border"
                style={{ insetInlineStart: '13px' }}
              />
              {filtered.map((entry, idx) => {
                const style = CATEGORY_STYLE[entry.category]
                return (
                  <div
                    key={entry.id}
                    className={
                      'relative flex gap-4 py-3.5' +
                      (idx < filtered.length - 1 ? ' border-0 border-b border-solid border-border' : '')
                    }
                  >
                    <span
                      className={'absolute h-2.5 w-2.5 rounded-full ' + style.dot}
                      style={{
                        insetInlineStart: '-22px',
                        top: '18px',
                        border: '2px solid var(--bg-page)',
                      }}
                    />
                    <div className="flex flex-1 items-start gap-3">
                      <span
                        className="flex flex-shrink-0 rounded-lg p-1.5"
                        style={{ background: style.bg, color: style.color }}
                      >
                        <Icon name={iconFor(entry)} size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[13px] text-body">
                          <span className="font-semibold text-heading">
                            {entry.actorName ?? t('System')}
                          </span>{' '}
                          {describe(entry, t)}
                        </p>
                        {detailOf(entry) && (
                          <p className="m-0 mt-0.5 text-[11px] text-muted">{detailOf(entry)}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-end">
                        <span className="text-[11px] text-muted">{timeOf(entry)}</span>
                        <p className="m-0 mt-0.5 font-mono text-[10px] text-faint" dir="ltr">
                          {entry.ip ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
