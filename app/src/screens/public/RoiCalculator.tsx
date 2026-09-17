import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { formatSar } from '@/components/ui/Money'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { cn } from '@/lib/cn'

/** PublicPortal.RoiCalculator — Tier B content page, new for the truth-and-
 *  conversion overhaul (2026-09).
 *
 *  Every output is a scenario estimate built from disclosed assumptions, never
 *  a promise. Three levers are monetised, each tied to a specific, named
 *  assumption shown on the page: faster estimate approval (extra invoiced
 *  revenue on job cards that already exist), reduced inventory loss, and
 *  admin time recovered from consolidating tools. Number of branches and
 *  technicians are shown as informational context, not folded into the money
 *  total, because there is no defensible formula here connecting them to
 *  revenue. No personal information is collected — every field is a number,
 *  nothing is submitted anywhere. */
const ADMIN_HOURLY_SAR = 60
const WEEKS_PER_MONTH = 4.33

interface Scenario {
  key: 'conservative' | 'expected' | 'ambitious'
  label: string
  approvalUpliftPoints: number
  inventoryLossReduction: number
  adminTimeReduction: number
}

const SCENARIOS: readonly Scenario[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    approvalUpliftPoints: 3,
    inventoryLossReduction: 0.1,
    adminTimeReduction: 0.15,
  },
  {
    key: 'expected',
    label: 'Expected',
    approvalUpliftPoints: 6,
    inventoryLossReduction: 0.2,
    adminTimeReduction: 0.3,
  },
  {
    key: 'ambitious',
    label: 'Ambitious',
    approvalUpliftPoints: 10,
    inventoryLossReduction: 0.35,
    adminTimeReduction: 0.45,
  },
]

interface Inputs {
  branches: string
  monthlyJobCards: string
  avgInvoiceValue: string
  technicians: string
  monthlyInventoryLoss: string
  adminHoursPerWeek: string
}

const DEFAULTS: Inputs = {
  branches: '1',
  monthlyJobCards: '200',
  avgInvoiceValue: '450',
  technicians: '6',
  monthlyInventoryLoss: '2,000',
  adminHoursPerWeek: '15',
}

