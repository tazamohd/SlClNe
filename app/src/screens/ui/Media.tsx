import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Media pattern-library screens: MapView, MediaGallery, Attachments (design
 *  project/UI.MapView.dc.html, UI.MediaGallery.dc.html, UI.Attachments.dc.html).
 *
 *  Reference pages under `/ui/*`, rendered inside the standard AppShell — no
 *  chrome of their own, and none of the three designs shipped a `.Mobile.dc.html`
 *  variant, so these just stay legible down to 390px rather than swapping
 *  layouts. Pins, media items and files are local demo state mirroring the
 *  `.dc.html` fixtures.
 *
 *  No network is available in this environment: the map is drawn as an inline
 *  SVG grid (never map tiles), and gallery thumbnails are gradient/icon
 *  placeholders (never remote photos) — a remote fetch would fail the smoke
 *  suite's console-error check. Blue is the only "active" tone, orange the
 *  only warning; no green/red/yellow/purple/pink/teal (README §7). */

// ── Map View ────────────────────────────────────────────────────────────────

interface Pin {
  id: string
  x: number
  y: number
  label: string
  color: string
}

const PINS: readonly Pin[] = [
  { id: 'riyadh-main', x: 180, y: 150, label: 'Riyadh Main', color: '#0A5ED7' },
  { id: 'riyadh-north', x: 470, y: 215, label: 'Riyadh North', color: '#0BB3FF' },
  { id: 'jeddah', x: 300, y: 350, label: 'Jeddah', color: '#0A5ED7' },
  { id: 'dammam', x: 620, y: 390, label: 'Dammam', color: '#F97316' },
  { id: 'van-3', x: 560, y: 110, label: 'Van #3', color: '#F97316' },
]

const MAP_LEGEND = [
  { label: 'Active branch', color: '#0A5ED7' },
  { label: 'Secondary', color: '#0BB3FF' },
  { label: 'Mobile unit / setup', color: '#F97316' },
] as const

interface MapLocation {
  name: string
  detail: string
  dist: string
  color: string
}

const LOCATIONS: readonly MapLocation[] = [
  { name: 'Riyadh Main', detail: 'Al-Olaya · 6 bays · 12 staff', dist: '0 km', color: '#0A5ED7' },
  { name: 'Riyadh North', detail: 'Al-Nakheel · 4 bays · 8 staff', dist: '14 km', color: '#0BB3FF' },
  { name: 'Jeddah Branch', detail: 'Al-Safa · 5 bays · 10 staff', dist: '842 km', color: '#0A5ED7' },
  { name: 'Dammam Branch', detail: 'Al-Faisaliah · 3 bays · setup', dist: '398 km', color: '#F97316' },
  { name: 'Mobile Van #3', detail: 'En route — Tariq Al-Dosari', dist: '6 km', color: '#F97316' },
]

/** Locations map. The design's tiles come from a real map provider; this
 *  environment has no network, so the base map is an inline SVG grid with
 *  plotted pins — same information, no remote fetch. */
