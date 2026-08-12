import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { StageNotice, stageBusy, stageLabel } from './StageNotice'
import { useJobStage } from './useJobStage'

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

export function WorkshopInspection() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const stage = useJobStage()
  const [results, setResults] = useState<Record<string, Verdict>>({})

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
    await stage.advance('estimate', {
      reason: `inspection ${checked}/${total}, ${failures} fail`,
      then: '/workshop-estimate',
    })
  }


  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="SearchCheck" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">
              {t('Vehicle Inspection')}
            </h1>
            <p className="mt-0.5 text-sm text-muted" dir="ltr">
              {stage.job ? `${stage.job.id} · ${stage.job.veh}` : '—'}
            </p>
          </div>
        </div>
        <span className="font-mono text-[13px] text-muted">
          {checked}/{total} {t('checks recorded')}
        </span>
      </div>

      <WorkflowStepper current={stage.stageLabel} />

      <StageNotice stage={stage} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CATEGORIES.map((category) => {
          const done = category.items.filter(
            (item) => results[`${category.label}-${item}`]
          ).length
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
                  const key = `${category.label}-${item}`
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
                    >
                      <span className="flex-1 text-[13px] text-body">{t(item)}</span>
                      <div
                        role="radiogroup"
                        aria-label={`${t(item)} — ${t(category.label)}`}
                        className="flex gap-1"
                      >
                        <VerdictButton
                          label={t('Pass')}
                          selected={results[key] === 'pass'}
                          tone="pass"
                          onSelect={() => setResults((prev) => ({ ...prev, [key]: 'pass' }))}
                        />
                        <VerdictButton
                          label={t('Fail')}
                          selected={results[key] === 'fail'}
                          tone="fail"
                          onSelect={() => setResults((prev) => ({ ...prev, [key]: 'fail' }))}
                        />
                        <VerdictButton
                          label={t('N/A')}
                          selected={results[key] === 'na'}
                          tone="na"
                          onSelect={() => setResults((prev) => ({ ...prev, [key]: 'na' }))}
                        />
                      </div>
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
  pass: 'bg-[rgba(10,94,215,.15)] text-salis-blue',
  fail: 'bg-[rgba(249,115,22,.15)] text-salis-orange',
  na: 'bg-[rgba(100,116,139,.12)] text-[#64748B]',
}

function VerdictButton({
  label,
  selected,
  tone,
  onSelect,
}: {
  label: string
  selected: boolean
  tone: 'pass' | 'fail' | 'na'
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'h-[26px] cursor-pointer whitespace-nowrap rounded-[4px] border-none px-2 font-action text-[10px] font-semibold',
        selected ? TONES[tone] : 'bg-inset text-muted'
      )}
    >
      {label}
    </button>
  )
}
