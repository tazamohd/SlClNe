import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/cn'
import { BackLink } from '@/components/ui/BackLink'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { queryKeys, useCollection, useUpdate, type RowOf } from '@/data/useCollection'
import { StageNotice, stageBusy, stageLabel } from './StageNotice'
import { useJobStage } from './useJobStage'
import { transitionFailureMessage } from './api'
import { createInspectionFinding, type InspectionSeverity } from './inspection-api'
import { InspectionEvidence } from './InspectionEvidence'

type Verdict = 'pass' | 'fail' | 'na'
type Finding = RowOf<'inspectionFindings'>
type MediaRow = RowOf<'inspectionMedia'>

/** Multi-point inspection checklist across six vehicle systems.
 *
 *  Findings feed the estimate, so this is where a repair's scope is decided. */
const CATEGORIES = [
  {
    icon: 'Cog',
    label: 'Engine & Transmission',
    items: ['Oil Level', 'Coolant', 'Transmission Fluid', 'Engine Noise'],
  },
  {
    icon: 'Disc',
    label: 'Brakes & Suspension',
    items: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Shock Absorbers'],
  },
  { icon: 'CircleDot', label: 'Tires & Wheels', items: ['Tire Tread', 'Tire Pressure', 'Wheel Alignment'] },
  {
    icon: 'Zap',
    label: 'Electrical & Lighting',
    items: ['Battery', 'Headlights', 'Tail Lights', 'Indicators'],
  },
  { icon: 'Droplets', label: 'Fluids & Filters', items: ['Coolant', 'Power Steering', 'Air Filter'] },
  {
    icon: 'Car',
    label: 'Body & Interior',
    items: ['Windshield', 'Paint Condition', 'Interior Trim', 'Seats'],
  },
] as const

const FAIL_SEVERITIES: readonly { value: InspectionSeverity; label: string }[] = [
  { value: 'monitor', label: 'Monitor' },
  { value: 'attention', label: 'Attention' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'unsafe', label: 'Unsafe' },
]

function keyOf(category: string, item: string): string {
  return `${category}-${item}`
}

/** `ok` reads as Pass, anything else on the ladder reads as Fail — `na` has no
 *  place on the severity ladder at all (Sprint 2, P0 names exactly five
 *  values: ok/monitor/attention/urgent/unsafe) and is never persisted as a
 *  finding; it is a local "nothing to report here" mark that clears if the
 *  page reloads, which is the honest behaviour for a state the server has no
 *  record of. */
function verdictOf(severity: InspectionSeverity): Verdict {
  return severity === 'ok' ? 'pass' : 'fail'
}

