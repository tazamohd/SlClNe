import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

const QC_CHECKS: ChecklistItem[] = [
  { label: 'Repair Verified' },
  { label: 'Fluids Topped' },
  { label: 'Test Drive' },
  { label: 'Cleaned' },
  { label: 'Quality Check' },
  { label: 'Documents Ready' },
]

const WORK_DONE = [
  { icon: 'Wrench', label: 'Brake Pads (Front)', kind: 'Repair', sar: 535 },
  { icon: 'Cog', label: 'Oil Filter (Toyota)', kind: 'Maintenance', sar: 270 },
  { icon: 'SearchCheck', label: 'Multi-Point Inspection', kind: null, sar: 170 },
]

const ASSIGNED_TECH = 'Yousef Al-Otaibi'

/** Stage 5 — quality gate before the vehicle goes back to the customer.
 *
 *  Segregation of duties: "Perform repair" and "Pass quality check" are a
 *  high-risk pair in the SOD table, so the technician who did the work must not
 *  be the one signing it off. The design didn't enforce that; this does. */
export function WorkshopQC() {
  const { t, rtl } = usePreferences()
  const { role, roleMeta } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const done = countChecked(QC_CHECKS, checked)
  const complete = done === QC_CHECKS.length

  // A technician may view this screen (jobcards: "ve") but must never pass QC
  // on their own work.
  const sodConflict = role === 'technician'

  function approve() {
    if (sodConflict) {
      toast.show({
        title: t('Segregation of duties'),
        description: t('The technician who performed the repair cannot pass its quality check.'),
        error: true,
      })
      return
    }
    if (!complete) {
      toast.show({
        title: t('Incomplete checklist'),
        description: `${done}/${QC_CHECKS.length} ${t('checks recorded')}`,
        error: true,
      })
      return
    }
    toast.show({ title: t('Quality Check'), description: t('QC approved') })
    setTimeout(() => navigate('/workshop-signature'), 700)
  }

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
          <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ShieldCheck" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[26px] font-black text-heading">{t('Quality Check')}</h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            JC-A3F8B2C1 · Toyota Camry 2022
          </p>
        </div>
      </div>

      <WorkflowStepper current="Quality Check" />

      {sodConflict ? (
        <Card className="flex items-start gap-3 border-salis-orange/40 p-4">
          <span className="flex flex-shrink-0 rounded bg-[rgba(249,115,22,.12)] p-2 text-salis-orange">
            <Icon name="AlertTriangle" size={18} />
          </span>
          <div>
            <p className="font-action text-sm font-semibold text-heading">
              {t('Segregation of duties')}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {t('The technician who performed the repair cannot pass its quality check.')}{' '}
              {t('Ask a QC inspector or the branch manager to sign off.')}
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          icon="ClipboardCheck"
          title={t('QC Checklist')}
          action={
            <span className="font-mono text-[11px] font-semibold text-muted">
              {done}/{QC_CHECKS.length}
            </span>
          }
        >
          <Checklist
            items={QC_CHECKS}
            checked={checked}
            onToggle={(label) => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
          />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel icon="FileText" title={t('Work Summary')}>
            <div className="flex flex-col gap-2.5">
              {WORK_DONE.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-[13px]">
                  <Icon name={item.icon} size={14} className="text-muted" />
                  <span className="flex-1 text-body">
                    {t(item.label)}
                    {item.kind ? ` — ${t(item.kind)}` : ''}
                  </span>
                  <Money sar={item.sar} className="font-semibold text-heading" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel icon="User" title={t('Assigned Technician')}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-salis-gradient text-[13px] font-bold text-white">
                {ASSIGNED_TECH[0]}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-heading">{ASSIGNED_TECH}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {sodConflict
                    ? `${t('Signed in as')} ${roleMeta.label}`
                    : t('Assigned Technician')}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          size="lg"
          className="border-salis-orange text-salis-orange hover:bg-salis-orange hover:text-white"
          onClick={() => {
            toast.show({ title: t('Returned to repair'), description: t('Repair In Progress') })
            setTimeout(() => navigate('/job-detail'), 700)
          }}
        >
          <Icon name="RotateCcw" size={16} />
          {t('Return to Repair')}
        </Button>
        <Button size="lg" onClick={approve} disabled={sodConflict}>
          <Icon name="CheckCircle" size={16} />
          {t('Approve QC')}
        </Button>
      </div>
    </div>
  )
}
