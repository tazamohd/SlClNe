import { g, type VehicleModel } from './types'

/** German makes and the British marques in their groups. */
export const GERMAN: readonly VehicleModel[] = [
  // ── BMW ───────────────────────────────────────────────────────────────
  {
    make: 'BMW', model: '7 Series', body: 'sedan',
    generations: [
      g('E38', 1994, 2001, ['728i', '735i', '740i', '740iL', '750iL']),
      g('E65/E66', 2002, 2008, ['730i', '735i', '740i', '745i', '745Li', '750i', '750Li', '760Li']),
      g('F01/F02', 2009, 2015, ['730i', '740i', '740Li', '750i', '750Li', '760Li']),
      g('G11/G12', 2016, 2022, ['730Li', '740i', '740Li', '750Li', 'M760Li']),
      g('G70', 2023, undefined, ['735i', '740i', '760i xDrive', 'i7 xDrive60', 'i7 M70']),
    ],
    twins: [{ make: 'Rolls-Royce', model: 'Ghost', note: 'The 2010–2020 Ghost was built on the F01 7 Series architecture; the 2020+ Ghost moved to Rolls-Royce’s own aluminium platform.' }],
  },
  {
    make: 'BMW', model: '5 Series', body: 'sedan',
    generations: [
      g('E39', 1996, 2003, ['523i', '528i', '530i', '540i', 'M5']),
      g('E60/E61', 2004, 2010, ['523i', '525i', '530i', '540i', '550i', 'M5']),
      g('F10/F11', 2011, 2017, ['520i', '528i', '530i', '535i', '550i', 'M5']),
      g('G30/G31', 2017, 2023, ['520i', '530i', '540i', 'M550i', 'M5']),
      g('G60', 2024, undefined, ['520i', '530i', '540i xDrive', 'i5 eDrive40', 'i5 M60']),
    ],
  },
  {
    make: 'BMW', model: '3 Series', body: 'sedan',
    generations: [
      g('E46', 1998, 2005, ['318i', '320i', '325i', '330i', 'M3']),
      g('E90/E91/E92', 2005, 2012, ['316i', '320i', '325i', '330i', '335i', 'M3']),
      g('F30/F31', 2012, 2019, ['316i', '318i', '320i', '328i', '330i', '340i']),
      g('G20/G21', 2019, undefined, ['318i', '320i', '330i', 'M340i']),
    ],
    twins: [{ make: 'BMW', model: '4 Series', note: 'The 4 Series is the two-door 3 Series (F32 / G22).' }],
  },
  {
    make: 'BMW', model: 'X5', body: 'suv',
    generations: [g('E53', 2000, 2006, ['3.0i', '4.4i', '4.8is']), g('E70', 2007, 2013, ['xDrive35i', 'xDrive50i', 'X5 M']), g('F15', 2014, 2018, ['xDrive35i', 'xDrive50i']), g('G05', 2019, undefined, ['xDrive40i', 'xDrive50i', 'M60i', 'X5 M'])],
    twins: [{ make: 'BMW', model: 'X6', note: 'The X6 is the X5’s coupé body on the same platform.' }],
  },
  {
    make: 'BMW', model: 'X7', body: 'suv',
    generations: [g('G07', 2019, undefined, ['xDrive40i', 'M60i', 'Alpina XB7'])],
    twins: [{ make: 'BMW', model: 'X5', note: 'Stretched CLAR platform shared with the G05 X5.' }],
  },
  { make: 'BMW', model: 'X3', body: 'crossover', generations: [g('E83', 2004, 2010), g('F25', 2011, 2017), g('G01', 2018, 2024), g('G45', 2025)] },
  {
    make: 'BMW', model: 'X1', body: 'crossover',
    generations: [g('E84', 2010, 2015), g('F48', 2016, 2022), g('U11', 2023)],
    twins: [{ make: 'MINI', model: 'Countryman', note: 'F48 / U11 X1 and the F60 / U25 Countryman share the UKL2 / FAAR platform.' }],
  },
  {
    make: 'BMW', model: 'Z4', body: 'sports',
    generations: [g('E85/E86', 2003, 2008), g('E89', 2009, 2016), g('G29', 2019, undefined, ['sDrive20i', 'sDrive30i', 'M40i'])],
    twins: [{ make: 'Toyota', model: 'Supra', note: 'The A90 Supra is the G29 Z4 with a Toyota body.' }],
  },

  // ── Mercedes-Benz ─────────────────────────────────────────────────────
  {
    make: 'Mercedes-Benz', model: 'S-Class', body: 'sedan',
    generations: [
      g('W220', 1999, 2005, ['S 320', 'S 350', 'S 430', 'S 500', 'S 600']),
      g('W221', 2006, 2013, ['S 350', 'S 450', 'S 500', 'S 550', 'S 600', 'S 63 AMG']),
      g('W222', 2014, 2020, ['S 400', 'S 450', 'S 500', 'S 560', 'S 63', 'S 650']),
      g('W223', 2021, undefined, ['S 450', 'S 500', 'S 580', 'S 63 E Performance']),
    ],
    twins: [{ make: 'Maybach', model: 'S-Class', note: 'Mercedes-Maybach S 560 / S 580 / S 680 are long-wheelbase W222 / W223 S-Class bodies.' }],
  },
  {
    make: 'Mercedes-Benz', model: 'E-Class', body: 'sedan',
    generations: [
      g('W210', 1996, 2002, ['E 200', 'E 240', 'E 320', 'E 430']),
      g('W211', 2003, 2009, ['E 200', 'E 240', 'E 280', 'E 350', 'E 500', 'E 63 AMG']),
      g('W212', 2010, 2016, ['E 200', 'E 250', 'E 300', 'E 350', 'E 500', 'E 63 AMG']),
      g('W213', 2017, 2023, ['E 200', 'E 300', 'E 350', 'E 450', 'E 53', 'E 63 S']),
      g('W214', 2024, undefined, ['E 200', 'E 300', 'E 450', 'E 53 Hybrid']),
    ],
    twins: [{ make: 'Mercedes-Benz', model: 'CLS', note: 'The CLS is the E-Class platform with a four-door coupé body (C219, C218, C257).' }],
  },
  {
    make: 'Mercedes-Benz', model: 'C-Class', body: 'sedan',
    generations: [g('W203', 2001, 2007, ['C 180', 'C 200', 'C 240', 'C 320']), g('W204', 2008, 2014, ['C 180', 'C 200', 'C 250', 'C 300', 'C 63 AMG']), g('W205', 2015, 2021, ['C 180', 'C 200', 'C 300', 'C 43', 'C 63']), g('W206', 2022, undefined, ['C 200', 'C 300', 'C 43'])],
  },
  {
    make: 'Mercedes-Benz', model: 'GLE', body: 'suv',
    generations: [g('W163 (ML)', 1998, 2005), g('W164 (ML)', 2006, 2011), g('W166 (ML / GLE)', 2012, 2019, ['ML 350', 'GLE 400', 'GLE 450', 'GLE 63']), g('V167', 2020, undefined, ['GLE 450', 'GLE 53', 'GLE 63 S'])],
    twins: [{ make: 'Mercedes-Benz', model: 'GLS', note: 'The GLS (and GL before it) is the long three-row body on the GLE platform.' }],
  },
  {
    make: 'Mercedes-Benz', model: 'GLS', body: 'suv',
    generations: [g('X164 (GL)', 2007, 2012), g('X166 (GL / GLS)', 2013, 2019), g('X167', 2020, undefined, ['GLS 450', 'GLS 580', 'Maybach GLS 600'])],
    twins: [{ make: 'Mercedes-Benz', model: 'GLE', note: 'Same platform as the GLE.' }],
  },
  { make: 'Mercedes-Benz', model: 'G-Class', body: 'suv', generations: [g('W463', 1990, 2018, ['G 500', 'G 55 AMG', 'G 63 AMG']), g('W463 (2nd)', 2019, undefined, ['G 500', 'G 63', 'G 580 EQ'])] },
  { make: 'Mercedes-Benz', model: 'GLC', body: 'crossover', generations: [g('X253', 2016, 2022, ['GLC 200', 'GLC 250', 'GLC 300', 'GLC 43', 'GLC 63']), g('X254', 2023, undefined, ['GLC 200', 'GLC 300', 'GLC 43'])] },
  {
    make: 'Mercedes-Benz', model: 'A-Class', body: 'hatchback',
    generations: [g('W169', 2005, 2012), g('W176', 2013, 2018), g('W177', 2019)],
    twins: [
      { make: 'Mercedes-Benz', model: 'CLA', note: 'The CLA is the A-Class platform with a sedan body.' },
      { make: 'Infiniti', model: 'Q30', note: 'The 2016–2019 Infiniti Q30 / QX30 was built on the W176 A-Class MFA platform.' },
    ],
  },
  { make: 'Mercedes-Benz', model: 'V-Class', body: 'van', generations: [g('W639 (Viano)', 2004, 2014), g('W447', 2015)], twins: [{ make: 'Mercedes-Benz', model: 'Vito', note: 'The Vito is the same van in commercial trim.' }] },

  // ── Audi ──────────────────────────────────────────────────────────────
  {
    make: 'Audi', model: 'A4', body: 'sedan',
    generations: [g('B6', 2001, 2005), g('B7', 2005, 2008), g('B8', 2008, 2016), g('B9', 2016, undefined, ['35 TFSI', '40 TFSI', '45 TFSI', 'S4'])],
  },
  {
    make: 'Audi', model: 'A6', body: 'sedan',
    generations: [g('C5', 1997, 2004), g('C6', 2005, 2011), g('C7', 2012, 2018), g('C8', 2019, undefined, ['45 TFSI', '55 TFSI', 'S6'])],
  },
  { make: 'Audi', model: 'A8', body: 'sedan', generations: [g('D2', 1994, 2002), g('D3', 2003, 2010), g('D4', 2011, 2017), g('D5', 2018, undefined, ['55 TFSI', '60 TFSI', 'S8'])] },
  {
    make: 'Audi', model: 'Q7', body: 'suv',
    generations: [g('4L', 2006, 2015, ['3.6', '4.2', '3.0 TFSI']), g('4M', 2016, undefined, ['45 TFSI', '55 TFSI', 'SQ7'])],
    twins: [
      { make: 'Porsche', model: 'Cayenne', note: 'Both generations share a platform with the Cayenne and VW Touareg (PL71, then MLB evo).' },
      { make: 'Lamborghini', model: 'Urus', note: 'The Urus and Bentley Bentayga sit on the 4M Q7’s MLB evo platform.' },
    ],
  },
  { make: 'Audi', model: 'Q5', body: 'crossover', generations: [g('8R', 2009, 2017), g('FY', 2018, undefined, ['40 TFSI', '45 TFSI', 'SQ5'])], twins: [{ make: 'Porsche', model: 'Macan', note: 'The Macan is built on the 8R Q5’s MLB platform.' }] },
  { make: 'Audi', model: 'Q3', body: 'crossover', generations: [g('8U', 2012, 2018), g('F3', 2019)], twins: [{ make: 'Volkswagen', model: 'Tiguan', note: 'Tiguan platform twin (PQ35, then MQB).' }] },
  { make: 'Audi', model: 'A3', body: 'hatchback', generations: [g('8P', 2004, 2012), g('8V', 2013, 2020), g('8Y', 2021)], twins: [{ make: 'Volkswagen', model: 'Golf', note: 'Golf platform twin in every generation.' }] },

  // ── Volkswagen ────────────────────────────────────────────────────────
  {
    make: 'Volkswagen', model: 'Golf', body: 'hatchback',
    generations: [g('Mk4', 1998, 2004), g('Mk5', 2004, 2008), g('Mk6', 2009, 2012), g('Mk7', 2013, 2020, ['1.4 TSI', 'GTI', 'R']), g('Mk8', 2021, undefined, ['1.4 TSI', 'GTI', 'R'])],
    twins: [{ make: 'Audi', model: 'A3', note: 'A3, Seat Leon and Skoda Octavia are Golf platform twins.' }],
  },
  {
    make: 'Volkswagen', model: 'Passat', body: 'sedan',
    generations: [g('B5.5', 2001, 2005), g('B6', 2006, 2010), g('B7', 2011, 2014), g('B8', 2015, 2023)],
    twins: [{ make: 'Skoda', model: 'Superb', note: 'The Superb is built on the same platform as the Passat.' }],
  },
  { make: 'Volkswagen', model: 'Tiguan', body: 'crossover', generations: [g('5N', 2008, 2016), g('AD', 2017, 2024), g('CT', 2025)], twins: [{ make: 'Audi', model: 'Q3', note: 'Q3 platform twin.' }] },
  {
    make: 'Volkswagen', model: 'Touareg', body: 'suv',
    generations: [g('7L', 2003, 2010), g('7P', 2011, 2018), g('CR', 2019)],
    twins: [{ make: 'Porsche', model: 'Cayenne', note: 'Cayenne and Q7 platform twin in every generation.' }],
  },
  { make: 'Volkswagen', model: 'Teramont', body: 'suv', generations: [g('CA', 2018)], twins: [{ make: 'Volkswagen', model: 'Atlas', note: 'The Teramont is the Atlas under its Gulf and Chinese name.' }] },
  { make: 'Volkswagen', model: 'Jetta', body: 'sedan', generations: [g('Mk4', 1999, 2005), g('Mk5', 2006, 2010), g('Mk6', 2011, 2018), g('Mk7', 2019)] },

  // ── Porsche ───────────────────────────────────────────────────────────
  {
    make: 'Porsche', model: 'Cayenne', body: 'suv',
    generations: [g('955/957 (9PA)', 2003, 2010, ['Cayenne', 'S', 'GTS', 'Turbo']), g('958 (92A)', 2011, 2017, ['Cayenne', 'S', 'GTS', 'Turbo']), g('PO536 (9YA)', 2018, undefined, ['Cayenne', 'S', 'GTS', 'Turbo', 'E-Hybrid'])],
    twins: [{ make: 'Volkswagen', model: 'Touareg', note: 'Touareg and Audi Q7 platform twin (PL71, then MLB evo).' }],
  },
  { make: 'Porsche', model: 'Macan', body: 'crossover', generations: [g('95B', 2014, 2024, ['Macan', 'S', 'GTS', 'Turbo']), g('Macan Electric', 2024)], twins: [{ make: 'Audi', model: 'Q5', note: 'Built on the 8R Q5’s MLB platform.' }] },
  { make: 'Porsche', model: 'Panamera', body: 'sedan', generations: [g('970', 2010, 2016), g('971', 2017, 2023), g('972', 2024)] },
  { make: 'Porsche', model: '911', body: 'sports', generations: [g('996', 1998, 2004), g('997', 2005, 2012), g('991', 2012, 2019), g('992', 2020, undefined, ['Carrera', 'Carrera S', 'GT3', 'Turbo S'])] },

  // ── Land Rover / Jaguar ───────────────────────────────────────────────
  {
    make: 'Land Rover', model: 'Range Rover', body: 'suv',
    generations: [g('L322', 2002, 2012, ['HSE', 'Vogue', 'Supercharged']), g('L405', 2013, 2021, ['Vogue', 'Vogue SE', 'Autobiography', 'SVAutobiography']), g('L460', 2022, undefined, ['SE', 'HSE', 'Autobiography', 'SV'])],
  },
  {
    make: 'Land Rover', model: 'Range Rover Sport', body: 'suv',
    generations: [g('L320', 2005, 2013, ['HSE', 'Supercharged']), g('L494', 2014, 2022, ['HSE', 'HSE Dynamic', 'Autobiography', 'SVR']), g('L461', 2023, undefined, ['SE', 'Dynamic HSE', 'Autobiography', 'SV'])],
    twins: [{ make: 'Land Rover', model: 'Discovery', note: 'The L320 shared its integrated body-frame with the Discovery 3 / 4; the L494 shares the L405 Range Rover’s aluminium platform.' }],
  },
  {
    make: 'Land Rover', model: 'Discovery', body: 'suv',
    generations: [g('L318 (Series II)', 1999, 2004), g('L319 (Discovery 3 / LR3)', 2005, 2009), g('L319 (Discovery 4 / LR4)', 2010, 2016), g('L462 (Discovery 5)', 2017)],
    twins: [{ make: 'Land Rover', model: 'Range Rover Sport', note: 'L320 Range Rover Sport twin (2005–2013).' }],
  },
  { make: 'Land Rover', model: 'Defender', body: 'suv', generations: [g('L316', 1990, 2016), g('L663', 2020, undefined, ['90', '110', '130', 'V8', 'Octa'])] },
  {
    make: 'Land Rover', model: 'Range Rover Evoque', body: 'crossover',
    generations: [g('L538', 2012, 2018), g('L551', 2019)],
    twins: [{ make: 'Jaguar', model: 'E-Pace', note: 'E-Pace and Discovery Sport share the Evoque’s platform (D8, then PTA).' }],
  },
  { make: 'Land Rover', model: 'Range Rover Velar', body: 'crossover', generations: [g('L560', 2018)], twins: [{ make: 'Jaguar', model: 'F-Pace', note: 'The Velar is built on the F-Pace’s iQ[Al] aluminium platform.' }] },
  { make: 'Jaguar', model: 'F-Pace', body: 'crossover', generations: [g('X761', 2017)], twins: [{ make: 'Land Rover', model: 'Range Rover Velar', note: 'Velar platform twin.' }] },
  { make: 'Jaguar', model: 'XF', body: 'sedan', generations: [g('X250', 2009, 2015), g('X260', 2016)] },
  { make: 'Jaguar', model: 'F-Type', body: 'sports', generations: [g('X152', 2014, 2024)] },
  { make: 'MINI', model: 'Countryman', body: 'crossover', generations: [g('R60', 2011, 2016), g('F60', 2017, 2023), g('U25', 2024)], twins: [{ make: 'BMW', model: 'X1', note: 'X1 platform twin (UKL2 / FAAR).' }] },
]
