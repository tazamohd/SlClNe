import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { readStored, writeStored } from '@/lib/storage'

/** Advanced Settings (AdvancedSettings.dc.html): workshop info, security,
 *  notifications, integrations and data management in five section cards.
 *
 *  The prototype's toggles lived in component state and evaporated on
 *  navigation while its Save button did nothing. Here the switches persist
 *  through the wrapped storage, Save is real (dirty-tracked, disabled until
 *  something changed, toast on write) and editing is gated on
 *  `can('settings', 'e')` — anyone else sees the configuration read-only. */

type ToggleKey = 'twoFa' | 'auditLog' | 'emailNotif' | 'smsAlert' | 'autoBackup'

const TOGGLE_KEYS: readonly ToggleKey[] = [
  'twoFa',
  'auditLog',
  'emailNotif',
  'smsAlert',
  'autoBackup',
]

/** The design's defaults: everything on except SMS alerts. */
const DEFAULT_TOGGLES: Record<ToggleKey, boolean> = {
  twoFa: true,
  auditLog: true,
  emailNotif: true,
  smsAlert: false,
  autoBackup: true,
}

const STORAGE_KEY = 'salis-advanced-settings'

/** Merge stored values over the defaults, ignoring anything malformed —
 *  a hand-edited or stale payload must not take the screen down. */
function loadToggles(): Record<ToggleKey, boolean> {
  const raw = readStored(STORAGE_KEY)
  if (!raw) return { ...DEFAULT_TOGGLES }
  try {
    const parsed: unknown = JSON.parse(raw)
    const next = { ...DEFAULT_TOGGLES }
    if (typeof parsed === 'object' && parsed !== null) {
      for (const key of TOGGLE_KEYS) {
        const value = (parsed as Record<string, unknown>)[key]
        if (typeof value === 'boolean') next[key] = value
      }
    }
    return next
  } catch {
    return { ...DEFAULT_TOGGLES }
  }
}

/** One row inside a section card. `latin` pins fixed Latin/numeric content
 *  (names, "15%", "8–18") LTR so Arabic bidi doesn't reorder it. */
type SettingItem = { label: string; desc: string; descLatin?: boolean } & (
  | { kind: 'toggle'; key: ToggleKey }
  | { kind: 'value'; value: string; latin?: boolean }
  | { kind: 'badge'; connected: boolean }
)

interface SettingSection {
  icon: string
  title: string
  items: readonly SettingItem[]
}

