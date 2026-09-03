import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Form, FormErrorSummary, SubmitButton, useZodForm } from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useDateFormat } from '@/lib/formatDate'
import { clearStored, readStored, writeStored } from '@/lib/storage'
import { AuthFormField } from './AuthFormField'

/** First-run wizard: organisation → branch → profile → preferences → done.
 *
 *  Each step is its own `useZodForm`, so Continue refuses an empty
 *  organisation name the way every other form in the app does, and every
 *  keystroke is drafted to storage — a wizard that loses four steps to a
 *  tab close is a wizard nobody finishes. The last step actually goes
 *  somewhere: the prototype's "Get Started" was a no-op. */
export const ONBOARDING_DRAFT_KEY = 'salis-onboarding-draft'
const AUTOSAVE_MS = 500
/** How long "Saved just now" stays before it turns into a timestamp. */
const JUST_NOW_MS = 10_000

const STEPS = [
  { id: 'organization', label: 'Organization', icon: 'Building2' },
  { id: 'branch', label: 'Branch Setup', icon: 'MapPin' },
  { id: 'profile', label: 'Your Profile', icon: 'User' },
  { id: 'preferences', label: 'Preferences', icon: 'Settings' },
  { id: 'complete', label: 'Complete', icon: 'CheckCircle' },
] as const

type OrganizationValues = { name: string; cr: string; vat: string }
type BranchValues = { name: string; city: string; bays: string }
type ProfileValues = { name: string; phone: string; title: string }

export interface OnboardingDraft {
  step: number
  organization: OrganizationValues
  branch: BranchValues
  profile: ProfileValues
}

export const EMPTY_DRAFT: OnboardingDraft = {
  step: 0,
  organization: { name: '', cr: '', vat: '' },
  branch: { name: '', city: '', bays: '' },
  profile: { name: '', phone: '', title: '' },
}

function stringsOf<T extends Record<string, string>>(template: T, raw: unknown): T {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const out = { ...template }
  for (const key of Object.keys(template) as (keyof T)[]) {
    const value = source[key as string]
    if (typeof value === 'string') out[key] = value as T[keyof T]
  }
  return out
}

/** The saved draft, or an empty one. A draft from an older shape is merged
 *  field by field rather than trusted whole. */
export function readDraft(): OnboardingDraft {
  const raw = readStored(ONBOARDING_DRAFT_KEY)
  if (!raw) return EMPTY_DRAFT
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>
    const step = typeof parsed.step === 'number' ? parsed.step : 0
    return {
      step: Math.min(Math.max(0, Math.floor(step)), STEPS.length - 1),
      organization: stringsOf(EMPTY_DRAFT.organization, parsed.organization),
      branch: stringsOf(EMPTY_DRAFT.branch, parsed.branch),
      profile: stringsOf(EMPTY_DRAFT.profile, parsed.profile),
    }
  } catch {
    return EMPTY_DRAFT
  }
}

const organizationRules = {
  name: z.string().trim().min(1, 'Please enter your organization name.'),
  cr: z.string().trim().regex(/^(\d{10})?$/, 'Commercial registration is 10 digits.'),
  vat: z.string().trim().regex(/^(\d{15})?$/, 'VAT number is 15 digits.'),
}
const branchRules = {
  name: z.string().trim().min(1, 'Please enter a branch name.'),
  city: z.string().trim().min(1, 'Please enter a city.'),
  bays: z.string().trim().regex(/^\d*$/, 'Service bays must be a whole number.'),
}
const profileRules = {
  name: z.string().trim().min(1, 'Please enter your name.'),
  phone: z.string().trim().min(1, 'Please enter your phone number.'),
  title: z.string(),
}
const organizationSchema = z.object(organizationRules)
const branchSchema = z.object(branchRules)
const profileSchema = z.object(profileRules)

/** Debounced draft save on every change after the first render. */
function useDraftAutosave<T>(values: T, save: (values: T) => void) {
  const first = useRef(true)
  const saveRef = useRef(save)
  saveRef.current = save
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(() => saveRef.current(values), AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [values])
}

