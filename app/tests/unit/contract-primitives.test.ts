import { describe, expect, it } from 'vitest'
import {
  ulid,
  halalas,
  signedHalalas,
  phone,
  email,
  plate,
  vin,
  vatNumber,
  crNumber,
  isoDate,
  isoDateTime,
  version,
  nonEmpty,
  sarToHalalas,
  halalasToSar,
  formatSar as contractFormatSar,
  parseSarToHalalas,
  HALALAS_PER_SAR,
  resourceRef,
} from '@contract'

/** Contract primitives — the shared Zod schemas that guard both the API edge
 *  and the client forms. A schema that silently accepts bad input is a server
 *  that accepts it; a schema that rejects good input is a form that cannot be
 *  submitted. Both are worse than a missing feature. */

describe('ulid', () => {
  it('accepts a valid 26-character Crockford base32 ULID', () => {
    expect(ulid.safeParse('01HX5N3KVGADWQ1JY6PXZG7RQP').success).toBe(true)
    expect(ulid.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAV').success).toBe(true)
  })

  it('rejects strings that are not 26 characters', () => {
    expect(ulid.safeParse('01HX5N3K').success).toBe(false)
    expect(ulid.safeParse('01HX5N3KVGADWQ1JY6PXZG7RQPXX').success).toBe(false)
    expect(ulid.safeParse('').success).toBe(false)
  })

  it('rejects characters outside Crockford base32 (I, L, O, U)', () => {
    // 'I' is not valid in Crockford base32
    expect(ulid.safeParse('01HX5N3KVGADWQ1IY6PXZG7RQP').success).toBe(false)
    // 'L' is not valid
    expect(ulid.safeParse('01HX5N3KVGADWQ1LY6PXZG7RQP').success).toBe(false)
    // 'O' is not valid
    expect(ulid.safeParse('01HX5N3KVGADWQ1OY6PXZG7RQP').success).toBe(false)
    // 'U' is not valid
    expect(ulid.safeParse('01HX5N3KVGADWQ1UY6PXZG7RQP').success).toBe(false)
  })

  it('rejects lowercase', () => {
    expect(ulid.safeParse('01hx5n3kvgadwq1jy6pxzg7rqp').success).toBe(false)
  })
})

describe('resourceRef', () => {
  it('accepts a ULID, a business code, and a short slug', () => {
    expect(resourceRef.safeParse('01HX5N3KVGADWQ1JY6PXZG7RQP').success).toBe(true)
    expect(resourceRef.safeParse('INV-2026-0142').success).toBe(true)
    expect(resourceRef.safeParse('A3F8B2C1').success).toBe(true)
  })

  it('rejects empty and overlong strings', () => {
    expect(resourceRef.safeParse('').success).toBe(false)
    expect(resourceRef.safeParse('x'.repeat(65)).success).toBe(false)
  })
})

describe('halalas (money)', () => {
  it('accepts non-negative integers', () => {
    expect(halalas.safeParse(0).success).toBe(true)
    expect(halalas.safeParse(184000).success).toBe(true)
    expect(halalas.safeParse(1).success).toBe(true)
  })

  it('rejects negative values', () => {
    expect(halalas.safeParse(-1).success).toBe(false)
    expect(halalas.safeParse(-184000).success).toBe(false)
  })

  it('rejects non-integers', () => {
    expect(halalas.safeParse(1.5).success).toBe(false)
    expect(halalas.safeParse(0.01).success).toBe(false)
  })

  it('rejects non-numbers', () => {
    expect(halalas.safeParse('184000').success).toBe(false)
    expect(halalas.safeParse(null).success).toBe(false)
  })
})

describe('signedHalalas', () => {
  it('accepts negative integers for credit notes', () => {
    expect(signedHalalas.safeParse(-184000).success).toBe(true)
    expect(signedHalalas.safeParse(0).success).toBe(true)
    expect(signedHalalas.safeParse(184000).success).toBe(true)
  })

  it('rejects non-integers', () => {
    expect(signedHalalas.safeParse(1.5).success).toBe(false)
  })
})

describe('sarToHalalas / halalasToSar', () => {
  it('converts SAR to halalas by multiplying by 100 and rounding', () => {
    expect(sarToHalalas(1840)).toBe(184000)
    expect(sarToHalalas(0)).toBe(0)
    expect(sarToHalalas(0.01)).toBe(1)
    expect(sarToHalalas(12450.75)).toBe(1245075)
  })

  it('rounds half-up at the last halala', () => {
    expect(sarToHalalas(0.005)).toBe(1)
    expect(sarToHalalas(0.004)).toBe(0)
  })

  it('converts halalas back to SAR', () => {
    expect(halalasToSar(184000)).toBe(1840)
    expect(halalasToSar(0)).toBe(0)
    expect(halalasToSar(1)).toBe(0.01)
    expect(halalasToSar(1245075)).toBe(12450.75)
  })

  it('round-trips without loss at whole-halala values', () => {
    for (const sar of [0, 1, 999.99, 1234.56, 842500]) {
      expect(halalasToSar(sarToHalalas(sar))).toBeCloseTo(sar, 2)
    }
  })

  it('HALALAS_PER_SAR is 100', () => {
    expect(HALALAS_PER_SAR).toBe(100)
  })
})

describe('contractFormatSar (halalas to display)', () => {
  it('formats integer halalas as SAR with comma thousands', () => {
    expect(contractFormatSar(184000)).toBe('SAR 1,840')
    expect(contractFormatSar(0)).toBe('SAR 0')
    expect(contractFormatSar(1245075)).toBe('SAR 12,450.75')
    expect(contractFormatSar(100)).toBe('SAR 1')
  })
})

describe('parseSarToHalalas', () => {
  it('reads display strings back to halalas', () => {
    expect(parseSarToHalalas('SAR 1,840')).toBe(184000)
    expect(parseSarToHalalas('SAR 12,450.75')).toBe(1245075)
    expect(parseSarToHalalas('1,840')).toBe(184000)
    expect(parseSarToHalalas('0')).toBe(0)
  })

  it('reads a raw number as SAR and converts to halalas', () => {
    expect(parseSarToHalalas(1840)).toBe(184000)
    expect(parseSarToHalalas(0)).toBe(0)
  })

  it('returns 0 for a dash or empty string', () => {
    expect(parseSarToHalalas('')).toBe(0)
    expect(parseSarToHalalas('—')).toBe(0)
    expect(parseSarToHalalas('-')).toBe(0)
  })

  it('throws on non-finite numeric input', () => {
    expect(() => parseSarToHalalas(Number.NaN)).toThrow()
    expect(() => parseSarToHalalas(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('throws on unparseable strings', () => {
    expect(() => parseSarToHalalas('pending')).toThrow()
    expect(() => parseSarToHalalas('SAR abc')).toThrow()
  })
})

describe('phone', () => {
  it('accepts Saudi phone numbers in the design format', () => {
    expect(phone.safeParse('+966 50 123 4567').success).toBe(true)
    expect(phone.safeParse('+966501234567').success).toBe(true)
    expect(phone.safeParse('050 123 4567').success).toBe(true)
  })

  it('rejects strings that are too short or too long', () => {
    expect(phone.safeParse('123').success).toBe(false)
    expect(phone.safeParse('+966 50 123 4567 ext 12345678').success).toBe(false)
  })

  it('rejects strings with letters', () => {
    expect(phone.safeParse('+966 CALL ME').success).toBe(false)
  })
})

describe('email', () => {
  it('accepts standard email addresses', () => {
    expect(email.safeParse('ahmed@salisauto.test').success).toBe(true)
    expect(email.safeParse('user@example.com').success).toBe(true)
  })

  it('rejects invalid email formats', () => {
    expect(email.safeParse('not-an-email').success).toBe(false)
    expect(email.safeParse('').success).toBe(false)
    expect(email.safeParse('@missing.local').success).toBe(false)
  })

  it('rejects addresses over 254 characters', () => {
    const long = 'a'.repeat(250) + '@b.co'
    expect(email.safeParse(long).success).toBe(false)
  })
})

describe('plate', () => {
  it('accepts Saudi plates in the design format', () => {
    expect(plate.safeParse('RUH 4821').success).toBe(true)
    expect(plate.safeParse('JED 9012').success).toBe(true)
    expect(plate.safeParse('DMM 3357').success).toBe(true)
  })

  it('rejects plates that are too short or too long', () => {
    expect(plate.safeParse('AB').success).toBe(false)
    expect(plate.safeParse('A'.repeat(17)).success).toBe(false)
  })
})

describe('vin', () => {
  it('accepts a valid 17-character VIN', () => {
    expect(vin.safeParse('1HGCM82633A004352').success).toBe(true)
    expect(vin.safeParse('WVWZZZ3CZWE123456').success).toBe(true)
  })

  it('strips spaces before validation (design-style spacing)', () => {
    expect(vin.safeParse('1HG CM82 633A 0043 52').success).toBe(true)
  })

  it('uppercases before validation', () => {
    expect(vin.safeParse('1hgcm82633a004352').success).toBe(true)
  })

  it('rejects I, O, Q characters (not valid in VINs)', () => {
    expect(vin.safeParse('1HGCM82633I004352').success).toBe(false)
    expect(vin.safeParse('1HGCM82633O004352').success).toBe(false)
    expect(vin.safeParse('1HGCM82633Q004352').success).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(vin.safeParse('1HGCM82633A00435').success).toBe(false)
    expect(vin.safeParse('1HGCM82633A0043521').success).toBe(false)
    expect(vin.safeParse('').success).toBe(false)
  })
})

describe('vatNumber', () => {
  it('accepts a 15-digit Saudi VAT number starting and ending with 3', () => {
    expect(vatNumber.safeParse('300000000000003').success).toBe(true)
    expect(vatNumber.safeParse('312345678901233').success).toBe(true)
  })

  it('rejects numbers not starting with 3', () => {
    expect(vatNumber.safeParse('200000000000003').success).toBe(false)
  })

  it('rejects numbers not ending with 3', () => {
    expect(vatNumber.safeParse('300000000000001').success).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(vatNumber.safeParse('3000000000003').success).toBe(false)
    expect(vatNumber.safeParse('3000000000000003').success).toBe(false)
  })
})

describe('crNumber', () => {
  it('accepts a 10-digit commercial registration number', () => {
    expect(crNumber.safeParse('1234567890').success).toBe(true)
  })

  it('rejects wrong length or non-digits', () => {
    expect(crNumber.safeParse('123456789').success).toBe(false)
    expect(crNumber.safeParse('12345678901').success).toBe(false)
    expect(crNumber.safeParse('12345678AB').success).toBe(false)
  })
})

describe('isoDate', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isoDate.safeParse('2026-07-28').success).toBe(true)
    expect(isoDate.safeParse('2025-01-01').success).toBe(true)
  })

  it('rejects other date formats', () => {
    expect(isoDate.safeParse('07/28/2026').success).toBe(false)
    expect(isoDate.safeParse('Jul 28, 2026').success).toBe(false)
    expect(isoDate.safeParse('2026-7-28').success).toBe(false)
  })
})

describe('isoDateTime', () => {
  it('accepts ISO 8601 with offset', () => {
    expect(isoDateTime.safeParse('2026-07-28T10:30:00+03:00').success).toBe(true)
    expect(isoDateTime.safeParse('2026-07-28T10:30:00Z').success).toBe(true)
  })

  it('rejects a bare date', () => {
    expect(isoDateTime.safeParse('2026-07-28').success).toBe(false)
  })
})

describe('version', () => {
  it('accepts non-negative integers', () => {
    expect(version.safeParse(0).success).toBe(true)
    expect(version.safeParse(1).success).toBe(true)
    expect(version.safeParse(42).success).toBe(true)
  })

  it('rejects negative, fractional, or non-numbers', () => {
    expect(version.safeParse(-1).success).toBe(false)
    expect(version.safeParse(1.5).success).toBe(false)
    expect(version.safeParse('1').success).toBe(false)
  })
})

describe('nonEmpty', () => {
  it('accepts non-empty trimmed strings', () => {
    expect(nonEmpty.safeParse('hello').success).toBe(true)
    expect(nonEmpty.safeParse('a').success).toBe(true)
  })

  it('rejects whitespace-only strings after trimming', () => {
    expect(nonEmpty.safeParse('').success).toBe(false)
    expect(nonEmpty.safeParse('   ').success).toBe(false)
    expect(nonEmpty.safeParse('\t\n').success).toBe(false)
  })
})
