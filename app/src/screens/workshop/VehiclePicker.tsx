import { useId, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Select } from '@/components/ui/Select'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MAKES,
  formatVehicleLabel,
  generationFor,
  manualFor,
  modelNamed,
  modelsFor,
  twinsFor,
  yearsFor,
  type VehicleModel,
} from './vehicle-catalog'

export interface VehicleChoice {
  make: string
  model: string
  year?: number
  trim?: string
  generation?: string
}

/** Make → Model → Year → Trim, from the catalogue.
 *
 *  A vehicle typed free-hand arrives a dozen ways ("Camry", "camry 2018",
 *  "TOYOTA CAMRY GLE"), and every variant is a different row to search for
 *  later. The picker writes one canonical label ("Toyota Camry GLE 2018") into
 *  the text field beside it, and the text field stays editable for the car
 *  the catalogue does not know.
 *
 *  Once a year is chosen it also says which generation the car is (the
 *  factory code a parts desk asks for), which other badge it is sold under,
 *  and which factory owner's manual it shipped with. */
export function VehiclePicker({
  onPick,
  className,
}: {
  onPick: (label: string, choice: VehicleChoice) => void
  className?: string
}) {
  const { t } = usePreferences()
  const id = useId()
  const [make, setMake] = useState('')
  const [modelName, setModelName] = useState('')
  const [year, setYear] = useState('')
  const [trim, setTrim] = useState('')

  const models = useMemo(() => modelsFor(make), [make])
  const model: VehicleModel | undefined = useMemo(() => modelNamed(make, modelName), [make, modelName])
  const years = useMemo(() => (model ? yearsFor(model) : []), [model])
  const yearNumber = year ? Number(year) : undefined
  const generation = model && yearNumber ? generationFor(model, yearNumber) : undefined
  const trims = generation?.trims ?? []
  const manual = model && yearNumber ? manualFor(model, yearNumber) : undefined

  function emit(next: { make?: string; model?: string; year?: string; trim?: string }) {
    const chosen = {
      make: next.make ?? make,
      model: next.model ?? modelName,
      year: next.year ?? year,
      trim: next.trim ?? trim,
    }
    if (!chosen.make || !chosen.model) return
    const chosenYear = chosen.year ? Number(chosen.year) : undefined
    const entry = modelNamed(chosen.make, chosen.model)
    onPick(formatVehicleLabel({ make: chosen.make, model: chosen.model, trim: chosen.trim, year: chosenYear }), {
      make: chosen.make,
      model: chosen.model,
      year: chosenYear,
      trim: chosen.trim || undefined,
      generation: entry && chosenYear ? generationFor(entry, chosenYear)?.code : undefined,
    })
  }

  const field = 'flex flex-col gap-1'
  const label = 'font-action text-[11px] font-medium text-heading'

  return (
    <fieldset className={cn('m-0 flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-inset/60 p-3', className)}>
      <legend className="px-1 font-action text-[11px] font-semibold uppercase tracking-[.06em] text-muted">
        {t('Pick from the catalogue')}
      </legend>

      <div className="grid grid-cols-2 gap-2.5">
        <div className={field}>
          <label htmlFor={`${id}-make`} className={label}>{t('Make')}</label>
          <Select
            id={`${id}-make`}
            size="md"
            value={make}
            onChange={(event) => {
              const next = event.target.value
              setMake(next)
              setModelName('')
              setYear('')
              setTrim('')
            }}
          >
            <option value="">{t('Choose...')}</option>
            {MAKES.map((entry) => (
              <option key={entry.name} value={entry.name}>{entry.name}</option>
            ))}
          </Select>
        </div>

        <div className={field}>
          <label htmlFor={`${id}-model`} className={label}>{t('Model')}</label>
          <Select
            id={`${id}-model`}
            size="md"
            value={modelName}
            disabled={!make}
            onChange={(event) => {
              const next = event.target.value
              setModelName(next)
              setYear('')
              setTrim('')
              emit({ model: next, year: '', trim: '' })
            }}
          >
            <option value="">{t('Choose...')}</option>
            {models.map((entry) => (
              <option key={entry.model} value={entry.model}>{entry.model}</option>
            ))}
          </Select>
        </div>

        <div className={field}>
          <label htmlFor={`${id}-year`} className={label}>{t('Model year')}</label>
          <Select
            id={`${id}-year`}
            size="md"
            value={year}
            disabled={!model}
            dir="ltr"
            onChange={(event) => {
              const next = event.target.value
              setYear(next)
              setTrim('')
              emit({ year: next, trim: '' })
            }}
          >
            <option value="">{t('Choose...')}</option>
            {years.map((entry) => (
              <option key={entry} value={String(entry)}>{entry}</option>
            ))}
          </Select>
        </div>

        <div className={field}>
          <label htmlFor={`${id}-trim`} className={label}>{t('Trim')}</label>
          <Select
            id={`${id}-trim`}
            size="md"
            value={trim}
            disabled={trims.length === 0}
            dir="ltr"
            onChange={(event) => {
              const next = event.target.value
              setTrim(next)
              emit({ trim: next })
            }}
          >
            <option value="">{trims.length ? t('Any') : '—'}</option>
            {trims.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </Select>
        </div>
      </div>

      {model && generation ? (
        <dl className="m-0 flex flex-col gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <dt className="font-action font-medium text-muted">{t('Generation')}</dt>
            <dd className="m-0 font-mono text-heading" dir="ltr">
              {generation.code ?? '—'} · {generation.from}–{generation.to ?? t('present')}
            </dd>
          </div>

          {twinsFor(model).length ? (
            <div className="flex flex-col gap-1">
              <dt className="font-action font-medium text-muted">{t('Same car under another badge')}</dt>
              {twinsFor(model).map((twin) => (
                <dd key={`${twin.make}-${twin.model}`} className="m-0 flex items-start gap-1.5 text-body">
                  <Icon name="GitBranch" size={13} className="mt-0.5 flex-shrink-0 text-salis-blue" />
                  <span>
                    <span className="font-semibold text-heading">{twin.make} {twin.model}</span>
                    {' — '}
                    {t(twin.note)}
                  </span>
                </dd>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-1.5 text-muted">
              <Icon name="GitBranch" size={13} className="mt-0.5 flex-shrink-0" />
              <span>{t('No platform twin in another brand is recorded for this model.')}</span>
            </div>
          )}

          {manual ? (
            <div className="flex flex-col gap-0.5">
              <dt className="font-action font-medium text-muted">{t('Original owner’s manual')}</dt>
              <dd className="m-0 text-body" dir="ltr">
                {manual.title}
              </dd>
              <dd className="m-0 text-muted">
                {t('Issued by')} {manual.publisher}
                {manual.portal ? (
                  <>
                    {' · '}
                    <a
                      href={manual.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[24px] items-center gap-1 text-salis-blue"
                    >
                      {t('Owner portal')}
                      <Icon name="ExternalLink" size={12} />
                    </a>
                  </>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </fieldset>
  )
}
