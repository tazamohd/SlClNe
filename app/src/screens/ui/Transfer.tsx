import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Section } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'

/** UI pattern-library screens (design project/UI.ExportCenter.dc.html and
 *  UI.ImportCenter.dc.html), wired into `APP_SCREENS` under /ui/export-center
 *  and /ui/import-center. Neither design shipped a `.Mobile.dc.html` variant.
 *
 *  The designs hardcode their type grids as demo data in the component
 *  script, so the recent-jobs/batches tables below follow the same idea —
 *  local consts, not a live collection. Uploads, the format picker and the
 *  dropzone are visual only: `useState` drives the highlighted selection,
 *  nothing reads or transfers a real file. */

/** lucide icon by registry name, with a direct-import fallback for glyphs the
 *  generated registry doesn't carry (BarChart3 isn't referenced anywhere else
 *  in the ported design bundle). */
function TypeIcon({ name, size = 18 }: { name: string; size?: number }) {
  if (name === 'BarChart3') return <BarChart3 size={size} strokeWidth={2} aria-hidden />
  return <Icon name={name} size={size} />
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 flex-shrink-0 overflow-hidden rounded-full bg-inset">
        <div className="h-full rounded-full bg-salis-gradient-r" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-muted" dir="ltr">
        {pct}%
      </span>
    </div>
  )
}

/** Export/import job status reuses the generated `ST_BADGE` palette instead
 *  of a bespoke tone map: `pending` → queued, `in_progress` → running,
 *  `completed` → done, `cancelled` → failed. All four are already
 *  blue/orange/slate, so no new colour is introduced. */
type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: 'Queued',
  in_progress: 'Running',
  completed: 'Completed',
  cancelled: 'Failed',
}

// ── Export Center ────────────────────────────────────────────────────────────

interface ExportType {
  id: string
  name: string
  desc: string
  icon: string
  bg: string
  fg: string
  formats: readonly string[]
}

