import { useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Automation Rules: trigger-based "when → then" workflow list.
 *
 *  Design-only screen (no backing collection in repository.ts), so the rule
 *  set is local static demo data — same shape as the .dc.html prototype's
 *  `rawRules`. Each icon chip carries the design's per-rule tint; the
 *  low-stock rule is the only orange one, since orange is reserved for
 *  warnings (README §7). The active/inactive toggle is local UI state, same
 *  as the prototype's `state.active`. */

interface AutomationRule {
  name: string
  desc: string
  trigger: string
  action: string
  tone: readonly [string, string]
}

const RULES: AutomationRule[] = [
  {
    name: 'Low Stock Alert',
    desc: 'Notify when parts fall below reorder level',
    trigger: 'Part stock < reorder level',
    action: 'Send notification to manager',
    tone: ['rgba(249,115,22,.1)', '#F97316'],
  },
  {
    name: 'Auto Invoice',
    desc: 'Generate invoice when job is completed',
    trigger: 'Job status = Completed',
    action: 'Create draft invoice',
    tone: ['rgba(10,94,215,.1)', '#0A5ED7'],
  },
  {
    name: 'Appointment Reminder',
    desc: 'Send SMS 24h before appointment',
    trigger: '24h before appointment',
    action: 'Send SMS to customer',
    tone: ['rgba(11,179,255,.1)', '#0BB3FF'],
  },
  {
    name: 'Overdue Follow-up',
    desc: 'Email when invoice is 7 days overdue',
    trigger: 'Invoice overdue > 7 days',
    action: 'Send email reminder',
    tone: ['rgba(100,116,139,.1)', '#64748B'],
  },
  {
    name: 'QC Notification',
    desc: 'Alert technician when QC fails',
    trigger: 'QC status = Fail',
    action: 'Assign back to technician',
    tone: ['rgba(11,31,59,.1)', '#0B1F3B'],
  },
]

// Overdue Follow-up starts off, matching the prototype's default state.
const DEFAULT_ACTIVE = [true, true, true, false, true]

export function AutomationRules() {
  const { t } = usePreferences()
  const [active, setActive] = useState<boolean[]>(DEFAULT_ACTIVE)

  return (
    <>
      <FeatureHeader
        icon="Zap"
        title={t('Automation Rules')}
        subtitle={t('Trigger-based automations')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Create Rule')}
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {RULES.map((rule, index) => {
          const on = active[index]
          const [bg, fg] = rule.tone
          return (
            <Card key={rule.name} className="flex flex-col gap-3.5 rounded-2xl p-5">
              <div className="flex items-center gap-3.5">
                <span
                  className="flex flex-shrink-0 rounded-[10px] p-2"
                  style={{ background: bg, color: fg }}
                >
                  <Icon name="Zap" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-bold text-heading">
                    {t(rule.name)}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted">{t(rule.desc)}</p>
                </div>
                <Badge
                  background={on ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                  color={on ? '#0A5ED7' : '#64748B'}
                >
                  {on ? t('Active') : t('Inactive')}
                </Badge>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={t(rule.name)}
                  onClick={() =>
                    setActive((prev) => prev.map((v, i) => (i === index ? !v : v)))
                  }
                  className={cn(
                    'relative box-content h-6 w-11 flex-shrink-0 cursor-pointer rounded-full py-2 transition-colors duration-200',
                    on ? 'bg-salis-blue' : 'bg-[#CBD5E1]'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200',
                      on ? 'start-[22px]' : 'start-0.5'
                    )}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-inset p-3 text-[13px]">
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
    </>
  )
}
