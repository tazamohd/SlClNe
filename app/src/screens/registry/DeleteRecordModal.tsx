import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DESTRUCTIVE_BUTTON, Modal } from '@/components/ui/Modal'
import { usePreferences } from '@/providers/PreferencesProvider'
import { RepositoryError } from '@/data/useCollection'

/** The delete confirmation for the registry screens.
 *
 *  Not `useModal().confirm` — that takes one English source string and
 *  translates it whole, which is right for a fixed sentence and wrong here.
 *  This dialog has to name the record and say how many other rows are affected,
 *  and a count interpolated into a translated sentence breaks the moment Arabic
 *  reorders it. So the copy is composed from translated fragments with the
 *  record's own identity left alone, and the caller passes the consequences as
 *  nodes rather than as a string it hopes survives translation.
 *
 *  What it says has to be true. The API soft-deletes: the row stops appearing
 *  in lists and stays in the audit trail, and nothing referring to it is
 *  touched. The design's own delete modal says "will be permanently removed",
 *  which is not what the server does, so this does not say that. */
export function DeleteRecordModal({
  open,
  onClose,
  /** What is being deleted, e.g. "Customer". English source string. */
  kind,
  /** The record's own identity — a name or a plate. Never translated. */
  name,
  /** Latin identifier: pinned LTR and monospaced. */
  code,
  /** What else changes. One `<li>` per consequence, each already translated. */
  consequences,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  kind: string
  name: string
  code?: boolean
  consequences?: ReactNode
  onConfirm: () => Promise<void>
}) {
  const { t } = usePreferences()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    if (pending) return
    setError(null)
    onClose()
  }

  const confirm = async () => {
    setPending(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (cause) {
      setError(
        cause instanceof RepositoryError || cause instanceof Error
          ? cause.message
          : t('The request failed.')
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      variant="lifecycle"
      layout="centred"
      icon="Trash2"
      destructive
      dismissible={!pending}
      title={`${t('Delete')} ${t(kind)}?`}
      description={
        <>
          <span dir={code ? 'ltr' : undefined} className={code ? 'font-mono font-semibold' : 'font-semibold'}>
            {name}
          </span>{' '}
          {t('is removed from lists. The record is kept in the audit trail.')}
        </>
      }
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={close} disabled={pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={confirm} disabled={pending} className={DESTRUCTIVE_BUTTON}>
            {pending ? t('Deleting...') : t('Delete')}
          </Button>
        </>
      }
    >
      {consequences ? (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-start text-[13px] text-muted">
          {consequences}
        </ul>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-3 py-2 text-start text-[13px] text-body"
        >
          <Icon name="AlertTriangle" size={14} className="mt-0.5 flex-shrink-0 text-salis-orange" />
          {error}
        </p>
      ) : null}
    </Modal>
  )
}

/** One consequence line. `count` is rendered as a numeral outside the sentence,
 *  because interpolating it in would break the Arabic word order. */
export function Consequence({ count, label }: { count?: number; label: string }) {
  const { t } = usePreferences()
  return (
    <li className="flex items-center gap-2">
      <Icon name="CircleDot" size={12} className="flex-shrink-0 text-muted" />
      {count === undefined ? null : (
        <span dir="ltr" className="font-mono font-semibold text-heading">
          {count}
        </span>
      )}
      <span>{t(label)}</span>
    </li>
  )
}
