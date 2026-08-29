import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface TemplateDef {
  name: string
  type: string
  desc: string
  icon: string
  lastEdit: string
  typeBg: string
  typeColor: string
}

export function Templates() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const templates: TemplateDef[] = [
    {
      name: t('Tax Invoice'),
      type: t('Invoice'),
      desc: t('ZATCA-compliant tax invoice template'),
      icon: 'Receipt',
      lastEdit: 'Jul 20, 2026',
      typeBg: 'var(--tint-blue)',
      typeColor: 'var(--salis-blue)',
    },
    {
      name: t('Service Estimate'),
      type: t('Estimate'),
      desc: t('Detailed service cost estimate for customers'),
      icon: 'FileText',
      lastEdit: 'Jul 18, 2026',
      typeBg: 'var(--tint-bright)',
      typeColor: 'var(--salis-blue-bright)',
    },
    {
      name: t('Job Card Print'),
      type: t('Job Card'),
      desc: t('Workshop job card for printing'),
      icon: 'ClipboardList',
      lastEdit: 'Jul 15, 2026',
      typeBg: 'var(--tint-orange)',
      typeColor: 'var(--salis-orange)',
    },
    {
      name: t('Welcome Email'),
      type: t('Email'),
      desc: t('New customer welcome email'),
      icon: 'Mail',
      lastEdit: 'Jul 12, 2026',
      typeBg: 'var(--tint-navy)',
      typeColor: 'var(--salis-navy)',
    },
    {
      name: t('Appointment Reminder'),
      type: t('SMS'),
      desc: t('SMS template for appointment reminders'),
      icon: 'MessageSquare',
      lastEdit: 'Jul 10, 2026',
      typeBg: 'var(--tint-neutral)',
      typeColor: 'var(--text-muted)',
    },
    {
      name: t('Delivery Receipt'),
      type: t('Receipt'),
      desc: t('Vehicle delivery acknowledgment receipt'),
      icon: 'Car',
      lastEdit: 'Jul 8, 2026',
      typeBg: 'var(--tint-blue)',
      typeColor: 'var(--salis-blue)',
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="FileCode" size={28} />
          </span>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">
              {t('Templates')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        <Button disabled={!isLive}>
          <Icon name="Plus" size={16} />
          {t('Create Template')}
        </Button>
      </div>

      <div
        className={
          isMobile
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-2 gap-5 lg:grid-cols-3'
        }
      >
        {templates.map((tpl) => (
          <Card
            key={tpl.name}
            className="cursor-pointer overflow-hidden rounded-2xl p-0 transition-all hover:border-salis-blue/[.3] hover:shadow-lg"
          >
            {/* Preview area */}
            <div className="flex h-[120px] items-center justify-center bg-inset">
              <Icon name={tpl.icon} size={40} className="text-muted opacity-40" />
            </div>

            <div className="p-4">
              <div className="mb-2">
                <Badge background={tpl.typeBg} color={tpl.typeColor}>
                  {tpl.type}
                </Badge>
              </div>
              <h2 className="m-0 text-[15px] font-bold text-heading">{tpl.name}</h2>
              <p className="m-0 mt-1 text-xs text-muted">{tpl.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-faint">{tpl.lastEdit}</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    aria-label={t('Edit')}
                    disabled={!isLive}
                    className="flex h-7 w-7 items-center justify-center rounded-md border-none bg-salis-blue/[.06] text-salis-blue transition-colors hover:bg-salis-blue/[.12] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                  >
                    <Icon name="Edit" size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('Copy')}
                    onClick={() => toast.show({ title: t('Template copied') })}
                    disabled={!isLive}
                    className="flex h-7 w-7 items-center justify-center rounded-md border-none bg-salis-blue/[.06] text-salis-blue transition-colors hover:bg-salis-blue/[.12] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                  >
                    <Icon name="Copy" size={13} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
