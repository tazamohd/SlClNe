import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

const STEPS = ['organization', 'branch', 'profile', 'preferences', 'complete'] as const

export function Onboarding() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [step, setStep] = useState(0)

  const labels = [
    t('Organization'),
    t('Branch Setup'),
    t('Your Profile'),
    t('Preferences'),
    t('Complete'),
  ]
  const icons = ['Building2', 'MapPin', 'User', 'Settings', 'CheckCircle']

  const canNext = step < STEPS.length - 1
  const canBack = step > 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-black text-heading">{t('Welcome to SALIS AUTO')}</h1>
          <p className="mt-1 text-sm text-muted">{t('Let\'s get your workspace set up')}</p>
        </div>

        {/* Step indicator */}
        <div className={`mb-8 flex items-center justify-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
          {labels.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className={`flex rounded-full p-2 transition-colors ${
                  i <= step
                    ? 'bg-salis-blue text-white'
                    : 'bg-surface-secondary text-muted'
                }`}
                aria-hidden
              >
                <Icon name={icons[i]} size={isMobile ? 14 : 18} />
              </span>
              {!isMobile && <span className={`text-[11px] ${i <= step ? 'font-semibold text-heading' : 'text-muted'}`}>{label}</span>}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border md:p-8">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-heading">{t('Organization Details')}</h2>
              <p className="text-sm text-muted">{t('Tell us about your workshop or organization')}</p>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Organization Name')}</span>
                  <Input type="text" inputSize="sm" placeholder={t('e.g. SALIS Auto Workshop')} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Commercial Registration')}</span>
                  <Input type="text" inputSize="sm" dir="ltr" placeholder="1010XXXXXX" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('VAT Number')}</span>
                  <Input type="text" inputSize="sm" dir="ltr" placeholder="3XXXXXXXXXXXXXXX" />
                </label>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-heading">{t('Branch Setup')}</h2>
              <p className="text-sm text-muted">{t('Configure your primary branch location')}</p>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Branch Name')}</span>
                  <Input type="text" inputSize="sm" placeholder={t('e.g. Main Workshop')} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('City')}</span>
                  <Input type="text" inputSize="sm" placeholder={t('Riyadh')} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Service Bays')}</span>
                  <Input type="number" inputSize="sm" dir="ltr" placeholder="4" />
                </label>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-heading">{t('Your Profile')}</h2>
              <p className="text-sm text-muted">{t('Complete your personal information')}</p>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Full Name')}</span>
                  <Input type="text" inputSize="sm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Phone')}</span>
                  <Input type="tel" inputSize="sm" dir="ltr" placeholder="+966 5X XXX XXXX" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">{t('Job Title')}</span>
                  <Input type="text" inputSize="sm" placeholder={t('e.g. Workshop Manager')} />
                </label>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-heading">{t('Preferences')}</h2>
              <p className="text-sm text-muted">{t('Set your preferred language and display options')}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Globe" size={16} className="text-salis-blue" />
                    <span className="text-sm text-heading">{t('Language')}</span>
                  </div>
                  <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('English')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Moon" size={16} className="text-salis-blue" />
                    <span className="text-sm text-heading">{t('Dark Mode')}</span>
                  </div>
                  <Badge background="rgba(11,31,59,.1)" color="var(--text-heading)">{t('Off')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Bell" size={16} className="text-salis-blue" />
                    <span className="text-sm text-heading">{t('Notifications')}</span>
                  </div>
                  <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('On')}</Badge>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex rounded-full bg-[rgba(10,94,215,.1)] p-4 text-salis-blue" aria-hidden>
                <Icon name="CheckCircle" size={40} />
              </span>
              <h2 className="text-lg font-bold text-heading">{t('All Set!')}</h2>
              <p className="max-w-sm text-sm text-muted">{t('Your workspace is ready. You can update these settings anytime from the Settings page.')}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-heading disabled:opacity-40"
              disabled={!canBack}
              onClick={() => setStep((s) => s - 1)}
            >
              {t('Back')}
            </button>
            <button
              type="button"
              className="rounded-lg bg-salis-blue px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-salis-blue/90 disabled:opacity-40"
              disabled={!canNext && step !== STEPS.length - 1}
              onClick={() => {
                if (canNext) setStep((s) => s + 1)
              }}
            >
              {step === STEPS.length - 1 ? t('Get Started') : t('Continue')}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {t('Step')} {step + 1} {t('of')} {STEPS.length}
        </p>
      </div>
    </div>
  )
}
