import { g, type VehicleModel } from './types'

/** Japanese makes — the bulk of the Gulf parc. */
export const JAPANESE: readonly VehicleModel[] = [
  // ── Toyota ────────────────────────────────────────────────────────────
  {
    make: 'Toyota', model: 'Camry', body: 'sedan',
    generations: [
      g('XV20', 1997, 2001, ['GL', 'GLX', 'Grande']),
      g('XV30', 2002, 2006, ['GL', 'GLX', 'Grande']),
      g('XV40', 2007, 2011, ['GL', 'GLX', 'SE', 'Grande']),
      g('XV50', 2012, 2017, ['S', 'SE', 'GLX', 'Grande', 'Limited']),
      g('XV70', 2018, 2024, ['LE', 'SE', 'GLE', 'Limited', 'Grande', 'Hybrid']),
      g('XV80', 2025, undefined, ['LE Hybrid', 'SE Hybrid', 'Grande Hybrid']),
    ],
    twins: [
      { make: 'Lexus', model: 'ES', note: 'Same platform (K, then TNGA-K); the ES is the Camry’s luxury sister.' },
      { make: 'Toyota', model: 'Aurion', note: 'The V6 Camry sold in the Gulf and Australia 2006–2017 under its own name.' },
    ],
  },
  {
    make: 'Toyota', model: 'Corolla', body: 'sedan',
    generations: [
      g('E120', 2001, 2007, ['XLi', 'GLi', '1.8 GLi']),
      g('E140/E150', 2008, 2013, ['XLi', 'GLi', '2.0 GLi']),
      g('E170', 2014, 2019, ['XLi', 'GLi', 'SE+', '2.0 GLi']),
      g('E210', 2020, undefined, ['XLi', 'GLi', 'SE+', 'Hybrid']),
    ],
    twins: [{ make: 'Toyota', model: 'Corolla Cross', note: 'Same TNGA-C platform as the E210 Corolla.' }],
  },
  {
    make: 'Toyota', model: 'Yaris', body: 'sedan',
    generations: [
      g('XP90', 2006, 2013, ['1.3', '1.5 SE']),
      g('XP150', 2014, 2022, ['1.3 Y', '1.5 SE']),
      g('XP150 (facelift)', 2023, undefined, ['1.5 Y', '1.5 SE+']),
    ],
    twins: [{ make: 'Toyota', model: 'Vios', note: 'The Gulf Yaris sedan is the Vios sold in Asia; the same car under two names.' }],
  },
  {
    make: 'Toyota', model: 'Avalon', body: 'sedan',
    generations: [
      g('XX30', 2005, 2012, ['XLE', 'Limited']),
      g('XX40', 2013, 2018, ['XLE', 'Limited']),
      g('XX50', 2019, 2022, ['Touring', 'Limited']),
    ],
    twins: [{ make: 'Lexus', model: 'ES', note: 'The 2013+ Avalon and ES share the same platform and V6.' }],
  },
  {
    make: 'Toyota', model: 'Land Cruiser', body: 'suv',
    generations: [
      g('J100', 1998, 2007, ['GXR', 'VXR', 'VX-R 4.7']),
      g('J200', 2008, 2021, ['GXR', 'VXR', 'VXR Grand Touring']),
      g('J300', 2022, undefined, ['GXR', 'VXR', 'GR Sport']),
    ],
    twins: [{ make: 'Lexus', model: 'LX', note: 'LX 470 / LX 570 / LX 600 are the Land Cruiser 100 / 200 / 300 with a Lexus body and cabin.' }],
  },
  {
    make: 'Toyota', model: 'Land Cruiser Prado', body: 'suv',
    generations: [
      g('J120', 2003, 2009, ['GXR', 'VXR']),
      g('J150', 2010, 2023, ['TXL', 'GXR', 'VXR']),
      g('J250', 2024, undefined, ['GXR', 'VXR', 'Adventure']),
    ],
    twins: [{ make: 'Lexus', model: 'GX', note: 'GX 470 / GX 460 / GX 550 sit on the Prado 120 / 150 / 250 chassis.' }],
  },
  {
    make: 'Toyota', model: 'Fortuner', body: 'suv',
    generations: [
      g('AN50', 2005, 2015, ['2.7 GXR', '4.0 VXR']),
      g('AN160', 2016, undefined, ['2.7 GXR', '4.0 VXR', 'GR Sport']),
    ],
    twins: [{ make: 'Toyota', model: 'Hilux', note: 'Both are IMV-platform vehicles; the Fortuner is the Hilux’s SUV body.' }],
  },
  {
    make: 'Toyota', model: 'Hilux', body: 'pickup',
    generations: [
      g('AN10/AN20', 2005, 2015, ['2.7 DC', '4.0 DC', '2.5 D-4D']),
      g('AN120', 2016, undefined, ['2.7 GL', '4.0 GR Sport', '2.8 D-4D Adventure']),
    ],
    twins: [{ make: 'Toyota', model: 'Fortuner', note: 'IMV platform sibling; shares running gear and cabin.' }],
  },
  {
    make: 'Toyota', model: 'RAV4', body: 'crossover',
    generations: [
      g('XA20', 2001, 2005), g('XA30', 2006, 2012), g('XA40', 2013, 2018),
      g('XA50', 2019, undefined, ['LE', 'XLE', 'Adventure', 'Hybrid']),
    ],
    twins: [{ make: 'Lexus', model: 'NX', note: 'The 2022+ NX is on the same TNGA-K platform as the XA50 RAV4.' }],
  },
  {
    make: 'Toyota', model: 'Innova', body: 'mpv',
    generations: [g('AN40', 2005, 2015), g('AN140', 2016, 2023), g('AG10 (Zenix)', 2023)],
    twins: [{ make: 'Toyota', model: 'Fortuner', note: 'IMV platform sibling until the 2023 Zenix moved to TNGA-C.' }],
  },
  {
    make: 'Toyota', model: 'Sequoia', body: 'suv',
    generations: [g('XK30', 2001, 2007), g('XK60', 2008, 2022), g('XK80', 2023)],
    twins: [{ make: 'Toyota', model: 'Tundra', note: 'The Sequoia is the Tundra pickup’s SUV body.' }],
  },
  {
    make: 'Toyota', model: 'Supra', body: 'sports',
    generations: [g('A90', 2020, undefined, ['3.0', '2.0'])],
    twins: [{ make: 'BMW', model: 'Z4', note: 'Co-developed with the G29 Z4; same platform, B58 engine and much of the cabin electronics.' }],
  },
  {
    make: 'Toyota', model: 'GR86', body: 'sports',
    generations: [g('ZN6 (86)', 2012, 2021), g('ZN8', 2022)],
    twins: [{ make: 'Subaru', model: 'BRZ', note: 'Built by Subaru; the same car with different badges and tuning.' }],
  },

  // ── Lexus ─────────────────────────────────────────────────────────────
  {
    make: 'Lexus', model: 'ES', body: 'sedan',
    generations: [g('XV30', 2002, 2006, ['ES 300', 'ES 330']), g('XV40', 2007, 2012, ['ES 350']), g('XV60', 2013, 2018, ['ES 250', 'ES 350']), g('XZ10', 2019, undefined, ['ES 250', 'ES 350', 'ES 300h'])],
    twins: [{ make: 'Toyota', model: 'Camry', note: 'Platform twin of the Camry (and the Avalon from 2013).' }],
  },
  {
    make: 'Lexus', model: 'LX', body: 'suv',
    generations: [g('J100', 1998, 2007, ['LX 470']), g('J200', 2008, 2021, ['LX 570', 'LX 570 Sport']), g('J300', 2022, undefined, ['LX 600', 'LX 600 F Sport', 'LX 700h'])],
    twins: [{ make: 'Toyota', model: 'Land Cruiser', note: 'The same chassis, engine and driveline as the Land Cruiser of the same year.' }],
  },
  {
    make: 'Lexus', model: 'GX', body: 'suv',
    generations: [g('J120', 2003, 2009, ['GX 470']), g('J150', 2010, 2023, ['GX 460']), g('J250', 2024, undefined, ['GX 550'])],
    twins: [{ make: 'Toyota', model: 'Land Cruiser Prado', note: 'Prado chassis with a Lexus body.' }],
  },
  {
    make: 'Lexus', model: 'RX', body: 'crossover',
    generations: [g('XU30', 2004, 2009, ['RX 330', 'RX 350']), g('AL10', 2010, 2015, ['RX 350', 'RX 450h']), g('AL20', 2016, 2022, ['RX 350', 'RX 350L']), g('AL30', 2023, undefined, ['RX 350', 'RX 350h', 'RX 500h'])],
    twins: [{ make: 'Toyota', model: 'Highlander', note: 'Same K / TNGA-K platform as the Highlander of the same generation.' }],
  },
  {
    make: 'Lexus', model: 'IS', body: 'sedan',
    generations: [g('XE10', 1999, 2005, ['IS 200', 'IS 300']), g('XE20', 2006, 2013, ['IS 250', 'IS 300', 'IS F']), g('XE30', 2014, undefined, ['IS 250', 'IS 300', 'IS 350', 'IS 500'])],
  },
  {
    make: 'Lexus', model: 'LS', body: 'sedan',
    generations: [g('XF30', 2001, 2006, ['LS 430']), g('XF40', 2007, 2017, ['LS 460', 'LS 460L', 'LS 600h']), g('XF50', 2018, undefined, ['LS 350', 'LS 500', 'LS 500h'])],
  },
  {
    make: 'Lexus', model: 'NX', body: 'crossover',
    generations: [g('AZ10', 2015, 2021, ['NX 200t', 'NX 300', 'NX 300h']), g('AZ20', 2022, undefined, ['NX 250', 'NX 350', 'NX 350h'])],
    twins: [{ make: 'Toyota', model: 'RAV4', note: 'The AZ20 shares the RAV4 XA50’s TNGA-K platform.' }],
  },

  // ── Nissan ────────────────────────────────────────────────────────────
  {
    make: 'Nissan', model: 'Patrol', body: 'suv',
    generations: [
      g('Y61', 1997, 2021, ['GL', 'Safari', 'Super Safari', 'VTC 4800']),
      g('Y62', 2010, 2024, ['XE', 'SE', 'LE Platinum', 'Nismo']),
      g('Y63', 2025, undefined, ['SE', 'LE', 'Platinum']),
    ],
    twins: [
      { make: 'Infiniti', model: 'QX80', note: 'The QX56 (2011–2013) and QX80 are the Y62 Patrol with Infiniti bodywork and cabin.' },
      { make: 'Nissan', model: 'Armada', note: 'The Y62 sold in North America from 2017.' },
    ],
  },
  {
    make: 'Nissan', model: 'Altima', body: 'sedan',
    generations: [g('L31', 2002, 2006), g('L32', 2007, 2012), g('L33', 2013, 2018, ['S', 'SV', 'SL', '3.5 SR']), g('L34', 2019, undefined, ['S', 'SV', 'SL', 'SR'])],
    twins: [{ make: 'Nissan', model: 'Maxima', note: 'Shared the D platform; the Maxima is the larger, V6-only sister.' }],
  },
  {
    make: 'Nissan', model: 'Maxima', body: 'sedan',
    generations: [g('A33', 2000, 2003), g('A34', 2004, 2008), g('A35', 2009, 2014), g('A36', 2016, 2023, ['S', 'SV', 'SR', 'Platinum'])],
    twins: [{ make: 'Nissan', model: 'Altima', note: 'D-platform sibling.' }],
  },
  {
    make: 'Nissan', model: 'Sunny', body: 'sedan',
    generations: [g('N16', 2000, 2012), g('N17', 2012, 2019, ['S', 'SV', 'SL']), g('N18', 2020, undefined, ['S', 'SV', 'SL'])],
    twins: [{ make: 'Nissan', model: 'Versa', note: 'The N17 and N18 Sunny are the Versa sedan sold in the Americas.' }],
  },
  {
    make: 'Nissan', model: 'Sentra', body: 'sedan',
    generations: [g('B15', 2000, 2006), g('B16', 2007, 2012), g('B17', 2013, 2019, ['S', 'SV', 'SL']), g('B18', 2020, undefined, ['S', 'SV', 'SL'])],
    twins: [{ make: 'Nissan', model: 'Sylphy', note: 'The same car under its Asian name.' }],
  },
  {
    make: 'Nissan', model: 'X-Trail', body: 'crossover',
    generations: [g('T30', 2001, 2007), g('T31', 2008, 2013), g('T32', 2014, 2022, ['S', 'SV', 'SL']), g('T33', 2023, undefined, ['S', 'SV', 'SL', 'e-Power'])],
    twins: [
      { make: 'Nissan', model: 'Rogue', note: 'The T32 and T33 are sold as the Rogue in North America.' },
      { make: 'Mitsubishi', model: 'Outlander', note: 'The 2022+ Outlander shares the T33’s CMF-C/D platform and 2.5 engine.' },
    ],
  },
  {
    make: 'Nissan', model: 'Pathfinder', body: 'suv',
    generations: [g('R50', 1996, 2004), g('R51', 2005, 2012, ['SE', 'LE']), g('R52', 2013, 2020, ['S', 'SV', 'SL', 'Platinum']), g('R53', 2022, undefined, ['S', 'SV', 'SL', 'Platinum'])],
    twins: [{ make: 'Infiniti', model: 'QX60', note: 'The JX35 / QX60 is the R52 and R53 Pathfinder’s luxury twin.' }],
  },
  {
    make: 'Nissan', model: 'Kicks', body: 'crossover',
    generations: [g('P15', 2017, 2024, ['S', 'SV', 'SL']), g('P16', 2025)],
  },
  {
    make: 'Nissan', model: 'Navara', body: 'pickup',
    generations: [g('D22', 1997, 2015), g('D40', 2005, 2015), g('D23', 2015, undefined, ['SE', 'LE', 'Pro-4X'])],
    twins: [
      { make: 'Mercedes-Benz', model: 'X-Class', note: '2017–2020 X-Class was built on the D23 Navara.' },
      { make: 'Renault', model: 'Alaskan', note: 'Renault’s badge on the D23.' },
    ],
  },

  // ── Infiniti ──────────────────────────────────────────────────────────
  {
    make: 'Infiniti', model: 'QX80', body: 'suv',
    generations: [g('Z62 (QX56)', 2011, 2013, ['QX56']), g('Z62', 2014, 2024, ['Luxe', 'Sensory']), g('Z63', 2025)],
    twins: [{ make: 'Nissan', model: 'Patrol', note: 'Y62 Patrol underneath.' }],
  },
  {
    make: 'Infiniti', model: 'QX60', body: 'crossover',
    generations: [g('L50 (JX35)', 2013, 2020), g('L51', 2022)],
    twins: [{ make: 'Nissan', model: 'Pathfinder', note: 'R52 / R53 Pathfinder platform.' }],
  },
  {
    make: 'Infiniti', model: 'Q50', body: 'sedan',
    generations: [g('V37', 2014, 2024, ['2.0t', '3.0t Luxe', 'Red Sport 400'])],
  },

  // ── Honda ─────────────────────────────────────────────────────────────
  {
    make: 'Honda', model: 'Accord', body: 'sedan',
    generations: [g('7th (CL/CM)', 2003, 2007), g('8th (CP)', 2008, 2012), g('9th (CR)', 2013, 2017, ['LX', 'EX', 'Sport', 'V6']), g('10th (CV)', 2018, 2022, ['LX', 'Sport', 'EX-L', '2.0T']), g('11th', 2023, undefined, ['LX', 'Sport', 'Hybrid'])],
    twins: [{ make: 'Acura', model: 'TLX', note: 'Acura’s sedans (TSX, TL, TLX) share the Accord platform of their era.' }],
  },
  {
    make: 'Honda', model: 'Civic', body: 'sedan',
    generations: [g('7th (ES)', 2001, 2005), g('8th (FD)', 2006, 2011), g('9th (FB)', 2012, 2015), g('10th (FC)', 2016, 2021, ['LX', 'EX', 'RS', 'Type R']), g('11th (FE)', 2022, undefined, ['LX', 'EX', 'RS', 'Type R'])],
    twins: [{ make: 'Acura', model: 'ILX', note: '2013–2022 ILX was built on the 9th-generation Civic.' }],
  },
  {
    make: 'Honda', model: 'CR-V', body: 'crossover',
    generations: [g('RD', 2002, 2006), g('RE', 2007, 2011), g('RM', 2012, 2016), g('RW', 2017, 2022), g('RS', 2023)],
    twins: [{ make: 'Acura', model: 'RDX', note: 'The 2013–2018 RDX shared the CR-V’s platform.' }],
  },
  {
    make: 'Honda', model: 'Pilot', body: 'suv',
    generations: [g('YF1', 2003, 2008), g('YF3', 2009, 2015), g('YF5', 2016, 2022), g('YG1', 2023)],
    twins: [{ make: 'Acura', model: 'MDX', note: 'MDX and Pilot share a platform in every generation.' }],
  },
  { make: 'Honda', model: 'City', body: 'sedan', generations: [g('GD', 2003, 2008), g('GM', 2009, 2013), g('GM6', 2014, 2020), g('GN', 2021)] },
  { make: 'Honda', model: 'HR-V', body: 'crossover', generations: [g('RU', 2016, 2021), g('RZ', 2022)] },

  // ── Mitsubishi ────────────────────────────────────────────────────────
  {
    make: 'Mitsubishi', model: 'Pajero', body: 'suv',
    generations: [g('V60/V70', 2000, 2006, ['GLS 3.0', 'GLS 3.5']), g('V80/V90', 2007, 2021, ['GLS 3.0', 'GLS 3.5', 'GLS 3.8'])],
    twins: [{ make: 'Mitsubishi', model: 'Montero', note: 'The Pajero’s name in the Americas and Spain.' }],
  },
  {
    make: 'Mitsubishi', model: 'Pajero Sport', body: 'suv',
    generations: [g('KG/KH', 2009, 2015), g('KS/QE', 2016, undefined, ['GLX', 'GLS'])],
    twins: [{ make: 'Mitsubishi', model: 'L200', note: 'Built on the L200 / Triton pickup.' }],
  },
  {
    make: 'Mitsubishi', model: 'L200', body: 'pickup',
    generations: [g('K60/K70', 1996, 2006), g('KA/KB', 2006, 2015), g('KJ/KK/KL', 2015, 2023), g('LC', 2024)],
    twins: [
      { make: 'Fiat', model: 'Fullback', note: '2016–2019 Fullback was a rebadged L200.' },
      { make: 'RAM', model: '1200', note: 'RAM’s badge on the L200 in the Gulf.' },
    ],
  },
  {
    make: 'Mitsubishi', model: 'Outlander', body: 'crossover',
    generations: [g('CU', 2003, 2006), g('CW', 2007, 2012), g('GF', 2013, 2021), g('GM', 2022)],
    twins: [
      { make: 'Peugeot', model: '4007', note: 'The CW Outlander was sold as the Peugeot 4007 and Citroën C-Crosser.' },
      { make: 'Nissan', model: 'X-Trail', note: 'The GM Outlander shares the T33 X-Trail platform.' },
    ],
  },
  { make: 'Mitsubishi', model: 'Lancer', body: 'sedan', generations: [g('CS', 2000, 2007), g('CY', 2008, 2017, ['GLX', 'GLS', 'EX'])] },
  { make: 'Mitsubishi', model: 'Attrage', body: 'sedan', generations: [g('A10', 2013, undefined, ['GLX', 'GLS'])], twins: [{ make: 'Mitsubishi', model: 'Mirage', note: 'The Attrage is the Mirage hatchback’s sedan.' }] },
  { make: 'Mitsubishi', model: 'Xpander', body: 'mpv', generations: [g('AB', 2017)] },
  { make: 'Mitsubishi', model: 'ASX', body: 'crossover', generations: [g('GA', 2010, 2023)], twins: [{ make: 'Mitsubishi', model: 'Outlander Sport', note: 'The ASX’s North American name.' }] },

  // ── Mazda ─────────────────────────────────────────────────────────────
  {
    make: 'Mazda', model: 'Mazda6', body: 'sedan',
    generations: [g('GG', 2002, 2007), g('GH', 2008, 2012), g('GJ/GL', 2013, 2023)],
    twins: [{ make: 'Ford', model: 'Fusion', note: 'The GG Mazda6 underpinned Ford’s CD3 platform (Fusion, Milan, MKZ).' }],
  },
  {
    make: 'Mazda', model: 'Mazda3', body: 'sedan',
    generations: [g('BK', 2004, 2009), g('BL', 2010, 2013), g('BM/BN', 2014, 2018), g('BP', 2019)],
    twins: [{ make: 'Ford', model: 'Focus', note: 'BK and BL Mazda3 shared the Ford C1 platform with the Focus and Volvo S40.' }],
  },
  { make: 'Mazda', model: 'CX-5', body: 'crossover', generations: [g('KE', 2012, 2016), g('KF', 2017)] },
  {
    make: 'Mazda', model: 'CX-9', body: 'suv',
    generations: [g('TB', 2007, 2015), g('TC', 2016, 2023)],
    twins: [{ make: 'Ford', model: 'Edge', note: 'The TB CX-9 shared the Ford CD3 platform with the first Edge.' }],
  },
  {
    make: 'Mazda', model: 'BT-50', body: 'pickup',
    generations: [g('UN', 2006, 2011), g('UP/UR', 2011, 2020), g('TF', 2020)],
    twins: [
      { make: 'Ford', model: 'Ranger', note: 'UN and UP/UR BT-50 were Ranger twins.' },
      { make: 'Isuzu', model: 'D-Max', note: 'The 2020+ TF BT-50 is built by Isuzu on the D-Max.' },
    ],
  },

  // ── Suzuki / Subaru / Isuzu ───────────────────────────────────────────
  { make: 'Suzuki', model: 'Swift', body: 'hatchback', generations: [g('RS', 2005, 2010), g('AZG', 2011, 2016), g('AZ', 2017)] },
  { make: 'Suzuki', model: 'Vitara', body: 'crossover', generations: [g('Grand Vitara JT', 2006, 2017), g('LY', 2015)] },
  { make: 'Suzuki', model: 'Jimny', body: 'suv', generations: [g('JB43', 1998, 2018), g('JB74', 2019)] },
  {
    make: 'Suzuki', model: 'Baleno', body: 'hatchback',
    generations: [g('WB', 2016, 2021), g('WB (2nd)', 2022)],
    twins: [{ make: 'Toyota', model: 'Starlet', note: 'Toyota sells the Baleno as the Glanza (India) and Starlet (Africa, Gulf).' }],
  },
  { make: 'Suzuki', model: 'Ertiga', body: 'mpv', generations: [g('ZE', 2012, 2018), g('ZK', 2018)], twins: [{ make: 'Toyota', model: 'Rumion', note: 'Toyota-badged Ertiga.' }] },
  {
    make: 'Subaru', model: 'BRZ', body: 'sports',
    generations: [g('ZC6', 2012, 2021), g('ZD8', 2022)],
    twins: [{ make: 'Toyota', model: 'GR86', note: 'Same car as the Toyota 86 / GR86.' }],
  },
  { make: 'Subaru', model: 'Forester', body: 'crossover', generations: [g('SG', 2003, 2008), g('SH', 2009, 2013), g('SJ', 2014, 2018), g('SK', 2019)] },
  {
    make: 'Isuzu', model: 'D-Max', body: 'pickup',
    generations: [g('TFR (1st)', 2002, 2012), g('RT50 (2nd)', 2012, 2019), g('RG (3rd)', 2020)],
    twins: [
      { make: 'Chevrolet', model: 'Colorado', note: 'The Thai-built 2012–2019 Colorado shared the second D-Max.' },
      { make: 'Mazda', model: 'BT-50', note: 'The 2020+ BT-50 is an Isuzu-built D-Max.' },
    ],
  },
  { make: 'Isuzu', model: 'MU-X', body: 'suv', generations: [g('1st', 2013, 2020), g('2nd', 2021)], twins: [{ make: 'Isuzu', model: 'D-Max', note: 'SUV body on the D-Max chassis.' }] },
]
