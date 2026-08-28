import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Toggle } from '@/components/ui/Toggle'
import { MobileCard, MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'



interface RuleDef {
  name: string
  desc: string
  trigger: string
  action: string
  iconBg: string
  iconFg: string
}

const FIXTURE_RULES: RuleDef[] = [
  {
    name: 'Low Stock Alert',
    desc: 'Notify when parts fall below reorder level',
    trigger: 'Part stock < reorder level',
    action: 'Send notification to manager',
    iconBg: 'var(--tint-orange)',
    iconFg: 'var(--salis-orange)',
  },
  {
    name: 'Auto Invoice',
    desc: 'Generate invoice when job is completed',
    trigger: 'Job status = Completed',
    action: 'Create draft invoice',
    iconBg: 'var(--tint-blue)',
    iconFg: 'var(--salis-blue)',
  },
  {
    name: 'Appointment Reminder',
    desc: 'Send SMS 24h before appointment',
    trigger: '24h before appointment',
    action: 'Send SMS to customer',
    iconBg: 'var(--tint-bright)',
    iconFg: 'var(--salis-blue-bright)',
  },
  {
    name: 'Overdue Follow-up',
    desc: 'Email when invoice is 7 days overdue',
    trigger: 'Invoice overdue > 7 days',
    action: 'Send email reminder',
    iconBg: 'var(--tint-neutral)',
    iconFg: 'var(--text-muted)',
  },
  {
    name: 'QC Notification',
    desc: 'Alert technician when QC fails',
    trigger: 'QC status = Fail',
    action: 'Assign back to technician',
    iconBg: 'var(--tint-navy)',
    iconFg: 'var(--salis-navy)',
  },
]

export function AutomationRules() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const [active, setActive] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: false,
    4: true,
  })

  const toggleRule = (idx: number) =>
    setActive((prev) => ({ ...prev, [idx]: !prev[idx] }))

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Zap" size={28} />
          </span>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">
              {t('Automation Rules')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        <Button disabled={!isLive}>
          <Icon name="Plus" size={16} />
          {t('Create Rule')}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {FIXTURE_RULES.map((rule, idx) => {
          const on = active[idx] !== false

          return isMobile ? (
            <MobileCard key={rule.name}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex flex-shrink-0 rounded-[10px] p-2"
                      style={{ background: rule.iconBg, color: rule.iconFg }}
                    >
                      <Icon name="Zap" size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-heading">{t(rule.name)}</span>
                      <p className="m-0 mt-0.5 text-[11px] text-muted">{t(rule.desc)}</p>
                    </div>
                  </div>
                }
                trailing={
                  <Toggle on={on} onToggle={() => toggleRule(idx)} label={t(rule.name)} disabled={!isLive} />
                }
              />
              <MobileCardRow label={t('When')} value={t(rule.trigger)} />
              <MobileCardRow label={t('Then')} value={t(rule.action)} />
            </MobileCard>
          ) : (
            <Card
              key={rule.name}
              className="rounded-2xl p-5 transition-all hover:border-[rgba(10,94,215,.3)]"
            >
              <div className="mb-3.5 flex items-center gap-3.5">
                <span
                  className="flex rounded-[10px] p-2"
                  style={{ background: rule.iconBg, color: rule.iconFg }}
                >
                  <Icon name="Zap" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 text-base font-bold text-heading">{t(rule.name)}</h3>
                  <p className="m-0 mt-0.5 text-xs text-muted">{t(rule.desc)}</p>
                </div>
                <Badge
                  background={
                    on ? 'var(--tint-blue)' : 'var(--tint-neutral)'
                  }
                  color={on ? 'var(--salis-blue)' : 'var(--text-muted)'}
                >
                  {on ? t('Active') : t('Inactive')}
                </Badge>
                <Toggle on={on} onToggle={() => toggleRule(idx)} label={t(rule.name)} disabled={!isLive} />
              </div>

              <div className="flex items-center gap-2 rounded-[10px] border border-border bg-inset p-3 text-[13px]">
                <span className="font-semibold text-salis-blue">{t('When')}</span>
                <span className="text-body">{t(rule.trigger)}</span>
                <Icon name="ArrowRight" size={14} className="flex-shrink-0 text-muted" />
                <span className="font-semibold text-salis-orange">{t('Then')}</span>
                <span className="text-body">{t(rule.action)}</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