export function WorkshopInspection() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const client = useQueryClient()
  const stage = useJobStage()
  const jobRef = stage.job?._id ?? stage.job?.id ?? ''

  const findingsQuery = useCollection('inspectionFindings', { filter: { jobCardId: jobRef } })
  const findings = (findingsQuery.data ?? []) as readonly Finding[]
  const mediaQuery = useCollection('inspectionMedia', { filter: { jobCardId: jobRef } })
  const media = (mediaQuery.data ?? []) as readonly MediaRow[]
  const updateFinding = useUpdate('inspectionFindings')

  const [naKeys, setNaKeys] = useState<Set<string>>(new Set())
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set())
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const findingByKey = useMemo(() => {
    const map = new Map<string, Finding>()
    for (const f of findings) map.set(keyOf(f.category, f.item), f)
    return map
  }, [findings])

  const mediaByFinding = useMemo(() => {
    const map = new Map<string, MediaRow[]>()
    for (const m of media) {
      const list = map.get(m.findingId) ?? []
      list.push(m)
      map.set(m.findingId, list)
    }
    return map
  }, [media])

  const { checked, total } = useMemo(() => {
    const all = CATEGORIES.flatMap((category) => category.items.map((item) => keyOf(category.label, item)))
    const done = all.filter((key) => findingByKey.has(key) || naKeys.has(key)).length
    return { checked: done, total: all.length }
  }, [findingByKey, naKeys])

  const failures = useMemo(
    () => findings.filter((f) => verdictOf(f.severity) === 'fail').length,
    [findings]
  )

  async function setVerdict(category: string, item: string, verdict: Verdict, severity?: InspectionSeverity) {
    const key = keyOf(category, item)

    if (verdict === 'na') {
      setNaKeys((prev) => new Set(prev).add(key))
      return
    }
    setNaKeys((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })

    const resolvedSeverity: InspectionSeverity = verdict === 'pass' ? 'ok' : (severity ?? 'attention')
    const existing = findingByKey.get(key)
    setPendingKeys((prev) => new Set(prev).add(key))
    try {
      if (existing?._id) {
        await updateFinding.mutateAsync({ id: existing._id, patch: { severity: resolvedSeverity } })
      } else {
        await createInspectionFinding(jobRef, { category, item, severity: resolvedSeverity })
        await client.invalidateQueries({ queryKey: queryKeys.all('inspectionFindings') })
      }
    } catch (cause) {
      toast.show({
        title: t('Could not save'),
        description: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  async function saveNotes(finding: Finding, patch: { internalNote?: string; customerNote?: string }) {
    if (!finding._id) return
    try {
      await updateFinding.mutateAsync({ id: finding._id, patch })
    } catch (cause) {
      toast.show({
        title: t('Could not save notes'),
        description: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    }
  }

  function toggleExpanded(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function submit() {
    // An inspection that recorded nothing is worse than none — the estimate
    // would be built on it.
    if (checked < total) {
      toast.show({
        title: t('Incomplete inspection'),
        description: `${checked}/${total} ${t('checks recorded')}`,
        error: true,
      })
      return
    }
    await stage.advance('estimate', {
      reason: `inspection ${checked}/${total}, ${failures} fail`,
      then: '/workshop-estimate',
    })
  }

  const findingsUnavailable = findingsQuery.isError

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <BackLink to="/job-cards" label="Back to Job Cards" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          icon="SearchCheck"
          title={t('Vehicle Inspection')}
          subtitle={<span dir="ltr">{stage.job ? `${stage.job.id} · ${stage.job.veh}` : '—'}</span>}
          compact={isMobile}
        />
        <span className="font-mono text-[13px] text-muted">
          {checked}/{total} {t('checks recorded')}
        </span>
      </div>

      <WorkflowStepper current={stage.stageLabel} />

      <StageNotice stage={stage} />

      {findingsUnavailable ? (
        <p className="text-[13px] text-muted">
          {t("Couldn't load saved findings for this job — new ones will still save.")}
        </p>
      ) : findingsQuery.isLoading ? (
        <Loading inline label={t('Loading saved findings...')} />
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CATEGORIES.map((category) => {
          const done = category.items.filter((item) => {
            const key = keyOf(category.label, item)
            return findingByKey.has(key) || naKeys.has(key)
          }).length
          return (
            <Panel
              key={category.label}
              icon={category.icon}
              title={t(category.label)}
              action={
                <span className="font-mono text-[11px] font-semibold text-muted">
                  {done}/{category.items.length}
                </span>
              }
            >
              <div className="flex flex-col">
                {category.items.map((item) => {
                  const key = keyOf(category.label, item)
                  const finding = findingByKey.get(key)
                  const verdict: Verdict | undefined = finding
                    ? verdictOf(finding.severity)
                    : naKeys.has(key)
                      ? 'na'
                      : undefined
                  const isFail = verdict === 'fail'
                  const busy = pendingKeys.has(key) || !stage.mayAdvance
                  const expanded = expandedKeys.has(key)
                  const evidenceMedia = finding?._id ? (mediaByFinding.get(finding._id) ?? []) : []

                  return (
                    <div key={item} className="border-b border-border py-2 last:border-b-0">
                      <div className="flex items-center gap-2.5">
                        <span className="flex-1 text-[13px] text-body">{t(item)}</span>
                        <div
                          role="radiogroup"
                          aria-label={`${t(item)} — ${t(category.label)}`}
                          className="flex gap-1"
                        >
                          <VerdictButton
                            label={t('Pass')}
                            selected={verdict === 'pass'}
                            tone="pass"
                            disabled={busy}
                            onSelect={() => void setVerdict(category.label, item, 'pass')}
                          />
                          <VerdictButton
                            label={t('Fail')}
                            selected={isFail}
                            tone="fail"
                            disabled={busy}
                            onSelect={() => void setVerdict(category.label, item, 'fail')}
                          />
                          <VerdictButton
                            label={t('N/A')}
                            selected={verdict === 'na'}
                            tone="na"
                            disabled={busy}
                            onSelect={() => void setVerdict(category.label, item, 'na')}
                          />
                        </div>
                        {finding ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(key)}
                            aria-expanded={expanded}
                            aria-label={t('Notes and evidence')}
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-muted hover:text-salis-blue"
                          >
                            <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
                          </button>
                        ) : null}
                      </div>

                      {isFail ? (
                        <div className="flex flex-wrap gap-1 pt-1.5 ps-0">
                          {FAIL_SEVERITIES.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              disabled={busy}
                              onClick={() => void setVerdict(category.label, item, 'fail', s.value)}
                              className={cn(
                                'h-[22px] cursor-pointer whitespace-nowrap rounded-[4px] border-none px-2 font-action text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-60',
                                finding?.severity === s.value
                                  ? SEVERITY_TONE[s.value]
                                  : 'bg-inset text-muted'
                              )}
                            >
                              {t(s.label)}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {expanded && finding ? (
                        <FindingDetails
                          finding={finding}
                          media={evidenceMedia}
                          disabled={!stage.mayAdvance}
                          onSaveNotes={(patch) => void saveNotes(finding, patch)}
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </Panel>
          )
        })}
      </div>

      <Button
        size="lg"
        className="w-full max-w-[400px] self-end"
        onClick={() => void submit()}
        disabled={stageBusy(stage)}
      >
        <Icon name="CheckCircle" size={18} />
        {t(stageLabel(stage, 'Submit Inspection'))}
      </Button>
    </div>
  )
}

/** Pass is blue, fail is orange, N/A is slate — the palette has no red or
 *  green, so "fail" reads as the warning colour (README §7). */
const TONES: Record<'pass' | 'fail' | 'na', string> = {
  pass: 'bg-salis-blue/[.15] text-salis-blue',
  fail: 'bg-salis-orange/[.15] text-salis-orange',
  na: 'bg-tint-neutral text-muted',
}

/* Brand permits blue and orange only (`check-tokens.mjs`) — severity escalates
 * through weight, not hue, same palette `DeclinedJobs.tsx` uses for its
 * identical ladder. */
const SEVERITY_TONE: Record<string, string> = {
  monitor: 'bg-tint-blue text-salis-blue',
  attention: 'bg-[rgba(249,115,22,.13)] text-salis-orange',
  urgent: 'bg-[rgba(249,115,22,.22)] text-salis-orange-hover',
  unsafe: 'bg-[var(--warning)] text-[var(--warning-fg)]',
}

function VerdictButton({
  label,
  selected,
  tone,
  disabled,
  onSelect,
}: {
  label: string
  selected: boolean
  tone: 'pass' | 'fail' | 'na'
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'h-[26px] cursor-pointer whitespace-nowrap rounded-[4px] border-none px-2 font-action text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-60',
        selected ? TONES[tone] : 'bg-inset text-muted focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
      )}
    >
      {label}
    </button>
  )
}

/** Internal/customer notes and photo evidence for one finding — collapsed
 *  behind the chevron so the checklist reads as a checklist first. Notes save
 *  on blur, one field at a time, so a technician typing a long note is never
 *  fighting a request that fires on every keystroke. */
function FindingDetails({
  finding,
  media,
  disabled,
  onSaveNotes,
}: {
  finding: Finding
  media: readonly MediaRow[]
  disabled: boolean
  onSaveNotes: (patch: { internalNote?: string; customerNote?: string }) => void
}) {
  const { t } = usePreferences()
  const [internalNote, setInternalNote] = useState(finding.internalNote ?? '')
  const [customerNote, setCustomerNote] = useState(finding.customerNote ?? '')

  return (
    <div className="mt-2 flex flex-col gap-2.5 rounded-lg bg-inset p-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-muted">{t('Internal note (shop only)')}</span>
        <textarea
          value={internalNote}
          disabled={disabled}
          onChange={(e) => setInternalNote(e.target.value)}
          onBlur={() => {
            if (internalNote !== (finding.internalNote ?? '')) onSaveNotes({ internalNote })
          }}
          rows={2}
          className="rounded-md border border-border bg-card p-2 text-[12px] text-body disabled:opacity-60"
          placeholder={t('Not shown to the customer')}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-muted">{t('Customer note')}</span>
        <textarea
          value={customerNote}
          disabled={disabled}
          onChange={(e) => setCustomerNote(e.target.value)}
          onBlur={() => {
            if (customerNote !== (finding.customerNote ?? '')) onSaveNotes({ customerNote })
          }}
          rows={2}
          className="rounded-md border border-border bg-card p-2 text-[12px] text-body disabled:opacity-60"
          placeholder={t('Shown on the customer health-check report')}
        />
      </label>
      {finding._id ? (
        <InspectionEvidence findingId={finding._id} media={media} disabled={disabled} />
      ) : null}
    </div>
  )
}
