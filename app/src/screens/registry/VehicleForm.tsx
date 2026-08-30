import { useMemo } from 'react'
import { z } from 'zod'
import { vehicleCreate } from '@contract'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DESTRUCTIVE_BUTTON, Modal, useModal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
  type FieldOption,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import {
  RepositoryError,
  useCollection,
  useCreate,
  useUpdate,
  useDelete,
  type RowOf,
} from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, rowId, serverFieldError } from './writes'

/** Add / Edit Vehicle.
 *
 *  The design bundle has no vehicle modal, so the field set is taken from the
 *  two places that do describe a vehicle: the registry's own columns (Plate,
 *  Make & Model, Owner, Mileage, Status) and `VehicleDetail`, which shows the
 *  VIN. Everything is validated by `vehicleCreate` from `packages/contract` —
 *  including the VIN's 17 characters and its excluded letters, which is exactly
 *  the kind of rule that gets typed differently the second time it is written.
 *
 *  Owner is a picker over existing customers rather than free text, because the
 *  vehicle carries both a `customerId` and a denormalised `ownerName` and the
 *  two must agree. Picking resolves both; leaving it empty sends neither, which
 *  the contract allows for a vehicle whose owner has no record yet. */
type Vehicle = RowOf<'vehicles'>
type Customer = RowOf<'customers'>

/** Columns the API returns that the fixture-derived row type does not name. */
type VehicleFields = Vehicle & {
  vin?: string | null
  mileageKm?: number
  customerId?: string | null
}

const STATUS_OPTIONS: readonly FieldOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'service', label: 'In Service' },
  { value: 'inactive', label: 'Inactive' },
]

/** Kilometres as typed — `42,180` or `42180`, never a decimal. */
const KILOMETRES = /^\d{1,3}(,\d{3})*$|^\d+$/

/** Built over the customer list so the owner picker can resolve one choice into
 *  the two columns the vehicle stores. A factory rather than a constant for
 *  that reason alone. */
function vehicleForm(owners: readonly { value: string; name: string; id?: string }[]) {
  return z
    .object({
      plate: z.string(),
      makeModel: z.string(),
      ownerRef: z.string(),
      mileage: z.string().refine((v) => v.trim() === '' || KILOMETRES.test(v.trim()), {
        message: 'not a whole number of kilometres',
      }),
      vin: z.string(),
      status: z.string(),
    })
    .transform((values) => {
      const owner = owners.find((o) => o.value === values.ownerRef)
      const mileage = values.mileage.replace(/,/g, '').trim()
      const vin = values.vin.trim()
      return {
        plate: values.plate.trim(),
        makeModel: values.makeModel.trim(),
        mileageKm: mileage ? Number(mileage) : 0,
        status: values.status || 'active',
        ...(owner ? { ownerName: owner.name } : {}),
        ...(owner?.id ? { customerId: owner.id } : {}),
        ...(vin ? { vin } : {}),
      }
    })
    .pipe(vehicleCreate)
}

type VehicleFormValues = z.input<ReturnType<typeof vehicleForm>>

export function VehicleFormModal({
  open,
  onClose,
  /** Absent to create, present to edit. */
  vehicle,
}: {
  open: boolean
  onClose: () => void
  vehicle?: VehicleFields
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('vehicles')
  const update = useUpdate('vehicles')
  const remove = useDelete('vehicles')
  const { data: customers = [] } = useCollection('customers')
  const editing = Boolean(vehicle)

  /** A customer is addressed by its ULID when the API issued one, and by name
   *  against the fixtures, which have no ids at all.
   *
   *  The vehicle's current owner is added even when the customer list has not
   *  arrived yet — it is fetched, and the modal renders before it lands. Without
   *  this the picker would open empty on an edit, and saving would have quietly
   *  removed the owner the record already had. */
  const owners = useMemo(() => {
    const list = customers.map((customer: Customer) => {
      const id = rowId(customer)
      return { value: id ?? customer.name, name: customer.name, id }
    })
    const current = vehicle?.customerId ?? vehicle?.owner
    if (current && vehicle?.owner && !list.some((o) => o.value === current)) {
      list.unshift({ value: current, name: vehicle.owner, id: vehicle.customerId ?? undefined })
    }
    return list
  }, [customers, vehicle?.customerId, vehicle?.owner])

  const schema = useMemo(() => vehicleForm(owners), [owners])

  // Read from the record, not from the list — the list is asynchronous and the
  // form's initial values are captured once, at mount.
  const initialOwner = vehicle?.customerId ?? (vehicle?.owner || '')

  const form = useZodForm({
    schema,
    initial: {
      plate: vehicle?.plate ?? '',
      makeModel: vehicle?.make ?? '',
      ownerRef: initialOwner,
      mileage: vehicle?.mileageKm !== undefined ? String(vehicle.mileageKm) : (vehicle?.mileage ?? '').replace(/[^\d]/g, ''),
      vin: vehicle?.vin ?? '',
      status: vehicle?.status ?? 'active',
    } satisfies VehicleFormValues,
    async onSubmit(values) {
      try {
        if (vehicle) {
          const id = rowId(vehicle)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Vehicle>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Vehicle>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Vehicle updated' : 'Vehicle added'),
        description: values.plate,
      })
      onClose()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)

  const close = async () => {
    if (form.pending) return
    if (!(await confirmDiscard())) return
    onClose()
  }

  const handleDelete = async () => {
    const id = rowId(vehicle)
    if (!id) return
    const agreed = await confirm({
      title: t('Delete Vehicle?'),
      description: `${vehicle?.plate ?? ''}`,
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
    toast.show({ title: t('Vehicle deleted'), description: vehicle?.plate ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Car'}
      title={t(editing ? 'Edit Vehicle' : 'Add New Vehicle')}
      dismissible={!busy}
      footer={
        <>
          {editing && rowId(vehicle) ? (
            <Button
              variant="subtle"
              size="lg"
              onClick={() => void handleDelete()}
              disabled={busy}
              className={DESTRUCTIVE_BUTTON}
            >
              <Icon name="Trash2" size={14} />
              {t('Delete')}
            </Button>
          ) : null}
          <div className="flex-1" />
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={busy}>
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Vehicle')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="plate" label="Plate" required placeholder={t('RUH 4821')} />
        <Field name="makeModel" label="Make & Model" required placeholder={t('Toyota Camry 2022')} />
        <Field
          name="ownerRef"
          label="Owner"
          kind="select"
          options={owners.map((owner) => ({ value: owner.value, label: owner.name }))}
          placeholder={t('No owner on record')}
        />
        <Field name="mileage" label="Mileage" placeholder="42180" hint="Kilometres on the odometer." />
        <Field name="vin" label="VIN" hint="Optional. 17 characters." />
        <Field name="status" label="Status" kind="select" options={STATUS_OPTIONS} required />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Vehicle')}
        </button>
      </Form>
    </Modal>
  )
}
