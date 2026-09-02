import { useState } from 'react'
import { Modal, DESTRUCTIVE_BUTTON, useModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useToast } from '@/components/ui/Toast'
import { useCreate, useUpdate, useDelete, type RowOf } from '@/data/useCollection'
import { RepositoryError } from '@/data/repository'
import { rowId } from '../registry/writes'
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

/** Books or edits an appointment.
 *
 *  The write goes through the ordinary collection create/update, so the server
 *  runs the bay double-booking rule (`rules/appointment.ts`) and answers with a
 *  `rule_violated` this form surfaces rather than swallows. `startMinute` is
 *  derived from the time label with the same `minuteOfDay` the server uses, so
 *  the overlap the form sends and the overlap the server checks are the same
 *  arithmetic. */
export function AppointmentForm({
  open,
  onClose,
  defaultDate,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  defaultDate?: string
  existingRecord?: Appointment
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('appointments')
  const update = useUpdate('appointments')
  const remove = useDelete('appointments')
  const editing = Boolean(existingRecord)

  const [fields, setFields] = useState<Fields>(() => {
    if (existingRecord) {
      return {
        customerName: existingRecord.cust ?? '',
        vehicleLabel: existingRecord.veh ?? '',
        plate: existingRecord.plate ?? '',
        serviceLabel: existingRecord.svc ?? '',
        scheduledDate: '',
        timeLabel: existingRecord.time ?? '',
        durationMins: existingRecord.mins != null ? String(existingRecord.mins) : '60',
        bay: existingRecord.bay ?? '',
        technicianName: existingRecord.tech ?? '',
      }
    }
    return { ...EMPTY, scheduledDate: defaultDate ?? '' }
  })
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

    const input = {
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
    } as unknown as Partial<Appointment>

    try {
      if (existingRecord) {
        const id = rowId(existingRecord)
        if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
        await update.mutateAsync({ id, patch: input })
      } else {
        await create.mutateAsync({ input })
      }
      toast.show({
        title: t(editing ? 'Appointment updated' : 'Appointment booked'),
        description: fields.customerName.trim(),
      })
      reset()
      onClose()
    } catch (cause) {
      setError(cause instanceof RepositoryError ? cause.message : String(cause))
    }
  }

  const handleDelete = async () => {
    const id = rowId(existingRecord)
    if (!id) return
    const agreed = await confirm({
      title: t('Delete Appointment?'),
      description: `${existingRecord?.cust ?? ''}`,
      icon: 'Trash2',
      confirmLabel: t('Delete'),
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    try {
      await remove.mutateAsync({ id })
    } catch (cause) {
      toast.show({
        title: t('Delete failed'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
      return
    }
    toast.show({ title: t('Appointment deleted'), description: existingRecord?.cust ?? '' })
    onClose()
  }

  const busy = create.isPending || update.isPending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(editing ? 'Edit Appointment' : 'New Appointment')}
      icon={editing ? 'Pencil' : 'CalendarPlus'}
      variant="crud"
      footer={
        <>
          {editing && rowId(existingRecord) ? (
            <Button
              variant="subtle"
              onClick={() => void handleDelete()}
              disabled={busy}
              className={DESTRUCTIVE_BUTTON}
            >
              <Icon name="Trash2" size={14} />
              {t('Delete')}
            </Button>
          ) : null}
          <div className="flex-1" />
          <Button variant="subtle" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button type="submit" form="appointment-form" disabled={busy}>
            {t(busy ? 'Saving...' : editing ? 'Save Changes' : 'Book Appointment')}
          </Button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={submit} className="flex flex-col gap-3">
        <FormField label={t('Customer')} value={fields.customerName} onChange={(v) => set('customerName', v)} />
        <FormField label={t('Vehicle')} value={fields.vehicleLabel} onChange={(v) => set('vehicleLabel', v)} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t('Plate')} value={fields.plate} onChange={(v) => set('plate', v)} ltr />
          <FormField label={t('Service')} value={fields.serviceLabel} onChange={(v) => set('serviceLabel', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t('Date')} type="date" value={fields.scheduledDate} onChange={(v) => set('scheduledDate', v)} ltr />
          <FormField label={t('Time')} value={fields.timeLabel} onChange={(v) => set('timeLabel', v)} placeholder="9:00 AM" ltr />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t('Bay')} value={fields.bay} onChange={(v) => set('bay', v)} />
          <FormField label={t('Duration (min)')} type="number" value={fields.durationMins} onChange={(v) => set('durationMins', v)} ltr />
        </div>
        <FormField label={t('Technician')} value={fields.technicianName} onChange={(v) => set('technicianName', v)} />

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-salis-orange">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}

function FormField({
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
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        dir={ltr ? 'ltr' : undefined}
        onChange={(event) => onChange(event.target.value)}
        inputSize="sm"
      />
    </label>
  )
}
