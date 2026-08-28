import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { RepositoryError, useCollection, useCreate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { NoWritesNotice, asPatch } from './writes'

/** Customer Feedback — `CustomerFeedback.dc.html` and `.Mobile.dc.html`.
 *
 *  A post-service rating form: the service summary, an overall star rating, four
 *  category ratings, a comment, and a submit.
 *
 *  **Persistence (F-027).** A `feedback` collection now exists and
 *  `POST /customer-feedback` backs it, so the form submits for real through
 *  `useCreate('feedback')` and shows a success state. The server stores one
 *  overall `rating` and a free-text `comment`; the four category ratings have no
 *  column of their own, so rather than drop what the user entered they are
 *  folded into the comment — everything shown as submitted is actually stored,
 *  which is the §60 line. `jobCardId` is sent only when the anchoring job's ULID
 *  is known. Against the fixtures the submit refuses honestly with the "set
 *  VITE_API_URL" state.
 *
 *  The service summary is real, not the prototype's invented Camry: it is the
 *  completed job named by `?job=<code>`, or the most recent completed/delivered
 *  job. A job card carries no amount, so the design's SAR figure is omitted
 *  rather than guessed. */
type Job = RowOf<'jobs'> & { _id?: string }

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
  const isMobile = useIsMobile()
  const { can } = useSession()
  const [params] = useSearchParams()
  const jobRef = params.get('job') ?? ''

  const jobs = useCollection('jobs')
  const submit = useCreate('feedback')

  const [rating, setRating] = useState(0)
  const [categories, setCategories] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rows = (jobs.data ?? []) as readonly Job[]
  const job = jobRef
    ? rows.find((row) => row.id === jobRef)
    : rows.find((row) => DONE.has(row.st)) ?? rows[0]

  const shell = (children: ReactNode) => (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4">
      {isMobile ? (
        <MobilePageHeader icon="MessageSquare" title={t('Service Feedback')} />
      ) : (
        <div className="flex items-center gap-2.5">
          <Link to="/customers" aria-label={t('Back')} className="flex text-muted no-underline hover:no-underline">
            <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
          </Link>
          <h1 className="font-display text-lg font-extrabold text-heading">{t('Service Feedback')}</h1>
        </div>
      )}
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
  const canSubmit = can('crm', 'c')

  if (submitted) {
    return shell(
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tint-blue)] text-salis-blue">
          <Icon name="CheckCircle" size={28} />
        </span>
        <h3 className="text-base font-bold text-heading">{t('Thank you for your feedback')}</h3>
        <p className="m-0 text-[13px] text-muted">
          {t('Your rating has been recorded and will help us improve our service.')}
        </p>
      </Card>,
    )
  }

  // The server stores one overall rating and a free-text comment. Rather than
  // silently drop the four category ratings the design collects, they are
  // folded into the comment, so everything shown as submitted is really stored.
  async function onSubmit() {
    if (!job) return
    setError(null)
    const detail = CATEGORIES.map((cat) =>
      categories[cat.key] ? `${t(cat.label)} ${categories[cat.key]}/5` : null,
    )
      .filter(Boolean)
      .join(', ')
    const body = comment.trim()
    const parts = [body, detail ? `(${detail})` : ''].filter(Boolean)
    try {
      await submit.mutateAsync({
        input: asPatch<RowOf<'feedback'>>({
          rating,
          ...(parts.length ? { comment: parts.join('\n\n') } : {}),
          ...(job._id ? { jobCardId: job._id } : {}),
          ...(job.cust ? { customerName: job.cust } : {}),
        }),
      })
      setSubmitted(true)
    } catch (cause) {
      setError(
        cause instanceof RepositoryError
          ? cause.message
          : t('Your feedback could not be submitted.'),
      )
    }
  }

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
        <Textarea
          id="feedback-comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t('Share your thoughts...')}
          className="resize-none text-[13px]"
        />
      </Card>

      {/* Honest "no API" notice on the fixtures; nothing on a live build. */}
      <NoWritesNotice />

      {canSubmit ? (
        <>
          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-salis-orange bg-[rgba(249,115,22,.08)] px-3 py-2.5 text-[13px] text-body"
            >
              <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={rating === 0 || submit.isPending}
            aria-disabled={rating === 0 || submit.isPending}
            className={cn(
              'flex h-[50px] w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg border-none bg-salis-gradient font-action text-[15px] font-semibold text-white',
              rating === 0 || submit.isPending
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer',
            )}
          >
            <Icon name="Send" size={16} />
            {submit.isPending ? t('Submitting...') : t('Submit Feedback')}
          </button>
          {rating === 0 ? (
            <p className="m-0 text-center text-[11px] text-muted">
              {t('Choose an overall rating to submit.')}
            </p>
          ) : null}
        </>
      ) : (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-inset px-3 py-2.5 text-[13px] text-body">
          <Icon name="Info" size={15} className="mt-0.5 flex-shrink-0 text-muted" />
          {t('Your role can view this feedback form but not submit it.')}
        </p>
      )}
    </>
  )
}
