import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { FigureStrip } from './InventoryBits'
import type { Part } from './partFields'

/** The page's one primary action, when no row has been chosen yet.
 *
 *  A movement is always recorded from a part's ledger — that is where the
 *  figures it is checked against live — so this only asks which part, then
 *  hands over to the ledger. The scanner path skips it: a search that lands on
 *  one SKU opens that ledger directly on Enter. */
export function RecordMovementModal({
  parts,
  initialSku,
  onClose,
  onPick,
}: {
  parts: readonly Part[]
  initialSku?: string
  onClose: () => void
  onPick: (part: Part) => void
}) {
  const { t } = usePreferences()
  const [sku, setSku] = useState(initialSku ?? parts[0]?.sku ?? '')
  const selected = parts.find((part) => part.sku === sku) ?? null

  return (
    <Modal
      open
      onClose={onClose}
      variant="actions"
      icon="ArrowUpDown"
      title="Record Movement"
      description={t('Choose the part first. Its ledger opens with every movement the API can record.')}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button size="lg" disabled={!selected} onClick={() => selected && onPick(selected)}>
            {t('Open Ledger')}
          </Button>
        </>
      }
    >
      {parts.length === 0 ? (
        <EmptyState
          icon="Package"
          title={t('No parts tracked yet')}
          description={t('Add parts to start tracking stock.')}
        />
      ) : (
        <label className="flex flex-col gap-1">
          <span className="font-action text-xs font-medium text-heading">{t('Part')}</span>
          <Select
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            aria-label={t('Part')}
            className="h-12 w-full bg-inset font-action text-sm"
          >
            {parts.map((part) => (
              <option key={part.sku} value={part.sku}>
                {`${part.name} — ${part.sku}`}
              </option>
            ))}
          </Select>
        </label>
      )}
      {selected ? <FigureStrip part={selected} /> : null}
    </Modal>
  )
}
