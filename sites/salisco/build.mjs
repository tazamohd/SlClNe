// SALISCO site generator. `node build.mjs` writes every page from the copy below.
// One header, one footer, one stylesheet, one script; pages differ only in <main>.
// Every string exists in both languages: <span lang="en"> and <span lang="ar">.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://salisco.com';
const DEMO = 'https://salisauto.app/public-portal/book-demo';

const t = (en, ar) => `<span lang="en">${en}</span><span lang="ar">${ar}</span>`;
const L = (s) => `<span dir="ltr">${s}</span>`;

/* ---------------------------------------------------------------- pages */
const PAGES = [
  { path: 'index.html', key: 'home', title: ['SALISCO', 'ساليسكو'],
    desc: ['SALISCO builds operational software for Saudi Arabia on one backbone: Arabic, ZATCA, SAR and an audit trail. Four product lines: Garage, Spare Parts, Fleet, Insurance.',
           'ساليسكو تبني برمجيات تشغيلية للمملكة على أساس واحد: العربية، الهيئة، الريال، وسجل التدقيق. أربعة خطوط: الورشة، قطع الغيار، الأساطيل، التأمين.'] },
  { path: 'products/garage.html', key: 'garage', title: ['SALIS Garage', 'SALIS Garage'],
    desc: ['SALIS Garage is workshop management for Saudi workshops, shipping today as SALIS AUTO: check-in to invoice, ZATCA e-invoicing, Arabic and English, one audit trail.',
           'SALIS Garage هو إدارة الورش للورش السعودية، يعمل اليوم باسم SALIS AUTO: من الاستقبال إلى الفاتورة، فوترة إلكترونية، عربي وإنجليزي، سجل تدقيق واحد.'] },
  { path: 'products/spare-parts.html', key: 'parts', title: ['SALIS Spare Parts', 'SALIS Spare Parts'],
    desc: ['SALIS Spare Parts is the supplier network inside SALIS AUTO: catalogue, price comparison, purchase orders, automatic reorder and the supplier portal.',
           'SALIS Spare Parts هي شبكة الموردين داخل SALIS AUTO: الكتالوج، مقارنة الأسعار، أوامر الشراء، إعادة الطلب تلقائياً، وبوابة الموردين.'] },
  { path: 'products/fleet.html', key: 'fleet', title: ['SALIS Fleet', 'SALIS Fleet'],
    desc: ['SALIS Fleet runs fleet accounts inside SALIS AUTO: vehicles under contract, SLA tracking, cost per vehicle and utilisation across branches.',
           'SALIS Fleet تدير حسابات الأساطيل داخل SALIS AUTO: المركبات تحت العقد، اتفاقيات مستوى الخدمة، التكلفة لكل مركبة، ونسبة الاستخدام عبر الفروع.'] },
  { path: 'products/insurance.html', key: 'insurance', title: ['SALIS Insurance', 'SALIS Insurance'],
    desc: ['SALIS Insurance is planned: claims and approvals between workshops and insurers on the estimate and invoice records that already exist in SALIS Garage.',
           'SALIS Insurance مخطط: المطالبات والموافقات بين الورش وشركات التأمين على سجلات عروض الأسعار والفواتير الموجودة في SALIS Garage.'] },
  { path: 'about.html', key: 'about', title: ['About SALISCO', 'عن ساليسكو'],
    desc: ['What SALISCO is, the four assumptions every product starts from, and where it is built.',
           'ما هي ساليسكو، الافتراضات الأربعة التي يبدأ منها كل منتج، وأين تُبنى.'] },
  { path: '404.html', key: 'lost', noindex: true, title: ['Page not found', 'الصفحة غير موجودة'],
    desc: ['That address does not exist on salisco.com.', 'هذا العنوان غير موجود على salisco.com.'] },
  { path: 'contact.html', key: 'contact', title: ['Contact SALISCO', 'تواصل مع ساليسكو'],
    desc: ['Email, demo booking and the SALISCO accounts on LinkedIn, X, Instagram and YouTube.',
           'البريد، حجز العرض التوضيحي، وحسابات ساليسكو على لينكدإن وإكس وإنستغرام ويوتيوب.'] },
];

const rel = (p) => (p.includes('/') ? '../' : '');

/* ---------------------------------------------------------------- shared */
const traceSymbol = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="trace" viewBox="0 0 400 200">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="7" class="draw">
      <path d="M22 160 H118 L160 118 H262" stroke="#0BB3FF"/>
      <path d="M62 44 H140 L182 86 H300 L342 44" stroke="#0A5ED7"/>
      <path d="M204 176 H318 L362 132" stroke="#F97316"/>
      <path d="M22 100 H84" stroke="#0BB3FF"/>
    </g>
    <g class="dots">
      <circle cx="22" cy="160" r="10" fill="#0BB3FF"/>
      <circle cx="262" cy="118" r="10" fill="#0B1F3B" stroke="#0BB3FF" stroke-width="7"/>
      <circle cx="62" cy="44" r="10" fill="#F97316"/>
      <circle cx="342" cy="44" r="10" fill="#0B1F3B" stroke="#0A5ED7" stroke-width="7"/>
      <circle cx="362" cy="132" r="10" fill="#F97316"/>
      <circle cx="204" cy="176" r="10" fill="#0B1F3B" stroke="#F97316" stroke-width="7"/>
      <circle cx="84" cy="100" r="10" fill="#0B1F3B" stroke="#0BB3FF" stroke-width="7"/>
    </g>
  </symbol>
</svg>`;

function header(page) {
  const r = rel(page.path);
  const on = (k) => (page.key === k ? ' aria-current="page"' : '');
  return `
<a class="skip" href="#main">${t('Skip to content', 'انتقل إلى المحتوى')}</a>
<header id="site-header">
  <div class="wrap">
    <a class="wm" href="${r}index.html" aria-label="SALISCO" translate="no">SALISCO<i></i></a>
    <nav aria-label="Main">
      <ul>
        <li class="has-menu">
          <a href="${r}index.html#family"${['garage','parts','fleet','insurance'].includes(page.key) ? ' aria-current="true"' : ''}>${t('Products', 'المنتجات')}</a>
          <ul class="menu">
            <li><a href="${r}products/garage.html"${on('garage')}><b dir="ltr" translate="no">SALIS Garage</b><span>${t('Workshop management', 'إدارة الورش')}</span></a></li>
            <li><a href="${r}products/spare-parts.html"${on('parts')}><b dir="ltr" translate="no">SALIS Spare Parts</b><span>${t('Supplier network', 'شبكة الموردين')}</span></a></li>
            <li><a href="${r}products/fleet.html"${on('fleet')}><b dir="ltr" translate="no">SALIS Fleet</b><span>${t('Fleet accounts', 'حسابات الأساطيل')}</span></a></li>
            <li><a href="${r}products/insurance.html"${on('insurance')}><b dir="ltr" translate="no">SALIS Insurance</b><span>${t('Planned', 'مخطط')}</span></a></li>
          </ul>
        </li>
        <li><a href="${r}about.html"${on('about')}>${t('About', 'عن ساليسكو')}</a></li>
        <li><a href="${r}contact.html"${on('contact')}>${t('Contact', 'تواصل')}</a></li>
      </ul>
    </nav>
    <div class="hdr-actions">
      <button class="lang" type="button" id="langToggle" aria-label="Switch language"><span lang="en">العربية</span><span lang="ar" dir="ltr">English</span></button>
      <a class="btn small" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a>
      <button class="burger" type="button" id="menuToggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div id="mobile-menu" class="mobile" hidden>
    <a href="${r}products/garage.html" dir="ltr">SALIS Garage</a>
    <a href="${r}products/spare-parts.html" dir="ltr">SALIS Spare Parts</a>
    <a href="${r}products/fleet.html" dir="ltr">SALIS Fleet</a>
    <a href="${r}products/insurance.html" dir="ltr">SALIS Insurance</a>
    <a href="${r}about.html">${t('About', 'عن ساليسكو')}</a>
    <a href="${r}contact.html">${t('Contact', 'تواصل')}</a>
  </div>