/** Digits only — tolerate "2,000", "2000", stray currency text. */
function parseNumber(raw: string): number {
  const digits = raw.replace(/[^0-9.]/g, '')
  const value = Number.parseFloat(digits)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

function computeScenario(inputs: Inputs, scenario: Scenario) {
  const monthlyJobCards = parseNumber(inputs.monthlyJobCards)
  const avgInvoiceValue = parseNumber(inputs.avgInvoiceValue)
  const monthlyInventoryLoss = parseNumber(inputs.monthlyInventoryLoss)
  const adminHoursPerWeek = parseNumber(inputs.adminHoursPerWeek)

  const approvalGain = monthlyJobCards * (scenario.approvalUpliftPoints / 100) * avgInvoiceValue
  const inventoryGain = monthlyInventoryLoss * scenario.inventoryLossReduction
  const adminGain =
    adminHoursPerWeek * WEEKS_PER_MONTH * scenario.adminTimeReduction * ADMIN_HOURLY_SAR

  const monthlyTotal = approvalGain + inventoryGain + adminGain
  return { approvalGain, inventoryGain, adminGain, monthlyTotal, annualTotal: monthlyTotal * 12 }
}

const FIELDS: readonly { key: keyof Inputs; label: string; unit?: string }[] = [
  { key: 'branches', label: 'Number of branches' },
  { key: 'monthlyJobCards', label: 'Monthly job cards (all branches)' },
  { key: 'avgInvoiceValue', label: 'Average invoice value', unit: 'SAR' },
  { key: 'technicians', label: 'Technicians (all branches)' },
  { key: 'monthlyInventoryLoss', label: 'Estimated monthly inventory loss today', unit: 'SAR' },
  { key: 'adminHoursPerWeek', label: 'Admin hours spent on manual data entry per week' },
]

export function PublicRoiCalculator() {
  const t = useT()
  const ids = {
    branches: useId(),
    monthlyJobCards: useId(),
    avgInvoiceValue: useId(),
    technicians: useId(),
    monthlyInventoryLoss: useId(),
    adminHoursPerWeek: useId(),
  } as const
  usePageMeta({
    title: t('ROI Calculator — SALIS AUTO'),
    description: t(
      'Estimate the operational impact of SALIS AUTO for your workshop — conservative, expected and ambitious scenarios, with every assumption disclosed. No personal information required.'
    ),
  })

  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [key]: e.target.value }))

  const results = useMemo(
    () => SCENARIOS.map((scenario) => ({ scenario, ...computeScenario(inputs, scenario) })),
    [inputs]
  )
  const branches = parseNumber(inputs.branches)
  const technicians = parseNumber(inputs.technicians)
  const monthlyJobCards = parseNumber(inputs.monthlyJobCards)

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        eyebrow="Scenario estimates, not promises"
        title="ROI Calculator"
        subtitle="Enter your workshop's numbers to see conservative, expected and ambitious scenarios — every assumption is shown below, nothing is submitted or stored"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-default bg-card p-6">
          <h2 className="mb-4 mt-0 text-lg font-bold text-heading">{t('Your workshop today')}</h2>
          <div className="flex flex-col gap-4">
            {FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label htmlFor={ids[field.key]} className="text-xs font-medium text-heading">
                  {t(field.label)}
                  {field.unit ? ` (${field.unit})` : ''}
                </label>
                <Input
                  id={ids[field.key]}
                  dir="ltr"
                  inputMode="numeric"
                  value={inputs[field.key]}
                  onChange={set(field.key)}
                  className="font-mono text-[15px]"
                  inputSize="sm"
                />
              </div>
            ))}
          </div>
          {branches > 0 && monthlyJobCards > 0 ? (
            <p className="mb-0 mt-5 text-xs text-muted">
              {t('For context only, not part of the estimate below:')}{' '}
              <span dir="ltr">~{Math.round(monthlyJobCards / branches)}</span>{' '}
              {t('job cards per branch per month')}
              {technicians > 0 ? (
                <>
                  , <span dir="ltr">~{Math.round(monthlyJobCards / technicians)}</span>{' '}
                  {t('per technician per month')}
                </>
              ) : null}
              .
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {results.map(({ scenario, monthlyTotal, annualTotal }) => (
              <div
                key={scenario.key}
                className={cn(
                  'rounded-2xl border p-5 text-center',
                  scenario.key === 'expected'
                    ? 'border-salis-blue bg-salis-blue/[.04] ring-1 ring-salis-blue'
                    : 'border-default bg-card'
                )}
              >
                <p className="m-0 font-mono text-[11px] font-semibold uppercase tracking-[.2em] text-muted">
                  {t(scenario.label)}
                </p>
                <p
                  dir="ltr"
                  className="mb-1 mt-2 font-display text-2xl font-black text-salis-blue md:text-[28px]"
                >
                  {formatSar(monthlyTotal, { decimals: 0 })}
                </p>
                <p className="m-0 text-[11px] text-muted">{t('estimated monthly impact')}</p>
                <p dir="ltr" className="mb-0 mt-3 text-sm font-semibold text-heading">
                  {formatSar(annualTotal, { decimals: 0 })}
                  <span className="ms-1 text-xs font-normal text-muted">{t('/year')}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-default bg-surface p-5">
            <h2 className="mb-3 mt-0 text-sm font-bold text-heading">
              {t('How this is calculated — every assumption, shown')}
            </h2>
            <ul className="m-0 flex flex-col gap-2 ps-5 text-[13px] leading-relaxed text-body">
              <li>
                {t(
                  'Faster estimate approval: scenarios assume clearer, faster estimates raise your approval rate by 3 / 6 / 10 percentage points (conservative / expected / ambitious). Extra monthly revenue = monthly job cards × approval-rate uplift × average invoice value.'
                )}
              </li>
              <li>
                {t(
                  'Reduced inventory loss: scenarios assume better parts tracking cuts your current monthly inventory loss by 10% / 20% / 35%.'
                )}
              </li>
              <li>
                {t(
                  'Admin time recovered: scenarios assume consolidating tools cuts manual admin hours by 15% / 30% / 45%, valued at an assumed SAR 60 per hour — adjust this rate for your own cost structure when reviewing the estimate with sales.'
                )}
              </li>
              <li>
                {t(
                  'Branch and technician counts are shown for context only and are not used in the money estimate above — we have no verified formula connecting them to revenue.'
                )}
              </li>
            </ul>
            <p className="mb-0 mt-4 text-xs text-muted">
              {t(
                'These are scenario estimates based on the assumptions above, not a guarantee of savings or revenue. Your actual results depend on your workshop’s operations, market and adoption. A sales specialist can walk through a scenario tailored to your data.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-default bg-card p-6 text-center">
            <Link
              to="/public-portal/request-demo"
              className="inline-flex h-11 items-center rounded-lg bg-salis-gradient px-5 font-action text-sm font-semibold text-white no-underline hover:no-underline"
            >
              {t('Request a Demo')}
            </Link>
            <Link
              to="/public-portal/contact"
              className="inline-flex h-11 items-center rounded-lg border border-default bg-surface px-5 font-action text-sm font-semibold text-heading no-underline hover:no-underline"
            >
              {t('Talk to Sales')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