export function AdvancedSettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const canEdit = can('settings', 'e')

  const [saved, setSaved] = useState(loadToggles)
  const [toggles, setToggles] = useState(saved)

  const dirty = useMemo(
    () => TOGGLE_KEYS.some((key) => toggles[key] !== saved[key]),
    [toggles, saved]
  )

  const save = () => {
    writeStored(STORAGE_KEY, JSON.stringify(toggles))
    setSaved(toggles)
    toast.show({
      title: t('Settings saved'),
      description: t('Your changes have been applied.'),
    })
  }

  /** Workshop identity, session and retention figures are org configuration
   *  the repository has no collection for yet — when the REST layer lands this
   *  becomes a `GET /settings` read and only this const moves. */
  const sections: readonly SettingSection[] = [
    {
      icon: 'Building2',
      title: t('Workshop Information'),
      items: [
        {
          label: t('Workshop Name'),
          desc: 'Al-Amri Auto Center',
          descLatin: true,
          kind: 'value',
          value: 'Al-Amri Auto Center',
          latin: true,
        },
        { label: t('VAT Rate'), desc: t('Tax Settings'), kind: 'value', value: '15%', latin: true },
        {
          label: t('Business Hours'),
          desc: t('Sat–Thu, 8 AM – 6 PM'),
          kind: 'value',
          value: '8–18',
          latin: true,
        },
      ],
    },
    {
      icon: 'Shield',
      title: t('Security Settings'),
      items: [
        {
          label: t('Two-Factor Authentication'),
          desc: t('Extra layer of security'),
          kind: 'toggle',
          key: 'twoFa',
        },
        {
          label: t('Session Timeout'),
          desc: t('Auto-expire after inactivity'),
          kind: 'value',
          value: t('30 min'),
        },
        {
          label: t('Audit Log'),
          desc: t('Track all system actions'),
          kind: 'toggle',
          key: 'auditLog',
        },
      ],
    },
    {
      icon: 'Bell',
      title: t('Notifications Preferences'),
      items: [
        {
          label: t('Email Notifications'),
          desc: t('Receive email alerts'),
          kind: 'toggle',
          key: 'emailNotif',
        },
        {
          label: t('SMS Alerts'),
          desc: t('SMS for critical alerts'),
          kind: 'toggle',
          key: 'smsAlert',
        },
      ],
    },
    {
      icon: 'Plug',
      title: t('Integrations'),
      items: [
        {
          label: 'ZATCA E-Invoice',
          desc: t('Saudi e-invoicing integration'),
          kind: 'badge',
          connected: true,
        },
        {
          label: 'WhatsApp Business',
          desc: t('Customer notifications'),
          kind: 'badge',
          connected: true,
        },
        {
          label: t('Accounting Software'),
          desc: t('Financial data export'),
          kind: 'badge',
          connected: false,
        },
      ],
    },
    {
      icon: 'Database',
      title: t('Data Management'),
      items: [
        {
          label: t('Auto Backup'),
          desc: t('Daily automatic backup'),
          kind: 'toggle',
          key: 'autoBackup',
        },
        {
          label: t('Retention Period'),
          desc: t('How long to keep data'),
          kind: 'value',
          value: t('1 year'),
        },
      ],
    },
  ]

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-5 md:gap-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {/* The design's soft glow behind the gradient tile. */}
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-[12px]" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Settings" size={28} />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-black text-heading md:text-[26px]">
            {t('Settings')}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {t('Configure your system')}
          </p>
        </div>
      </div>

      {sections.map((section) => (
        <Card key={section.icon} className="flex flex-col gap-3 p-4 md:gap-4 md:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
              <Icon name={section.icon} size={16} />
            </span>
            <h3 className="text-[13px] font-bold text-heading md:text-[15px]">{section.title}</h3>
          </div>
          <div className="flex flex-col">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-body">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {/* Latin desc (the workshop's name) is bidi-isolated inline
                        so the paragraph itself still start-aligns under RTL. */}
                    {item.descLatin ? <span dir="ltr">{item.desc}</span> : item.desc}
                  </p>
                </div>
                {item.kind === 'toggle' ? (
                  <Switch
                    on={toggles[item.key]}
                    label={item.label}
                    disabled={!canEdit}
                    onToggle={() =>
                      setToggles((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                  />
                ) : item.kind === 'value' ? (
                  <span
                    className="flex-shrink-0 rounded-md border border-border bg-inset px-3 py-1.5 text-[13px] font-medium text-heading"
                    dir={item.latin ? 'ltr' : undefined}
                  >
                    {item.value}
                  </span>
                ) : (
                  <Badge
                    className="flex-shrink-0"
                    background={item.connected ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'}
                    color={item.connected ? '#0A5ED7' : '#F97316'}
                  >
                    {t(item.connected ? 'Connected' : 'Disconnected')}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {canEdit ? (
        <Button
          size="lg"
          disabled={!dirty}
          onClick={save}
          className="h-12 w-full md:h-11 md:max-w-[280px] md:self-end"
        >
          <Icon name="Save" size={16} />
          {t('Save Changes')}
        </Button>
      ) : null}
    </div>
  )
}

/** The design's 44×24 pill switch: gradient when on, knob slides between the
 *  logical edges (`start-*`, so it flips under RTL). Real `switch` semantics —
 *  the prototype's bare button announced nothing to assistive tech. */
function Switch({
  on,
  label,
  disabled,
  onToggle,
}: {
  on: boolean
  label: string
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'relative h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-none transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-page',
        on ? 'bg-salis-gradient' : 'bg-border-strong',
        disabled && 'cursor-default opacity-60'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-all duration-200',
          on ? 'start-[22px]' : 'start-0.5'
        )}
      />
    </button>
  )
}