</header>`;
}

function footer(page) {
  const r = rel(page.path);
  return `
<footer>
  <div class="wrap">
    <div>
      <a class="wm" href="${r}index.html" translate="no">SALISCO<i></i></a>
      <p class="tag">${t('Operational software for Saudi Arabia. One backbone, four product lines. Riyadh.', 'برمجيات تشغيلية للمملكة العربية السعودية. أساس واحد وأربعة خطوط منتجات. الرياض.')}</p>
    </div>
    <div>
      <span class="k">${t('Family', 'العائلة')}</span>
      <ul>
        <li><a href="${r}products/garage.html" dir="ltr">SALIS Garage</a> <em>${t('shipping', 'متاح')}</em></li>
        <li><a href="${r}products/spare-parts.html" dir="ltr">SALIS Spare Parts</a> <em>${t('in SALIS AUTO', 'داخل SALIS AUTO')}</em></li>
        <li><a href="${r}products/fleet.html" dir="ltr">SALIS Fleet</a> <em>${t('in SALIS AUTO', 'داخل SALIS AUTO')}</em></li>
        <li><a href="${r}products/insurance.html" dir="ltr">SALIS Insurance</a> <em>${t('planned', 'مخطط')}</em></li>
      </ul>
    </div>
    <div>
      <span class="k">${t('Accounts', 'الحسابات')}</span>
      <ul>
        <li><a href="https://www.linkedin.com/company/salisco" dir="ltr">linkedin.com/company/salisco</a></li>
        <li><a href="https://x.com/salisco" dir="ltr">x.com/salisco</a></li>
        <li><a href="https://www.instagram.com/salisco" dir="ltr">instagram.com/salisco</a></li>
        <li><a href="https://www.youtube.com/@salisco" dir="ltr">youtube.com/@salisco</a></li>
      </ul>
      <p class="fine">${t('Handles are not yet reserved.', 'المعرّفات لم تُحجز بعد.')}</p>
      <p class="legal"><a href="https://salisauto.app/privacy-policy">${t('Privacy', 'الخصوصية')}</a> · <a href="https://salisauto.app/terms-conditions">${t('Terms', 'الشروط')}</a> <span dir="ltr">(SALIS AUTO)</span></p>
    </div>
    <div>
      <span class="k">${t('Contact', 'تواصل')}</span>
      <ul>
        <li><a href="mailto:info@salisco.com" dir="ltr">info@salisco.com</a><span class="prop">${t('proposed', 'مقترح')}</span></li>
        <li><a href="https://salisco.com" dir="ltr">salisco.com</a></li>
        <li><a href="${DEMO}">${t('Book a SALIS AUTO demo', 'احجز عرض SALIS AUTO')}</a></li>
        <li><a href="https://salisauto.app" dir="ltr">salisauto.app</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

function head(page) {
  const r = rel(page.path);
  const url = SITE + '/' + (page.path === 'index.html' ? '' : page.path);
  const jsonld = page.key === 'home' ? `
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"SALISCO","alternateName":"ساليسكو","url":"${SITE}","email":"info@salisco.com",
 "address":{"@type":"PostalAddress","addressLocality":"Riyadh","addressCountry":"SA"},
 "sameAs":["https://www.linkedin.com/company/salisco","https://x.com/salisco","https://www.instagram.com/salisco","https://www.youtube.com/@salisco"],
 "brand":[{"@type":"Brand","name":"SALIS Garage"},{"@type":"Brand","name":"SALIS Spare Parts"},{"@type":"Brand","name":"SALIS Fleet"},{"@type":"Brand","name":"SALIS Insurance"}],
 "makesOffer":{"@type":"Offer","itemOffered":{"@type":"SoftwareApplication","name":"SALIS AUTO","url":"https://salisauto.app","applicationCategory":"BusinessApplication"}}}
</script>` : '';
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title[0]}</title>
<meta name="description" content="${page.desc[0]}">
<meta name="description" lang="ar" content="${page.desc[1]}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}?lang=en">
<link rel="alternate" hreflang="ar" href="${url}?lang=ar">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SALISCO">
<meta property="og:title" content="${page.title[0]}">
<meta property="og:description" content="${page.desc[0]}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="en_SA">
<meta property="og:locale:alternate" content="ar_SA">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@salisco">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F4F6F9">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0E1117">${page.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="${r}salisco-pfp.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&family=Poppins:wght@500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="${r}assets/site.css">
<script>document.documentElement.classList.add('js');document.documentElement.dataset.titleAr=${JSON.stringify(page.title[1])};document.documentElement.dataset.titleEn=${JSON.stringify(page.title[0])};</script>${jsonld}
</head>`;
}

/* ---------------------------------------------------------------- mocks */
const statusChip = (en, ar, cls = '') => `<span class="st ${cls}">${t(en, ar)}</span>`;

const mockGarage = `
<div class="bezel"><div class="mock" aria-label="Bay board, illustrative">
  <div class="bar"><b>${t('Bay board · Riyadh Main', 'لوحة الخلجان · الرياض الرئيسي')}</b><span class="mono" dir="ltr">04 Sep 2026 · 09:40</span></div>
  <div class="row head"><span>${t('Bay', 'الخليج')}</span><span>${t('Job card', 'بطاقة العمل')}</span><span>${t('Plate', 'اللوحة')}</span><span class="num">${t('Amount', 'المبلغ')}</span><span>${t('Status', 'الحالة')}</span></div>
  <div class="row"><b>1</b><span class="mono" dir="ltr">JC-4F2A</span><span class="mono" dir="ltr">RUH 4821</span><span class="num mono" dir="ltr">SAR 1,245.00</span>${statusChip('In repair', 'قيد الإصلاح')}</div>
  <div class="row"><b>2</b><span class="mono" dir="ltr">JC-4F2B</span><span class="mono" dir="ltr">RUH 1157</span><span class="num mono" dir="ltr">SAR 380.00</span>${statusChip('QC', 'فحص الجودة')}</div>
  <div class="row"><b>3</b><span class="mono" dir="ltr">JC-4F2C</span><span class="mono" dir="ltr">RUH 9930</span><span class="num mono" dir="ltr">SAR 2,910.50</span>${statusChip('Awaiting parts', 'بانتظار القطع', 'o')}</div>
  <div class="row"><b>4</b><span class="mono" dir="ltr">JC-4F2D</span><span class="mono" dir="ltr">RUH 2204</span><span class="num mono" dir="ltr">SAR 640.00</span>${statusChip('Delivered', 'تم التسليم')}</div>
  <div class="foot">${t('Illustrative rows. Figures are examples, not customer data.', 'صفوف توضيحية. الأرقام أمثلة وليست بيانات عملاء.')}</div>
</div></div>`;

const mockParts = `
<div class="bezel"><div class="mock" aria-label="Purchase order, illustrative">
  <div class="bar"><b>${t('Purchase order', 'أمر شراء')} <span class="mono" dir="ltr">PO-10421</span></b>${statusChip('Awaiting approval', 'بانتظار الاعتماد', 'o')}</div>
  <div class="kv"><span>${t('Supplier', 'المورّد')}</span><b>${t('Preferred supplier, Riyadh', 'المورّد المفضل، الرياض')}</b><span>${t('Trigger', 'السبب')}</span><b>${t('Stock below minimum: 4 of 12', 'المخزون تحت الحد: ٤ من ١٢')}</b></div>
  <div class="row head"><span>${t('Part', 'القطعة')}</span><span>${t('Number', 'الرقم')}</span><span class="num">${t('Qty', 'الكمية')}</span><span class="num">${t('Unit', 'الوحدة')}</span><span class="num">${t('Line', 'الإجمالي')}</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><span class="mono" dir="ltr">BP-2210-F</span><span class="num mono" dir="ltr">8</span><span class="num mono" dir="ltr">SAR 145.00</span><span class="num mono" dir="ltr">SAR 1,160.00</span></div>
  <div class="row"><span>${t('Oil filter', 'فلتر زيت')}</span><span class="mono" dir="ltr">OF-0090</span><span class="num mono" dir="ltr">24</span><span class="num mono" dir="ltr">SAR 28.50</span><span class="num mono" dir="ltr">SAR 684.00</span></div>
  <div class="row total"><span>${t('Total incl. VAT 15%', 'الإجمالي شامل الضريبة ١٥٪')}</span><span></span><span></span><span></span><b class="num mono" dir="ltr">SAR 2,120.60</b></div>
  <div class="foot">${t('Illustrative order. Prices are examples.', 'أمر توضيحي. الأسعار أمثلة.')}</div>
