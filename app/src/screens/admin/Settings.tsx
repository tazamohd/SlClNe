import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'
import { readStored, writeStored } from '@/lib/storage'

/** Settings (Settings.dc.html): the garage's main settings hub — workshop
 *  profile, appearance/language, notification prefs and a link out to
 *  billing.
 *
 *  The prototype kept theme and language as page-local buttons in its sidebar
 *  chrome and re-implemented the toggle from scratch on every screen (see
 *  `PreferencesProvider`'s docstring on why that lost the setting on
 *  navigation). This screen exposes the same two choices as in-content chips
 *  bound straight to the shared provider, so picking one here is identical to
 *  picking it from the shell — same storage key, same state, applies
 *  immediately with no Save. SMS Alerts and Two-Factor Authentication have no
 *  provider home yet, so they persist immediately to their own storage keys
 *  on toggle. Only the workshop identity fields are staged and written by
 *  Save, matching the design's single Save Changes button. */

const WORKSHOP_KEY = 'salis-settings-workshop'
const SMS_KEY = 'salis-settings-sms-alerts'
const TFA_KEY = 'salis-settings-2fa'

interface WorkshopProfile {
  name: string
  phone: string
}

const DEFAULT_WORKSHOP: WorkshopProfile = {
  name: 'Al-Amri Auto Center',
  phone: '+966 55 123 4567',
}

/** Merge a stored workshop profile over the default, ignoring anything
 *  malformed — a hand-edited or stale payload must not take the screen down. */
function loadWorkshop(): WorkshopProfile {
  const raw = readStored(WORKSHOP_KEY)
  if (!raw) return { ...DEFAULT_WORKSHOP }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_WORKSHOP }
    const p = parsed as Record<string, unknown>
    return {
      name: typeof p.name === 'string' ? p.name : DEFAULT_WORKSHOP.name,
      phone: typeof p.phone === 'string' ? p.phone : DEFAULT_WORKSHOP.phone,
    }
  } catch {
    return { ...DEFAULT_WORKSHOP }
  }
}

function loadBoolean(key: string, fallback: boolean): boolean {
  const raw = readStored(key)
  if (raw === 'on') return true
  if (raw === 'off') return false
  return fallback
}

export function Settings() {
  const { t, theme, setTheme, language, setLanguage, notifications, setNotifications } =
    usePreferences()
  const toast = useToast()

  const [saved, setSaved] = useState(loadWorkshop)
  const [draft, setDraft] = useState(saved)
  const [smsAlerts, setSmsAlerts] = useState(() => loadBoolean(SMS_KEY, false))
  const [twoFactor, setTwoFactor] = useState(() => loadBoolean(TFA_KEY, true))

  const dirty = useMemo(
    () => draft.name !== saved.name || draft.phone !== saved.phone,
    [draft, saved]
  )

  const save = () => {
    writeStored(WORKSHOP_KEY, JSON.stringify(draft))
    setSaved(draft)
    toast.show({
      title: t('Settings saved'),
      description: t('Your changes have been applied.'),
    })
  }

  const toggleSms = () => {
    const next = !smsAlerts
    writeStored(SMS_KEY, next ? 'on' : 'off')
    setSmsAlerts(next)
  }

  const toggleTfa = () => {
    const next = !twoFactor
    writeStored(TFA_KEY, next ? 'on' : 'off')
    setTwoFactor(next)
  }

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-6">
      <h1 className="font-display text-3xl font-black text-heading">{t('Settings')}</h1>

      <Card className="flex flex-col gap-4 p-5 md:p-6">
        <h3 className="text-[17px] font-bold text-heading">{t('Workshop Profile')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-ws-name"
              className="font-action text-xs font-medium text-body"
            >
              {t('Workshop Name')}
            </label>
            <Input
              id="settings-ws-name"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-ws-phone"
              className="font-action text-xs font-medium text-body"
            >
              {t('Phone')}
            </label>
            <Input
              id="settings-ws-phone"
              dir="ltr"
              className="font-mono text-[13px]"
              value={draft.phone}
              onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5 md:p-6">
        <h3 className="text-[17px] font-bold text-heading">{t('Appearance')}</h3>
        <div className="flex flex-col gap-2">
          <span className="font-action text-xs font-medium text-body">{t('Theme')}</span>
          <ChipGroup label={t('Theme')}>
            <Chip
              label={t('Light')}
              selected={theme === 'light'}
              onToggle={() => setTheme('light')}
            />
            <Chip
              label={t('Dark')}
              selected={theme === 'dark'}
              onToggle={() => setTheme('dark')}
            />
          </ChipGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-action text-xs font-medium text-body">
            {t('Language & Region')}
          </span>
          <ChipGroup label={t('Language & Region')}>
            <Chip
              label={t('English')}
              selected={language === 'en'}
              onToggle={() => setLanguage('en')}
            />
            <Chip
              label={t('Arabic')}
              selected={language === 'ar'}
              onToggle={() => setLanguage('ar')}
            />
          </ChipGroup>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5 p-5 md:p-6">
        <h3 className="text-[17px] font-bold text-heading">{t('Notifications Preferences')}</h3>
        <SettingRow label={t('Email Notifications')}>
          <Switch
            on={notifications}
            label={t('Email Notifications')}
            onToggle={() => setNotifications(!notifications)}
          />
        </SettingRow>
        <SettingRow label={t('SMS Alerts')}>
          <Switch label={t('SMS Alerts')} on={smsAlerts} onToggle={toggleSms} />
        </SettingRow>
        <SettingRow label={t('Two-Factor Authentication')}>
          <Switch
            label={t('Two-Factor Authentication')}
            on={twoFactor}
            onToggle={toggleTfa}
          />
        </SettingRow>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
        <div>
          <h3 className="text-[17px] font-bold text-heading">{t('Billing & Subscription')}</h3>
          <p className="mt-1 text-[13px] text-muted">
            {t('Current Plan')}:{' '}
            <span className="font-semibold text-salis-blue" dir="ltr">
              PRO
            </span>
          </p>
        </div>
        <Link
          to="/subscription"
          className={cn(
            'inline-flex h-9 flex-shrink-0 items-center gap-2 rounded border-[1.5px] border-salis-blue px-3.5',
            'font-action text-[13px] font-medium text-salis-blue no-underline',
            'hover:bg-[rgba(10,94,215,.08)] hover:text-salis-blue hover:no-underline'
          )}
        >
          <Icon name="CreditCard" size={16} />
          {t('Manage Plan')}
        </Link>
      </Card>

      <Button size="lg" disabled={!dirty} onClick={save} className="self-end">
        <Icon name="Check" size={16} />
        {t('Save Changes')}
      </Button>
    </div>
  )
}

/** Label + control row shared by every toggle in the Notifications card. */
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-body">{label}</span>
      {children}
    </div>
  )
}

/** The design's 42×24 pill switch. Uses `insetInlineStart` so the knob
 *  travels the correct way in both LTR and RTL without a conditional. */
function Switch({
  on,
  label,
  onToggle,
}: {
  on: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'relative h-6 w-[42px] flex-shrink-0 cursor-pointer rounded-full border-none transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-page',
        on ? 'bg-salis-gradient' : 'bg-border-strong'
      )}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-[inset-inline-start] duration-200"
        style={{ insetInlineStart: on ? 20 : 2 }}
      />
    </button>
  )
}
