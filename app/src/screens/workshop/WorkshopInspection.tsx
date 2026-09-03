import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/FieldGrid'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { StageFrame } from './StageFrame'
import { stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'
import { useStageDraft } from './useStageDraft'
import { DraftSaved } from './WorkshopCheckIn'

type Verdict = 'pass' | 'fail' | 'na'

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

const NO_RESULTS: Record<string, Verdict> = {}

export function WorkshopInspection() {
  const { t } = usePreferences()
  const toast = useToast()
  const stage = useJobStage()
  const { draft: results, setDraft: setResults, saved, clear } = useStageDraft('inspection', stage.job?.id, NO_RESULTS)

  const { checked, total } = useMemo(() => {
    const all = CATEGORIES.flatMap((category) =>
      category.items.map((item) => `${category.label}-${item}`)
    )
    return { checked: all.filter((key) => results[key]).length, total: all.length }
  }, [results])

  const failures = useMemo(
    () => Object.entries(results).filter(([, verdict]) => verdict === 'fail').length,
    [results]
  )

  async function submit() {
    // The prototype let you submit an untouched checklist. An inspection that
    // recorded nothing is worse than none — the estimate would be built on it.
    if (checked < total) {
      toast.show({
        title: t('Incomplete inspection'),
        description: `${checked}/${total} ${t('checks recorded')}`,
        error: true,
      })
      return
    }
    /* The verdicts themselves have no table yet — `diag_findings` belongs to
     * the diagnostics flow and nothing links it to a job card — so the count of
     * failures rides along as the transition's reason, which the audit log does
     * keep. It is a summary, not a substitute for the findings record. */
    const done = await stage.advance('estimate', {
      reason: `inspection ${checked}/${total}, ${failures} fail`,
      then: '/workshop-estimate',
    })
    if (done) clear()
  }

  return (
    <StageFrame
      icon="SearchCheck"
      title="Vehicle Inspection"
      stage={stage}
      meta={[
        {
          icon: 'ListChecks',
          label: 'Checks recorded',
          value: (
            <span>
              <span dir="ltr" className="font-mono">{checked}/{total}</span> {t('checks recorded')}
            </span>
          ),
        },
      ]}
      notice={saved ? <DraftSaved /> : null}
      actions={
        <Button
          size="lg"
          icon="CheckCircle"
          loading={stage.status === 'saving'}
          loadingLabel="Saving..."
          disabled={stageBusy(stage)}
          onClick={() => void submit()}
          className="sm:min-w-[280px]"
        >
          {t('Submit Inspection')}
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CATEGORIES.map((category) => {
          const done = category.items.filter((item) => results[`${category.label}-${item}`]).length
          return (
            <Panel
              key={category.label}
              icon={category.icon}
              title={t(category.label)}
              action={
                <span className="font-mono text-[11px] font-semibold text-muted" dir="ltr">
                  {done}/{category.items.length}
                </span>
              }
            >
              <div className="flex flex-col">
                {category.items.map((item) => {
                  const key = `${category.label}-${item}`
                  const set = (verdict: Verdict) => setResults((prev) => ({ ...prev, [key]: verdict }))
                  return (
                    <div
                      key={item}
                      className="flex min-h-[44px] items-center gap-2.5 border-b border-border py-1.5 last:border-b-0"
                    >
                      <span className="flex-1 text-[13px] text-body">{t(item)}</span>
                      <div
                        role="radiogroup"
                        aria-label={t(item)}
                        className="flex gap-1"
                      >
                        <VerdictButton label={t('Pass')} selected={results[key] === 'pass'} tone="pass" onSelect={() => set('pass')} />
                        <VerdictButton label={t('Fail')} selected={results[key] === 'fail'} tone="fail" onSelect={() => set('fail')} />
                        <VerdictButton label={t('N/A')} selected={results[key] === 'na'} tone="na" onSelect={() => set('na')} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>
          )
        })}
      </div>
    </StageFrame>
  )
}

/** Pass is blue, fail is orange, N/A is slate — the palette has no red or
 *  green, so "fail" reads as the warning colour (README §7). */
const TONES: Record<Verdict, string> = {
  pass: 'bg-salis-blue/[.15] text-salis-blue',
  fail: 'bg-salis-orange/[.15] text-salis-orange',
  na: 'bg-tint-neutral text-muted',
}

function VerdictButton({
  label,
  selected,
  tone,
  onSelect,
}: {
  label: string
  selected: boolean
  tone: Verdict
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'h-9 min-w-[44px] cursor-pointer whitespace-nowrap rounded-[4px] border-none px-2.5 font-action text-[11px] font-semibold',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2',
        selected ? TONES[tone] : 'bg-inset text-muted hover:text-heading'
      )}
    >
      {label}
    </button>
  )
}
