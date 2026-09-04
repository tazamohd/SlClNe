import { g, type VehicleModel } from './types'

/** American makes — full-size trucks and SUVs are Gulf staples, and GM,
 *  Ford and Stellantis each sell one body under two or three badges. */
export const AMERICAN: readonly VehicleModel[] = [
  // ── Ford / Lincoln ────────────────────────────────────────────────────
  {
    make: 'Ford', model: 'F-150', body: 'pickup',
    generations: [g('P221', 2004, 2008), g('P415', 2009, 2014, ['XL', 'XLT', 'Lariat', 'Platinum', 'Raptor']), g('P552', 2015, 2020, ['XL', 'XLT', 'Lariat', 'Platinum', 'Limited', 'Raptor']), g('P702', 2021, undefined, ['XL', 'XLT', 'Lariat', 'Platinum', 'Raptor', 'Lightning'])],
    twins: [{ make: 'Lincoln', model: 'Mark LT', note: '2006–2008 Mark LT was a Lincoln-badged F-150.' }],
  },
  {
    make: 'Ford', model: 'Explorer', body: 'suv',
    generations: [g('U152', 2002, 2005), g('U251', 2006, 2010), g('U502', 2011, 2019, ['XLT', 'Limited', 'Sport', 'Platinum']), g('U625', 2020, undefined, ['XLT', 'Limited', 'ST', 'Platinum'])],
    twins: [
      { make: 'Lincoln', model: 'Aviator', note: 'The 2020+ Aviator shares the U625 Explorer’s rear-drive CD6 platform.' },
      { make: 'Mercury', model: 'Mountaineer', note: 'Mercury’s badge on the Explorer until 2010.' },
    ],
  },
  {
    make: 'Ford', model: 'Expedition', body: 'suv',
    generations: [g('U222', 2003, 2006), g('U324', 2007, 2017, ['XLT', 'Limited', 'King Ranch', 'Platinum']), g('U553', 2018, undefined, ['XLT', 'Limited', 'Platinum', 'Timberline'])],
    twins: [{ make: 'Lincoln', model: 'Navigator', note: 'The Navigator is the Expedition with Lincoln bodywork in every generation.' }],
  },
  {
    make: 'Ford', model: 'Edge', body: 'crossover',
    generations: [g('CD3 (1st)', 2007, 2014), g('CD4 (2nd)', 2015, 2024, ['SE', 'SEL', 'Titanium', 'ST'])],
    twins: [{ make: 'Lincoln', model: 'Nautilus', note: 'MKX / Nautilus is the Edge’s Lincoln twin.' }],
  },
  {
    make: 'Ford', model: 'Taurus', body: 'sedan',
    generations: [g('D258 (5th)', 2008, 2009), g('D3 (6th)', 2010, 2019, ['SE', 'SEL', 'Limited', 'SHO']), g('CD4 (Gulf / China)', 2016, 2023)],
    twins: [{ make: 'Lincoln', model: 'MKS', note: 'The 2009–2016 MKS shared the D3 Taurus platform.' }],
  },
  {
    make: 'Ford', model: 'Mustang', body: 'coupe',
    generations: [g('SN95 (New Edge)', 1999, 2004), g('S197', 2005, 2014, ['V6', 'GT', 'Shelby GT500']), g('S550', 2015, 2023, ['EcoBoost', 'GT', 'Mach 1', 'Shelby GT500']), g('S650', 2024, undefined, ['EcoBoost', 'GT', 'Dark Horse'])],
  },
  {
    make: 'Ford', model: 'Fusion', body: 'sedan',
    generations: [g('CD3', 2006, 2012), g('CD4', 2013, 2020, ['S', 'SE', 'Titanium', 'Hybrid'])],
    twins: [{ make: 'Lincoln', model: 'MKZ', note: 'The MKZ (and Mercury Milan) share the Fusion platform.' }],
  },
  { make: 'Ford', model: 'Escape', body: 'crossover', generations: [g('ZB', 2001, 2007), g('ZD', 2008, 2012), g('C520', 2013, 2019), g('CX482', 2020)], twins: [{ make: 'Ford', model: 'Kuga', note: 'The Escape is sold as the Kuga in Europe from 2013.' }] },
  {
    make: 'Ford', model: 'Ranger', body: 'pickup',
    generations: [g('PJ/PK', 2007, 2011), g('T6 (PX)', 2012, 2022, ['XL', 'XLT', 'Wildtrak', 'Raptor']), g('T6.2 (P703)', 2023, undefined, ['XLT', 'Wildtrak', 'Raptor'])],
    twins: [
      { make: 'Mazda', model: 'BT-50', note: '2011–2020 BT-50 was a T6 Ranger twin.' },
      { make: 'Volkswagen', model: 'Amarok', note: 'The 2023+ Amarok is built by Ford on the P703 Ranger.' },
    ],
  },
  { make: 'Ford', model: 'Everest', body: 'suv', generations: [g('UA', 2015, 2022), g('U704', 2023)], twins: [{ make: 'Ford', model: 'Ranger', note: 'SUV body on the T6 Ranger.' }] },
  { make: 'Ford', model: 'Territory', body: 'crossover', generations: [g('CX743 (China)', 2019, 2023), g('CX744', 2024)], twins: [{ make: 'JMC', model: 'Yusheng S330', note: 'The first Gulf Territory was the JMC Yusheng S330 with Ford badges.' }] },
  { make: 'Lincoln', model: 'Navigator', body: 'suv', generations: [g('U228', 2003, 2006), g('U326', 2007, 2017), g('U554', 2018)], twins: [{ make: 'Ford', model: 'Expedition', note: 'Expedition twin.' }] },
  { make: 'Lincoln', model: 'Aviator', body: 'suv', generations: [g('U152', 2003, 2005), g('U611', 2020)], twins: [{ make: 'Ford', model: 'Explorer', note: 'Explorer platform twin in both generations.' }] },

  // ── Chevrolet / GMC / Cadillac ────────────────────────────────────────
  {
    make: 'Chevrolet', model: 'Tahoe', body: 'suv',
    generations: [g('GMT800', 2000, 2006, ['LS', 'LT', 'Z71']), g('GMT900', 2007, 2014, ['LS', 'LT', 'LTZ']), g('K2XX', 2015, 2020, ['LS', 'LT', 'RST', 'Premier']), g('T1XX', 2021, undefined, ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'])],
    twins: [
      { make: 'GMC', model: 'Yukon', note: 'The Yukon is the Tahoe with GMC trim.' },
      { make: 'Cadillac', model: 'Escalade', note: 'The Escalade is the same truck under Cadillac bodywork.' },
    ],
  },
  { make: 'Chevrolet', model: 'Suburban', body: 'suv', generations: [g('GMT800', 2000, 2006), g('GMT900', 2007, 2014), g('K2XX', 2015, 2020), g('T1XX', 2021)], twins: [{ make: 'GMC', model: 'Yukon XL', note: 'Yukon XL and Escalade ESV are the Suburban’s twins.' }] },
  {
    make: 'Chevrolet', model: 'Silverado', body: 'pickup',
    generations: [g('GMT800', 1999, 2006), g('GMT900', 2007, 2013), g('K2XX', 2014, 2018), g('T1XX', 2019, undefined, ['WT', 'LT', 'RST', 'LTZ', 'High Country', 'ZR2'])],
    twins: [{ make: 'GMC', model: 'Sierra', note: 'The Sierra is the Silverado with GMC trim.' }],
  },
  { make: 'Chevrolet', model: 'Traverse', body: 'suv', generations: [g('Lambda', 2009, 2017), g('C1XX', 2018, 2023), g('C1YX', 2024)], twins: [{ make: 'GMC', model: 'Acadia', note: 'Acadia and Buick Enclave share the Traverse platform.' }] },
  { make: 'Chevrolet', model: 'Malibu', body: 'sedan', generations: [g('7th', 2004, 2007), g('8th', 2008, 2012), g('9th', 2013, 2015), g('9th (E2XX)', 2016, 2024, ['LS', 'LT', 'Premier'])] },
  { make: 'Chevrolet', model: 'Camaro', body: 'coupe', generations: [g('5th', 2010, 2015, ['LS', 'LT', 'SS', 'ZL1']), g('6th (Alpha)', 2016, 2024, ['LT', 'SS', 'ZL1'])], twins: [{ make: 'Cadillac', model: 'ATS', note: 'The sixth Camaro shares Cadillac’s Alpha platform with the ATS and CTS.' }] },
  { make: 'Chevrolet', model: 'Corvette', body: 'sports', generations: [g('C5', 1997, 2004), g('C6', 2005, 2013), g('C7', 2014, 2019), g('C8', 2020, undefined, ['Stingray', 'Z06', 'E-Ray', 'ZR1'])] },
  { make: 'Chevrolet', model: 'Cruze', body: 'sedan', generations: [g('J300', 2009, 2015), g('D2LC', 2016, 2019)] },
  { make: 'Chevrolet', model: 'Captiva', body: 'crossover', generations: [g('C100/C140', 2007, 2018), g('C1 (Baojun 530)', 2019)], twins: [{ make: 'Opel', model: 'Antara', note: 'The 2007–2018 Captiva and Antara were twins; the 2019+ Captiva is a Baojun 530 / MG Hector.' }] },
  { make: 'Chevrolet', model: 'Trailblazer', body: 'suv', generations: [g('GMT360', 2002, 2009), g('31XX (Thai)', 2013, 2020), g('9BXX', 2021)], twins: [{ make: 'GMC', model: 'Envoy', note: 'GMT360 Trailblazer twin (2002–2009).' }] },
  { make: 'GMC', model: 'Yukon', body: 'suv', generations: [g('GMT800', 2000, 2006), g('GMT900', 2007, 2014), g('K2XX', 2015, 2020), g('T1XX', 2021, undefined, ['SLE', 'SLT', 'AT4', 'Denali'])], twins: [{ make: 'Chevrolet', model: 'Tahoe', note: 'Tahoe twin.' }] },
  { make: 'GMC', model: 'Sierra', body: 'pickup', generations: [g('GMT800', 1999, 2006), g('GMT900', 2007, 2013), g('K2XX', 2014, 2018), g('T1XX', 2019, undefined, ['SLE', 'Elevation', 'SLT', 'AT4', 'Denali'])], twins: [{ make: 'Chevrolet', model: 'Silverado', note: 'Silverado twin.' }] },
  { make: 'GMC', model: 'Acadia', body: 'suv', generations: [g('Lambda', 2007, 2016), g('C1XX', 2017, 2023), g('C1YX', 2024)], twins: [{ make: 'Chevrolet', model: 'Traverse', note: 'Traverse twin.' }] },
  { make: 'GMC', model: 'Terrain', body: 'crossover', generations: [g('Theta', 2010, 2017), g('D2XX', 2018)], twins: [{ make: 'Chevrolet', model: 'Equinox', note: 'Equinox twin.' }] },
  { make: 'Cadillac', model: 'Escalade', body: 'suv', generations: [g('GMT800', 2002, 2006), g('GMT900', 2007, 2014), g('K2XX', 2015, 2020), g('T1XX', 2021, undefined, ['Luxury', 'Premium Luxury', 'Sport', 'Platinum', 'V'])], twins: [{ make: 'Chevrolet', model: 'Tahoe', note: 'Tahoe / Yukon twin.' }] },
  { make: 'Cadillac', model: 'CT5', body: 'sedan', generations: [g('Alpha 2', 2020, undefined, ['Luxury', 'Premium Luxury', 'V', 'V Blackwing'])] },

  // ── Dodge / Chrysler / Jeep / RAM ─────────────────────────────────────
  {
    make: 'Dodge', model: 'Charger', body: 'sedan',
    generations: [g('LX', 2006, 2010, ['SE', 'SXT', 'R/T', 'SRT8']), g('LD', 2011, 2023, ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'])],
    twins: [{ make: 'Chrysler', model: '300', note: 'The 300 and the Challenger share the Charger’s LX / LD platform, itself derived from the W211 Mercedes E-Class.' }],
  },
  { make: 'Dodge', model: 'Challenger', body: 'coupe', generations: [g('LC', 2008, 2023, ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'])], twins: [{ make: 'Dodge', model: 'Charger', note: 'Charger LX platform.' }] },
  { make: 'Dodge', model: 'Durango', body: 'suv', generations: [g('HB', 2004, 2009), g('WD', 2011, undefined, ['SXT', 'GT', 'R/T', 'SRT'])], twins: [{ make: 'Jeep', model: 'Grand Cherokee', note: 'The WD Durango is the long body of the WK2 Grand Cherokee.' }] },
  { make: 'Chrysler', model: '300', body: 'sedan', generations: [g('LX', 2005, 2010, ['300', '300C', 'SRT8']), g('LD', 2011, 2023, ['300', '300S', '300C'])], twins: [{ make: 'Dodge', model: 'Charger', note: 'Charger twin.' }] },
  {
    make: 'Jeep', model: 'Grand Cherokee', body: 'suv',
    generations: [g('WJ', 1999, 2004), g('WK', 2005, 2010, ['Laredo', 'Limited', 'Overland', 'SRT8']), g('WK2', 2011, 2021, ['Laredo', 'Limited', 'Overland', 'Summit', 'SRT', 'Trackhawk']), g('WL', 2022, undefined, ['Laredo', 'Limited', 'Overland', 'Summit', 'L'])],
    twins: [
      { make: 'Dodge', model: 'Durango', note: 'WD Durango is a WK2 Grand Cherokee twin.' },
      { make: 'Jeep', model: 'Commander', note: 'The 2006–2010 Commander (XK) was a boxier WK Grand Cherokee.' },
    ],
  },
  {
    make: 'Jeep', model: 'Wrangler', body: 'suv',
    generations: [g('TJ', 1997, 2006), g('JK', 2007, 2018, ['Sport', 'Sahara', 'Rubicon']), g('JL', 2018, undefined, ['Sport', 'Sahara', 'Rubicon', '392'])],
    twins: [{ make: 'Jeep', model: 'Gladiator', note: 'The JT Gladiator is the JL Wrangler as a pickup.' }],
  },
  { make: 'Jeep', model: 'Cherokee', body: 'crossover', generations: [g('KJ (Liberty)', 2002, 2007), g('KK (Liberty)', 2008, 2012), g('KL', 2014, 2023)], twins: [{ make: 'Chrysler', model: '200', note: 'The KL shared the Compact US Wide platform with the 2015 Chrysler 200 and Dodge Dart.' }] },
  { make: 'RAM', model: '1500', body: 'pickup', generations: [g('DR', 2002, 2008), g('DS', 2009, 2018, ['Tradesman', 'Big Horn', 'Laramie']), g('DT', 2019, undefined, ['Big Horn', 'Laramie', 'Rebel', 'Limited', 'TRX'])] },
]
