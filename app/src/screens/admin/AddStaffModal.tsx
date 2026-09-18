import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  ServerValidationError,
  useUnsavedChangesGuard,
  useZodForm,
  type FieldOption,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  createStaff,
  RepositoryError,
  STAFF_ROLES,
  actionFailureMessage,
  type CreateStaffResult,
  type StaffRole,
} from './api'

/** Display labels for the roles this form may create. `hr`, `qc` and
 *  `parts` read as initialisms or single words that benefit from spelling
 *  out; the rest already read fine title-cased. */
const ROLE_LABEL: Record<string, string> = {
  manager: 'Manager',
  advisor: 'Service Advisor',
  technician: 'Technician',
  qc: 'Quality Control',
  parts: 'Parts',
  accountant: 'Accountant',
  hr: 'HR',
  frontdesk: 'Front Desk',
  callcenter: 'Call Center',
  procurement: 'Procurement',
}

const ROLE_OPTIONS: readonly FieldOption[] = STAFF_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABEL[role] ?? role,
}))

const MODE_OPTIONS: readonly FieldOption[] = [
  { value: 'direct', label: 'Create now (I will hand them the password)' },
  { value: 'invite', label: 'Email an invite to set their own password' },
]

const staffForm = z
  .object({
    name: z.string().min(1, 'Please enter a name.'),
    email: z.string().email('Please enter a valid email address.'),
    role: z.string().min(1, 'Please choose a role.'),
    mode: z.enum(['direct', 'invite']),
  })
  .refine((values) => (STAFF_ROLES as readonly string[]).includes(values.role), {
    message: 'Please choose a valid role.',
    path: ['role'],
  })
  .transform((values) => ({
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    role: values.role as StaffRole,
    mode: values.mode,
  }))

type StaffFormValues = z.input<typeof staffForm>

function serverFieldError(cause: unknown): ServerValidationError | undefined {
  if (!(cause instanceof RepositoryError) || !cause.field) return undefined
  return new ServerValidationError({ [cause.field]: cause.message })
}

/** Add a staff account — `POST /admin/staff` (Phase A). Two outcomes, shown
 *  in place of the form rather than as a toast that vanishes: a direct
 *  create hands back a password that exists nowhere else and must be relayed
 *  by hand, and an invite hands back nothing secret at all. Either is worth
 *  more than 3.2 seconds on screen. */
export function AddStaffModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  /** Called once a staff account was actually created, so the list can
   *  reload. Not called for a cancelled or failed attempt. */
  onCreated: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const [result, setResult] = useState<CreateStaffResult | null>(null)

  const form = useZodForm({
    schema: staffForm,
    initial: { name: '', email: '', role: '', mode: 'direct' } as StaffFormValues,
    async onSubmit(values) {
      try {
        const created = await createStaff(values)
        setResult(created)
        onCreated()
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw new Error(actionFailureMessage(cause, 'Could not create that account.'))
      }
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending && !result)

  const close = async () => {
    if (form.pending) return
    if (!result && !(await confirmDiscard())) return
    setResult(null)
    form.reset({ name: '', email: '', role: '', mode: 'direct' } as StaffFormValues)
    onClose()
  }

  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password)
      toast.show({ title: t('Copied to clipboard') })
    } catch {
      // Clipboard access can be denied; the password stays selectable text.
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon="UserPlus"
      title={t(result ? 'Account created' : 'Add Staff')}
      dismissible={!form.pending}
      footer={
        result ? (
          <Button size="lg" onClick={() => void close()}>
            {t('Done')}
          </Button>
        ) : (
          <>
            <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
              {t('Cancel')}
            </Button>
            <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
              {form.pending ? t('Creating...') : t('Add Staff')}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="flex flex-col gap-3.5">
          {result.mode === 'direct' ? (
            <>
              <p className="text-[13px] text-muted">
                {t('This password is shown once. Relay it to')} <strong>{result.user.name}</strong>{' '}
                {t('directly — it is not stored anywhere in plain text and cannot be shown again.')}
              </p>
              <div className="flex items-center gap-2 rounded border border-border bg-inset px-3.5 py-2.5">
                <code className="flex-1 select-all break-all font-mono text-sm text-heading">
                  {result.temporaryPassword}
                </code>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => void copyPassword(result.temporaryPassword)}
                >
                  <Icon name="Copy" size={14} />
                  {t('Copy')}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-muted">
              {t('An invite email is on its way to')} <strong>{result.user.email}</strong>.{' '}
              {t('The link expires')} {new Date(result.expiresAt).toLocaleString()}.
            </p>
          )}
        </div>
      ) : (
        <Form form={form}>
          <FormErrorSummary />
          <Field name="name" label="Full Name" required />
          <Field name="email" label="Email" kind="email" required />
          <Field name="role" label="Role" kind="select" options={ROLE_OPTIONS} required />
          <Field name="mode" label="How should they sign in the first time?" kind="select" options={MODE_OPTIONS} />
          <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
            {t('Add Staff')}
          </button>
        </Form>
      )}
    </Modal>
  )
}
