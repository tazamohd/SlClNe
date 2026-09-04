import { g, type VehicleModel } from './types'

/** Hyundai, Kia and Genesis — one group, so nearly every model has a twin. */
export const KOREAN: readonly VehicleModel[] = [
  // ── Hyundai ───────────────────────────────────────────────────────────
  {
    make: 'Hyundai', model: 'Sonata', body: 'sedan',
    generations: [g('EF', 1998, 2005), g('NF', 2005, 2010), g('YF', 2011, 2014), g('LF', 2015, 2019), g('DN8', 2020, undefined, ['GL', 'GLS', 'Smart', 'N Line'])],
    twins: [{ make: 'Kia', model: 'K5', note: 'The Optima / K5 has shared the Sonata’s platform since 2005.' }],
  },
  {
    make: 'Hyundai', model: 'Elantra', body: 'sedan',
    generations: [g('XD', 2001, 2006), g('HD', 2007, 2010), g('MD', 2011, 2015), g('AD', 2016, 2020), g('CN7', 2021, undefined, ['GL', 'GLS', 'Smart', 'N'])],
    twins: [{ make: 'Kia', model: 'Cerato', note: 'The Cerato / Forte / K3 is the Elantra’s platform twin.' }],
  },
  {
    make: 'Hyundai', model: 'Accent', body: 'sedan',
    generations: [g('LC', 2000, 2005), g('MC', 2006, 2011), g('RB', 2012, 2017), g('HC', 2018, 2023), g('BN7', 2024)],
    twins: [{ make: 'Kia', model: 'Rio', note: 'Same platform as the Rio of the same generation.' }],
  },
  {
    make: 'Hyundai', model: 'Tucson', body: 'crossover',
    generations: [g('JM', 2005, 2009), g('LM (ix35)', 2010, 2015), g('TL', 2016, 2020), g('NX4', 2021, undefined, ['GL', 'GLS', 'Smart', 'N Line'])],
    twins: [{ make: 'Kia', model: 'Sportage', note: 'Sportage and Tucson share a platform in every generation.' }],
  },
  {
    make: 'Hyundai', model: 'Santa Fe', body: 'suv',
    generations: [g('SM', 2001, 2006), g('CM', 2007, 2012), g('DM', 2013, 2018), g('TM', 2019, 2023), g('MX5', 2024)],
    twins: [{ make: 'Kia', model: 'Sorento', note: 'Sorento and Santa Fe are platform twins from 2009.' }],
  },
  {
    make: 'Hyundai', model: 'Azera', body: 'sedan',
    generations: [g('TG', 2006, 2011), g('HG', 2012, 2017), g('IG (Grandeur)', 2017, 2022), g('GN7 (Grandeur)', 2023)],
    twins: [{ make: 'Kia', model: 'Cadenza', note: 'Cadenza / K7 shares the Azera / Grandeur platform.' }],
  },
  {
    make: 'Hyundai', model: 'Creta', body: 'crossover',
    generations: [g('GS', 2015, 2020), g('SU2', 2021)],
    twins: [{ make: 'Kia', model: 'Seltos', note: 'The Seltos is built on the SU2 Creta’s platform.' }],
  },
  { make: 'Hyundai', model: 'Palisade', body: 'suv', generations: [g('LX2', 2019, 2025), g('LX3', 2026)], twins: [{ make: 'Kia', model: 'Telluride', note: 'Same platform as the Telluride.' }] },
  { make: 'Hyundai', model: 'Kona', body: 'crossover', generations: [g('OS', 2018, 2023), g('SX2', 2024)] },
  { make: 'Hyundai', model: 'Staria', body: 'van', generations: [g('TQ (H-1)', 2008, 2021), g('US4 (Staria)', 2022)] },
  { make: 'Hyundai', model: 'Veloster', body: 'hatchback', generations: [g('FS', 2012, 2017), g('JS', 2019, 2022)] },

  // ── Kia ───────────────────────────────────────────────────────────────
  {
    make: 'Kia', model: 'K5', body: 'sedan',
    generations: [g('MS (Optima)', 2001, 2005), g('MG (Optima)', 2006, 2010), g('TF (Optima)', 2011, 2015), g('JF (Optima)', 2016, 2020), g('DL3', 2021, undefined, ['LX', 'EX', 'GT-Line', 'GT'])],
    twins: [{ make: 'Hyundai', model: 'Sonata', note: 'Sonata platform twin; sold as Optima until 2020.' }],
  },
  {
    make: 'Kia', model: 'Cerato', body: 'sedan',
    generations: [g('LD', 2004, 2008), g('TD (Forte)', 2009, 2013), g('YD', 2014, 2018), g('BD', 2019, undefined, ['LX', 'EX', 'GT-Line'])],
    twins: [{ make: 'Hyundai', model: 'Elantra', note: 'Elantra platform twin; called Forte in the Americas and K3 in Korea.' }],
  },
  {
    make: 'Kia', model: 'Rio', body: 'sedan',
    generations: [g('DC', 2000, 2005), g('JB', 2006, 2011), g('UB', 2012, 2017), g('YB', 2018, 2023)],
    twins: [{ make: 'Hyundai', model: 'Accent', note: 'Accent platform twin.' }],
  },
  {
    make: 'Kia', model: 'Sportage', body: 'crossover',
    generations: [g('JE/KM', 2005, 2010), g('SL', 2011, 2015), g('QL', 2016, 2021), g('NQ5', 2022, undefined, ['LX', 'EX', 'GT-Line'])],
    twins: [{ make: 'Hyundai', model: 'Tucson', note: 'Tucson platform twin.' }],
  },
  {
    make: 'Kia', model: 'Sorento', body: 'suv',
    generations: [g('BL', 2003, 2009), g('XM', 2010, 2014), g('UM', 2015, 2020), g('MQ4', 2021)],
    twins: [{ make: 'Hyundai', model: 'Santa Fe', note: 'Santa Fe platform twin from the XM onward.' }],
  },
  {
    make: 'Kia', model: 'Carnival', body: 'mpv',
    generations: [g('GQ', 1999, 2006), g('VQ', 2006, 2014), g('YP', 2015, 2020), g('KA4', 2021)],
    twins: [{ make: 'Kia', model: 'Sedona', note: 'The Carnival’s North American name until 2021.' }],
  },
  { make: 'Kia', model: 'Telluride', body: 'suv', generations: [g('ON', 2020)], twins: [{ make: 'Hyundai', model: 'Palisade', note: 'Palisade platform twin.' }] },
  { make: 'Kia', model: 'Seltos', body: 'crossover', generations: [g('SP2', 2020)], twins: [{ make: 'Hyundai', model: 'Creta', note: 'Creta SU2 platform twin.' }] },
  { make: 'Kia', model: 'Picanto', body: 'hatchback', generations: [g('SA', 2004, 2011), g('TA', 2012, 2017), g('JA', 2018)] },
  { make: 'Kia', model: 'Cadenza', body: 'sedan', generations: [g('VG (K7)', 2010, 2016), g('YG (K7)', 2017, 2021)], twins: [{ make: 'Hyundai', model: 'Azera', note: 'Azera / Grandeur platform twin.' }] },
  { make: 'Kia', model: 'Stinger', body: 'sedan', generations: [g('CK', 2018, 2023, ['2.0T', '3.3T GT'])], twins: [{ make: 'Genesis', model: 'G70', note: 'The G70 is built on the Stinger’s rear-drive platform.' }] },
  { make: 'Kia', model: 'Pegas', body: 'sedan', generations: [g('AB', 2018)], twins: [{ make: 'Kia', model: 'Soluto', note: 'The Pegas’s name in the Philippines.' }] },

  // ── Genesis ───────────────────────────────────────────────────────────
  { make: 'Genesis', model: 'G70', body: 'sedan', generations: [g('IK', 2018, undefined, ['2.0T', '2.5T', '3.3T'])], twins: [{ make: 'Kia', model: 'Stinger', note: 'Shares the Stinger’s platform and 3.3 twin-turbo V6.' }] },
  {
    make: 'Genesis', model: 'G80', body: 'sedan',
    generations: [g('DH (Hyundai Genesis)', 2014, 2016), g('DH', 2017, 2020, ['3.8', '5.0']), g('RG3', 2021, undefined, ['2.5T', '3.5T'])],
    twins: [{ make: 'Hyundai', model: 'Genesis', note: 'The DH was sold as the Hyundai Genesis sedan until the brand split in 2017.' }],
  },
  { make: 'Genesis', model: 'G90', body: 'sedan', generations: [g('HI', 2017, 2022, ['3.3T', '5.0']), g('RS4', 2023, undefined, ['3.5T', '3.5T e-SC'])], twins: [{ make: 'Kia', model: 'K9', note: 'The Kia K9 / K900 shares the G90 platform.' }] },
  { make: 'Genesis', model: 'GV70', body: 'crossover', generations: [g('JK', 2021, undefined, ['2.5T', '3.5T'])] },
  { make: 'Genesis', model: 'GV80', body: 'suv', generations: [g('JX', 2021, undefined, ['2.5T', '3.5T'])] },
]
