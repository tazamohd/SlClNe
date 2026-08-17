import { useId, type ComponentProps, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle, CheckSquare, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Modal / dialog pattern gallery — ported from UI.Modals.CRUD.dc.html,
 *  UI.Modals.Actions.dc.html and UI.Modals.Status.dc.html.
 *
 *  These are reference specimens, not live dialogs: every variant renders
 *  inline as a card so the whole set is visible on load, with no overlay,
 *  portal or focus trap. Close/cancel controls are inert — this is a
 *  catalogue of what the real dialog looks like, not the dialog itself. */

// ── Shared "specimen" chrome ────────────────────────────────────────────────

type Tone = 'blue' | 'brightBlue' | 'orange' | 'slate' | 'navy'

const TONE_CLASS: Record<Tone, string> = {
  blue: 'bg-[rgba(10,94,215,.08)] text-salis-blue',
  brightBlue: 'bg-[rgba(11,179,255,.08)] text-[#0BB3FF]',
  orange: 'bg-[rgba(249,115,22,.1)] text-salis-orange',
  slate: 'bg-[rgba(100,116,139,.08)] text-muted',
  navy: 'bg-[rgba(11,31,59,.08)] text-[#0B1F3B]',
}

/** Destructive button: orange fill, never red (README §7). */
function DestructiveButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(
        'border-none bg-salis-orange text-white shadow-[0_4px_12px_rgba(249,115,22,.25)] hover:opacity-90',
        props.className
      )}
    />
  )
}

function Specimen({ children, className }: { children: ReactNode; className?: string }) {
  return <Card className={cn('flex flex-col overflow-hidden rounded-2xl', className)}>{children}</Card>
}

/** Header bar: icon chip, title, optional badge, decorative close control. */
function SpecimenBar({
  tone,
  icon,
  title,
  badge,
}: {
  tone?: Tone
  icon?: ReactNode
  title: string
  badge?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
      {icon && tone ? (
        <span className={cn('flex flex-shrink-0 items-center justify-center rounded-lg p-1.5', TONE_CLASS[tone])}>
          {icon}
        </span>
      ) : null}
      <h3 className="min-w-0 truncate text-[15px] font-bold text-heading">{title}</h3>
      {badge}
      <span className="flex-1" />
      <button
        type="button"
        aria-label="Close"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-inset"
      >
        <X size={16} strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}

function SpecimenBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-3.5 p-5', className)}>{children}</div>
}

function SpecimenFoot({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={cn('flex flex-wrap gap-2.5 border-t border-border px-5 py-3.5', center ? 'justify-center' : 'justify-end')}>
      {children}
    </div>
  )
}

/** Centered confirmation/status block: icon medallion, title, description. */
function SpecimenIcon({
  tone,
  icon,
  title,
  description,
  extra,
}: {
  tone: Tone
  icon: ReactNode
  title: string
  description: ReactNode
  extra?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 py-8 text-center">
      <span className={cn('flex flex-shrink-0 items-center justify-center rounded-full p-3.5', TONE_CLASS[tone])}>
        {icon}
      </span>
      <h3 className="text-lg font-bold text-heading">{title}</h3>
      <p className="max-w-[320px] text-sm text-muted">{description}</p>
      {extra}
    </div>
  )
}

function Field({
  label,
  placeholder,
  dir,
  mono,
}: {
  label: string
  placeholder: string
  dir?: 'ltr'
  mono?: boolean
}) {
  const id = useId()
  return (
    <span className="flex flex-col gap-1">
      <label htmlFor={id} className="font-action text-[11px] font-medium text-heading">
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        dir={dir}
        className={cn(
          'h-11 rounded border border-border bg-inset px-3 text-sm text-heading outline-none',
          'transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
          mono && 'font-mono'
        )}
      />
    </span>
  )
}

// ── UI.Modals.CRUD ───────────────────────────────────────────────────────────

const TECHNICIANS = [
  { name: 'Yousef Al-Otaibi', initial: 'Y', specialty: 'Engine & Diagnostics', load: '3 jobs' },
  { name: 'Bandar Al-Qahtani', initial: 'B', specialty: 'Body & Paint', load: '2 jobs' },
  { name: 'Faisal Al-Harbi', initial: 'F', specialty: 'Electrical', load: '4 jobs' },
  { name: 'Nasser Al-Dosari', initial: 'N', specialty: 'Tires & Suspension', load: '1 job' },
]

