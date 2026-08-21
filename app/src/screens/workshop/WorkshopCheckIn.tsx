import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Panel, FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { StageNotice, stageBusy, stageLabel } from './StageNotice'
import { useJobStage } from './useJobStage'

const FUEL_LEVELS = ['1/4', '1/2', '3/4', 'Full'] as const
const BELONGINGS = ['Sunglasses', 'Phone charger', 'Documents', 'Spare key', 'GPS device'] as const

/** Stage 1 of the workshop loop — receive the vehicle and open the job card.
 *
 *  Customer contact details are hidden from technicians, QC and suppliers
 *  (FIELD_RULES), so phone and email redact rather than disappear: the receiver
 *  can still see the fields exist and that someone else holds them.
 *
 *  Completing check-in is `POST /jobs/:id/transition` to `inspection`. It used
 *  to be a toast and a 700ms `setTimeout` into the next screen, which is the
 *  precise shape §60 forbids: the stage appeared to advance and nothing
 *  recorded it. The reported issues and the odometer reading travel with the
 *  request as its reason, so the trail says what was found on arrival. */
export function WorkshopCheckIn() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const stage = useJobStage()
  const { data: customers = [] } = useCollection('customers')
  const { data: vehicles = [] } = useCollection('vehicles')

  const [odometer, setOdometer] = useState('')
  const [fuel, setFuel] = useState<string>('1/2')
  const [issues, setIssues] = useState('')
  const [belongings, setBelongings] = useState<readonly string[]>([])

  const hideContact = fieldHidden('Customer contact details')
  const job = stage.job
  const customer = customers.find((row) => row.name === job?.cust)
  const vehicle = vehicles.find((row) => row.make === job?.veh && row.owner === job?.cust)

  async function complete() {
    const noted = [
      odometer.trim() ? `odometer ${odometer.trim()}` : '',
      `fuel ${fuel}`,
      belongings.length ? `belongings: ${belongings.join(', ')}` : '',
      issues.trim(),
    ]
      .filter(Boolean)
      .join(' · ')
    await stage.advance('inspection', { reason: noted.slice(0, 500), then: '/workshop-inspection' })
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
            <Icon name="ClipboardCheck" size={isMobile ? 20 : 28} />
          </div>
        </div>
        <div>
          <h1 className={isMobile ? 'font-display text-xl font-black text-heading' : 'font-display text-[26px] font-black text-heading'}>
            {t('Vehicle Check-In')}
          </h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            {job ? `${job.id} · ${job.cust}` : '—'}
          </p>
        </div>
      </div>

      <WorkflowStepper current={stage.stageLabel} />

      <StageNotice stage={stage} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Panel icon="User" title={t('Customer Information')}>
            <FieldGrid>
              <ReadField label={t('Name')} value={job?.cust ?? '—'} emphasis />
              <ReadField
                label={t('Phone')}
                value={customer?.phone ?? '—'}
                code
                emphasis
                redacted={hideContact}
              />
              <ReadField
                label={t('Email')}
                value={(customer as { email?: string } | undefined)?.email ?? '—'}
                redacted={hideContact}
              />
              <ReadField label={t('Total Visits')} value={customer?.vehicles ?? '—'} />
            </FieldGrid>
          </Panel>

          <Panel icon="Car" title={t('Vehicle Information')}>
            <FieldGrid>
              <ReadField label={t('Make & Model')} value={job?.veh ?? '—'} emphasis />
              <ReadField label={t('Plate')} value={vehicle?.plate ?? '—'} code emphasis />
              <ReadField label={t('Status')} value={t(vehicle?.status ?? '—')} />
              <ReadField
                label="VIN"
                value={(vehicle as { vin?: string } | undefined)?.vin ?? '—'}
                code
              />
            </FieldGrid>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel icon="ClipboardList" title={t('Check-In Details')}>
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="odometer"
                    className="font-action text-[11px] font-medium text-heading"
                  >
                    {t('Odometer Reading')}
                  </label>
                  <input
                    id="odometer"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    dir="ltr"
                    inputMode="numeric"
                    className="box-border h-10 rounded border border-border bg-inset px-3 font-mono text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-action text-[11px] font-medium text-heading">
                    {t('Fuel Level')}
                  </span>
                  <ChipGroup label={t('Fuel Level')} className="h-10">
                    {FUEL_LEVELS.map((level) => (
                      <Chip
                        key={level}
                        label={t(level)}
                        selected={fuel === level}
                        onToggle={() => setFuel(level)}
                      />
                    ))}
                  </ChipGroup>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="issues"
                  className="font-action text-[11px] font-medium text-heading"
                >
                  {t('Reported Issues')}
                </label>
                <textarea
                  id="issues"
                  rows={3}
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  placeholder={t('Describe reported issues...')}
                  className="box-border w-full resize-y rounded border border-border bg-inset px-3 py-2.5 font-ui text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-action text-[11px] font-medium text-heading">
                  {t('Personal Belongings')}
                </span>
                <ChipGroup label={t('Personal Belongings')} multi>
                  {BELONGINGS.map((item) => (
                    <Chip
                      key={item}
                      multi
                      label={t(item)}
                      selected={belongings.includes(item)}
                      onToggle={() =>
                        setBelongings((prev) =>
                          prev.includes(item)
                            ? prev.filter((entry) => entry !== item)
                            : [...prev, item]
                        )
                      }
                    />
                  ))}
                </ChipGroup>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-action text-[11px] font-medium text-heading">
                  {t('Exterior Condition')}
                </span>
                {/* A live-looking dropzone that swallowed every click was the
                    worst of both worlds. There is no object storage and no
                    upload endpoint yet (handoff README §10), so the control
                    says so instead of accepting photos it would drop. */}
                <div
                  className="flex h-[120px] flex-col items-center justify-center gap-1.5 rounded border-[1.5px] border-dashed border-border bg-inset px-4 text-center text-faint"
                  aria-disabled="true"
                >
                  <Icon name="Camera" size={22} />
                  <span className="text-xs">
                    {t('Photo capture needs file storage, which this build has no endpoint for.')}
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <Button
            size="lg"
            className="w-full"
            onClick={() => void complete()}
            disabled={stageBusy(stage)}
          >
            <Icon name="Check" size={18} />
            {t(stageLabel(stage, 'Complete Check-In'))}
          </Button>
        </div>
      </div>
    </div>
  )
}