</div></div>`;

const mockFleet = `
<div class="bezel"><div class="mock" aria-label="Fleet utilisation, illustrative">
  <div class="bar"><b>${t('Fleet account · Contract 2026-14', 'حساب أسطول · عقد 2026-14')}</b><span class="mono" dir="ltr">31 Aug 2026</span></div>
  <div class="row head"><span>${t('Plate', 'اللوحة')}</span><span>${t('Branch', 'الفرع')}</span><span>${t('Utilisation', 'الاستخدام')}</span><span class="num">${t('Cost / km', 'التكلفة / كم')}</span></div>
  <div class="row"><span class="mono" dir="ltr">RUH 7712</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span><span class="util"><i style="width:82%"></i><em dir="ltr">82%</em></span><span class="num mono" dir="ltr">SAR 0.41</span></div>
  <div class="row"><span class="mono" dir="ltr">DMM 3048</span><span>${t('Dammam', 'الدمام')}</span><span class="util"><i style="width:64%"></i><em dir="ltr">64%</em></span><span class="num mono" dir="ltr">SAR 0.53</span></div>
  <div class="row"><span class="mono" dir="ltr">JED 5521</span><span>${t('Jeddah', 'جدة')}</span><span class="util"><i style="width:37%"></i><em dir="ltr">37%</em></span><span class="num mono" dir="ltr">SAR 0.88</span></div>
  <div class="row"><span class="mono" dir="ltr">RUH 0916</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span><span class="util"><i style="width:91%"></i><em dir="ltr">91%</em></span><span class="num mono" dir="ltr">SAR 0.36</span></div>
  <div class="foot">${t('Utilisation is days in service over days under contract. Illustrative figures.', 'الاستخدام هو أيام الخدمة على أيام العقد. أرقام توضيحية.')}</div>
</div></div>`;

const mockInsurance = `
<div class="bezel"><div class="mock planned" aria-label="Claim timeline, illustrative and planned">
  <div class="bar"><b>${t('Claim on estimate', 'مطالبة على عرض سعر')} <span class="mono" dir="ltr">EST-2041</span></b>${statusChip('Planned product', 'منتج مخطط', 'o')}</div>
  <ol class="timeline">
    <li class="done"><b>${t('Estimate issued', 'إصدار عرض السعر')}</b><span class="mono" dir="ltr">02 Sep · SAR 4,860.00</span></li>
    <li class="done"><b>${t('Submitted to insurer', 'الإرسال إلى شركة التأمين')}</b><span class="mono" dir="ltr">02 Sep · 14:10</span></li>
    <li class="now"><b>${t('Insurer approval, partial', 'موافقة جزئية من شركة التأمين')}</b><span class="mono" dir="ltr">03 Sep · SAR 4,120.00</span></li>
    <li><b>${t('Repair', 'الإصلاح')}</b><span>${t('Job card opens on approval', 'تُفتح بطاقة العمل عند الموافقة')}</span></li>
    <li><b>${t('Invoice split: insurer and customer', 'فاتورة مقسّمة: شركة التأمين والعميل')}</b><span>${t('ZATCA e-invoice for each', 'فاتورة إلكترونية لكل طرف')}</span></li>
  </ol>
  <div class="foot">${t('This flow is planned, not available. Shown to state the intent.', 'هذا المسار مخطط وغير متاح. يُعرض لبيان النية.')}</div>
</div></div>`;

/* ---------------------------------------------------------------- home */
const familyMap = `
<div class="map" role="img" aria-label="Four product lines on one backbone">
  <div class="lines">
    <a class="line live" href="products/garage.html"><span class="core"><span class="cap">${t('Shipping', 'متاح')}</span><b dir="ltr" translate="no">SALIS Garage</b><span>${t('Workshop management, as SALIS AUTO', 'إدارة الورش، باسم SALIS AUTO')}</span></span></a>
    <a class="line" href="products/spare-parts.html"><span class="core"><span class="cap">${t('In SALIS AUTO', 'داخل SALIS AUTO')}</span><b dir="ltr" translate="no">SALIS Spare Parts</b><span>${t('Supplier network and reorder', 'شبكة الموردين وإعادة الطلب')}</span></span></a>
    <a class="line" href="products/fleet.html"><span class="core"><span class="cap">${t('In SALIS AUTO', 'داخل SALIS AUTO')}</span><b dir="ltr" translate="no">SALIS Fleet</b><span>${t('Fleet accounts across branches', 'حسابات الأساطيل عبر الفروع')}</span></span></a>
    <a class="line plan" href="products/insurance.html"><span class="core"><span class="cap">${t('Planned', 'مخطط')}</span><b dir="ltr" translate="no">SALIS Insurance</b><span>${t('Claims on the same records', 'مطالبات على السجلات نفسها')}</span></span></a>
  </div>
  <div class="rail"><span class="railcap">${t('One backbone', 'أساس واحد')}</span></div>
  <div class="assume">
    <div><i></i><b>${t('Arabic first', 'العربية أولاً')}</b><span>${t('Written for Arabic, English beside it', 'تُكتب بالعربية والإنجليزية بجانبها')}</span></div>
    <div><i></i><b>${t('ZATCA in the core', 'الهيئة في النواة')}</b><span>${t('QR and hash chain in the posting transaction', 'رمز الاستجابة وسلسلة التجزئة في معاملة الترحيل')}</span></div>
    <div><i></i><b>${t('SAR to the halala', 'الريال حتى الهللة')}</b><span>${t('Integer halalas, rounding once', 'هللات صحيحة، وتقريب مرة واحدة')}</span></div>
    <div><i class="o"></i><b>${t('One audit row per change', 'سطر تدقيق لكل تغيير')}</b><span>${t('Actor, before, after, request id', 'الفاعل، قبل، بعد، رقم الطلب')}</span></div>
  </div>
</div>`;

const home = `
<section class="hero" aria-labelledby="hero-h">
  <svg class="trace anim" viewBox="0 0 400 200" style="width:980px;inset-inline-end:-300px;top:-160px"><use href="#trace"/></svg>
  <svg class="trace anim late" viewBox="0 0 400 200" style="width:700px;inset-inline-start:-260px;bottom:-240px;transform:rotate(180deg)"><use href="#trace"/></svg>
  <div class="wrap hero-grid">
    <div>
      <div class="eyebrow">${t('Riyadh · Operational software for Saudi Arabia', 'الرياض · برمجيات تشغيلية للمملكة')}</div>
      <h1 id="hero-h">${t('One backbone.<br>Four lines of <span class="o">Saudi-built</span> software.', 'أساس واحد.<br>أربعة خطوط من البرمجيات <span class="o">المبنية في السعودية.</span>')}</h1>
      <p class="lede">${t('SALISCO builds the operational software Saudi businesses run on. Garage, Spare Parts, Fleet and Insurance share one ledger and four assumptions from day one: Arabic, ZATCA, the riyal, and an audit trail that answers who changed what.', 'ساليسكو تبني البرمجيات التشغيلية التي تعمل عليها المنشآت السعودية. الورشة وقطع الغيار والأساطيل والتأمين تتشارك دفتراً واحداً وأربعة افتراضات من اليوم الأول: العربية، الهيئة، الريال، وسجل تدقيق يجيب عن سؤال من غيّر ماذا.')}</p>
      <div class="ctas">
        <a class="btn on-dark" href="#family">${t('See the four lines', 'اطّلع على الخطوط الأربعة')}<span class="arr" aria-hidden="true">→</span></a>
        <a class="btn ghost-dark" href="${DEMO}">${t('Book a SALIS AUTO demo', 'احجز عرض SALIS AUTO')}</a>
      </div>
    </div>
    <div class="hero-mock">${mockGarage}</div>
  </div>