export function UIModalsCRUD() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader icon="Database" title={t('CRUD Modals')} subtitle={t('Create, update and delete confirmations')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Specimen>
          <SpecimenBar tone="blue" icon={<Icon name="Plus" size={16} />} title={t('Add New Customer')} />
          <SpecimenBody>
            <Field label={t('Full Name')} placeholder={t('Enter customer name')} />
            <Field label={t('Phone')} placeholder="+966 5X XXX XXXX" dir="ltr" mono />
            <Field label={t('Email')} placeholder="email@example.com" />
          </SpecimenBody>
          <SpecimenFoot>
            <Button variant="outline" size="md">{t('Cancel')}</Button>
            <Button size="md">{t('Add Customer')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="orange"
            icon={<Icon name="Trash2" size={28} />}
            title={t('Delete Job Card?')}
            description={
              <>
                {t('This action cannot be undone. Job card')}{' '}
                <span dir="ltr" className="font-mono font-semibold text-heading">JC-A3F8B2C1</span>{' '}
                {t('will be permanently removed.')}
              </>
            }
          />
          <SpecimenFoot center>
            <Button variant="outline" size="md">{t('Cancel')}</Button>
            <DestructiveButton size="md">{t('Delete')}</DestructiveButton>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="blue"
            icon={<Icon name="Save" size={28} />}
            title={t('Save as Draft?')}
            description={t('Your changes will be saved as a draft. You can continue editing later.')}
          />
          <SpecimenFoot center>
            <Button variant="outline" size="md">{t('Discard')}</Button>
            <Button size="md">{t('Save Draft')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenBar tone="brightBlue" icon={<Icon name="UserPlus" size={16} />} title={t('Assign Technician')} />
          <SpecimenBody className="gap-2">
            {TECHNICIANS.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2.5 rounded-[10px] border border-border px-3 py-2.5"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[13px] font-bold text-white">
                  {tech.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-heading">{t(tech.name)}</p>
                  <p className="truncate text-[11px] text-muted">{t(tech.specialty)}</p>
                </span>
                <span className="flex-shrink-0 font-mono text-xs text-muted" dir="ltr">{tech.load}</span>
              </div>
            ))}
          </SpecimenBody>
          <SpecimenFoot>
            <Button size="md">{t('Assign')}</Button>
          </SpecimenFoot>
        </Specimen>
      </div>
    </>
  )
}

// ── UI.Modals.Actions ────────────────────────────────────────────────────────

const BULK_ACTIONS: { label: string; icon: ReactNode; tone: 'blue' | 'body' | 'muted' | 'orange' }[] = [
  { label: 'Mark as Completed', icon: <CheckCircle size={16} strokeWidth={2} aria-hidden />, tone: 'blue' },
  { label: 'Assign to Technician', icon: <Icon name="UserPlus" size={16} />, tone: 'body' },
  { label: 'Export Selected', icon: <Icon name="Download" size={16} />, tone: 'body' },
  { label: 'Archive', icon: <Icon name="Archive" size={16} />, tone: 'muted' },
  { label: 'Delete Selected', icon: <Icon name="Trash2" size={16} />, tone: 'orange' },
]

const BULK_TONE_CLASS: Record<string, string> = {
  blue: 'text-salis-blue hover:bg-[rgba(10,94,215,.06)]',
  body: 'text-body hover:bg-[rgba(10,94,215,.04)]',
  muted: 'text-muted hover:bg-[rgba(100,116,139,.06)]',
  orange: 'text-salis-orange hover:bg-[rgba(249,115,22,.06)]',
}

