import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Customer Feedback — `CustomerFeedback.dc.html` and `.Mobile.dc.html`.
 *
 *  A post-service rating form: the service summary, an overall star rating, four
 *  category ratings, a comment, and a submit.
 *
 *  **Server gap.** There is no feedback collection, table or endpoint anywhere —
 *  nothing to store a rating in and nothing to read one back from. So the form
 *  is built and fully interactive (choosing stars is local UI state, not
 *  persistence), but **it cannot be submitted**: the submit is disabled and a
 *  banner says why, rather than reporting a save the next reload would contradict
 *  (§60, no fake persistence). `crm-gaps` pins the missing `POST /customer-feedback`.
 *
 *  The service summary is real, not the prototype's invented Camry: it is the
 *  completed job named by `?job=<code>`, or the most recent completed/delivered
 *  job. A job card carries no amount, so the design's SAR figure is omitted
 *  rather than guessed. */
type Job = RowOf<'jobs'>

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] as const

const CATEGORIES = [
  { key: 'quality', label: 'Work Quality' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'communication', label: 'Communication' },
  { key: 'value', label: 'Value for Money' },
] as const

const DONE = new Set(['completed', 'delivered'])

export function CustomerFeedback() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()
  const jobRef = params.get('job') ?? ''

  const jobs = useCollection('jobs')

  const [rating, setRating] = useState(0)
  const [categories, setCategories] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  const rows = (jobs.data ?? []) as readonly Job[]
  const job = jobRef
    ? rows.find((row) => row.id === jobRef)
    : rows.find((row) => DONE.has(row.st)) ?? rows[0]

  const shell = (children: ReactNode) => (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <Link to="/customers" aria-label={t('Back')} className="flex text-muted no-underline hover:no-underline">
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
        </Link>
        <h1 className="font-display text-lg font-extrabold text-heading">{t('Service Feedback')}</h1>
      </div>
      {children}
    </div>
  )

  if (jobs.isLoading) return shell(<Loading label="Loading..." />)

  if (jobs.isError) {
    return shell(
      <Card className="p-5">
        <ErrorState description={jobs.error?.message} onRetry={() => void jobs.refetch()} />
      </Card>
    )
  }

  if (!job) {
    return shell(
      <Card className="p-5">
        <EmptyState
          icon="MessageSquare"
          title={t('No completed service to rate')}
          description={t('Feedback can be captured once a job card has been completed or delivered.')}
        />
      </Card>
    )
  }

  const ratingLabel = rating > 0 ? t(RATING_LABELS[rating - 1]) : ''

  return shell(
    <>
      {/* Service summary — real fields from the job card. */}
      <div className="flex flex-col gap-2 rounded-2xl bg-salis-gradient p-[18px] text-white">
        <div className="flex items-center gap-2">
          <Icon name="CheckCircle" size={18} />
          <span className="text-sm font-bold">{t('Service Completed')}</span>
        </div>
        <p className="m-0 text-base font-extrabold">{job.veh}</p>
        <div className="flex flex-wrap gap-4 text-xs opacity-80">
          <span dir="ltr">{job.id}</span>
          <span>{t(job.svc.replace(/_/g, ' '))}</span>
        </div>
      </div>

      {/* Overall rating. */}
      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <h3 className="text-[15px] font-bold text-heading">{t('How was your experience?')}</h3>
        <div role="radiogroup" aria-label={t('Overall rating')} className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} ${t('stars')}`}
              onClick={() => setRating(value)}
              className={cn(
                'cursor-pointer border-none bg-transparent p-1 text-3xl leading-none transition-transform hover:scale-110 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
                value <= rating ? 'text-salis-orange' : 'text-border-strong'
              )}
            >
              ★
            </button>
          ))}
        </div>
        <p className="m-0 h-4 text-[13px] font-semibold text-salis-blue">{ratingLabel}</p>
      </Card>

      {/* Category ratings. */}
      <Card className="flex flex-col gap-3 p-4">
        <h3 className="text-[13px] font-bold text-heading">{t('Rate the Details')}</h3>
        {CATEGORIES.map((cat) => {
          const value = categories[cat.key] ?? 0
          return (
            <div
              key={cat.key}
              className="flex items-center gap-2.5 border-0 border-b border-solid border-border py-2 last:border-b-0"
            >
              <span className="flex-1 text-[13px] text-body">{t(cat.label)}</span>
              <div role="radiogroup" aria-label={t(cat.label)} className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${cat.label}: ${n} ${t('stars')}`}
                    onClick={() => setCategories((prev) => ({ ...prev, [cat.key]: n }))}
                    className={cn(
                      'cursor-pointer border-none bg-transparent p-0 text-base leading-none',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
                      n <= value ? 'text-salis-orange' : 'text-border-strong'
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </Card>

      {/* Comment. */}
      <Card className="flex flex-col gap-1.5 p-4">
        <label htmlFor="feedback-comment" className="font-action text-[11px] font-medium text-heading">
          {t('Additional Comments')}
        </label>
        <textarea
          id="feedback-comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t('Share your thoughts...')}
          className="box-border w-full resize-none rounded-lg border border-solid border-border bg-inset px-3 py-2.5 text-[13px] text-heading outline-none focus:border-salis-blue focus:ring-2 focus:ring-[rgba(10,94,215,.15)]"
        />
      </Card>

      {/* Persistence gap — honest, not a save that does not happen. */}
      <p className="flex items-start gap-2 rounded-lg border border-border bg-inset px-3 py-2.5 text-[13px] text-body">
        <Icon name="Info" size={15} className="mt-0.5 flex-shrink-0 text-muted" />
        {t('Submitting feedback needs the feedback service, which is not available yet.')}
      </p>

      <button
        type="button"
        disabled
        aria-disabled
        className="flex h-[50px] w-full flex-shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg border-none bg-salis-gradient font-action text-[15px] font-semibold text-white opacity-50"
      >
        <Icon name="Send" size={16} />
        {t('Submit Feedback')}
      </button>
    </>
  )
}
