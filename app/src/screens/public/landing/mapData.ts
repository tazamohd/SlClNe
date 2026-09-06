/** Geometry for the AI-era map scene, lifted from the `SALIS AUTO last` artifact's
 *  `data-map` attribute. Illustrative regional shapes and city markers — coarse on
 *  purpose, and never a customer location.
 *
 *  Coordinates are [longitude, latitude]. The scene projects them itself. */

/** Ring 0 is Riyadh, 1 the rest of the Kingdom, 2 the Gulf, 3 the wider region.
 *  Scroll progress lights them in that order. */
export type CityRing = 0 | 1 | 2 | 3

export const MAP_STEP = 0.9

/** Land outlines, tested point-in-polygon to decide where a dot belongs. */
export const MAP_POLYS: readonly (readonly (readonly [number, number])[])[] = [
    [[34.8, 29.3], [37, 29.9], [39, 32], [41.5, 31.3], [44.5, 29.2], [47.9, 29.9], [48.6, 28.5], [49.5, 27], [50.2, 26.4], [51.6, 25.2], [51.2, 24.6], [52.6, 24.2], [54.4, 24.4], [56.2, 26.2], [56.5, 24.8], [58.6, 23.6], [59.8, 22.5], [58.8, 20.6], [57.8, 19], [56.1, 17.9], [54, 17], [52.2, 16.4], [49.4, 14.6], [45.2, 13], [43.4, 12.7], [42.8, 14.8], [42.3, 16.8], [40.8, 19.6], [39.1, 22.3], [38.6, 24.4], [36.9, 26.2], [35.5, 28]],
    [[34.5, 29.5], [34.9, 32.9], [35.9, 34.6], [36.5, 36.8], [41, 37.1], [42.4, 37.3], [44.8, 37.1], [46.1, 35], [47.7, 32.4], [48.5, 30], [47.9, 29.9], [44.5, 29.2], [41.5, 31.3], [39, 32], [37, 29.9]],
    [[25, 31.6], [31, 31.5], [34.2, 31.2], [34.9, 29.4], [34.2, 27.8], [33.5, 27], [35, 24.5], [36.9, 22], [31.5, 22], [25, 22]],
    [[44.8, 37.1], [48.5, 38.5], [53, 37], [56, 37.5], [61.2, 36.6], [61, 31], [61.6, 25.2], [57.3, 25.7], [56.3, 27.1], [54, 26.6], [51.5, 27.9], [50, 30.2], [48.5, 30], [47.7, 32.4], [46.1, 35]],
]

export const MAP_CITIES: readonly { id: string; lon: number; lat: number; ring: CityRing }[] = [
  { id: 'riyadh', lon: 46.7, lat: 24.7, ring: 0 },
  { id: 'jeddah', lon: 39.2, lat: 21.5, ring: 1 },
  { id: 'dammam', lon: 50.1, lat: 26.4, ring: 1 },
  { id: 'madinah', lon: 39.6, lat: 24.5, ring: 1 },
  { id: 'abha', lon: 42.5, lat: 18.2, ring: 1 },
  { id: 'kuwait', lon: 48, lat: 29.4, ring: 2 },
  { id: 'manama', lon: 50.6, lat: 26.2, ring: 2 },
  { id: 'doha', lon: 51.5, lat: 25.3, ring: 2 },
  { id: 'abudhabi', lon: 54.4, lat: 24.5, ring: 2 },
  { id: 'dubai', lon: 55.3, lat: 25.2, ring: 2 },
  { id: 'muscat', lon: 58.5, lat: 23.6, ring: 2 },
  { id: 'amman', lon: 35.9, lat: 31.9, ring: 3 },
  { id: 'cairo', lon: 31.2, lat: 30, ring: 3 },
  { id: 'baghdad', lon: 44.4, lat: 33.3, ring: 3 },
]

export const MAP_LINKS: readonly (readonly [string, string])[] = [
  ['riyadh', 'jeddah'],
  ['riyadh', 'dammam'],
  ['riyadh', 'madinah'],
  ['riyadh', 'abha'],
  ['riyadh', 'kuwait'],
  ['dammam', 'manama'],
  ['manama', 'doha'],
  ['doha', 'abudhabi'],
  ['abudhabi', 'dubai'],
  ['dubai', 'muscat'],
  ['madinah', 'amman'],
  ['amman', 'cairo'],
  ['kuwait', 'baghdad'],
]
