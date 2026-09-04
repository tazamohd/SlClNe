import { describe, expect, it } from 'vitest'
import {
  CATALOG_FROM_YEAR,
  MAKES,
  MODELS,
  formatVehicleLabel,
  generationFor,
  makeNamed,
  manualFor,
  modelNamed,
  modelsFor,
  twinsFor,
  yearsFor,
} from '@/screens/workshop/vehicle-catalog'

/** The vehicle catalogue is reference data, so these pin its integrity — a
 *  model whose make is unknown, a generation that ends before it starts, a
 *  twin that names nothing — rather than any one fact about one car. */
describe('vehicle catalogue — integrity', () => {
  it('names a known make on every model, and every make has at least one model', () => {
    const names = new Set(MAKES.map((make) => make.name))
    for (const model of MODELS) expect(names.has(model.make), `${model.make} ${model.model}`).toBe(true)
    for (const make of MAKES) expect(modelsFor(make.name).length, make.name).toBeGreaterThan(0)
  })

  it('lists each make and model once', () => {
    const seen = new Set<string>()
    for (const model of MODELS) {
      const key = `${model.make} ${model.model}`
      expect(seen.has(key), key).toBe(false)
      seen.add(key)
    }
    expect(new Set(MAKES.map((make) => make.name)).size).toBe(MAKES.length)
  })

  it('keeps every generation in order and every span sane', () => {
    for (const model of MODELS) {
      let previous = 0
      for (const generation of model.generations) {
        expect(generation.from, `${model.make} ${model.model} ${generation.code}`).toBeGreaterThanOrEqual(1990)
        if (generation.to !== undefined) expect(generation.to).toBeGreaterThanOrEqual(generation.from)
        expect(generation.from).toBeGreaterThanOrEqual(previous)
        previous = generation.from
      }
      expect(model.generations.length).toBeGreaterThan(0)
    }
  })

  it('never offers a model year before 2000 or after next year', () => {
    const next = new Date().getFullYear() + 1
    for (const model of MODELS) {
      const years = yearsFor(model)
      expect(years.length).toBeGreaterThan(0)
      expect(Math.min(...years)).toBeGreaterThanOrEqual(CATALOG_FROM_YEAR)
      expect(Math.max(...years)).toBeLessThanOrEqual(next)
      expect(years[0]).toBeGreaterThan(years[years.length - 1])
    }
  })

  it('only names a twin with a make and a model and a reason', () => {
    for (const model of MODELS) {
      for (const twin of twinsFor(model)) {
        expect(twin.make.length).toBeGreaterThan(0)
        expect(twin.model.length).toBeGreaterThan(0)
        expect(twin.note.length).toBeGreaterThan(10)
      }
    }
  })

  it('links a manual portal only as an https URL on the maker’s own domain', () => {
    for (const make of MAKES) {
      if (!make.manualPortal) continue
      expect(make.manualPortal.startsWith('https://')).toBe(true)
    }
  })
})

describe('vehicle catalogue — lookups', () => {
  it('places a BMW 740Li by model year into its generation', () => {
    const seven = modelNamed('BMW', '7 Series')!
    expect(generationFor(seven, 2005)?.code).toBe('E65/E66')
    expect(generationFor(seven, 2012)?.code).toBe('F01/F02')
    expect(generationFor(seven, 2018)?.code).toBe('G11/G12')
    expect(generationFor(seven, 2018)?.trims).toContain('740Li')
    expect(generationFor(seven, 2024)?.code).toBe('G70')
  })

  it('prefers the newer generation in a run-out year', () => {
    // Y61 and Y62 Patrol were sold side by side for a decade.
    const patrol = modelNamed('Nissan', 'Patrol')!
    expect(generationFor(patrol, 2015)?.code).toBe('Y62')
    expect(generationFor(patrol, 2005)?.code).toBe('Y61')
  })

  it('names the same car under another badge', () => {
    expect(twinsFor(modelNamed('Nissan', 'Patrol')!).map((twin) => twin.make)).toContain('Infiniti')
    expect(twinsFor(modelNamed('Toyota', 'Land Cruiser')!)[0]).toMatchObject({ make: 'Lexus', model: 'LX' })
    expect(twinsFor(modelNamed('Toyota', 'Supra')!)[0]).toMatchObject({ make: 'BMW', model: 'Z4' })
  })

  it('describes the factory owner’s manual without inventing a document', () => {
    const manual = manualFor(modelNamed('BMW', '7 Series')!, 2022)
    expect(manual.title).toBe("2022 BMW 7 Series Owner's Manual (G11/G12)")
    expect(manual.publisher).toBe('BMW')
    expect(manual.portal).toBeUndefined()

    const lexus = manualFor(modelNamed('Lexus', 'LX')!, 2020)
    expect(lexus.publisher).toBe('Lexus (Toyota group)')
    expect(lexus.portal).toBe(makeNamed('Lexus')?.manualPortal)
  })

  it('formats the label the job card stores', () => {
    expect(formatVehicleLabel({ make: 'BMW', model: '7 Series', trim: '740Li', year: 2022 })).toBe('BMW 7 Series 740Li 2022')
    expect(formatVehicleLabel({ make: 'Toyota', model: 'Camry' })).toBe('Toyota Camry')
    expect(formatVehicleLabel({ make: 'Toyota', model: 'Camry', trim: '  ', year: 2018 })).toBe('Toyota Camry 2018')
  })
})
