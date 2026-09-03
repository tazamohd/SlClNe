import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Panel, FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { Textarea } from '@/components/ui/Textarea'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { StageFrame } from './StageFrame'
import { stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'
import { useStageDraft } from './useStageDraft'

const FUEL_LEVELS = ['1/4', '1/2', '3/4', 'Full'] as const
const BELONGINGS = ['Sunglasses', 'Phone charger', 'Documents', 'Spare key', 'GPS device'] as const

interface CheckInDraft {
  odometer: string
  fuel: string
  issues: string
  belongings: readonly string[]
}

const EMPTY_DRAFT: CheckInDraft = { odometer: '', fuel: '1/2', issues: '', belongings: [] }

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
 *  request as its reason, so the trail says what was found on arrival.
 *
 *  What is typed is kept per job card until the check-in completes, so a
 *  receiver called away mid-form comes back to it rather than to a blank. */
export function WorkshopCheckIn() {
  const { t } = usePreferences()
  const { fieldHidden } = useSession()
  const stage = useJobStage()
  const customers = useCollection('customers')
  const vehicles = useCollection('vehicles')
  const { draft, setDraft, saved, clear } = useStageDraft('check-in', stage.job?.id, EMPTY_DRAFT)

  const isLoading = customers.isLoading || vehicles.isLoading
  const loadError = customers.error || vehicles.error
  const refetch = () => {
    void customers.refetch()
    void vehicles.refetch()
  }

  const hideContact = fieldHidden('Customer contact details')
  const job = stage.job
  const customer = (customers.data ?? []).find((row) => row.name === job?.cust)
  const vehicle = (vehicles.data ?? []).find((row) => row.make === job?.veh && row.owner === job?.cust)

  const patch = (change: Partial<CheckInDraft>) => setDraft((prev) => ({ ...prev, ...change }))

  async function complete() {
    const noted = [
      draft.odometer.trim() ? `odometer ${draft.odometer.trim()}` : '',
      `fuel ${draft.fuel}`,
      draft.belongings.length ? `belongings: ${draft.belongings.join(', ')}` : '',
      draft.issues.trim(),
    ]
      .filter(Boolean)
      .join(' · ')
    const done = await stage.advance('inspection', { reason: noted.slice(0, 500), then: '/workshop-inspection' })
    if (done) clear()
  }

  return (
    <StageFrame
      icon="ClipboardCheck"
      title="Vehicle Check-In"
      stage={stage}
      notice={saved ? <DraftSaved /> : null}
      actions={
        <Button
          size="lg"
          icon="Check"
          loading={stage.status === 'saving'}
          loadingLabel="Saving..."
          disabled={stageBusy(stage)}
          onClick={() => void complete()}
        >
          {t('Complete Check-In')}
        </Button>
      }
    >
      {isLoading ? (
        <Loading label="Loading check-in..." />
      ) : loadError ? (
        <ErrorState description={loadError.message} onRetry={refetch} />
      ) : (
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

          <Panel icon="ClipboardList" title={t('Check-In Details')}>
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="odometer" className="font-action text-[11px] font-medium text-heading">
                    {t('Odometer Reading')}
                  </label>
                  <Input
                    id="odometer"
                    value={draft.odometer}
                    onChange={(e) => patch({ odometer: e.target.value })}
                    dir="ltr"
                    inputMode="numeric"
                    className="font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-action text-[11px] font-medium text-heading">{t('Fuel Level')}</span>
                  <ChipGroup label={t('Fuel Level')} className="min-h-[44px]">
                    {FUEL_LEVELS.map((level) => (
                      <Chip
                        key={level}
                        label={t(level)}
                        selected={draft.fuel === level}
                        onToggle={() => patch({ fuel: level })}
                        className="min-h-[36px]"
                      />
                    ))}
                  </ChipGroup>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="issues" className="font-action text-[11px] font-medium text-heading">
                  {t('Reported Issues')}
                </label>
                <Textarea
                  id="issues"
                  rows={3}
                  value={draft.issues}
                  onChange={(e) => patch({ issues: e.target.value })}
                  placeholder={t('Describe reported issues...')}
                  className="text-[13px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-action text-[11px] font-medium text-heading">{t('Personal Belongings')}</span>
                <ChipGroup label={t('Personal Belongings')} multi>
                  {BELONGINGS.map((item) => (
                    <Chip
                      key={item}
                      multi
                      label={t(item)}
                      selected={draft.belongings.includes(item)}
                      onToggle={() =>
                        patch({
                          belongings: draft.belongings.includes(item)
                            ? draft.belongings.filter((entry) => entry !== item)
                            : [...draft.belongings, item],
                        })
                      }
                      className="min-h-[36px]"
                    />
                  ))}
                </ChipGroup>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-action text-[11px] font-medium text-heading">{t('Exterior Condition')}</span>
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
        </div>
      )}
    </StageFrame>
  )
}

/** The autosave caption. Polite live region: it changes often and must not
 *  interrupt what the receiver is typing. */
export function DraftSaved() {
  const { t } = usePreferences()
  return (
    <p role="status" className="flex items-center gap-1.5 text-[12px] text-muted">
      <Icon name="CloudCheck" size={13} className="text-salis-blue" />
      {t('Draft saved')}
    </p>
  )
}