</section>

<section id="family" class="wrap" aria-labelledby="family-h">
  <div class="sec-head">
    <div class="eyebrow">${t('The family', 'العائلة')}</div>
    <h2 id="family-h">${t('One family. Four products. Status stated on every line.', 'عائلة واحدة. أربعة منتجات. الحالة مذكورة في كل سطر.')}</h2>
    <p>${t('Garage is what a workshop signs in to today. Spare Parts and Fleet ship inside it. Insurance is planned and is described as planned.', 'الورشة هي ما تسجّل الورش الدخول إليه اليوم. قطع الغيار والأساطيل تعمل داخلها. التأمين مخطط ويوصف بأنه مخطط.')}</p>
  </div>
  ${familyMap}
  <div class="note">${t('Product lines confirmed by the owner on 4 September 2026. Statuses describe what a workshop can sign in to today, not the roadmap.', 'خطوط المنتجات كما أكدها المالك في ٤ سبتمبر ٢٠٢٦. تصف الحالات ما تستطيع الورشة تسجيل الدخول إليه اليوم، لا خارطة الطريق.')}</div>
</section>

<section id="lines" class="wrap lines-detail" aria-label="Product lines in detail">
  <article class="line-row">
    <div class="line-text">
      <div class="eyebrow">${t('Garage · shipping as SALIS AUTO', 'الورشة · متاح باسم SALIS AUTO')}</div>
      <h3 dir="ltr" translate="no">SALIS Garage</h3>
      <p>${t('The full workshop lifecycle on one job card: check-in, inspection, estimate, repair, quality control, delivery. Finance and ZATCA e-invoicing on the same record, a customer app, and portals for technicians and suppliers.', 'دورة الورشة كاملة على بطاقة عمل واحدة: الاستقبال، الفحص، عرض السعر، الإصلاح، مراقبة الجودة، التسليم. المالية والفوترة الإلكترونية على السجل نفسه، وتطبيق للعملاء، وبوابات للفنيين والموردين.')}</p>
      <a class="more" href="products/garage.html">${t('Read about Garage', 'اقرأ عن الورشة')} <span dir="ltr" aria-hidden="true">→</span></a>
    </div>
    <div class="line-mock">${mockGarage}</div>
  </article>
  <article class="line-row flip">
    <div class="line-text">
      <div class="eyebrow">${t('Spare Parts · in SALIS AUTO today', 'قطع الغيار · داخل SALIS AUTO اليوم')}</div>
      <h3 dir="ltr" translate="no">SALIS Spare Parts</h3>
      <p>${t('Supplier catalogue, price comparison, purchase orders, and automatic reorder when stock drops below its minimum. Suppliers publish and confirm through their own portal.', 'كتالوج الموردين، مقارنة الأسعار، أوامر الشراء، وإعادة الطلب تلقائياً عند انخفاض المخزون عن حده. ينشر الموردون ويؤكدون عبر بوابتهم.')}</p>
      <a class="more" href="products/spare-parts.html">${t('Read about Spare Parts', 'اقرأ عن قطع الغيار')} <span dir="ltr" aria-hidden="true">→</span></a>
    </div>
    <div class="line-mock">${mockParts}</div>
  </article>
  <article class="line-row">
    <div class="line-text">
      <div class="eyebrow">${t('Fleet · in SALIS AUTO today', 'الأساطيل · داخل SALIS AUTO اليوم')}</div>
      <h3 dir="ltr" translate="no">SALIS Fleet</h3>
      <p>${t('Vehicles under contract, SLA tracking, cost per vehicle and utilisation across branches, from the same job cards the workshop already writes.', 'المركبات تحت العقد، متابعة اتفاقيات مستوى الخدمة، التكلفة لكل مركبة ونسبة الاستخدام عبر الفروع، من بطاقات العمل نفسها التي تكتبها الورشة.')}</p>
      <a class="more" href="products/fleet.html">${t('Read about Fleet', 'اقرأ عن الأساطيل')} <span dir="ltr" aria-hidden="true">→</span></a>
    </div>
    <div class="line-mock">${mockFleet}</div>
  </article>
  <article class="line-row flip">
    <div class="line-text">
      <div class="eyebrow">${t('Insurance · planned', 'التأمين · مخطط')}</div>
      <h3 dir="ltr" translate="no">SALIS Insurance</h3>
      <p>${t('Claims and approvals between workshops and insurers on the estimate and invoice records that already exist. Not available yet, and not described as if it were.', 'المطالبات والموافقات بين الورش وشركات التأمين على سجلات عروض الأسعار والفواتير الموجودة أصلاً. غير متاح بعد، ولا يوصف كأنه متاح.')}</p>
      <a class="more" href="products/insurance.html">${t('Read the plan for Insurance', 'اقرأ خطة التأمين')} <span dir="ltr" aria-hidden="true">→</span></a>
    </div>
    <div class="line-mock">${mockInsurance}</div>
  </article>
</section>

<section id="why" class="wrap" aria-labelledby="why-h">
  <div class="sec-head">
    <div class="eyebrow">${t('Why one family', 'لماذا عائلة واحدة')}</div>
    <h2 id="why-h">${t('The value is the absence of seams.', 'القيمة في غياب الفواصل.')}</h2>
  </div>
  <div class="why">
    <div><span class="k">${t('Saudi-native', 'سعودية الأصل')}</span><h3>${t('Built for this market, not translated into it.', 'بُنيت لهذا السوق، لا تُرجمت إليه.')}</h3><p>${t('ZATCA, SAR and Arabic are the assumptions each product starts from. Nothing is bolted on late, so nothing behaves differently in Arabic than in English.', 'الهيئة والريال والعربية هي الافتراضات التي يبدأ منها كل منتج. لا شيء يُضاف لاحقاً، فلا شيء يتصرف بالعربية بخلاف الإنجليزية.')}</p></div>
    <div><span class="k">${t('One backbone', 'أساس واحد')}</span><h3>${t('Products share a ledger, not an integration.', 'المنتجات تتشارك دفتراً واحداً، لا تكاملاً.')}</h3><p>${t('An estimate, a purchase order, a fleet contract and a claim are rows in one system. There is nothing to export, reconcile or retype between them.', 'عرض السعر وأمر الشراء وعقد الأسطول والمطالبة سطور في نظام واحد. لا شيء يُصدَّر أو يُطابَق أو يُعاد إدخاله بينها.')}</p></div>
    <div><span class="k">${t('Auditable', 'قابلة للتدقيق')}</span><h3>${t('Traceability is enforced by the database.', 'التتبع تفرضه قاعدة البيانات.')}</h3><p>${t('Every mutation writes its audit row in the same transaction. The promise is not in the marketing copy. It is in the schema.', 'كل تعديل يكتب سطر تدقيقه في المعاملة نفسها. الوعد ليس في نص تسويقي. إنه في بنية البيانات.')}</p></div>
  </div>
</section>

${proofBand()}

