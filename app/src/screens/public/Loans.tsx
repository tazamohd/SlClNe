import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.Loans — `project/PublicPortal.Loans.dc.html`.
 *
 *  The design shows a loan calculator card with fixed example values
 *  (SAR 150,000 / SAR 30,000 down / "SAR 2,400" at 60 months, 3.5% APR).
 *  This one actually calculates: the mock's displayed 2,400 does not follow
 *  from its own stated terms, and shipping a calculator whose result ignores
 *  its inputs is fake behaviour. Terms stay exactly as designed — 60 months
 *  at 3.5% APR — and the standard amortised-payment formula does the rest.
 *
 *  "Apply Now" goes to `/register`, the same account-creation entry the
 *  Landing design points its own primary CTA at — financing applications live
 *  behind an account (CustomerApp.Loans). */
const TERM_MONTHS = 60
const ANNUAL_RATE = 0.035

/** Standard amortised monthly payment, rounded to whole riyals. */
export function monthlyPayment(principal: number): number {
  const r = ANNUAL_RATE / 12
  return Math.round((principal * r) / (1 - (1 + r) ** -TERM_MONTHS))
}

const formatSar = (value: number) => `SAR ${value.toLocaleString('en-US')}`

/** Digits only — tolerate "SAR 150,000", "150000", "150,000". */
function parseAmount(raw: string): number | null {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return null
  return Number(digits)
}

export function PublicLoans() {
  const t = useT()
  usePageMeta({
    title: t('Auto Financing — SALIS AUTO'),
    description: t('Flexible vehicle financing options with competitive rates'),
  })

  const priceId = useId()
  const downId = useId()
  const [price, setPrice] = useState('150,000')
  const [down, setDown] = useState('30,000')

  const result = useMemo(() => {
    const priceValue = parseAmount(price)
    const downValue = parseAmount(down)
    if (priceValue === null || priceValue <= 0) {
      return { error: 'Enter a vehicle price greater than zero.' as string, payment: null }
    }
    if (downValue === null) {
      return { error: 'Enter a down payment amount (0 is allowed).' as string, payment: null }
    }
    if (downValue >= priceValue) {
      return {
        error: 'The down payment must be less than the vehicle price.' as string,
        payment: null,
      }
    }
    return { error: null, payment: monthlyPayment(priceValue - downValue) }
  }, [price, down])

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        title="Auto Financing"
        subtitle="Flexible vehicle financing options with competitive rates"
      />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <h2 className="mb-5 mt-0 text-xl font-bold text-heading">{t('Loan Calculator')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={priceId} className="text-xs font-medium text-heading">
              {t('Vehicle Price')} (SAR)
            </label>
            <Input
              id={priceId}
              dir="ltr"
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="font-mono text-[15px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={downId} className="text-xs font-medium text-heading">
              {t('Down Payment')} (SAR)
            </label>
            <Input
              id={downId}
              dir="ltr"
              inputMode="numeric"
              value={down}
              onChange={(event) => setDown(event.target.value)}
              className="font-mono text-[15px]"
            />
          </div>
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mb-0 mt-5 rounded-[14px] border border-salis-orange bg-[rgba(249,115,22,.06)] p-4 text-center text-sm text-heading"
          >
            {t(result.error)}
          </p>
        ) : (
          <div
            aria-live="polite"
            className="mt-5 rounded-[14px] border border-[rgba(10,94,215,.15)] bg-[rgba(10,94,215,.04)] p-6 text-center"
          >
            <p className="m-0 text-sm text-muted">{t('Estimated Monthly Payment')}</p>
            <p dir="ltr" className="mb-0 mt-2 font-display text-3xl font-black text-salis-blue md:text-[40px]">
              {formatSar(result.payment ?? 0)}
            </p>
            <p className="mb-0 mt-1.5 text-[13px] text-muted">{t('60 months at 3.5% APR')}</p>
          </div>
        )}

        <Link
          to="/register"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:no-underline"
        >
          {t('Apply Now')}
        </Link>
      </div>
    </div>
  )
}