export function Onboarding() {
  const { t } = usePreferences()
  const { time } = useDateFormat()
  const navigate = useNavigate()
  const toast = useToast()

  const [draft, setDraft] = useState<OnboardingDraft>(readDraft)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    if (!savedAt) return
    setStale(false)
    const timer = setTimeout(() => setStale(true), JUST_NOW_MS)
    return () => clearTimeout(timer)
  }, [savedAt])

  const persist = useCallback((patch: Partial<OnboardingDraft>) => {
    const next = { ...draftRef.current, ...patch }
    writeStored(ONBOARDING_DRAFT_KEY, JSON.stringify(next))
    draftRef.current = next
    setDraft(next)
    setSavedAt(new Date())
  }, [])

  const step = draft.step
  const current = STEPS[step] ?? STEPS[0]
  const goTo = (index: number) => persist({ step: Math.min(Math.max(0, index), STEPS.length - 1) })

  function finish() {
    clearStored(ONBOARDING_DRAFT_KEY)
    toast.show({
      title: t('Workspace ready'),
      description: t('Your workspace is ready. You can update these settings anytime from the Settings page.'),
      action: { label: 'Add first vehicle', onClick: () => navigate('/vehicles') },
    })
    navigate('/dashboard', { replace: true })
  }

  const savedCaption = !savedAt
    ? t('Drafts save automatically')
    : stale
      ? `${t('Draft saved')} · ${time(savedAt)}`
      : t('Saved just now')

  return (
    <AuthLayout className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-black text-heading">{t('Welcome to SALIS AUTO')}</h1>
        <p className="mt-1 text-sm text-muted">{t("Let's get your workspace set up")}</p>
      </div>

      <StepIndicator step={step} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <p className="mb-4 font-action text-xs font-semibold uppercase tracking-[.06em] text-salis-blue">
          {t('Step')} <span dir="ltr">{step + 1}</span> {t('of')} <span dir="ltr">{STEPS.length}</span> ·{' '}
          {t(current.label)}
        </p>

        {step === 0 ? (
          <OrganizationStep
            key="organization"
            initial={draft.organization}
            onDraft={(values) => persist({ organization: values })}
            onNext={(values) => persist({ organization: values, step: 1 })}
          />
        ) : null}
        {step === 1 ? (
          <BranchStep
            key="branch"
            initial={draft.branch}
            onDraft={(values) => persist({ branch: values })}
            onNext={(values) => persist({ branch: values, step: 2 })}
            onBack={() => goTo(0)}
          />
        ) : null}
        {step === 2 ? (
          <ProfileStep
            key="profile"
            initial={draft.profile}
            onDraft={(values) => persist({ profile: values })}
            onNext={(values) => persist({ profile: values, step: 3 })}
            onBack={() => goTo(1)}
          />
        ) : null}
        {step === 3 ? <PreferencesStep key="preferences" onNext={() => goTo(4)} onBack={() => goTo(2)} /> : null}
        {step === 4 ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex rounded-full bg-tint-blue p-4 text-salis-blue" aria-hidden>
              <Icon name="CheckCircle" size={40} />
            </span>
            <h2 className="text-lg font-bold text-heading">{t('All Set!')}</h2>
            <p className="max-w-sm text-sm text-muted">
              {t('Your workspace is ready. You can update these settings anytime from the Settings page.')}
            </p>
            <StepFooter onBack={() => goTo(3)}>
              <Button type="button" size="lg" icon="Sparkles" onClick={finish}>
                {t('Get Started')}
              </Button>
            </StepFooter>
          </div>
        ) : null}
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted" aria-live="polite">
        <Icon name="Save" size={12} className={savedAt ? 'text-salis-blue' : 'text-faint'} />
        {savedCaption}
      </p>
    </AuthLayout>
  )
}