export function UIMapView() {
  const { t } = usePreferences()

  return (
    <>
      <ListPageHeader title={t('Map View')} subtitle={t('UI Patterns')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="relative h-[360px] overflow-hidden rounded-2xl sm:h-[440px] lg:h-[520px]">
          <svg viewBox="0 0 800 520" className="block h-full w-full" role="img" aria-label={t('Map View')}>
            <rect width={800} height={520} fill="var(--surface-inset)" />
            <g stroke="var(--border-default)" strokeWidth={1} opacity={0.9}>
              <path d="M0,120 H800" />
              <path d="M0,260 H800" />
              <path d="M0,400 H800" />
              <path d="M160,0 V520" />
              <path d="M400,0 V520" />
              <path d="M640,0 V520" />
            </g>
            <g stroke="#0A5ED7" strokeWidth={5} opacity={0.16} strokeLinecap="round">
              <path d="M0,260 H800" />
              <path d="M400,0 V520" />
            </g>
            {PINS.map((pin) => (
              <g key={pin.id}>
                <circle cx={pin.x} cy={pin.y} r={22} fill={pin.color} opacity={0.14} />
                <circle cx={pin.x} cy={pin.y} r={9} fill={pin.color} stroke="#fff" strokeWidth={2.5} />
                <text
                  x={pin.x}
                  y={pin.y - 22}
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--text-heading)"
                  textAnchor="middle"
                  fontFamily="Inter,sans-serif"
                >
                  {t(pin.label)}
                </text>
              </g>
            ))}
          </svg>

          <div className="absolute top-3.5 flex flex-col gap-1.5 end-3.5">
            <MapControl icon="Plus" label={t('Zoom in')} />
            <MapControl icon="Minus" label={t('Zoom out')} />
            <MapControl icon="Locate" label={t('Center on me')} />
          </div>

          <div className="absolute bottom-3.5 flex gap-3.5 rounded-[10px] border border-border bg-card px-3.5 py-2.5 shadow start-3.5">
            {MAP_LEGEND.map((entry) => (
              <span key={entry.label} className="flex items-center gap-1.5 text-[11px] text-body">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: entry.color }} />
                {t(entry.label)}
              </span>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 rounded-2xl p-5">
          <h3 className="m-0 font-display text-[15px] font-bold text-heading">{t('Locations')}</h3>
          <div className="flex flex-col gap-2.5">
            {LOCATIONS.map((location) => (
              <div
                key={location.name}
                className="flex items-center gap-2.5 rounded-[10px] border border-border bg-inset p-2.5 transition-colors duration-150 hover:border-salis-blue"
              >
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: location.color }} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[13px] font-medium text-heading">{t(location.name)}</p>
                  <p className="m-0 mt-0.5 truncate text-[11px] text-muted">{t(location.detail)}</p>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] text-muted" dir="ltr">
                  {location.dist}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function MapControl({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-body shadow-sm"
    >
      <Icon name={icon} size={14} />
    </button>
  )
}

// ── Media Gallery ───────────────────────────────────────────────────────────

type MediaType = 'photo' | 'video' | 'doc'

interface MediaItem {
  id: string
  type: MediaType
  name: string
  date: string
  size: string
  icon: string
  color: string
  duration?: string
}

const MEDIA_ITEMS: readonly MediaItem[] = [
  { id: 'm1', type: 'photo', name: 'Front bumper damage', date: 'Jul 21', size: '3.2 MB', icon: 'Image', color: '#0BB3FF' },
  { id: 'm2', type: 'photo', name: 'Engine bay — before', date: 'Jul 21', size: '2.8 MB', icon: 'Image', color: '#0A5ED7' },
  { id: 'm3', type: 'photo', name: 'Engine bay — after', date: 'Jul 22', size: '2.9 MB', icon: 'Image', color: '#0A5ED7' },
  { id: 'm4', type: 'video', name: 'Diagnostic walkthrough', date: 'Jul 21', size: '28 MB', icon: 'Video', color: '#F97316', duration: '1:42' },
  { id: 'm5', type: 'photo', name: 'Brake pad wear', date: 'Jul 21', size: '1.9 MB', icon: 'Image', color: '#0B1F3B' },
  { id: 'm6', type: 'doc', name: 'Inspection checklist', date: 'Jul 21', size: '640 KB', icon: 'FileText', color: '#64748B' },
  { id: 'm7', type: 'photo', name: 'Odometer reading', date: 'Jul 21', size: '1.1 MB', icon: 'Image', color: '#0BB3FF' },
  { id: 'm8', type: 'video', name: 'Test drive recording', date: 'Jul 23', size: '64 MB', icon: 'Video', color: '#F97316', duration: '3:08' },
  { id: 'm9', type: 'photo', name: 'Delivery handover', date: 'Jul 23', size: '2.4 MB', icon: 'Image', color: '#0A5ED7' },
  { id: 'm10', type: 'doc', name: 'Signed delivery note', date: 'Jul 23', size: '320 KB', icon: 'FileText', color: '#64748B' },
]

const MEDIA_TABS: readonly { id: 'all' | MediaType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'photo', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'doc', label: 'Documents' },
]

/** Filterable thumbnail grid. The design fetches real photo/video thumbnails;
 *  with no network available here, each tile is a gradient tint of the item's
 *  tone with its type icon over it — the design system's own placeholder
 *  convention, not a stand-in image URL. */
export function UIMediaGallery() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<'all' | MediaType>('all')

  const media = useMemo(
    () => (filter === 'all' ? MEDIA_ITEMS : MEDIA_ITEMS.filter((item) => item.type === filter)),
    [filter]
  )

  return (
    <>
      <ListPageHeader title={t('Media Gallery')} subtitle={t('UI Patterns')} />

      <div role="tablist" aria-label={t('Media type')} className="flex flex-wrap gap-2">
        {MEDIA_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'cursor-pointer rounded-full border px-3.5 py-1.5 font-action text-[13px] font-medium transition-all duration-150',
              filter === tab.id
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {media.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon="Image" title={t('No media in this filter')} />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((item) => (
            <Card
              key={item.id}
              className="flex cursor-pointer flex-col overflow-hidden rounded-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(10,94,215,.3)] hover:shadow-md"
            >
              <span
                className="relative flex h-[110px] items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}0d)` }}
              >
                <Icon name={item.icon} size={28} style={{ color: item.color, opacity: 0.4 }} />
                {item.duration ? (
                  <span
                    className="absolute bottom-2 rounded bg-[rgba(11,31,59,.75)] px-1.5 py-0.5 font-mono text-[10px] text-white end-2"
                    dir="ltr"
                  >
                    {item.duration}
                  </span>
                ) : null}
              </span>
              <span className="flex flex-col gap-0.5 p-2.5">
                <span className="truncate text-xs font-medium text-heading">{t(item.name)}</span>
                <span className="text-[10px] text-muted" dir="ltr">
                  {item.date} · {item.size}
                </span>
              </span>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

// ── Attachments ─────────────────────────────────────────────────────────────

interface Attachment {
  id: string
  name: string
  size: string
  uploaded: string
  by: string
  icon: string
  color: string
}

const ATTACHMENTS: readonly Attachment[] = [
  { id: 'a1', name: 'Pre-repair inspection.pdf', size: '1.4 MB', uploaded: 'Jul 21', by: 'Yousef Al-Otaibi', icon: 'FileText', color: '#0A5ED7' },
  { id: 'a2', name: 'Damage photo — front bumper.jpg', size: '3.2 MB', uploaded: 'Jul 21', by: 'Yousef Al-Otaibi', icon: 'Image', color: '#0BB3FF' },
  { id: 'a3', name: 'Customer approval signature.png', size: '148 KB', uploaded: 'Jul 21', by: 'Fatima Al-Zahrani', icon: 'PenTool', color: '#F97316' },
  { id: 'a4', name: 'Parts invoice — AutoParts KSA.pdf', size: '620 KB', uploaded: 'Jul 22', by: 'Nasser Al-Dosari', icon: 'Receipt', color: '#0B1F3B' },
  { id: 'a5', name: 'Diagnostic scan export.csv', size: '84 KB', uploaded: 'Jul 22', by: 'Faisal Al-Harbi', icon: 'Table', color: '#64748B' },
]

const TOTAL_SIZE = '5.5 MB'

/** Dropzone + attached-file list. No network is available, so the dropzone
 *  is inert decoration (matches the design's static prototype) rather than a
 *  wired-up uploader. */
export function UIAttachments() {
  const { t } = usePreferences()

  return (
    <>
      <ListPageHeader title={t('Attachments')} subtitle={t('UI Patterns')} />

      <div className="flex max-w-[720px] flex-col gap-4">
        <button
          type="button"
          className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center transition-all duration-150 hover:border-salis-blue hover:bg-[rgba(10,94,215,.02)]"
        >
          <span className="inline-flex rounded-full bg-[rgba(10,94,215,.08)] p-3 text-salis-blue">
            <Icon name="Paperclip" size={24} />
          </span>
          <span className="text-sm font-semibold text-heading">{t('Drop files here or click to upload')}</span>
          <span className="text-xs text-muted">{t('PDF, JPG, PNG, CSV · max 10MB per file')}</span>
        </button>

        <Card className="overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
            <h3 className="m-0 font-display text-[15px] font-bold text-heading">{t('Attached Files')}</h3>
            <Badge background="rgba(10,94,215,.08)" color="var(--salis-blue)">
              {ATTACHMENTS.length}
            </Badge>
            <span className="flex-1" />
            <span className="text-xs text-muted" dir="ltr">
              {TOTAL_SIZE}
            </span>
          </div>
          {ATTACHMENTS.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 border-b border-border px-5 py-3 transition-colors duration-150 last:border-b-0 hover:bg-[rgba(10,94,215,.03)]"
            >
              <span
                className="flex flex-shrink-0 rounded-lg p-1.5"
                style={{ background: `${file.color}1f`, color: file.color }}
              >
                <Icon name={file.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[13px] font-medium text-heading">{t(file.name)}</p>
                <p className="m-0 mt-0.5 truncate text-[11px] text-muted" dir="ltr">
                  {file.size} · {file.uploaded} · {file.by}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-1.5">
                <FileAction icon="Eye" label={t('View')} />
                <FileAction icon="Download" label={t('Download')} />
                <FileAction icon="Trash2" label={t('Delete')} tone="warning" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

function FileAction({ icon, label, tone }: { icon: string; label: string; tone?: 'warning' }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none transition-colors duration-150',
        tone === 'warning'
          ? 'bg-[rgba(249,115,22,.06)] text-salis-orange hover:bg-[rgba(249,115,22,.12)]'
          : 'bg-[rgba(10,94,215,.06)] text-salis-blue hover:bg-[rgba(10,94,215,.12)]'
      )}
    >
      <Icon name={icon} size={13} />
    </button>
  )
}
