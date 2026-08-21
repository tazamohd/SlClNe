import { useState } from 'react'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'

function Toggle({
  on,
  onToggle,
  rtl,
  label,
}: {
  on: boolean
  onToggle: () => void
  rtl: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      disabled={!isLive}
      className={
        'relative h-6 w-[42px] flex-shrink-0 cursor-pointer rounded-full border-none p-0.5 transition-colors disabled:opacity-50 ' +
        (on ? 'bg-salis-gradient' : 'bg-border-strong')
      }
    >
      <span
        className="block h-5 w-5 rounded-full bg-white transition-transform"
        style={{
          transform: on
            ? `translateX(${rtl ? '-18px' : '18px'})`
            : 'translateX(0)',
        }}
      />
    </button>
  )
}

interface SettingItem {
  label: string
  desc: string
  kind: 'toggle' | 'value' | 'badge'
  toggleKey?: string
  value?: string
  badgeLabel?: string
  badgeBg?: string
  badgeColor?: string
}

interface SettingSection {
  icon: string
  title: string
  items: SettingItem[]
}

export function AdvancedSettings() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    twoFa: true,
    emailNotif: true,
    smsAlert: false,
    autoBackup: true,
    auditLog: true,
  })

  const flip = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))

  const sections: SettingSection[] = [
    {
      icon: 'Building2',
      title: t('Workshop Information'),
      items: [
        { label: t('Workshop Name'), desc: 'Al-Amri Auto Center', kind: 'value', value: 'Al-Amri Auto Center' },
        { label: t('VAT Rate'), desc: t('Tax Settings'), kind: 'value', value: '15%' },
        { label: t('Business Hours'), desc: rtl ? 'السبت-الخميس' : 'Sat–Thu, 8 AM – 6 PM', kind: 'value', value: '8–18' },
      ],
    },
    {
      icon: 'Shield',
      title: t('Security Settings'),
      items: [
        { label: t('Two-Factor Authentication'), desc: rtl ? 'طبقة أمان إضافية' : 'Extra layer of security', kind: 'toggle', toggleKey: 'twoFa' },
        { label: t('Session Timeout'), desc: rtl ? 'انتهاء تلقائي بعد' : 'Auto-expire after inactivity', kind: 'value', value: '30 min' },
        { label: t('Audit Log'), desc: rtl ? 'تتبع جميع الإجراءات' : 'Track all system actions', kind: 'toggle', toggleKey: 'auditLog' },
      ],
    },
    {
      icon: 'Bell',
      title: t('Notifications Preferences'),
      items: [
        { label: t('Email Notifications'), desc: rtl ? 'إشعارات البريد الإلكتروني' : 'Receive email alerts', kind: 'toggle', toggleKey: 'emailNotif' },
        { label: t('SMS Alerts'), desc: rtl ? 'تنبيهات الرسائل النصية' : 'SMS for critical alerts', kind: 'toggle', toggleKey: 'smsAlert' },
      ],
    },
    {
      icon: 'Plug',
      title: t('Integrations'),
      items: [
        { label: 'ZATCA E-Invoice', desc: rtl ? 'ربط الفوترة الإلكترونية' : 'Saudi e-invoicing integration', kind: 'badge', badgeLabel: t('Connected'), badgeBg: 'rgba(10,94,215,.1)', badgeColor: 'var(--salis-blue)' },
        { label: 'WhatsApp Business', desc: rtl ? 'إشعارات العملاء' : 'Customer notifications', kind: 'badge', badgeLabel: t('Connected'), badgeBg: 'rgba(10,94,215,.1)', badgeColor: 'var(--salis-blue)' },
        { label: t('Accounting Software'), desc: rtl ? 'تصدير البيانات المالية' : 'Financial data export', kind: 'badge', badgeLabel: t('Disconnected'), badgeBg: 'rgba(249,115,22,.1)', badgeColor: 'var(--salis-orange)' },
      ],
    },
    {
      icon: 'Database',
      title: t('Data Management'),
      items: [
        { label: t('Auto Backup'), desc: rtl ? 'نسخ احتياطي يومي' : 'Daily automatic backup', kind: 'toggle', toggleKey: 'autoBackup' },
        { label: t('Retention Period'), desc: rtl ? 'مدة الاحتفاظ بالبيانات' : 'How long to keep data', kind: 'value', value: t('1 year') },
      ],
    },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Settings" title={t('Advanced Settings')} subtitle={t('Configure your system')} />
        {sections.map((sec) => (
          <Card key={sec.title} className="flex flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex rounded-[10px] bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
                <Icon name={sec.icon} size={16} />
              </span>
              <h3 className="text-[14px] font-bold text-heading">{sec.title}</h3>
            </div>
            {sec.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[13px] font-medium text-body">{item.label}</p>
                  <p className="m-0 mt-0.5 text-[11px] text-muted">{item.desc}</p>
                </div>
                {item.kind === 'toggle' && item.toggleKey && (
                  <Toggle on={toggles[item.toggleKey]} onToggle={() => flip(item.toggleKey!)} rtl={rtl} label={item.label} />
                )}
                {item.kind === 'value' && (
                  <span className="flex-shrink-0 rounded-md border border-border bg-inset px-2 py-1 text-[12px] font-medium text-heading">{item.value}</span>
                )}
                {item.kind === 'badge' && (
                  <Badge background={item.badgeBg!} color={item.badgeColor!}>{item.badgeLabel}</Badge>
                )}
              </div>
            ))}
          </Card>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => toast.show({ title: t('Settings saved') })} disabled={!isLive}>
            <Icon name="Save" size={16} />
            {t('Save Changes')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-w-[900px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="Settings" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[26px] font-black text-heading">
            {t('Advanced Settings')}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {t('Configure your system')}
          </p>
        </div>
      </div>

      {sections.map((sec) => (
        <Card key={sec.title} className="flex flex-col gap-4 rounded-xl p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex rounded-[10px] bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
              <Icon name={sec.icon} size={18} />
            </span>
            <h3 className="text-[15px] font-bold text-heading">{sec.title}</h3>
          </div>

          {sec.items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-medium text-body">{item.label}</p>
                <p className="m-0 mt-0.5 text-xs text-muted">{item.desc}</p>
              </div>

              {item.kind === 'toggle' && item.toggleKey && (
                <Toggle
                  on={toggles[item.toggleKey]}
                  onToggle={() => flip(item.toggleKey!)}
                  rtl={rtl}
                  label={item.label}
                />
              )}

              {item.kind === 'value' && (
                <span className="flex-shrink-0 rounded-md border border-border bg-inset px-3 py-1.5 text-[13px] font-medium text-heading">
                  {item.value}
                </span>
              )}

              {item.kind === 'badge' && (
                <Badge
                  background={item.badgeBg!}
                  color={item.badgeColor!}
                >
                  {item.badgeLabel}
                </Badge>
              )}
            </div>
          ))}
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={() => toast.show({ title: t('Settings saved') })}
          disabled={!isLive}
        >
          <Icon name="Save" size={16} />
          {t('Save Changes')}
        </Button>
      </div>
    </div>
  )
}
