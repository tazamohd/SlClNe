import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCreate, type RowOf } from '@/data/useCollection'
import { RepositoryError } from '@/data/repository'
import { isValidTimeLabel, parseTimeLabel } from './schedule'

type Appointment = RowOf<'appointments'>

interface Fields {
  customerName: string
  vehicleLabel: string
  plate: string
  serviceLabel: string
  scheduledDate: string
  timeLabel: string
  durationMins: string
  bay: string
  technicianName: string
}

const EMPTY: Fields = {
  customerName: '',
  vehicleLabel: '',
  plate: '',
  serviceLabel: '',
  scheduledDate: '',
  timeLabel: '',
  durationMins: '60',
  bay: '',
  technicianName: '',
}

/** Books an appointment.
 *
 *  The write goes through the ordinary collection create, so the server runs
 *  the bay double-booking rule (`rules/appointment.ts`) and answers with a
 *  `rule_violated` this form surfaces rather than swallows — §36, the calendar
 *  is not the boundary. `startMinute` is derived from the time label with the
 *  same `minuteOfDay` the server uses, so the overlap the form sends and the
 *  overlap the server checks are the same arithmetic. */
export function AppointmentForm({
  open,
  onClose,
  defaultDate,
}: {
  open: boolean
  onClose: () => void
  defaultDate?: string
}) {
  const { t } = usePreferences()
  const create = useCreate('appointments')
  const [fields, setFields] = useState<Fields>({ ...EMPTY, scheduledDate: defaultDate ?? '' })
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setFields({ ...EMPTY, scheduledDate: defaultDate ?? '' })
    setError(null)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const label = fields.timeLabel.trim()
    if (!isValidTimeLabel(label)) {
      setError(t('Enter a time like 9:00 AM.'))
      return
    }
    const startMinute = parseTimeLabel(label)
    if (startMinute === null) {
      setError(t('Enter a time like 9:00 AM.'))
      return
    }
    const duration = Number(fields.durationMins)
    if (!Number.isFinite(duration) || duration < 5) {
      setError(t('Enter a duration of at least 5 minutes.'))
      return
    }
    for (const [key, message] of [
      ['customerName', t('Enter the customer name.')],
      ['vehicleLabel', t('Enter the vehicle.')],
      ['plate', t('Enter the plate.')],
      ['serviceLabel', t('Enter the service.')],
      ['scheduledDate', t('Pick a date.')],
      ['bay', t('Pick a bay.')],
    ] as const) {
      if (!fields[key].trim()) {
        setError(message)
        return
      }
    }

    try {
      await create.mutateAsync({
        input: {
          scheduledDate: fields.scheduledDate,
          timeLabel: label,
          startMinute,
          durationMins: duration,
          customerName: fields.customerName.trim(),
          vehicleLabel: fields.vehicleLabel.trim(),
          plate: fields.plate.trim(),
          serviceLabel: fields.serviceLabel.trim(),
          bay: fields.bay.trim(),
          technicianName: fields.technicianName.trim() || undefined,
        } as unknown as Partial<Appointment>,
      })
      reset()
      onClose()
    } catch (cause) {
      setError(cause instanceof RepositoryError ? cause.message : String(cause))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('New Appointment')}
      icon="CalendarPlus"
      variant="crud"
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button type="submit" form="appointment-form" disabled={create.isPending}>
            {t(create.isPending ? 'Saving...' : 'Book Appointment')}
          </Button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={submit} className="flex flex-col gap-3">
        <Field label={t('Customer')} value={fields.customerName} onChange={(v) => set('customerName', v)} />
        <Field label={t('Vehicle')} value={fields.vehicleLabel} onChange={(v) => set('vehicleLabel', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Plate')} value={fields.plate} onChange={(v) => set('plate', v)} ltr />
          <Field label={t('Service')} value={fields.serviceLabel} onChange={(v) => set('serviceLabel', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Date')} type="date" value={fields.scheduledDate} onChange={(v) => set('scheduledDate', v)} ltr />
          <Field label={t('Time')} value={fields.timeLabel} onChange={(v) => set('timeLabel', v)} placeholder="9:00 AM" ltr />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Bay')} value={fields.bay} onChange={(v) => set('bay', v)} />
          <Field label={t('Duration (min)')} type="number" value={fields.durationMins} onChange={(v) => set('durationMins', v)} ltr />
        </div>
        <Field label={t('Technician')} value={fields.technicianName} onChange={(v) => set('technicianName', v)} />

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-salis-orange">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  ltr,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  ltr?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-action text-[12px] font-medium text-body">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        dir={ltr ? 'ltr' : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-heading outline-none focus-visible:border-salis-blue focus-visible:ring-2 focus-visible:ring-[rgba(10,94,215,.2)]"
      />
    </label>
  )
}
