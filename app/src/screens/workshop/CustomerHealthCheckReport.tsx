import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BackLink } from '@/components/ui/BackLink'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useAuthenticatedMediaUrl } from '@/data/useAuthenticatedMedia'
import { RepositoryError } from '@/data/repository'
import type { InspectionAnnotation } from '@/data/repository'
import { fetchHealthCheckReport, type HealthCheckReport, type InspectionSeverity } from './inspection-api'
import { ANNOTATION_COLOR } from './annotation-colors'

/** The DVHC clean report a customer reads (Sprint 2, P0) — `GET
 *  /jobs/:id/health-check-report`, the same aggregate a staff member previews
 *  from the job card. Nothing here is computed in the browser: severity,
 *  category, item and every note are exactly what the server selected, and the
 *  server's own `select()` never names `internal_note` at all — see
 *  `packages/contract/src/entities/inspection.ts` for why that is a stronger
 *  guarantee than hiding a field in this component would be. */
export function CustomerHealthCheckReport() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [params] = useSearchParams()
  const jobRef = params.get('id') ?? ''

  const query = useQuery<HealthCheckReport, RepositoryError>({
    queryKey: ['health-check-report', jobRef],
    queryFn: () => fetchHealthCheckReport(jobRef),
    enabled: Boolean(jobRef),
  })

  return (
    <div className="flex max-w-[860px] flex-col gap-5">
      <BackLink to="/customer-portal" label="Back to Portal" />

      <PageHeader
        icon="ClipboardCheck"
        title={t('Health Check Report')}
        subtitle={t('Everything our technicians checked on your vehicle')}
        compact={isMobile}
      />

      {!jobRef || query.isError ? (
        <Card className="p-6">
          <ErrorState
            title={t('This report is not available')}
            description={query.error?.message ?? t('It may not be ready yet, or the link is out of date.')}
            onRetry={() => void query.refetch()}
          />
        </Card>
      ) : query.isLoading ? (
        <Loading label={t('Loading your health check report...')} />
      ) : query.data && query.data.findings.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="ClipboardCheck"
            title={t('No findings recorded yet')}
            description={t('Your technician has not recorded any findings for this visit yet.')}
          />
        </Card>
      ) : query.data ? (
        <>
          <p className="text-[13px] text-muted" dir="ltr">
            {query.data.vehicle}
          </p>
          <div className="flex flex-col gap-3">
            {query.data.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

const SEVERITY_TONE: Record<InspectionSeverity, { bg: string; fg: string; label: string }> = {
  ok: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)', label: 'Everything checked out' },
  monitor: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Monitor' },
  attention: { bg: 'rgba(249,115,22,.13)', fg: 'var(--salis-orange)', label: 'Attention' },
  urgent: { bg: 'rgba(249,115,22,.22)', fg: 'var(--salis-orange-hover)', label: 'Urgent' },
  unsafe: { bg: 'var(--warning)', fg: 'var(--warning-fg)', label: 'Unsafe' },
}

function FindingCard({ finding }: { finding: HealthCheckReport['findings'][number] }) {
  const { t } = usePreferences()
  const tone = SEVERITY_TONE[finding.severity]

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t(finding.category)}</p>
          <p className="text-sm font-bold text-heading">{t(finding.item)}</p>
        </div>
        <span
          className="flex-shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {t(tone.label)}
        </span>
      </div>

      {finding.customerNote ? <p className="text-[13px] text-body">{finding.customerNote}</p> : null}

      {finding.media.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {finding.media.map((media) => (
            <ReportMedia key={media.id} media={media} />
          ))}
        </div>
      ) : null}
    </Card>
  )
}

function ReportMedia({ media }: { media: HealthCheckReport['findings'][number]['media'][number] }) {
  const { t } = usePreferences()
  const { src, error } = useAuthenticatedMediaUrl(media.url)

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-inset">
      {media.kind === 'photo' && src ? (
        <>
          <img src={src} alt="" className="h-full w-full object-cover" />
          {media.annotations.map((a, i) => (
            <ReadOnlyMark key={i} annotation={a} />
          ))}
        </>
      ) : media.kind === 'video' && src ? (
        <video src={src} controls className="h-full w-full object-cover" />
      ) : error ? (
        <span className="flex h-full w-full items-center justify-center text-muted">
          <Icon name="Image" size={16} />
        </span>
      ) : (
        <Loading inline />
      )}
      <span className="absolute start-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
        {t(media.stage === 'before' ? 'Before' : 'After')}
      </span>
    </div>
  )
}

function ReadOnlyMark({ annotation }: { annotation: InspectionAnnotation }) {
  const color = ANNOTATION_COLOR[annotation.color]
  if (annotation.type === 'text') {
    return (
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white"
        style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%` }}
      >
        {annotation.text}
      </span>
    )
  }
  if (annotation.type === 'arrow' && annotation.x2 !== undefined && annotation.y2 !== undefined) {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <line
          x1={`${annotation.x * 100}%`}
          y1={`${annotation.y * 100}%`}
          x2={`${annotation.x2 * 100}%`}
          y2={`${annotation.y2 * 100}%`}
          stroke={color}
          strokeWidth={2}
        />
      </svg>
    )
  }
  return (
    <span
      className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
      style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, background: color }}
    />
  )
}
