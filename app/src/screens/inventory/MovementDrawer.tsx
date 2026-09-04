import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { ReadOnlyNotice } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Figure, FigureStrip } from './InventoryBits'
import type { MovementApi } from './movementApi'
import { MOVEMENT_KINDS, type MovementKind } from './movementKinds'
import { MovementHistory } from './MovementHistory'
import { MovementModal } from './MovementModal'
import { reservedOf, type Part } from './partFields'
import { ReservationModal, type ReservationAction } from './ReservationModal'

/* ─────────────────────────────────────────────────────── the part's ledger */

/** The desktop ledger hangs off the end edge as a full-height side panel.
 *
 *  It is a `Modal`, not the `Drawer` primitive, on purpose: the movement and
 *  reservation forms open on top of it, and `Modal` keeps a stack so only the
 *  top-most dialog answers Escape and Tab. `Drawer` listens on the document
 *  for both, so under a nested form Escape would close the ledger beneath it
 *  and Tab would pull focus out of the form. The classes below turn the
 *  centred panel into a side sheet; on a phone the same dialog is a bottom
 *  sheet a thumb can reach. */
const SIDE_PANEL =
  'ms-auto -me-6 -my-6 h-[calc(100%+3rem)] max-h-none w-full max-w-[640px] rounded-none border-y-0 border-e-0'

/** One part: what it holds, what may be done to it, and everything that has
 *  moved it. Opened from a row, and the only place a movement starts. */
export function PartLedgerDrawer({
  part,
  api,
  unavailable,
  mayEdit,
  onClose,
}: {
  part: Part
  api: MovementApi | null
  unavailable: string | null
  mayEdit: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [kind, setKind] = useState<MovementKind | null>(null)
  // The reservation flow is a hold on `parts.reserved`, not a ledger entry, so
  // it opens its own dialog rather than one of the movement kinds.
  const [reservation, setReservation] = useState<ReservationAction | null>(null)
  const reserved = reservedOf(part)

  return (
    <>
      <Modal
        open
        onClose={onClose}
        variant="data"
        icon="Package"
        title={part.name}
        description={t('Stock on hand, and every movement that produced it.')}
        meta={
          <span dir="ltr" className="font-mono">
            {part.sku}
          </span>
        }
        sheet={isMobile ? 'bottom' : undefined}
        className={isMobile ? undefined : SIDE_PANEL}
        footer={
          <Button variant="subtle" size="lg" onClick={onClose}>
            {t('Close')}
          </Button>
        }
      >
        <FigureStrip part={part}>
          <Figure label="Reorder At" value={part.reorder} />
        </FigureStrip>

        {mayEdit ? (
          api ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {MOVEMENT_KINDS.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setKind(option)}
                  >
                    <Icon name={option.icon} size={14} />
                    {t(option.label)}
                  </Button>
                ))}
              </div>
              {/* Reserved and Available, honestly: a reservation holds stock
                  against open work without moving it, so consumption and
                  transfer see less than is on hand until the hold is released
                  or drawn down. */}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setReservation('reserve')}>
                  <Icon name="Lock" size={14} />
                  {t('Reserve Stock')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(reserved ?? 0) <= 0}
                  onClick={() => setReservation('release')}
                >
                  <Icon name="RotateCcw" size={14} />
                  {t('Release Reservation')}
                </Button>
                {(reserved ?? 0) <= 0 ? (
                  <span className="text-[13px] text-muted">
                    {t('No stock is reserved on this part.')}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <ReadOnlyNotice
              message={t(unavailable ?? 'The stock ledger cannot be reached from this build.')}
            />
          )
        ) : (
          <ReadOnlyNotice
            message={t('Read-only — your role can view stock but not record movements.')}
          />
        )}

        <MovementHistory
          part={part}
          api={api}
          unavailable={unavailable}
          emptyTitle="No movements recorded"
          emptyDescription="Nothing has moved this part's stock since it was opened."
          reconcile
        />
      </Modal>

      {kind && api ? (
        <MovementModal
          kind={kind}
          part={part}
          api={api}
          onClose={() => setKind(null)}
          onRecorded={() => setKind(null)}
        />
      ) : null}

      {reservation && api ? (
        <ReservationModal
          action={reservation}
          part={part}
          api={api}
          onClose={() => setReservation(null)}
          onDone={() => setReservation(null)}
        />
      ) : null}
    </>
  )
}