export function UIModalsActions() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader icon="Zap" title={t('Action Modals')} subtitle={t('Approve, share, upload and bulk-act dialogs')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Specimen>
          <SpecimenIcon
            tone="blue"
            icon={<Icon name="ThumbsUp" size={28} />}
            title={t('Approve Estimate?')}
            description={
              <>
                {t('Approve estimate')} <span dir="ltr" className="font-semibold text-heading">EST-0231</span>{' '}
                {t('for')} <Money sar={1250} className="font-bold text-salis-blue" />
              </>
            }
            extra={
              <span className="flex w-full flex-col gap-1 text-start">
                <label htmlFor="approve-notes" className="font-action text-[11px] font-medium text-heading">
                  {t('Notes (optional)')}
                </label>
                <textarea
                  id="approve-notes"
                  rows={2}
                  placeholder={t('Add approval notes...')}
                  className="resize-none rounded border border-border bg-inset p-2.5 text-[13px] text-heading outline-none focus:border-salis-blue"
                />
              </span>
            }
          />
          <SpecimenFoot center>
            <Button variant="outline" size="md">{t('Cancel')}</Button>
            <Button size="md">{t('Approve')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenBar tone="brightBlue" icon={<Icon name="Share2" size={16} />} title={t('Share Invoice')} />
          <SpecimenBody>
            <span className="flex flex-col gap-1">
              <span className="font-action text-[11px] font-medium text-heading">{t('Send via')}</span>
              <span className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Icon name="Mail" size={14} />
                  {t('Email')}
                </Button>
                <Button variant="subtle" size="sm" className="flex-1">
                  <Icon name="MessageCircle" size={14} />
                  {t('WhatsApp')}
                </Button>
                <Button variant="subtle" size="sm" className="flex-1">
                  <Icon name="Link" size={14} />
                  {t('Link')}
                </Button>
              </span>
            </span>
            <Field label={t('Recipient Email')} placeholder="customer@email.com" />
          </SpecimenBody>
          <SpecimenFoot>
            <Button size="md">
              <Icon name="Send" size={14} />
              {t('Send')}
            </Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenBar title={t('Upload Files')} />
          <SpecimenBody>
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-8 py-8 text-center">
              <Icon name="Upload" size={32} className="text-salis-blue" />
              <p className="text-sm font-medium text-heading">{t('Drop files here')}</p>
              <p className="text-xs text-muted">{t('or click to browse (PDF, JPG, PNG · max 10MB)')}</p>
            </div>
          </SpecimenBody>
          <SpecimenFoot>
            <Button size="md">{t('Upload')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenBar
            tone="blue"
            icon={<CheckSquare size={16} strokeWidth={2} aria-hidden />}
            title={t('Bulk Actions')}
            badge={
              <span className="rounded-full bg-[rgba(10,94,215,.08)] px-2.5 py-0.5 text-xs font-semibold text-salis-blue">
                {t('5 selected')}
              </span>
            }
          />
          <SpecimenBody className="gap-1 p-3">
            {BULK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-start font-action text-[13px] transition-colors',
                  BULK_TONE_CLASS[action.tone]
                )}
              >
                {action.icon}
                {t(action.label)}
              </button>
            ))}
          </SpecimenBody>
        </Specimen>
      </div>
    </>
  )
}

// ── UI.Modals.Status ─────────────────────────────────────────────────────────

export function UIModalsStatus() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader icon="Info" title={t('Status Modals')} subtitle={t('Success, warning, error and system-state dialogs')} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Specimen>
          <SpecimenIcon
            tone="blue"
            icon={<CheckCircle size={32} strokeWidth={2} aria-hidden />}
            title={t('Success')}
            description={t('Job card has been created successfully.')}
          />
          <SpecimenFoot center>
            <Button size="md">{t('Continue')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="orange"
            icon={<AlertTriangle size={32} strokeWidth={2} aria-hidden />}
            title={t('Warning')}
            description={t('This invoice is overdue by 15 days. Send a reminder?')}
          />
          <SpecimenFoot center>
            <Button variant="outline" size="md">{t('Skip')}</Button>
            <DestructiveButton size="md">{t('Send Reminder')}</DestructiveButton>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="orange"
            icon={<XCircle size={32} strokeWidth={2} aria-hidden />}
            title={t('Error')}
            description={t('Failed to process payment. Please check card details and try again.')}
            extra={
              <span className="rounded-lg border border-border bg-inset px-3 py-2 font-mono text-[11px] text-muted" dir="ltr">
                ERR_PAYMENT_DECLINED
              </span>
            }
          />
          <SpecimenFoot center>
            <Button size="md">{t('Try Again')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="slate"
            icon={<Icon name="WifiOff" size={32} />}
            title={t('Offline Conflict')}
            description={t('Changes were made offline and conflict with the server version.')}
          />
          <SpecimenFoot center>
            <Button variant="outline" size="md">{t('Keep Local')}</Button>
            <Button size="md">{t('Use Server')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="orange"
            icon={<Icon name="Clock" size={32} />}
            title={t('Session Expiring')}
            description={t('Your session will expire in 2 minutes. Would you like to stay logged in?')}
          />
          <SpecimenFoot center>
            <Button variant="outline" size="md">{t('Log Out')}</Button>
            <Button size="md">{t('Stay Logged In')}</Button>
          </SpecimenFoot>
        </Specimen>

        <Specimen>
          <SpecimenIcon
            tone="navy"
            icon={<Icon name="Lock" size={32} />}
            title={t('Permission Denied')}
            description={t("You don't have permission to perform this action. Contact your administrator.")}
          />
          <SpecimenFoot center>
            <Button size="md">{t('Go Back')}</Button>
          </SpecimenFoot>
        </Specimen>
      </div>
    </>
  )
}