const EXPORT_TYPES: readonly ExportType[] = [
  { id: 'job-cards', name: 'Job Cards', desc: 'Export all job card records', icon: 'ClipboardList', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', formats: ['CSV', 'PDF', 'Excel'] },
  { id: 'invoices', name: 'Invoices', desc: 'Export invoice history', icon: 'Receipt', bg: 'rgba(249,115,22,.1)', fg: '#F97316', formats: ['PDF', 'CSV'] },
  { id: 'customers', name: 'Customers', desc: 'Export customer database', icon: 'Users', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', formats: ['CSV', 'Excel'] },
  { id: 'inventory', name: 'Inventory', desc: 'Export parts inventory', icon: 'Package', bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B', formats: ['CSV', 'Excel'] },
  { id: 'financial', name: 'Financial', desc: 'Export accounting data', icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', formats: ['PDF', 'Excel'] },
  { id: 'reports', name: 'Reports', desc: 'Export generated reports', icon: 'BarChart3', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', formats: ['PDF'] },
]

interface ExportJob {
  id: string
  name: string
  format: string
  size: string
  date: string
  status: JobStatus
  progress: number
}

const EXPORT_JOBS: readonly ExportJob[] = [
  { id: 'exp-1', name: 'Job Cards — Q2 2026', format: 'CSV', size: '4.2 MB', date: 'Aug 15, 2026', status: 'completed', progress: 100 },
  { id: 'exp-2', name: 'Invoice History', format: 'PDF', size: '11.8 MB', date: 'Aug 15, 2026', status: 'in_progress', progress: 62 },
  { id: 'exp-3', name: 'Customer Database', format: 'Excel', size: '2.6 MB', date: 'Aug 14, 2026', status: 'completed', progress: 100 },
  { id: 'exp-4', name: 'Parts Inventory', format: 'CSV', size: '—', date: 'Aug 13, 2026', status: 'pending', progress: 0 },
  { id: 'exp-5', name: 'Accounting Ledger', format: 'Excel', size: '—', date: 'Aug 12, 2026', status: 'cancelled', progress: 0 },
  { id: 'exp-6', name: 'Monthly Reports', format: 'PDF', size: '6.4 MB', date: 'Aug 10, 2026', status: 'completed', progress: 100 },
]

export function UIExportCenter() {
  const { t } = usePreferences()
  const [selectedType, setSelectedType] = useState(EXPORT_TYPES[0].id)
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_TYPES[0].formats[0])

  const activeType = EXPORT_TYPES.find((type) => type.id === selectedType) ?? EXPORT_TYPES[0]

  const columns: Column<ExportJob>[] = [
    { header: 'Job', cell: (job) => t(job.name) },
    { header: 'Format', cell: (job) => <span dir="ltr" className="font-mono text-xs">{job.format}</span> },
    { header: 'Size', cell: (job) => <span dir="ltr" className="font-mono text-xs text-muted">{job.size}</span> },
    { header: 'Status', cell: (job) => <StatusBadge value={job.status} label={t(STATUS_LABEL[job.status])} /> },
    {
      header: 'Progress',
      cell: (job) =>
        job.status === 'in_progress' ? (
          <ProgressBar pct={job.progress} />
        ) : (
          <span dir="ltr" className="text-xs text-muted">
            {job.status === 'completed' ? '100%' : '—'}
          </span>
        ),
    },
    { header: 'Requested', cell: (job) => <span dir="ltr" className="text-xs text-muted">{job.date}</span> },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Export Center')}
        subtitle={t('UI Patterns')}
        actions={
          <Button size="md">
            <Icon name="Download" size={16} />
            {t('New Export')}
          </Button>
        }
      />

      <Section title={t('Export Type')} subtitle={t('Choose what to export')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {EXPORT_TYPES.map((type) => {
            const active = type.id === selectedType
            return (
              <button
                key={type.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedType(type.id)
                  setSelectedFormat(type.formats[0])
                }}
                className={cn(
                  'flex cursor-pointer flex-col gap-2.5 rounded-[14px] border p-4 text-start transition-all duration-200',
                  active
                    ? 'border-salis-blue shadow-[0_8px_20px_-6px_rgba(10,94,215,.25)]'
                    : 'border-border hover:border-[rgba(10,94,215,.3)]'
                )}
              >
                <span className="flex w-fit rounded-[10px] p-2" style={{ background: type.bg, color: type.fg }}>
                  <TypeIcon name={type.icon} size={18} />
                </span>
                <h3 className="text-sm font-semibold text-heading">{t(type.name)}</h3>
                <p className="text-xs text-muted">{t(type.desc)}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {type.formats.map((fmt) => (
                    <span
                      key={fmt}
                      dir="ltr"
                      className="rounded border border-border bg-inset px-2 py-0.5 font-mono text-[10px] font-semibold text-muted"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title={t('Format')} subtitle={`${t('Selected type')}: ${t(activeType.name)}`}>
        <div role="tablist" aria-label={t('Format')} className="flex flex-wrap gap-2">
          {activeType.formats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              role="tab"
              aria-selected={selectedFormat === fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={cn(
                'cursor-pointer rounded-full border px-4 py-1.5 font-action text-[13px] font-medium transition-all duration-150',
                selectedFormat === fmt
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              <span dir="ltr">{fmt}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('Recent Exports')} subtitle={t('Latest export jobs and their status')}>
        <DataTable
          columns={columns}
          rows={EXPORT_JOBS}
          rowKey={(job) => job.id}
          mobileCard={(job) => (
            <>
              <MobileCardHeader
                title={t(job.name)}
                trailing={<StatusBadge value={job.status} label={t(STATUS_LABEL[job.status])} />}
              />
              <MobileCardRow label={t('Format')}>
                <span dir="ltr">{job.format}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Requested')}>
                <span dir="ltr">{job.date}</span>
              </MobileCardRow>
              {job.status === 'in_progress' ? <ProgressBar pct={job.progress} /> : null}
            </>
          )}
          empty={<EmptyState icon="Download" title={t('No exports yet')} />}
        />
      </Section>
    </>
  )
}

// ── Import Center ────────────────────────────────────────────────────────────

interface ImportType {
  id: string
  name: string
  desc: string
  icon: string
  bg: string
  fg: string
}

const IMPORT_TYPES: readonly ImportType[] = [
  { id: 'customers', name: 'Customers', desc: 'Import customer records', icon: 'Users', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  { id: 'vehicles', name: 'Vehicles', desc: 'Import vehicle data', icon: 'Car', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
  { id: 'inventory', name: 'Inventory', desc: 'Import parts catalog', icon: 'Package', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  { id: 'contacts', name: 'Contacts', desc: 'Import from CRM', icon: 'BookOpen', bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B' },
]

interface ImportBatch {
  id: string
  name: string
  type: string
  rows: string
  date: string
  status: JobStatus
  progress: number
}

const IMPORT_BATCHES: readonly ImportBatch[] = [
  { id: 'imp-1', name: 'customer_records.csv', type: 'Customers', rows: '1,204', date: 'Aug 16, 2026', status: 'completed', progress: 100 },
  { id: 'imp-2', name: 'fleet_vehicles.xlsx', type: 'Vehicles', rows: '318', date: 'Aug 16, 2026', status: 'in_progress', progress: 41 },
  { id: 'imp-3', name: 'parts_catalog.csv', type: 'Inventory', rows: '2,860', date: 'Aug 15, 2026', status: 'pending', progress: 0 },
  { id: 'imp-4', name: 'crm_contacts.json', type: 'Contacts', rows: '—', date: 'Aug 14, 2026', status: 'cancelled', progress: 0 },
]

export function UIImportCenter() {
  const { t } = usePreferences()
  const [dragOver, setDragOver] = useState(false)
  const [staged, setStaged] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState(IMPORT_TYPES[0].id)

  const stage = () => setStaged((current) => current ?? 'customer_records.csv')

  const columns: Column<ImportBatch>[] = [
    { header: 'File', cell: (batch) => <span dir="ltr" className="font-mono text-xs">{batch.name}</span> },
    { header: 'Type', cell: (batch) => t(batch.type) },
    { header: 'Rows', cell: (batch) => <span dir="ltr" className="font-mono text-xs text-muted">{batch.rows}</span> },
    { header: 'Status', cell: (batch) => <StatusBadge value={batch.status} label={t(STATUS_LABEL[batch.status])} /> },
    {
      header: 'Progress',
      cell: (batch) =>
        batch.status === 'in_progress' ? (
          <ProgressBar pct={batch.progress} />
        ) : (
          <span dir="ltr" className="text-xs text-muted">
            {batch.status === 'completed' ? '100%' : '—'}
          </span>
        ),
    },
    { header: 'Date', cell: (batch) => <span dir="ltr" className="text-xs text-muted">{batch.date}</span> },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Import Center')}
        subtitle={t('UI Patterns')}
        actions={
          <Button size="md" disabled={!staged}>
            <Icon name="Upload" size={16} />
            {t('Start Import')}
          </Button>
        }
      />

      <Section title={t('Upload')} subtitle={t('Drop files here or click to upload')}>
        <div className="flex flex-col gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={stage}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                stage()
              }
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragOver(false)
              setStaged('customer_records.csv')
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
              dragOver ? 'border-salis-blue bg-[rgba(10,94,215,.02)]' : 'border-border hover:border-salis-blue'
            )}
          >
            <span className="flex rounded-full p-4" style={{ background: 'rgba(10,94,215,.08)', color: '#0A5ED7' }}>
              <Icon name="Upload" size={28} />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-heading">{t('Drop files here or click to upload')}</h3>
              <p className="mt-1 text-[13px] text-muted">{t('Supports CSV, Excel (.xlsx), and JSON files')}</p>
              <p className="mt-1 text-xs text-faint">{t('Max file size: 10MB')}</p>
            </div>
          </div>

          {staged ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-inset px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-[13px] text-heading">
                <Icon name="FileText" size={15} className="flex-shrink-0 text-salis-blue" />
                <span dir="ltr" className="truncate font-mono">
                  {staged}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setStaged(null)}
                aria-label={t('Remove file')}
                className="flex flex-shrink-0 cursor-pointer rounded border-none bg-transparent p-1 text-muted hover:text-heading"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ) : null}
        </div>
      </Section>

      <Section title={t('Import Type')} subtitle={t('What kind of records is this file?')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {IMPORT_TYPES.map((type) => {
            const active = type.id === selectedType
            return (
              <button
                key={type.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-[14px] border p-4 text-start transition-all duration-150',
                  active
                    ? 'border-salis-blue shadow-[0_8px_20px_-6px_rgba(10,94,215,.25)]'
                    : 'border-border hover:border-[rgba(10,94,215,.3)]'
                )}
              >
                <span className="flex flex-shrink-0 rounded-[10px] p-2" style={{ background: type.bg, color: type.fg }}>
                  <Icon name={type.icon} size={16} />
                </span>
                <span className="min-w-0">
                  <h4 className="text-sm font-semibold text-heading">{t(type.name)}</h4>
                  <p className="truncate text-xs text-muted">{t(type.desc)}</p>
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title={t('Recent Imports')} subtitle={t('Latest import batches and their status')}>
        <DataTable
          columns={columns}
          rows={IMPORT_BATCHES}
          rowKey={(batch) => batch.id}
          mobileCard={(batch) => (
            <>
              <MobileCardHeader
                title={batch.name}
                code
                trailing={<StatusBadge value={batch.status} label={t(STATUS_LABEL[batch.status])} />}
              />
              <MobileCardRow label={t('Type')}>{t(batch.type)}</MobileCardRow>
              <MobileCardRow label={t('Rows')}>
                <span dir="ltr">{batch.rows}</span>
              </MobileCardRow>
              {batch.status === 'in_progress' ? <ProgressBar pct={batch.progress} /> : null}
            </>
          )}
          empty={<EmptyState icon="Upload" title={t('No imports yet')} />}
        />
      </Section>
    </>
  )
}
