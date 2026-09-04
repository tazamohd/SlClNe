import { g, type VehicleModel } from './types'

/** Chinese and other makes now common in the Kingdom. */
export const OTHER: readonly VehicleModel[] = [
  // ── MG ────────────────────────────────────────────────────────────────
  { make: 'MG', model: 'ZS', body: 'crossover', generations: [g('ZS11', 2018, undefined, ['STD', 'COM', 'LUX'])] },
  { make: 'MG', model: 'HS', body: 'crossover', generations: [g('AS23', 2019, 2024), g('AS24', 2025)] },
  { make: 'MG', model: 'RX8', body: 'suv', generations: [g('D90', 2019)], twins: [{ make: 'Maxus', model: 'D90', note: 'The RX8 is the Maxus D90 with MG badges.' }] },
  { make: 'MG', model: 'MG 5', body: 'sedan', generations: [g('AP32', 2021)] },
  { make: 'MG', model: 'MG GT', body: 'sedan', generations: [g('AP32', 2022)], twins: [{ make: 'MG', model: 'MG 5', note: 'Same platform as the MG 5.' }] },

  // ── Geely ─────────────────────────────────────────────────────────────
  {
    make: 'Geely', model: 'Coolray', body: 'crossover',
    generations: [g('SX11', 2019)],
    twins: [{ make: 'Proton', model: 'X50', note: 'The Proton X50 is the Coolray (Binyue) built in Malaysia.' }],
  },
  { make: 'Geely', model: 'Emgrand', body: 'sedan', generations: [g('EC7', 2010, 2018), g('SS11', 2019, 2021), g('SS11 (2nd)', 2022)] },
  { make: 'Geely', model: 'Okavango', body: 'suv', generations: [g('VX11', 2021)], twins: [{ make: 'Proton', model: 'X90', note: 'Proton’s badge on the Okavango (Haoyue).' }] },
  { make: 'Geely', model: 'Monjaro', body: 'suv', generations: [g('KX11', 2022)], twins: [{ make: 'Volvo', model: 'XC60', note: 'Built on Volvo’s CMA-derived platform with the 2.0 turbo shared with Volvo.' }] },

  // ── Chery / Jetour / Exeed ────────────────────────────────────────────
  { make: 'Chery', model: 'Tiggo 8', body: 'suv', generations: [g('T18', 2019, undefined, ['Tiggo 8', 'Tiggo 8 Pro', 'Tiggo 8 Pro Max'])], twins: [{ make: 'Exeed', model: 'TXL', note: 'Exeed is Chery’s premium brand on the same M3X platform.' }] },
  { make: 'Chery', model: 'Tiggo 7', body: 'crossover', generations: [g('T15', 2017, 2020), g('T1E (Pro)', 2021)] },
  { make: 'Chery', model: 'Arrizo 6', body: 'sedan', generations: [g('M1D', 2019)] },
  { make: 'Jetour', model: 'T2', body: 'suv', generations: [g('T2', 2023)] },
  { make: 'Jetour', model: 'X70', body: 'suv', generations: [g('X70', 2019, undefined, ['X70', 'X70 Plus'])] },

  // ── Haval / Great Wall ────────────────────────────────────────────────
  { make: 'Haval', model: 'H6', body: 'crossover', generations: [g('1st', 2011, 2020), g('3rd (B01)', 2021, undefined, ['Premium', 'Luxury', 'GT', 'HEV'])] },
  { make: 'Haval', model: 'Jolion', body: 'crossover', generations: [g('A01', 2021)] },
  { make: 'GWM', model: 'Poer', body: 'pickup', generations: [g('P-Series', 2020)], twins: [{ make: 'GWM', model: 'Cannon', note: 'The Poer is the Cannon / Ute under its Middle-East name.' }] },

  // ── Changan / GAC ─────────────────────────────────────────────────────
  { make: 'Changan', model: 'CS75', body: 'suv', generations: [g('1st', 2014, 2019), g('Plus', 2020)] },
  { make: 'Changan', model: 'CS35 Plus', body: 'crossover', generations: [g('1st', 2018)] },
  { make: 'Changan', model: 'Alsvin', body: 'sedan', generations: [g('V7', 2019)] },
  { make: 'GAC', model: 'GS3', body: 'crossover', generations: [g('1st', 2017, 2022), g('Emzoom', 2023)] },
  { make: 'GAC', model: 'GN8', body: 'mpv', generations: [g('1st', 2017)] },

  // ── Renault / Peugeot / Skoda / Volvo ─────────────────────────────────
  {
    make: 'Renault', model: 'Duster', body: 'crossover',
    generations: [g('HS', 2012, 2017), g('HM', 2018, 2024), g('DF', 2025)],
    twins: [{ make: 'Dacia', model: 'Duster', note: 'Renault badges on the Dacia Duster outside Europe.' }],
  },
  { make: 'Renault', model: 'Koleos', body: 'crossover', generations: [g('HY', 2008, 2016), g('HC', 2017, 2024)], twins: [{ make: 'Nissan', model: 'X-Trail', note: 'The HC Koleos shares the T32 X-Trail’s CMF-CD platform.' }] },
  { make: 'Renault', model: 'Megane', body: 'sedan', generations: [g('II', 2003, 2009), g('III', 2009, 2016), g('IV', 2016, 2023)] },
  { make: 'Peugeot', model: '3008', body: 'crossover', generations: [g('T8', 2009, 2016), g('P84', 2017, 2023), g('P64', 2024)], twins: [{ make: 'Citroën', model: 'C5 Aircross', note: 'EMP2 platform twin.' }] },
  { make: 'Peugeot', model: '2008', body: 'crossover', generations: [g('A94', 2013, 2019), g('P24', 2020)], twins: [{ make: 'Opel', model: 'Mokka', note: 'CMP platform twin.' }] },
  { make: 'Skoda', model: 'Octavia', body: 'sedan', generations: [g('1U', 1996, 2010), g('1Z', 2004, 2013), g('5E', 2013, 2020), g('NX', 2021)], twins: [{ make: 'Volkswagen', model: 'Golf', note: 'Golf platform twin.' }] },
  { make: 'Skoda', model: 'Kodiaq', body: 'suv', generations: [g('NS', 2017, 2024), g('NS (2nd)', 2025)], twins: [{ make: 'Volkswagen', model: 'Tiguan', note: 'Tiguan Allspace platform twin.' }] },
  { make: 'Volvo', model: 'XC90', body: 'suv', generations: [g('P2', 2003, 2014), g('SPA', 2016)] },
  { make: 'Volvo', model: 'XC60', body: 'crossover', generations: [g('P3', 2009, 2017), g('SPA', 2018)] },
  { make: 'Volvo', model: 'S90', body: 'sedan', generations: [g('SPA', 2017)] },
]