function StepIndicator({ step }: { step: number }) {
  const { t } = usePreferences()
  return (
    <ol
      aria-label={t('Progress')}
      className="mb-6 flex items-start justify-center gap-2 md:gap-4"
    >
      {STEPS.map((item, index) => {
        const reached = index <= step
        return (
          <li
            key={item.id}
            aria-current={index === step ? 'step' : undefined}
            className="flex min-w-0 flex-col items-center gap-1"
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                reached ? 'bg-salis-gradient text-white shadow-[0_4px_10px_rgba(10,94,215,.25)]' : 'bg-inset text-muted'
              )}
              aria-hidden
            >
              <Icon name={item.icon} size={16} />
            </span>
            <span
              className={cn(
                'hidden text-center text-[11px] md:block',
                reached ? 'font-semibold text-heading' : 'text-muted'
              )}
            >
              {t(item.label)}
            </span>
            <span className="sr-only">
              {t('Step')} {index + 1} {t('of')} {STEPS.length}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Back on the start side, the step's primary action on the end side. The
 *  arrow follows the reading direction. */
function StepFooter({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  const { t, rtl } = usePreferences()
  return (
    <div className="mt-6 flex w-full items-center justify-between gap-3">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        icon={rtl ? 'ArrowRight' : 'ArrowLeft'}
        onClick={onBack}
        disabled={!onBack}
      >
        {t('Back')}
      </Button>
      {children}
    </div>
  )
}

function StepIntro({ title, text }: { title: string; text: string }) {
  const { t } = usePreferences()
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-heading">{t(title)}</h2>
      <p className="text-sm text-muted">{t(text)}</p>
    </div>
  )
}

function OrganizationStep({
  initial,
  onDraft,
  onNext,
}: {
  initial: OrganizationValues
  onDraft: (values: OrganizationValues) => void
  onNext: (values: OrganizationValues) => void
}) {
  const form = useZodForm<OrganizationValues, z.output<typeof organizationSchema>>({
    schema: organizationSchema,
    initial,
    onSubmit: (values) => onNext(values),
  })
  useDraftAutosave(form.values, onDraft)
  return (
    <Form form={form}>
      <StepIntro title="Organization Details" text="Tell us about your workshop or organization" />
      <FormErrorSummary />
      <AuthFormField
        form={form}
        name="name"
        label="Organization Name"
        placeholderKey="e.g. SALIS Auto Workshop"
        autoComplete="organization"
        required
        rule={organizationRules.name}
      />
      <AuthFormField
        form={form}
        name="cr"
        label="Commercial Registration"
        placeholder="1010XXXXXX"
        ltr
        mono
        inputMode="numeric"
        rule={organizationRules.cr}
      />
      <AuthFormField
        form={form}
        name="vat"
        label="VAT Number"
        placeholder="3XXXXXXXXXXXXXXX"
        ltr
        mono
        inputMode="numeric"
        rule={organizationRules.vat}
      />
      <StepFooter>
        <SubmitButton label="Continue" />
      </StepFooter>
    </Form>
  )
}

function BranchStep({
  initial,
  onDraft,
  onNext,
  onBack,
}: {
  initial: BranchValues
  onDraft: (values: BranchValues) => void
  onNext: (values: BranchValues) => void
  onBack: () => void
}) {
  const form = useZodForm<BranchValues, z.output<typeof branchSchema>>({
    schema: branchSchema,
    initial,
    onSubmit: (values) => onNext(values),
  })
  useDraftAutosave(form.values, onDraft)
  return (
    <Form form={form}>
      <StepIntro title="Branch Setup" text="Configure your primary branch location" />
      <FormErrorSummary />
      <AuthFormField
        form={form}
        name="name"
        label="Branch Name"
        placeholderKey="e.g. Main Workshop"
        required
        rule={branchRules.name}
      />
      <AuthFormField
        form={form}
        name="city"
        label="City"
        placeholderKey="Riyadh"
        autoComplete="address-level2"
        required
        rule={branchRules.city}
      />
      <AuthFormField
        form={form}
        name="bays"
        label="Service Bays"
        type="number"
        min={0}
        placeholder="4"
        ltr
        mono
        inputMode="numeric"
        rule={branchRules.bays}
      />
      <StepFooter onBack={onBack}>
        <SubmitButton label="Continue" />
      </StepFooter>
    </Form>
  )
}

function ProfileStep({
  initial,
  onDraft,
  onNext,
  onBack,
}: {
  initial: ProfileValues
  onDraft: (values: ProfileValues) => void
  onNext: (values: ProfileValues) => void
  onBack: () => void
}) {
  const form = useZodForm<ProfileValues, z.output<typeof profileSchema>>({
    schema: profileSchema,
    initial,
    onSubmit: (values) => onNext(values),
  })
  useDraftAutosave(form.values, onDraft)
  return (
    <Form form={form}>
      <StepIntro title="Your Profile" text="Complete your personal information" />
      <FormErrorSummary />
      <AuthFormField
        form={form}
        name="name"
        label="Full Name"
        autoComplete="name"
        required
        rule={profileRules.name}
      />
      <AuthFormField
        form={form}
        name="phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="+966 5X XXX XXXX"
        ltr
        mono
        required
        rule={profileRules.phone}
      />
      <AuthFormField
        form={form}
        name="title"
        label="Job Title"
        placeholderKey="e.g. Workshop Manager"
        autoComplete="organization-title"
        rule={profileRules.title}
      />
      <StepFooter onBack={onBack}>
        <SubmitButton label="Continue" />
      </StepFooter>
    </Form>
  )
}

/** The three switches write straight to `PreferencesProvider`, which already
 *  persists them — so the wizard shows the real state, and flipping Arabic
 *  here flips the wizard itself. */
function PreferencesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { t, language, setLanguage, theme, setTheme, notifications, setNotifications } =
    usePreferences()
  const rows: { icon: string; label: string; on: boolean; toggle: () => void }[] = [
    {
      icon: 'Languages',
      label: 'Arabic',
      on: language === 'ar',
      toggle: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
    },
    {
      icon: 'Moon',
      label: 'Dark Mode',
      on: theme === 'dark',
      toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      icon: 'Bell',
      label: 'Notifications',
      on: notifications,
      toggle: () => setNotifications(!notifications),
    },
  ]
  return (
    <div>
      <StepIntro title="Preferences" text="Set your preferred language and display options" />
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-h-[56px] items-center justify-between gap-3 rounded-lg border border-border bg-inset px-3.5 py-2.5"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tint-blue text-salis-blue">
                <Icon name={row.icon} size={15} />
              </span>
              <span className="text-sm font-medium text-heading">{t(row.label)}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted">{row.on ? t('On') : t('Off')}</span>
              <Toggle on={row.on} onToggle={row.toggle} label={t(row.label)} />
            </span>
          </div>
        ))}
      </div>
      <StepFooter onBack={onBack}>
        <Button type="button" size="lg" onClick={onNext}>
          {t('Continue')}
        </Button>
      </StepFooter>
    </div>
  )
}