<section class="wrap cta-end" aria-label="Next step">
  <h2>${t('See the shipping product on your own numbers.', 'شاهد المنتج المتاح على أرقامك.')}</h2>
  <p>${t('A 20-minute SALIS AUTO demo, in Arabic or English, on a job card from your floor.', 'عرض SALIS AUTO لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}</p>
  <div class="ctas"><a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="contact.html">${t('Contact SALISCO', 'تواصل مع ساليسكو')}</a></div>
</section>`;

function proofBand() {
  return `
<section id="proof" class="proof" aria-labelledby="proof-h">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow bright">${t('Results from SALIS AUTO deployments', 'نتائج من تشغيل SALIS AUTO')}</div>
      <h2 id="proof-h">${t('Numbers carry their baseline or they do not appear.', 'الأرقام تحمل أساس قياسها أو لا تظهر.')}</h2>
    </div>
    <div class="grid">
      <div class="cell"><div class="pair" dir="ltr"><span class="from">48 h</span><span class="to">4 h</span></div><div class="what">${t('Estimate approval', 'اعتماد عرض السعر')}</div><div class="base">${t('Baseline: paper estimates signed at the counter.', 'الأساس: عروض أسعار ورقية تُوقَّع عند الكاونتر.')}</div></div>
      <div class="cell"><div class="pair" dir="ltr"><span class="from">15 min</span><span class="to">2 min</span></div><div class="what">${t('Invoice at the counter', 'الفاتورة عند الكاونتر')}</div><div class="base">${t('Baseline: handwritten invoice copied to a spreadsheet at day’s end.', 'الأساس: فاتورة بخط اليد تُنسخ إلى جدول في نهاية اليوم.')}</div></div>
      <div class="cell"><div class="pair" dir="ltr"><span class="to">+25%</span></div><div class="what">${t('Workshop throughput', 'إنتاجية الورشة')}</div><div class="base">${t('Measured across deployments against each workshop’s prior twelve months.', 'مقاسة عبر عمليات التشغيل مقارنة بالاثني عشر شهراً السابقة لكل ورشة.')}</div></div>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- product pages */
function productPage(o) {
  return `
<section class="phero" aria-labelledby="ph">
  <svg class="trace anim" viewBox="0 0 400 200" style="width:900px;inset-inline-end:-320px;top:-200px"><use href="#trace"/></svg>
  <div class="wrap hero-grid">
    <div>
      <div class="crumbs"><a href="../index.html">SALISCO</a> <span aria-hidden="true">/</span> <a href="../index.html#family">${t('Products', 'المنتجات')}</a></div>
      <div class="eyebrow">${o.eyebrow}</div>
      <h1 id="ph" dir="ltr" translate="no">${o.name}</h1>
      <p class="lede">${o.lede}</p>
      <div class="ctas">${o.ctas}</div>
      <div class="statusline">${o.status}</div>
    </div>
    <div class="hero-mock">${o.mock}</div>
  </div>
</section>

<section class="wrap two" aria-labelledby="what-h">
  <div class="sec-head"><div class="eyebrow">${t('What it does', 'ما الذي يقوم به')}</div><h2 id="what-h">${o.whatH}</h2></div>
  <ul class="facts">${o.facts.map(([en, ar]) => `<li>${t(en, ar)}</li>`).join('')}</ul>
</section>

<section class="wrap" aria-labelledby="who-h">
  <div class="sec-head"><div class="eyebrow">${t('Who it is for', 'لمن هو')}</div><h2 id="who-h">${t('Judged on whether it survives the floor.', 'يُحكم عليه بما إذا كان يصمد على أرض الورشة.')}</h2></div>
  <div class="roles">${o.roles.map(([r, ra, d, da]) => `<div><b>${t(r, ra)}</b><p>${t(d, da)}</p></div>`).join('')}</div>
</section>

${o.proof ? proofBand() : ''}

<section class="wrap cta-end" aria-label="Next step">
  <h2>${o.endH}</h2>
  <p>${o.endP}</p>
  <div class="ctas">${o.endCtas}</div>
</section>`;
}

const garage = productPage({
  name: 'SALIS Garage',
  eyebrow: t('Workshop management · shipping as SALIS AUTO', 'إدارة الورش · متاح باسم SALIS AUTO'),
  lede: t('Workshop management, Saudi standard. One job card carries the vehicle from check-in to delivery, and the invoice at the end is the sum of what happened, with the ZATCA QR and hash already on it.', 'إدارة ورش السيارات بمعيار سعودي. بطاقة عمل واحدة ترافق المركبة من الاستقبال إلى التسليم، والفاتورة في النهاية هي مجموع ما حدث، ومعها رمز الهيئة وسلسلة التجزئة.'),
  ctas: `<a class="btn on-dark" href="${DEMO}">${t('Book a 20-minute demo', 'احجز عرضاً لعشرين دقيقة')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="https://salisauto.app" dir="ltr">salisauto.app</a>`,
  status: t('<b>Status: shipping.</b> Workshops sign in to it today under the product name SALIS AUTO.', '<b>الحالة: متاح.</b> تسجّل الورش الدخول إليه اليوم باسم المنتج SALIS AUTO.'),
  mock: mockGarage,
  whatH: t('Thirteen domains on one record of the job.', 'ثلاثة عشر مجالاً على سجل واحد للعمل.'),
  facts: [
    ['Check-in with photos and customer lookup, a multi-point inspection with severity, and an itemised estimate with VAT sent to the customer’s phone for an SMS-verified signature.', 'استقبال بالصور والبحث عن العميل، فحص متعدد النقاط بدرجات الخطورة، وعرض سعر مفصّل بالضريبة يُرسل إلى هاتف العميل لتوقيع موثّق برسالة نصية.'],
    ['Bay board, technician assignment, parts consumption from stock, quality control sign-off, delivery with e-signature.', 'لوحة الخلجان، إسناد الفنيين، صرف القطع من المخزون، توقيع مراقبة الجودة، والتسليم بتوقيع إلكتروني.'],
    ['ZATCA Phase 2 e-invoice generated by the same transaction that posts the sale: QR, hash chain, seven-year retention.', 'فاتورة إلكترونية للمرحلة الثانية تولدها المعاملة نفسها التي ترحّل البيع: رمز الاستجابة، سلسلة التجزئة، وحفظ لسبع سنوات.'],
    ['Accounting, payroll, CRM and HR on the same ledger. Every mutation writes its audit row in the same transaction.', 'المحاسبة والرواتب وإدارة العملاء والموارد البشرية على الدفتر نفسه. كل تعديل يكتب سطر تدقيقه في المعاملة نفسها.'],
    ['Arabic and English as first-class renderings, fourteen roles, multi-branch from the first branch.', 'العربية والإنجليزية كواجهتين أصليتين، أربعة عشر دوراً، وتعدد الفروع من الفرع الأول.'],
  ],
  roles: [
    ['Workshop owner', 'صاحب الورشة', 'Revenue, VAT and stock reconcile without a bookkeeper’s rework.', 'الإيراد والضريبة والمخزون تتطابق دون إعادة عمل من المحاسب.'],
    ['Service advisor', 'مستشار الخدمة', 'Speed at the counter, and language a customer can be shown directly.', 'سرعة عند الكاونتر، ولغة يمكن عرضها للعميل مباشرة.'],
    ['Technician', 'الفني', 'Short instructions on a phone, in Arabic, with one hand.', 'تعليمات قصيرة على الهاتف، بالعربية، بيد واحدة.'],
    ['Accountant', 'المحاسب', 'ZATCA correctness and an audit trail that answers who changed this.', 'صحة الامتثال للهيئة وسجل تدقيق يجيب عن سؤال من غيّر هذا.'],
  ],
  proof: true,
  endH: t('See it on your own workshop’s numbers.', 'شاهده على أرقام ورشتك.'),
  endP: t('A 20-minute demo, in Arabic or English, on a job card from your floor.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.'),
  endCtas: `<a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="https://salisauto.app">${t('Visit SALIS AUTO', 'زُر SALIS AUTO')}</a>`,
});

const parts = productPage({
  name: 'SALIS Spare Parts',
  eyebrow: t('Supplier network · in SALIS AUTO today', 'شبكة الموردين · داخل SALIS AUTO اليوم'),
  lede: t('The parts side of the workshop as one system: catalogue, price comparison, purchase orders, automatic reorder below minimum stock, and a portal where suppliers publish and confirm.', 'جانب القطع في الورشة كنظام واحد: الكتالوج، مقارنة الأسعار، أوامر الشراء، إعادة الطلب تلقائياً عند انخفاض المخزون عن حده، وبوابة ينشر فيها الموردون ويؤكدون.'),
  ctas: `<a class="btn on-dark" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a><a class="btn ghost-dark" href="garage.html">${t('It ships inside Garage', 'يعمل داخل الورشة')}</a>`,
  status: t('<b>Status: in SALIS AUTO today.</b> Available to every SALIS AUTO workshop. Access for buyers outside the workshop is planned and not yet available.', '<b>الحالة: داخل SALIS AUTO اليوم.</b> متاح لكل ورشة على SALIS AUTO. الوصول لمشترين من خارج الورشة مخطط وغير متاح بعد.'),
  mock: mockParts,
  whatH: t('Stock that reorders itself, with a person still approving.', 'مخزون يعيد طلب نفسه، ومع ذلك يعتمده شخص.'),
  facts: [
    ['Every part has an opening quantity; everything after that is a movement with an idempotency key, so a retried request never double-counts.', 'لكل قطعة كمية افتتاحية، وكل ما يليها حركة بمفتاح تكرار، فلا يُحتسب طلب معاد مرتين.'],
    ['When stock drops below its minimum, a purchase request is drafted against the preferred supplier and waits for approval within the role’s ceiling.', 'حين ينخفض المخزون عن حده، تُصاغ طلبية شراء للمورّد المفضل وتنتظر الاعتماد ضمن سقف الدور.'],
    ['Suppliers publish catalogues, prices and delivery times in their own portal; the workshop compares before it orders.', 'ينشر الموردون الكتالوجات والأسعار ومدد التوصيل في بوابتهم، وتقارن الورشة قبل الطلب.'],
    ['Parts consumed on a job card leave stock and land on the invoice as the same line, priced in SAR to the halala.', 'القطع المصروفة على بطاقة العمل تخرج من المخزون وتظهر في الفاتورة كالبند نفسه، مسعّرة بالريال حتى الهللة.'],
  ],
  roles: [
    ['Parts manager', 'مدير القطع', 'Sees what is below minimum, what is on order, and what is arriving, without a spreadsheet.', 'يرى ما هو تحت الحد، وما هو مطلوب، وما هو في الطريق، دون جدول.'],
    ['Purchasing', 'المشتريات', 'Approves drafted orders within a ceiling; anything above routes to the next role.', 'يعتمد الأوامر المصاغة ضمن سقف، وما فوقه يُحال إلى الدور التالي.'],
    ['Supplier', 'المورّد', 'Publishes once, confirms orders, tracks delivery, gets paid against a ZATCA invoice.', 'ينشر مرة، يؤكد الطلبات، يتابع التسليم، ويُسدد له مقابل فاتورة إلكترونية.'],
    ['Accountant', 'المحاسب', 'Stock value and cost of parts sold reconcile to the ledger by construction.', 'قيمة المخزون وتكلفة القطع المباعة تتطابق مع الدفتر بحكم البناء.'],
  ],
  proof: false,
  endH: t('Procurement is measured, like everything else.', 'المشتريات تُقاس، ككل شيء آخر.'),
  endP: t('The press kit records a 40% shorter procurement cycle across deployments. Ask for the baseline in the demo.', 'يسجل الملف الصحفي دورة مشتريات أقصر بنسبة ٤٠٪ عبر عمليات التشغيل. اطلب أساس القياس في العرض.'),
  endCtas: `<a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="../index.html#family">${t('Back to the family', 'العودة إلى العائلة')}</a>`,
});

const fleet = productPage({
  name: 'SALIS Fleet',
  eyebrow: t('Fleet accounts · in SALIS AUTO today', 'حسابات الأساطيل · داخل SALIS AUTO اليوم'),
  lede: t('Fleet accounts across branches: vehicles under contract, SLA tracking, cost per vehicle and utilisation, computed from the job cards the workshop already writes.', 'حسابات الأساطيل عبر الفروع: المركبات تحت العقد، متابعة اتفاقيات مستوى الخدمة، التكلفة لكل مركبة ونسبة الاستخدام، محسوبة من بطاقات العمل التي تكتبها الورشة أصلاً.'),
  ctas: `<a class="btn on-dark" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a><a class="btn ghost-dark" href="garage.html">${t('It ships inside Garage', 'يعمل داخل الورشة')}</a>`,
  status: t('<b>Status: in SALIS AUTO today.</b> A standalone product for fleet managers who do not run a workshop is planned and not yet available.', '<b>الحالة: داخل SALIS AUTO اليوم.</b> منتج مستقل لمديري الأساطيل الذين لا يديرون ورشة مخطط وغير متاح بعد.'),
  mock: mockFleet,
  whatH: t('Utilisation without an export.', 'نسبة الاستخدام دون تصدير.'),
  facts: [
    ['A fleet account groups vehicles under a contract with its own pricing, approval ceiling and SLA.', 'حساب الأسطول يجمع المركبات تحت عقد له تسعيره وسقف اعتماده واتفاقية مستوى خدمته.'],
    ['Utilisation is days in service over days under contract, per vehicle and per branch, from job-card timestamps.', 'الاستخدام هو أيام الخدمة على أيام العقد، لكل مركبة ولكل فرع، من أختام وقت بطاقات العمل.'],
    ['Cost per vehicle and per kilometre from the invoices already posted, in SAR to the halala.', 'التكلفة لكل مركبة ولكل كيلومتر من الفواتير المرحّلة أصلاً، بالريال حتى الهللة.'],
    ['Preventive maintenance scheduled by interval; the appointment lands on the bay board like any other job.', 'الصيانة الوقائية تُجدول بالفترة، ويظهر الموعد على لوحة الخلجان كأي عمل آخر.'],
  ],
  roles: [
    ['Fleet manager', 'مدير الأسطول', 'Utilisation and cost per vehicle across branches, without a spreadsheet export.', 'الاستخدام والتكلفة لكل مركبة عبر الفروع، دون تصدير إلى جدول.'],
    ['Workshop owner', 'صاحب الورشة', 'Contract revenue tracked against SLA, so a breach is visible before the customer says so.', 'إيراد العقد يُتابع مقابل اتفاقية مستوى الخدمة، فيُرى الإخلال قبل أن يقوله العميل.'],
    ['Service advisor', 'مستشار الخدمة', 'A fleet vehicle checks in with its contract terms already applied.', 'تُستقبل مركبة الأسطول وشروط عقدها مطبقة سلفاً.'],
    ['Accountant', 'المحاسب', 'One consolidated invoice per contract period, itemised per vehicle, ZATCA-compliant.', 'فاتورة موحدة لكل فترة عقد، مفصّلة لكل مركبة، متوافقة مع الهيئة.'],
  ],
  proof: false,
  endH: t('Fleet utilisation is a measured figure.', 'نسبة استخدام الأسطول رقم مُقاس.'),
  endP: t('The press kit records a 30% utilisation gain across deployments. The baseline is each fleet’s prior contract period.', 'يسجل الملف الصحفي زيادة في الاستخدام بنسبة ٣٠٪ عبر عمليات التشغيل. الأساس هو فترة العقد السابقة لكل أسطول.'),
  endCtas: `<a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="../index.html#family">${t('Back to the family', 'العودة إلى العائلة')}</a>`,
});

const insurance = productPage({
  name: 'SALIS Insurance',
  eyebrow: t('Claims between workshops and insurers · planned', 'المطالبات بين الورش وشركات التأمين · مخطط'),
  lede: t('Claims and approvals on the estimate and invoice records that already exist in SALIS Garage. The insurer sees the same estimate the customer signed; the invoice splits between insurer and customer with a ZATCA e-invoice for each.', 'المطالبات والموافقات على سجلات عروض الأسعار والفواتير الموجودة أصلاً في SALIS Garage. ترى شركة التأمين عرض السعر نفسه الذي وقّعه العميل، وتنقسم الفاتورة بين شركة التأمين والعميل بفاتورة إلكترونية لكل طرف.'),
  ctas: `<a class="btn on-dark" href="../contact.html">${t('Ask about the plan', 'اسأل عن الخطة')}</a><a class="btn ghost-dark" href="garage.html">${t('See what ships today', 'اطّلع على المتاح اليوم')}</a>`,
  status: t('<b>Status: planned.</b> Not available. No date is promised on this page.', '<b>الحالة: مخطط.</b> غير متاح. لا يُوعد بتاريخ في هذه الصفحة.'),
  mock: mockInsurance,
  whatH: t('The intent, stated plainly.', 'النية، مذكورة بوضوح.'),
  facts: [
    ['A claim opens on an existing estimate, so the insurer, the workshop and the customer are looking at one document.', 'تُفتح المطالبة على عرض سعر موجود، فتنظر شركة التأمين والورشة والعميل إلى مستند واحد.'],
    ['Approvals, partial approvals and rejections are recorded as audit rows on the same job card.', 'تُسجَّل الموافقات والموافقات الجزئية والرفض كسطور تدقيق على بطاقة العمل نفسها.'],
    ['On approval the job card moves to repair; on delivery the invoice splits by the approved amount.', 'عند الموافقة تنتقل بطاقة العمل إلى الإصلاح، وعند التسليم تنقسم الفاتورة بحسب المبلغ المعتمد.'],
    ['Nothing in this line is available today. It appears here so the family is described completely and honestly.', 'لا شيء في هذا الخط متاح اليوم. يظهر هنا لتوصف العائلة كاملة وبصدق.'],
  ],
  roles: [
    ['Insurer', 'شركة التأمين', 'One signed estimate per claim, with photos from check-in and the inspection record.', 'عرض سعر موقّع واحد لكل مطالبة، مع صور الاستقبال وسجل الفحص.'],
    ['Workshop owner', 'صاحب الورشة', 'Approval status visible on the bay board, not in an email thread.', 'حالة الموافقة ظاهرة على لوحة الخلجان، لا في سلسلة بريد.'],
    ['Customer', 'العميل', 'Sees what the insurer covers and what remains, before the repair starts.', 'يرى ما تغطيه شركة التأمين وما يتبقى، قبل بدء الإصلاح.'],
    ['Accountant', 'المحاسب', 'Two invoices, two payers, one job card, one audit trail.', 'فاتورتان، ودافعان، وبطاقة عمل واحدة، وسجل تدقيق واحد.'],
  ],
  proof: false,
  endH: t('Interested in the insurance line?', 'مهتم بخط التأمين؟'),
  endP: t('Write to SALISCO. Insurers and workshops who want to shape it are the first people we want to hear from.', 'راسل ساليسكو. شركات التأمين والورش الراغبة في تشكيل هذا الخط هم أول من نريد سماعهم.'),
  endCtas: `<a class="btn" href="mailto:info@salisco.com">${t('Email SALISCO', 'راسل ساليسكو')}</a><a class="btn ghost" href="../index.html#family">${t('Back to the family', 'العودة إلى العائلة')}</a>`,
});

/* ---------------------------------------------------------------- about, contact */
const about = `
<section class="phero" aria-labelledby="ah">
  <svg class="trace anim" viewBox="0 0 400 200" style="width:900px;inset-inline-end:-320px;top:-200px"><use href="#trace"/></svg>
  <div class="wrap">
    <div class="eyebrow">${t('About', 'عن ساليسكو')}</div>
    <h1 id="ah">${t('SALISCO builds the software Saudi operations run on.', 'ساليسكو تبني البرمجيات التي تعمل عليها العمليات السعودية.')}</h1>
    <p class="lede">${t('A product-family company in Riyadh. One engineering backbone, four product lines, one rule: the product is judged on whether it survives a workshop floor at 09:40 with a queue behind the counter.', 'شركة عائلة منتجات في الرياض. أساس هندسي واحد، أربعة خطوط منتجات، وقاعدة واحدة: يُحكم على المنتج بما إذا كان يصمد على أرض ورشة في التاسعة والأربعين صباحاً وخلف الكاونتر طابور.')}</p>
  </div>
</section>
<section class="wrap" aria-labelledby="as-h">
  <div class="sec-head"><div class="eyebrow">${t('The four assumptions', 'الافتراضات الأربعة')}</div><h2 id="as-h">${t('Every product starts from the same place.', 'كل منتج يبدأ من المكان نفسه.')}</h2></div>
  <div class="assume standalone">
    <div><i></i><b>${t('Arabic first', 'العربية أولاً')}</b><span>${t('Copy is written for Arabic and rendered right-to-left; English sits beside it. Length differences are a layout problem to solve, never a reason to abbreviate Arabic.', 'يُكتب النص بالعربية ويُعرض من اليمين إلى اليسار، والإنجليزية بجانبه. فروق الطول مشكلة تخطيط تُحل، لا سبباً لاختصار العربية.')}</span></div>
    <div><i></i><b>${t('ZATCA in the core', 'الهيئة في النواة')}</b><span>${t('Phase 2 e-invoicing with QR and hash chain is generated by the same transaction that posts the sale. Compliance is not a module.', 'الفوترة الإلكترونية للمرحلة الثانية برمز الاستجابة وسلسلة التجزئة تولدها المعاملة نفسها التي ترحّل البيع. الامتثال ليس وحدة إضافية.')}</span></div>
    <div><i></i><b>${t('SAR to the halala', 'الريال حتى الهللة')}</b><span>${t('Money is stored as integer halalas. Totals reconcile because rounding happens once, at the edge.', 'تُخزَّن المبالغ بالهللة كأعداد صحيحة. المجاميع تتطابق لأن التقريب يحدث مرة واحدة، عند الحافة.')}</span></div>
    <div><i class="o"></i><b>${t('One audit row per change', 'سطر تدقيق لكل تغيير')}</b><span>${t('Actor, before, after and request id, written in the same transaction as the change. The promise of traceability is in the schema.', 'الفاعل والقيمة قبل وبعد ورقم الطلب، تُكتب في المعاملة نفسها مع التغيير. وعد التتبع في بنية البيانات.')}</span></div>
  </div>
</section>
<section class="wrap two" aria-labelledby="where-h">
  <div class="sec-head"><div class="eyebrow">${t('Where', 'أين')}</div><h2 id="where-h">${t('Riyadh, Kingdom of Saudi Arabia.', 'الرياض، المملكة العربية السعودية.')}</h2></div>
  <ul class="facts">
    <li>${t('Built in Riyadh for the Saudi market. The first product, SALIS AUTO, serves workshops from a single bay to multi-branch fleet operations.', 'تُبنى في الرياض للسوق السعودي. المنتج الأول، SALIS AUTO، يخدم الورش من خليج واحد إلى عمليات أساطيل متعددة الفروع.')}</li>
    <li>${t('Hiring in Riyadh, on site: product design (Arabic-first), backend engineering (PostgreSQL), implementation (workshops). Roles are listed on the SALIS AUTO careers page.', 'التوظيف في الرياض حضورياً: تصميم المنتج (العربية أولاً)، هندسة الخلفية (PostgreSQL)، التطبيق (الورش). الوظائف مدرجة في صفحة الوظائف في SALIS AUTO.')} <a href="https://salisauto.app/public-portal/careers">${t('See open roles', 'اطّلع على الوظائف')}</a></li>
  </ul>
  <div class="note">${t('Honest note. The company name SALISCO, its Arabic form ساليسكو, the domain salisco.com and the four product lines were confirmed by the owner on 4 September 2026. The address info@salisco.com is still a proposal.', 'ملاحظة صريحة. اسم الشركة SALISCO وصيغته العربية ساليسكو والنطاق salisco.com وخطوط المنتجات الأربعة أُكدت من المالك في ٤ سبتمبر ٢٠٢٦. العنوان info@salisco.com ما يزال مقترحاً.')}</div>
</section>`;

const contact = `
<section class="phero" aria-labelledby="ch">
  <svg class="trace anim" viewBox="0 0 400 200" style="width:900px;inset-inline-end:-320px;top:-200px"><use href="#trace"/></svg>
  <div class="wrap">
    <div class="eyebrow">${t('Contact', 'تواصل')}</div>
    <h1 id="ch">${t('Write, or book the demo.', 'راسلنا، أو احجز العرض.')}</h1>
    <p class="lede">${t('No form on this page. An email reaches a person; the demo link opens the SALIS AUTO booking page, which is the fastest way to see the shipping product.', 'لا نموذج في هذه الصفحة. البريد يصل إلى شخص، ورابط العرض يفتح صفحة الحجز في SALIS AUTO، وهي أسرع طريقة لرؤية المنتج المتاح.')}</p>
  </div>
</section>
<section class="wrap" aria-label="Contact channels">
  <div class="channels">
    <a class="channel" href="mailto:info@salisco.com"><span class="k">${t('Email', 'البريد')}</span><b dir="ltr">info@salisco.com</b><span>${t('Company matters, partnerships, press, the insurance line.', 'شؤون الشركة، الشراكات، الإعلام، خط التأمين.')}<span class="prop">${t('address proposed', 'العنوان مقترح')}</span></span></a>
    <a class="channel" href="${DEMO}"><span class="k">${t('Demo', 'العرض التوضيحي')}</span><b>${t('Book a 20-minute SALIS AUTO demo', 'احجز عرض SALIS AUTO لعشرين دقيقة')}</b><span>${t('In Arabic or English, on a job card from your floor.', 'بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}</span></a>
    <a class="channel" href="mailto:info@salisauto.app"><span class="k">${t('Product support', 'دعم المنتج')}</span><b dir="ltr">info@salisauto.app</b><span>${t('Existing SALIS AUTO workshops: support lives with the product.', 'ورش SALIS AUTO الحالية: الدعم مع المنتج.')}</span></a>
  </div>
  <div class="sec-head" style="margin-top:56px"><div class="eyebrow">${t('Accounts', 'الحسابات')}</div><h2>${t('SALISCO on four platforms, one handle.', 'ساليسكو على أربع منصات بمعرّف واحد.')}</h2><p>${t('SALISCO speaks as the company: releases across the family, hiring, results. Product detail stays on each product’s own accounts. The handle must be reserved on every platform before these go live.', 'ساليسكو تتحدث بصفة الشركة: الإصدارات عبر العائلة، والتوظيف، والنتائج. تفاصيل المنتج تبقى على حسابات كل منتج. يجب حجز المعرّف على كل منصة قبل الإطلاق.')}</p></div>
  <div class="tablewrap">
    <table>
      <thead><tr><th>${t('Platform', 'المنصة')}</th><th>${t('Handle', 'المعرّف')}</th><th>${t('Bio, English', 'النبذة بالإنجليزية')}</th><th>${t('Bio, Arabic', 'النبذة بالعربية')}</th></tr></thead>
      <tbody>
        <tr><td><b>LinkedIn</b></td><td class="mono" dir="ltr">linkedin.com/company/salisco</td><td class="bio" dir="ltr">SALISCO builds operational software for Saudi Arabia. One backbone across four product lines: Garage, Spare Parts, Fleet, Insurance. Arabic, ZATCA, the riyal, and an audit trail. Shipping today as SALIS AUTO.<span class="lim">215 / 2,000</span></td><td class="bio arabic" dir="rtl">ساليسكو تبني برمجيات تشغيلية للمملكة العربية السعودية. أساس واحد لأربعة خطوط منتجات: الورشة، قطع الغيار، الأساطيل، التأمين. العربية، الهيئة، الريال، وسجل تدقيق. متاح اليوم باسم <span dir="ltr">SALIS AUTO</span>.</td></tr>
        <tr><td><b>X</b></td><td class="mono" dir="ltr">@salisco</td><td class="bio" dir="ltr">Operational software built in Saudi Arabia. Garage, Spare Parts, Fleet, Insurance on one backbone. Makers of SALIS AUTO.<span class="lim">121 / 160</span></td><td class="bio arabic" dir="rtl">برمجيات تشغيلية مبنية في السعودية. الورشة، قطع الغيار، الأساطيل، التأمين على أساس واحد. صانعو <span dir="ltr">SALIS AUTO</span>.</td></tr>
        <tr><td><b>Instagram</b></td><td class="mono" dir="ltr">@salisco</td><td class="bio" dir="ltr">Saudi-built operational software.<br>Garage · Spare Parts · Fleet · Insurance<br>Makers of SALIS AUTO. Riyadh.<span class="lim">104 / 150</span></td><td class="bio arabic" dir="rtl">برمجيات تشغيلية مبنية في السعودية.<br>الورشة · قطع الغيار · الأساطيل · التأمين<br>صانعو <span dir="ltr">SALIS AUTO</span>. الرياض.</td></tr>
        <tr><td><b>YouTube</b></td><td class="mono" dir="ltr">youtube.com/@salisco</td><td class="bio" dir="ltr">Company channel for SALISCO: releases across the four product lines, engineering talks, recorded webinars. Product demos live on each product’s own channel.<span class="lim">168 / 1,000</span></td><td class="bio arabic" dir="rtl">قناة شركة ساليسكو: إصدارات خطوط المنتجات الأربعة، وأحاديث هندسية، وندوات مسجلة. العروض التوضيحية على قناة كل منتج.</td></tr>
      </tbody>
    </table>
  </div>
</section>`;

const lost = `
<section class="wrap lost" aria-labelledby="lh">
  <div class="eyebrow">404</div>
  <div class="code" dir="ltr" aria-hidden="true">404</div>
  <h1 id="lh">${t('That page is not here.', 'هذه الصفحة ليست هنا.')}</h1>
  <p class="lede" style="color:var(--muted)">${t('The address may have changed, or it never existed on salisco.com. The four product lines, the company page and contact are one click away.', 'ربما تغيّر العنوان، أو لم يوجد أصلاً على salisco.com. خطوط المنتجات الأربعة وصفحة الشركة وصفحة التواصل على بعد نقرة.')}</p>
  <div class="ctas"><a class="btn" href="index.html">${t('Go to the home page', 'اذهب إلى الصفحة الرئيسية')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="index.html#family">${t('See the four lines', 'اطّلع على الخطوط الأربعة')}</a><a class="btn ghost" href="contact.html">${t('Contact SALISCO', 'تواصل مع ساليسكو')}</a></div>
</section>`;

const BODIES = { home, garage, parts, fleet, insurance, about, contact, lost };

/* ---------------------------------------------------------------- write */
for (const page of PAGES) {
  const html = head(page) + '\n<body>' + traceSymbol + header(page) + `\n<main id="main">${BODIES[page.key]}\n</main>` + footer(page) + `\n<script src="${rel(page.path)}assets/site.js"></script>\n</body>\n</html>\n`;
  const out = join(ROOT, page.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', page.path, html.length);
}

const today = '2026-09-04';
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.filter((p) => !p.noindex).map((p) => { const u = SITE + '/' + (p.path === 'index.html' ? '' : p.path); return `  <url><loc>${u}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${u}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${u}?lang=ar"/>
  </url>`; }).join('\n')}
</urlset>
`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('sitemap, robots written');
