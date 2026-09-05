// SALISCO site generator. `node build.mjs` writes every page from the copy below.
// One header, one footer, one stylesheet, one script; pages differ only in <main>.
// Every string exists in both languages: <span lang="en"> and <span lang="ar">.
// Design language: the z-axis cascade (direction C): a navy field with the circuit trace drawn on load,
// stacking cards that settle as they take the viewport, double-bezel surfaces, tabs for depth.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://salisco.com';
const APP = 'https://app.salisauto.app';
const DEMO = `${APP}/public-portal/book-demo`;
const SIGNIN = `${APP}/login`;

const t = (en, ar) => `<span lang="en">${en}</span><span lang="ar">${ar}</span>`;

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

/* ---------------------------------------------------------------- shared chrome */
/* The circuit trace as full-bleed paths, drawn on load. Three paths, four nodes, one orange. */
const fieldTrace = `
<svg class="field-trace" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <path d="M-20 470 H240 L330 380 H620 L700 300 H1000" stroke="#0BB3FF"/>
  <path d="M120 90 H380 L470 180 H760 L850 90 H1240" stroke="#0A5ED7"/>
  <path d="M520 560 H820 L920 460 H1240" stroke="#F97316"/>
  <circle cx="620" cy="380" r="12" fill="#0BB3FF"/><circle cx="760" cy="180" r="12" fill="#0B1F3B" stroke="#0A5ED7" stroke-width="6"/><circle cx="920" cy="460" r="12" fill="#F97316"/><circle cx="240" cy="470" r="12" fill="#0B1F3B" stroke="#0BB3FF" stroke-width="6"/>
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
      <a class="signin" href="${SIGNIN}">${t('Sign in', 'تسجيل الدخول')}</a>
      <a class="btn small" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a>
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
    <a href="${SIGNIN}">${t('Sign in', 'تسجيل الدخول')}</a>
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

/* ---------------------------------------------------------------- mocks (bare; wrap in .bezel where they stand alone) */
const chip = (en, ar, cls = '') => `<span class="st ${cls}">${t(en, ar)}</span>`;
const bez = (m) => `<div class="bezel">${m}</div>`;

const mockGarage = `
<div class="mock" aria-label="Bay board, illustrative">
  <div class="bar"><b>${t('Bay board · Riyadh Main', 'لوحة الخلجان · الرياض الرئيسي')}</b><span class="mono" dir="ltr">04 Sep 2026 · 09:40</span></div>
  <div class="row head"><span>${t('Bay', 'الخليج')}</span><span>${t('Job card', 'بطاقة العمل')}</span><span>${t('Plate', 'اللوحة')}</span><span class="num">${t('Amount', 'المبلغ')}</span><span>${t('Status', 'الحالة')}</span></div>
  <div class="row"><b>1</b><span class="mono" dir="ltr">JC-4F2A</span><span class="mono" dir="ltr">RUH 4821</span><span class="num mono" dir="ltr">SAR 1,245.00</span>${chip('In repair', 'قيد الإصلاح')}</div>
  <div class="row"><b>2</b><span class="mono" dir="ltr">JC-4F2B</span><span class="mono" dir="ltr">RUH 1157</span><span class="num mono" dir="ltr">SAR 380.00</span>${chip('QC', 'فحص الجودة')}</div>
  <div class="row"><b>3</b><span class="mono" dir="ltr">JC-4F2C</span><span class="mono" dir="ltr">RUH 9930</span><span class="num mono" dir="ltr">SAR 2,910.50</span>${chip('Awaiting parts', 'بانتظار القطع', 'o')}</div>
  <div class="row"><b>4</b><span class="mono" dir="ltr">JC-4F2D</span><span class="mono" dir="ltr">RUH 2204</span><span class="num mono" dir="ltr">SAR 640.00</span>${chip('Delivered', 'تم التسليم')}</div>
  <div class="foot">${t('Illustrative rows. Figures are examples, not customer data.', 'صفوف توضيحية. الأرقام أمثلة وليست بيانات عملاء.')}</div>
</div>`;

const mockParts = `
<div class="mock" aria-label="Purchase order, illustrative">
  <div class="bar"><b>${t('Purchase order', 'أمر شراء')} <span class="mono" dir="ltr">PO-10421</span></b>${chip('Awaiting approval', 'بانتظار الاعتماد', 'o')}</div>
  <div class="kv"><span>${t('Supplier', 'المورّد')}</span><b>${t('Preferred supplier, Riyadh', 'المورّد المفضل، الرياض')}</b><span>${t('Trigger', 'السبب')}</span><b>${t('Stock below minimum: 4 of 12', 'المخزون تحت الحد: ٤ من ١٢')}</b></div>
  <div class="row head"><span>${t('Part', 'القطعة')}</span><span>${t('Number', 'الرقم')}</span><span class="num">${t('Qty', 'الكمية')}</span><span class="num">${t('Unit', 'الوحدة')}</span><span class="num">${t('Line', 'الإجمالي')}</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><span class="mono" dir="ltr">BP-2210-F</span><span class="num mono" dir="ltr">8</span><span class="num mono" dir="ltr">SAR 145.00</span><span class="num mono" dir="ltr">SAR 1,160.00</span></div>
  <div class="row"><span>${t('Oil filter', 'فلتر زيت')}</span><span class="mono" dir="ltr">OF-0090</span><span class="num mono" dir="ltr">24</span><span class="num mono" dir="ltr">SAR 28.50</span><span class="num mono" dir="ltr">SAR 684.00</span></div>
  <div class="row total"><span>${t('Total incl. VAT 15%', 'الإجمالي شامل الضريبة ١٥٪')}</span><span></span><span></span><span></span><b class="num mono" dir="ltr">SAR 2,120.60</b></div>
  <div class="foot">${t('Illustrative order. Prices are examples.', 'أمر توضيحي. الأسعار أمثلة.')}</div>
</div>`;

const mockFleet = `
<div class="mock" aria-label="Fleet utilisation, illustrative">
  <div class="bar"><b>${t('Fleet account · Contract 2026-14', 'حساب أسطول · عقد 2026-14')}</b><span class="mono" dir="ltr">31 Aug 2026</span></div>
  <div class="row head"><span>${t('Plate', 'اللوحة')}</span><span>${t('Branch', 'الفرع')}</span><span>${t('Utilisation', 'الاستخدام')}</span><span class="num">${t('Cost / km', 'التكلفة / كم')}</span></div>
  <div class="row"><span class="mono" dir="ltr">RUH 7712</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span><span class="util"><i style="width:82%"></i><em dir="ltr">82%</em></span><span class="num mono" dir="ltr">SAR 0.41</span></div>
  <div class="row"><span class="mono" dir="ltr">DMM 3048</span><span>${t('Dammam', 'الدمام')}</span><span class="util"><i style="width:64%"></i><em dir="ltr">64%</em></span><span class="num mono" dir="ltr">SAR 0.53</span></div>
  <div class="row"><span class="mono" dir="ltr">JED 5521</span><span>${t('Jeddah', 'جدة')}</span><span class="util"><i style="width:37%"></i><em dir="ltr">37%</em></span><span class="num mono" dir="ltr">SAR 0.88</span></div>
  <div class="row"><span class="mono" dir="ltr">RUH 0916</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span><span class="util"><i style="width:91%"></i><em dir="ltr">91%</em></span><span class="num mono" dir="ltr">SAR 0.36</span></div>
  <div class="foot">${t('Utilisation is days in service over days under contract. Illustrative figures.', 'الاستخدام هو أيام الخدمة على أيام العقد. أرقام توضيحية.')}</div>
</div>`;

const mockInsurance = `
<div class="mock planned" aria-label="Claim timeline, illustrative and planned">
  <div class="bar"><b>${t('Claim on estimate', 'مطالبة على عرض سعر')} <span class="mono" dir="ltr">EST-2041</span></b>${chip('Planned product', 'منتج مخطط', 'o')}</div>
  <ol class="timeline">
    <li class="done"><b>${t('Estimate issued', 'إصدار عرض السعر')}</b><span class="mono" dir="ltr">02 Sep · SAR 4,860.00</span></li>
    <li class="done"><b>${t('Submitted to insurer', 'الإرسال إلى شركة التأمين')}</b><span class="mono" dir="ltr">02 Sep · 14:10</span></li>
    <li class="now"><b>${t('Insurer approval, partial', 'موافقة جزئية من شركة التأمين')}</b><span class="mono" dir="ltr">03 Sep · SAR 4,120.00</span></li>
    <li><b>${t('Repair', 'الإصلاح')}</b><span>${t('Job card opens on approval', 'تُفتح بطاقة العمل عند الموافقة')}</span></li>
    <li><b>${t('Invoice split: insurer and customer', 'فاتورة مقسّمة: شركة التأمين والعميل')}</b><span>${t('ZATCA e-invoice for each', 'فاتورة إلكترونية لكل طرف')}</span></li>
  </ol>
  <div class="foot">${t('This flow is planned, not available. Shown to state the intent.', 'هذا المسار مخطط وغير متاح. يُعرض لبيان النية.')}</div>
</div>`;

/* small mocks for the backbone tabs: one screen detail per assumption */
const mockArabic = `
<div class="mock" aria-label="Bilingual field, illustrative">
  <div class="bar"><b>${t('Job card · customer', 'بطاقة العمل · العميل')}</b><span class="mono" dir="ltr">JC-4F2A</span></div>
  <div class="kv"><span>${t('Plate', 'اللوحة')}</span><b class="mono" dir="ltr">RUH 4821</b><span>${t('Status', 'الحالة')}</span><b>${t('In repair', 'قيد الإصلاح')}</b><span>${t('Rendered', 'العرض')}</span><b>${t('Right-to-left, Arabic written first', 'من اليمين إلى اليسار، العربية أولاً')}</b></div>
  <div class="foot">${t('Plates, ids and amounts stay Latin and isolated; everything else is written for Arabic.', 'اللوحات والمعرّفات والمبالغ تبقى لاتينية معزولة، وكل ما عداها يُكتب بالعربية.')}</div>
</div>`;

const mockZatca = `
<div class="mock" aria-label="E-invoice stub, illustrative">
  <div class="bar"><b>${t('Tax invoice', 'فاتورة ضريبية')} <span class="mono" dir="ltr">INV-88120</span></b>${chip('Issued', 'صادرة')}</div>
  <div class="kv"><span>${t('QR', 'رمز الاستجابة')}</span><b>${t('TLV: seller, VAT number, timestamp, total, VAT', 'TLV: البائع، الرقم الضريبي، الوقت، الإجمالي، الضريبة')}</b><span>${t('Hash', 'التجزئة')}</span><b class="mono" dir="ltr">bf3c…a25e → prev 46f1…8b91</b><span>${t('After issue', 'بعد الإصدار')}</span><b>${t('Immutable. A correction cancels and reissues.', 'غير قابلة للتعديل. التصحيح إلغاء وإصدار جديد.')}</b></div>
  <div class="foot">${t('Generated by the same transaction that posts the sale.', 'تولدها المعاملة نفسها التي ترحّل البيع.')}</div>
</div>`;

const mockSar = `
<div class="mock" aria-label="Halala arithmetic, illustrative">
  <div class="bar"><b>${t('Estimate total', 'إجمالي عرض السعر')}</b><span class="mono" dir="ltr">EST-2041</span></div>
  <div class="row head"><span>${t('Line', 'البند')}</span><span></span><span></span><span class="num">${t('Halalas', 'هللات')}</span><span class="num">SAR</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><span></span><span></span><span class="num mono" dir="ltr">64000</span><span class="num mono" dir="ltr">640.00</span></div>
  <div class="row"><span>${t('VAT 15%', 'الضريبة ١٥٪')}</span><span></span><span></span><span class="num mono" dir="ltr">9600</span><span class="num mono" dir="ltr">96.00</span></div>
  <div class="row total"><span>${t('Total', 'الإجمالي')}</span><span></span><span></span><b class="num mono" dir="ltr">73600</b><b class="num mono" dir="ltr">736.00</b></div>
  <div class="foot">${t('Stored as integers. Rounding happens once, at the edge, so totals reconcile.', 'تُخزَّن أعداداً صحيحة. التقريب مرة واحدة عند الحافة، فتتطابق المجاميع.')}</div>
</div>`;

const mockAudit = `
<div class="mock" aria-label="Audit row, illustrative">
  <div class="bar"><b>${t('Audit trail', 'سجل التدقيق')}</b><span class="mono" dir="ltr">req 9c2e-41a7</span></div>
  <div class="kv"><span>${t('Actor', 'الفاعل')}</span><b>${t('Service advisor · Riyadh Main', 'مستشار الخدمة · الرياض الرئيسي')}</b><span>${t('Change', 'التغيير')}</span><b>${t('Estimate line 3, quantity', 'بند عرض السعر ٣، الكمية')}</b><span>${t('Before', 'قبل')}</span><b class="mono" dir="ltr">2</b><span>${t('After', 'بعد')}</span><b class="mono" dir="ltr">4</b></div>
  <div class="foot">${t('Written in the same transaction as the change. Never edited, never deleted.', 'يُكتب في المعاملة نفسها مع التغيير. لا يُعدَّل ولا يُحذف.')}</div>
</div>`;

/* ---------------------------------------------------------------- tabs component */
let tabSeq = 0;
/** items: [{ id, label:[en,ar], panel:html }] — first tab is selected; panels after the first are hidden by JS only. */
function tabs(items, label) {
  const id = `tabs-${++tabSeq}`;
  const list = items.map((it, i) => `<button class="tab" role="tab" type="button" id="${id}-t${i}" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="${id}-p${i}" tabindex="${i === 0 ? '0' : '-1'}">${t(it.label[0], it.label[1])}</button>`).join('');
  const panels = items.map((it, i) => `<div class="tabpanel" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}" tabindex="0"${i ? ' data-tab-hidden' : ''}>${it.panel}</div>`).join('');
  return `<div class="tabs" data-tabs><div class="tablist" role="tablist" aria-label="${label}">${list}<span class="ind" aria-hidden="true"></span></div>${panels}</div>`;
}

/* ---------------------------------------------------------------- home sections */
const lineCards = [
  { id: 'garage', href: 'products/garage.html', st: chip('Shipping as SALIS AUTO', 'متاح باسم SALIS AUTO', 'live'), name: 'SALIS Garage',
    p: t('Workshop management, Saudi standard. The full lifecycle from check-in to delivery, finance and ZATCA e-invoicing, a customer app, and portals for technicians and suppliers.', 'إدارة ورش السيارات بمعيار سعودي. دورة الورشة كاملة من الاستقبال إلى التسليم، المالية والفوترة الإلكترونية، تطبيق للعملاء، وبوابات للفنيين والموردين.'),
    more: t('Read about Garage', 'اقرأ عن الورشة'), mock: mockGarage },
  { id: 'parts', href: 'products/spare-parts.html', st: chip('In SALIS AUTO today', 'داخل SALIS AUTO اليوم', 'in'), name: 'SALIS Spare Parts',
    p: t('The supplier network: catalogue, price comparison, purchase orders, automatic reorder below minimum stock, and the supplier portal.', 'شبكة الموردين: الكتالوج، مقارنة الأسعار، أوامر الشراء، إعادة الطلب تلقائياً عند انخفاض المخزون عن حده، وبوابة الموردين.'),
    more: t('Read about Spare Parts', 'اقرأ عن قطع الغيار'), mock: mockParts },
  { id: 'fleet', href: 'products/fleet.html', st: chip('In SALIS AUTO today', 'داخل SALIS AUTO اليوم', 'in'), name: 'SALIS Fleet',
    p: t('Fleet accounts across branches: vehicles under contract, SLA tracking, cost per vehicle and utilisation, computed from the job cards the workshop already writes.', 'حسابات الأساطيل عبر الفروع: المركبات تحت العقد، متابعة اتفاقيات مستوى الخدمة، التكلفة لكل مركبة ونسبة الاستخدام، محسوبة من بطاقات العمل التي تكتبها الورشة أصلاً.'),
    more: t('Read about Fleet', 'اقرأ عن الأساطيل'), mock: mockFleet },
  { id: 'insurance', href: 'products/insurance.html', st: chip('Planned', 'مخطط', 'plan'), name: 'SALIS Insurance',
    p: t('Claims and approvals between workshops and insurers on the estimate and invoice records that already exist. Not available yet, and not described as if it were.', 'المطالبات والموافقات بين الورش وشركات التأمين على سجلات عروض الأسعار والفواتير الموجودة أصلاً. غير متاح بعد، ولا يوصف كأنه متاح.'),
    more: t('Read the plan for Insurance', 'اقرأ خطة التأمين'), mock: mockInsurance },
];

const stackCards = (r = '') => `
<div class="cards">
${lineCards.map((c, i) => `  <article class="card bezel" data-i="${i}" id="line-${c.id}"><div class="core">
    <div class="txt">${c.st}<h3 translate="no" dir="ltr">${c.name}</h3><p>${c.p}</p><a class="more" href="${r}${c.href}">${c.more} <span aria-hidden="true">→</span></a></div>
    <div class="cmock" aria-hidden="true">${c.mock}</div>
  </div></article>`).join('\n')}
</div>`;

const backboneTabs = tabs([
  { label: ['Arabic first', 'العربية أولاً'], panel: `<div class="tp"><div><h3>${t('Written for Arabic, rendered right-to-left, English beside it.', 'تُكتب بالعربية، وتُعرض من اليمين إلى اليسار، والإنجليزية بجانبها.')}</h3><p>${t('Arabic is a first-class rendering, not a translation layer. Copy is written for Arabic; length differences are a layout problem to solve, never a reason to abbreviate. Plates, ids, SKUs and amounts stay Latin and isolated so the bidi algorithm never reorders a digit.', 'العربية واجهة أصلية لا طبقة ترجمة. يُكتب النص بالعربية، وفروق الطول مشكلة تخطيط تُحل لا سبباً للاختصار. اللوحات والمعرّفات ورموز القطع والمبالغ تبقى لاتينية معزولة حتى لا يعيد خوارزم الاتجاه ترتيب رقم.')}</p></div>${bez(mockArabic)}</div>` },
  { label: ['ZATCA in the core', 'الهيئة في النواة'], panel: `<div class="tp"><div><h3>${t('The e-invoice is generated by the same transaction that posts the sale.', 'الفاتورة الإلكترونية تولدها المعاملة نفسها التي ترحّل البيع.')}</h3><p>${t('Phase 2 compliance is not a module you switch on. Every issued invoice carries the TLV QR, the hash that links it to the one before, and UBL 2.1 XML. After issue it is immutable; a correction cancels the invoice and issues a new one that references it, on the same chain. Reporting to the Fatoora platform is configured per workshop at deployment.', 'الامتثال للمرحلة الثانية ليس وحدة تُفعَّل. كل فاتورة صادرة تحمل رمز الاستجابة بصيغة TLV، والتجزئة التي تربطها بالسابقة، وXML بمعيار UBL 2.1. بعد الإصدار تصبح غير قابلة للتعديل، والتصحيح يلغيها ويصدر فاتورة جديدة تشير إليها في السلسلة نفسها. الإبلاغ إلى منصة فاتورة يُهيأ لكل ورشة عند النشر.')}</p></div>${bez(mockZatca)}</div>` },
  { label: ['SAR to the halala', 'الريال حتى الهللة'], panel: `<div class="tp"><div><h3>${t('Money is stored as integer halalas. Rounding happens once.', 'تُخزَّن المبالغ هللات صحيحة. والتقريب يحدث مرة واحدة.')}</h3><p>${t('A line total, a VAT amount and an invoice total are integers until the moment they are shown. Totals reconcile because nothing is rounded twice, and the accountant’s VAT return adds up from the invoice table, not from a spreadsheet beside it.', 'إجمالي البند ومبلغ الضريبة وإجمالي الفاتورة أعداد صحيحة حتى لحظة العرض. تتطابق المجاميع لأن لا شيء يُقرَّب مرتين، وإقرار الضريبة يُجمع من جدول الفواتير لا من جدول بجانبه.')}</p></div>${bez(mockSar)}</div>` },
  { label: ['One audit row', 'سطر تدقيق واحد'], panel: `<div class="tp"><div><h3>${t('Actor, before, after and request id, written in the same transaction as the change.', 'الفاعل والقيمة قبل وبعد ورقم الطلب، تُكتب في المعاملة نفسها مع التغيير.')}</h3><p>${t('Traceability is enforced by the database, not promised by the copy. Every mutation across every product line writes its audit row in the transaction that made it, so “who changed this” always has an answer and a request id to quote.', 'التتبع تفرضه قاعدة البيانات لا يعِد به النص. كل تعديل عبر كل خط منتج يكتب سطر تدقيقه في المعاملة نفسها التي أحدثته، فلسؤال «من غيّر هذا» جواب دائماً ورقم طلب يُقتبس.')}</p></div>${bez(mockAudit)}</div>` },
], 'The backbone every product shares');

const roleGrid = (rows) => `<div class="rg">${rows.map(([line, cls, en, ar]) => `<div class="rgi"><b dir="ltr" translate="no">${line}</b><span class="st ${cls}">${cls === 'plan' ? t('Planned', 'مخطط') : cls === 'live' ? t('Shipping', 'متاح') : t('In SALIS AUTO', 'داخل SALIS AUTO')}</span><p>${t(en, ar)}</p></div>`).join('')}</div>`;

const rolesTabs = tabs([
  { label: ['Owner', 'المالك'], panel: roleGrid([
    ['SALIS Garage', 'live', 'Revenue, VAT and stock reconcile without a bookkeeper’s rework. Every branch on one bay board.', 'الإيراد والضريبة والمخزون تتطابق دون إعادة عمل من المحاسب. كل الفروع على لوحة خلجان واحدة.'],
    ['SALIS Spare Parts', 'in', 'Stock that reorders itself below minimum, with a person still approving within a ceiling.', 'مخزون يعيد طلب نفسه تحت الحد، ومع ذلك يعتمده شخص ضمن سقف.'],
    ['SALIS Fleet', 'in', 'Contract revenue tracked against SLA, so a breach is visible before the customer says so.', 'إيراد العقد يُتابع مقابل اتفاقية مستوى الخدمة، فيُرى الإخلال قبل أن يقوله العميل.'],
    ['SALIS Insurance', 'plan', 'Approval status on the bay board, not in an email thread. Planned.', 'حالة الموافقة على لوحة الخلجان لا في سلسلة بريد. مخطط.'],
  ]) },
  { label: ['Service advisor', 'مستشار الخدمة'], panel: roleGrid([
    ['SALIS Garage', 'live', 'Speed at the counter, and an estimate the customer signs from their phone with an SMS code.', 'سرعة عند الكاونتر، وعرض سعر يوقّعه العميل من هاتفه برمز رسالة نصية.'],
    ['SALIS Spare Parts', 'in', 'Parts availability and price seen while the estimate is being built, not after.', 'توفر القطع وسعرها يُرى أثناء إعداد عرض السعر لا بعده.'],
    ['SALIS Fleet', 'in', 'A fleet vehicle checks in with its contract terms already applied.', 'تُستقبل مركبة الأسطول وشروط عقدها مطبقة سلفاً.'],
    ['SALIS Insurance', 'plan', 'The insurer sees the same estimate the customer signed. Planned.', 'ترى شركة التأمين عرض السعر نفسه الذي وقّعه العميل. مخطط.'],
  ]) },
  { label: ['Technician', 'الفني'], panel: roleGrid([
    ['SALIS Garage', 'live', 'Short instructions on a phone, in Arabic, with one hand. Time clock and job updates from the bay.', 'تعليمات قصيرة على الهاتف، بالعربية، بيد واحدة. تسجيل الوقت وتحديث العمل من الخليج.'],
    ['SALIS Spare Parts', 'in', 'Parts requested from the job card; the part arrives against that card, not a WhatsApp message.', 'تُطلب القطع من بطاقة العمل، وتصل مقابل تلك البطاقة لا مقابل رسالة واتساب.'],
    ['SALIS Fleet', 'in', 'Preventive maintenance jobs land on the bay board like any other job.', 'أعمال الصيانة الوقائية تظهر على لوحة الخلجان كأي عمل آخر.'],
    ['SALIS Insurance', 'plan', 'Repair starts on approval, and the approved lines are the work order. Planned.', 'يبدأ الإصلاح عند الموافقة، والبنود المعتمدة هي أمر العمل. مخطط.'],
  ]) },
  { label: ['Accountant', 'المحاسب'], panel: roleGrid([
    ['SALIS Garage', 'live', 'ZATCA correctness, journals from invoices, and an audit trail that answers who changed this.', 'صحة الامتثال للهيئة، وقيود من الفواتير، وسجل تدقيق يجيب عن سؤال من غيّر هذا.'],
    ['SALIS Spare Parts', 'in', 'Stock value and cost of parts sold reconcile to the ledger by construction.', 'قيمة المخزون وتكلفة القطع المباعة تتطابق مع الدفتر بحكم البناء.'],
    ['SALIS Fleet', 'in', 'One consolidated invoice per contract period, itemised per vehicle, ZATCA-compliant.', 'فاتورة موحدة لكل فترة عقد، مفصّلة لكل مركبة، متوافقة مع الهيئة.'],
    ['SALIS Insurance', 'plan', 'Two invoices, two payers, one job card, one audit trail. Planned.', 'فاتورتان، ودافعان، وبطاقة عمل واحدة، وسجل تدقيق واحد. مخطط.'],
  ]) },
  { label: ['Fleet manager', 'مدير الأسطول'], panel: roleGrid([
    ['SALIS Garage', 'live', 'Every fleet vehicle’s job history on the same job cards the workshop writes.', 'سجل أعمال كل مركبة في الأسطول على بطاقات العمل نفسها التي تكتبها الورشة.'],
    ['SALIS Spare Parts', 'in', 'Parts for contract vehicles priced by the contract, visible on the order.', 'قطع مركبات العقد مسعّرة بحسب العقد، وظاهرة على الطلب.'],
    ['SALIS Fleet', 'in', 'Utilisation and cost per vehicle across branches, without a spreadsheet export.', 'الاستخدام والتكلفة لكل مركبة عبر الفروع، دون تصدير إلى جدول.'],
    ['SALIS Insurance', 'plan', 'Fleet claims under one contract, on the same records. Planned.', 'مطالبات الأسطول تحت عقد واحد، على السجلات نفسها. مخطط.'],
  ]) },
], 'Who it is for, by role');

const proofCards = `
<div class="pgrid">
  <div class="pc bezel"><div class="core"><div class="pair" dir="ltr"><span class="from">48 h</span><span class="to">4 h</span></div><div class="what">${t('Estimate approval', 'اعتماد عرض السعر')}</div><div class="base">${t('Baseline: paper estimates signed at the counter.', 'الأساس: عروض أسعار ورقية تُوقَّع عند الكاونتر.')}</div></div></div>
  <div class="pc bezel"><div class="core"><div class="pair" dir="ltr"><span class="from">15 min</span><span class="to">2 min</span></div><div class="what">${t('Invoice at the counter', 'الفاتورة عند الكاونتر')}</div><div class="base">${t('Baseline: handwritten invoice copied to a spreadsheet at day’s end.', 'الأساس: فاتورة بخط اليد تُنسخ إلى جدول في نهاية اليوم.')}</div></div></div>
  <div class="pc bezel"><div class="core"><div class="pair" dir="ltr"><span class="to">+25%</span></div><div class="what">${t('Workshop throughput', 'إنتاجية الورشة')}</div><div class="base">${t('Measured across deployments against each workshop’s prior twelve months.', 'مقاسة عبر عمليات التشغيل مقارنة بالاثني عشر شهراً السابقة لكل ورشة.')}</div></div></div>
</div>`;

const roadmap = (r = '') => `
<ol class="road">
  <li><a href="${r}products/garage.html" dir="ltr" translate="no">SALIS Garage</a>${chip('Shipping', 'متاح', 'live')}<p>${t('Workshops sign in today, as SALIS AUTO. Releases are announced on the SALIS AUTO accounts, with release notes.', 'تسجّل الورش الدخول اليوم باسم SALIS AUTO. تُعلن الإصدارات على حسابات SALIS AUTO مع ملاحظات الإصدار.')}</p></li>
  <li><a href="${r}products/spare-parts.html" dir="ltr" translate="no">SALIS Spare Parts</a>${chip('In SALIS AUTO', 'داخل SALIS AUTO', 'in')}<p>${t('Available to every SALIS AUTO workshop. Access for buyers outside the workshop is planned, with no date promised.', 'متاح لكل ورشة على SALIS AUTO. الوصول لمشترين من خارج الورشة مخطط، دون وعد بتاريخ.')}</p></li>
  <li><a href="${r}products/fleet.html" dir="ltr" translate="no">SALIS Fleet</a>${chip('In SALIS AUTO', 'داخل SALIS AUTO', 'in')}<p>${t('Available inside SALIS AUTO. A standalone product for fleet managers who do not run a workshop is planned, with no date promised.', 'متاح داخل SALIS AUTO. منتج مستقل لمديري الأساطيل الذين لا يديرون ورشة مخطط، دون وعد بتاريخ.')}</p></li>
  <li><a href="${r}products/insurance.html" dir="ltr" translate="no">SALIS Insurance</a>${chip('Planned', 'مخطط', 'plan')}<p>${t('Not available. Described here so the family is complete and honest. Insurers and workshops who want to shape it are the first people we want to hear from.', 'غير متاح. يُذكر هنا لتكون العائلة كاملة وصادقة. شركات التأمين والورش الراغبة في تشكيله أول من نريد سماعهم.')}</p></li>
</ol>`;

const faqList = (items) => `<div class="faq">${items.map(([q, qa, a, aa]) => `<details class="bezel"><summary><span>${t(q, qa)}</span><i aria-hidden="true"></i></summary><div class="ans"><p>${t(a, aa)}</p></div></details>`).join('')}</div>`;

const homeFaq = faqList([
  ['Is SALISCO a product or a company?', 'هل ساليسكو منتج أم شركة؟', 'A company in Riyadh with one engineering backbone and four product lines. The product a workshop uses today is SALIS AUTO, which is the Garage line.', 'شركة في الرياض بأساس هندسي واحد وأربعة خطوط منتجات. المنتج الذي تستخدمه الورشة اليوم هو SALIS AUTO، وهو خط الورشة.'],
  ['Which lines can I sign in to today?', 'أي الخطوط يمكنني تسجيل الدخول إليها اليوم؟', 'Garage, as SALIS AUTO. Spare Parts and Fleet run inside it, so a SALIS AUTO workshop already has them. Insurance is planned and not available.', 'الورشة، باسم SALIS AUTO. قطع الغيار والأساطيل تعمل داخله، فأي ورشة على SALIS AUTO تملكهما. التأمين مخطط وغير متاح.'],
  ['Do the lines share data, or integrate?', 'هل تتشارك الخطوط البيانات أم تتكامل؟', 'They share one ledger. An estimate, a purchase order, a fleet contract and a claim are rows in one system, and every change writes its audit row in the same transaction.', 'تتشارك دفتراً واحداً. عرض السعر وأمر الشراء وعقد الأسطول والمطالبة سطور في نظام واحد، وكل تغيير يكتب سطر تدقيقه في المعاملة نفسها.'],
  ['Where do the numbers on this page come from?', 'من أين تأتي الأرقام في هذه الصفحة؟', 'From SALIS AUTO deployments, each quoted with its baseline. A number without a baseline does not appear here.', 'من عمليات تشغيل SALIS AUTO، وكل رقم مذكور مع أساس قياسه. الرقم بلا أساس لا يظهر هنا.'],
  ['Does it work in Arabic?', 'هل يعمل بالعربية؟', 'Arabic is written first and rendered right-to-left, with English beside it. Compliance terms keep their official Arabic forms.', 'العربية تُكتب أولاً وتُعرض من اليمين إلى اليسار، والإنجليزية بجانبها. مصطلحات الامتثال تحتفظ بصيغها العربية الرسمية.'],
  ['How do I see it?', 'كيف أراه؟', 'Book a 20-minute SALIS AUTO demo, in Arabic or English, on a job card from your own floor. For the company, insurers and partnerships, write to SALISCO.', 'احجز عرض SALIS AUTO لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك. لشؤون الشركة وشركات التأمين والشراكات، راسل ساليسكو.'],
]);

const accounts = `
<div class="acct">
  <a href="https://www.linkedin.com/company/salisco"><b>LinkedIn</b><span class="mono" dir="ltr">linkedin.com/company/salisco</span><span>${t('Releases across the family, hiring, results.', 'إصدارات العائلة، التوظيف، النتائج.')}</span></a>
  <a href="https://x.com/salisco"><b>X</b><span class="mono" dir="ltr">@salisco</span><span>${t('Short company news.', 'أخبار الشركة القصيرة.')}</span></a>
  <a href="https://www.instagram.com/salisco"><b>Instagram</b><span class="mono" dir="ltr">@salisco</span><span>${t('The family in pictures, Riyadh.', 'العائلة بالصور، الرياض.')}</span></a>
  <a href="https://www.youtube.com/@salisco"><b>YouTube</b><span class="mono" dir="ltr">youtube.com/@salisco</span><span>${t('Engineering talks and recorded webinars.', 'أحاديث هندسية وندوات مسجلة.')}</span></a>
</div>
<p class="fine">${t('The handle must be reserved on every platform before these go live. Product detail stays on each product’s own accounts.', 'يجب حجز المعرّف على كل منصة قبل الإطلاق. تفاصيل المنتج تبقى على حسابات كل منتج.')}</p>`;

const whyDeck = `
<div class="deck">
  <div class="dk bezel"><div class="core"><span class="k">${t('Saudi-native', 'سعودية الأصل')}</span><h3>${t('Built for this market, not translated into it.', 'بُنيت لهذا السوق، لا تُرجمت إليه.')}</h3><p>${t('ZATCA, SAR and Arabic are the assumptions each product starts from. Nothing is bolted on late, so nothing behaves differently in Arabic than in English.', 'الهيئة والريال والعربية هي الافتراضات التي يبدأ منها كل منتج. لا شيء يُضاف متأخراً، فلا شيء يتصرف بالعربية بخلاف الإنجليزية.')}</p></div></div>
  <div class="dk bezel"><div class="core"><span class="k">${t('One backbone', 'أساس واحد')}</span><h3>${t('Products share a ledger, not an integration.', 'المنتجات تتشارك دفتراً واحداً، لا تكاملاً.')}</h3><p>${t('An estimate, a purchase order, a fleet contract and a claim are rows in one system. There is nothing to export, reconcile or retype between them.', 'عرض السعر وأمر الشراء وعقد الأسطول والمطالبة صفوف في نظام واحد. لا شيء يُصدَّر أو يُطابَق أو يُعاد إدخاله بينها.')}</p></div></div>
  <div class="dk bezel"><div class="core"><span class="k">${t('Auditable', 'قابلة للتدقيق')}</span><h3>${t('Traceability is enforced by the database.', 'التتبع تفرضه قاعدة البيانات.')}</h3><p>${t('Every mutation writes its audit row in the same transaction. The promise is not in the marketing copy. It is in the schema.', 'كل تعديل يكتب سطر تدقيقه في المعاملة نفسها. الوعد ليس في نص التسويق. إنه في المخطط.')}</p></div></div>
</div>`;

const home = `
<section class="field" id="top" aria-labelledby="hero-h">${fieldTrace}
  <div class="wrap">
    <div class="eyebrow rv">${t('Riyadh · operational software for Saudi Arabia', 'الرياض · برمجيات تشغيلية للمملكة')}</div>
    <h1 id="hero-h" class="rv">${t('SALISCO. One backbone. Four lines of <span class="o">Saudi-built</span> software.', 'ساليسكو. أساس واحد. أربعة خطوط من البرمجيات <span class="o">المبنية في السعودية.</span>')}</h1>
    <p class="lede rv">${t('Garage, Spare Parts, Fleet and Insurance share one ledger and four assumptions from day one: Arabic, ZATCA, the riyal, and an audit trail that answers who changed what.', 'الورشة وقطع الغيار والأساطيل والتأمين تتشارك دفتراً واحداً وأربعة افتراضات من اليوم الأول: العربية، والهيئة، والريال، وسجل تدقيق يجيب عن السؤال: من غيّر ماذا.')}</p>
    <div class="ctas rv"><a class="btn on-dark" href="#family">${t('See the four lines', 'اطّلع على الخطوط الأربعة')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="${DEMO}">${t('Book a SALIS AUTO demo', 'احجز عرض SALIS AUTO')}<span class="arr" aria-hidden="true">→</span></a></div>
  </div>
</section>

<section class="wrap stack" id="family" aria-labelledby="fam-h">
  <div class="sec-head"><div class="eyebrow">${t('The family', 'العائلة')}</div><h2 id="fam-h">${t('One family. Four products. Status stated on every line.', 'عائلة واحدة. أربعة منتجات. الحالة مذكورة في كل سطر.')}</h2><p>${t('Garage is what a workshop signs in to today. Spare Parts and Fleet ship inside it. Insurance is planned and is described as planned.', 'الورشة هي ما تسجّل الورش الدخول إليه اليوم. قطع الغيار والأساطيل تعمل داخلها. التأمين مخطط ويوصف بأنه مخطط.')}</p></div>
  ${stackCards()}
  <div class="note">${t('Product lines confirmed by the owner on 4 September 2026. Statuses describe what a workshop can sign in to today, not the roadmap.', 'خطوط المنتجات كما أكدها المالك في ٤ سبتمبر ٢٠٢٦. تصف الحالات ما تستطيع الورشة تسجيل الدخول إليه اليوم، لا خارطة الطريق.')}</div>
</section>

<section class="wrap" id="backbone" aria-labelledby="bb-h">
  <div class="sec-head"><div class="eyebrow">${t('One backbone', 'أساس واحد')}</div><h2 id="bb-h">${t('Four assumptions every product starts from.', 'أربعة افتراضات يبدأ منها كل منتج.')}</h2><p>${t('Each tab is one assumption and the screen detail it produces.', 'كل تبويب افتراض واحد وتفصيل الشاشة الذي ينتج عنه.')}</p></div>
  ${backboneTabs}
</section>

<section class="band" id="why" aria-labelledby="why-h"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">${t('Why one family', 'لماذا عائلة واحدة')}</div><h2 id="why-h">${t('The value is the absence of seams.', 'القيمة في غياب الفواصل.')}</h2></div>
  ${whyDeck}
</div></section>

<section class="wrap" id="roles" aria-labelledby="roles-h">
  <div class="sec-head"><div class="eyebrow">${t('Who it is for', 'لمن هو')}</div><h2 id="roles-h">${t('Judged on whether it survives the floor.', 'يُحكم عليه بما إذا كان يصمد على أرض الورشة.')}</h2><p>${t('Pick a role. Each line says what that person gets from it, and whether it ships today.', 'اختر دوراً. كل خط يقول ما الذي يحصل عليه هذا الشخص منه، وهل هو متاح اليوم.')}</p></div>
  ${rolesTabs}
</section>

<section class="wrap" id="proof" aria-labelledby="proof-h">
  <div class="sec-head"><div class="eyebrow">${t('Results from SALIS AUTO deployments', 'نتائج من تشغيل SALIS AUTO')}</div><h2 id="proof-h">${t('Numbers carry their baseline or they do not appear.', 'الأرقام تحمل أساس قياسها أو لا تظهر.')}</h2></div>
  ${proofCards}
</section>

<section class="wrap" id="roadmap" aria-labelledby="road-h">
  <div class="sec-head"><div class="eyebrow">${t('Status, line by line', 'الحالة سطراً بسطر')}</div><h2 id="road-h">${t('What ships, what runs inside, what is planned.', 'ما هو متاح، وما يعمل داخله، وما هو مخطط.')}</h2><p>${t('No dates are invented on this page. A line moves when it moves, and this list changes on the day it does.', 'لا تُخترع تواريخ في هذه الصفحة. ينتقل الخط حين ينتقل، وتتغير هذه القائمة في اليوم نفسه.')}</p></div>
  ${roadmap()}
</section>

<section class="wrap" id="faq" aria-labelledby="faq-h">
  <div class="sec-head"><div class="eyebrow">${t('Questions', 'أسئلة')}</div><h2 id="faq-h">${t('Plain answers.', 'إجابات واضحة.')}</h2></div>
  ${homeFaq}
</section>

<section class="wrap" id="accounts" aria-labelledby="acc-h">
  <div class="sec-head"><div class="eyebrow">${t('Accounts', 'الحسابات')}</div><h2 id="acc-h">${t('SALISCO on four platforms, one handle.', 'ساليسكو على أربع منصات بمعرّف واحد.')}</h2></div>
  ${accounts}
</section>

<section class="wrap cta-end" id="contact" aria-labelledby="cta-h">
  <h2 id="cta-h">${t('See it on a job card from your own floor.', 'شاهده على بطاقة عمل من ورشتك.')}</h2>
  <p>${t('A 20-minute SALIS AUTO demo, in Arabic or English. For the company, write to SALISCO.', 'عرض SALIS AUTO لعشرين دقيقة، بالعربية أو الإنجليزية. لشؤون الشركة راسل ساليسكو.')}</p>
  <div class="ctas"><a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="contact.html">${t('Contact SALISCO', 'تواصل مع ساليسكو')}<span class="arr" aria-hidden="true">→</span></a></div>
</section>`;

/* ---------------------------------------------------------------- product pages */
function productPage(o) {
  const shipsList = `<ul class="ships">${o.ships.map(([en, ar, cls]) => `<li><span class="st ${cls}">${cls === 'live' ? t('Shipping', 'متاح') : cls === 'in' ? t('In SALIS AUTO', 'داخل SALIS AUTO') : cls === 'cfg' ? t('Requires configuration', 'يتطلب إعداداً') : t('Planned', 'مخطط')}</span><span>${t(en, ar)}</span></li>`).join('')}</ul>`;
  const connects = `<div class="connect">${o.connects.map(([name, href, cls, en, ar]) => `<a class="bezel" href="${href}"><span class="core"><b dir="ltr" translate="no">${name}</b><span class="st ${cls}">${cls === 'live' ? t('Shipping', 'متاح') : cls === 'in' ? t('In SALIS AUTO', 'داخل SALIS AUTO') : t('Planned', 'مخطط')}</span><p>${t(en, ar)}</p></span></a>`).join('')}</div>`;
  const body = tabs([
    { label: ['Overview', 'نظرة عامة'], panel: `<div class="tp"><div><h3>${o.whatH}</h3><ul class="facts">${o.facts.map(([en, ar]) => `<li>${t(en, ar)}</li>`).join('')}</ul></div>${bez(o.mock2 || o.mock)}</div>` },
    { label: ['What ships today', 'ما هو متاح اليوم'], panel: `<div class="tp one"><div><h3>${o.shipsH}</h3><p class="lead">${o.status}</p>${shipsList}</div></div>` },
    { label: ['Who it is for', 'لمن هو'], panel: `<div class="roles">${o.roles.map(([r, ra, d, da]) => `<div><b>${t(r, ra)}</b><p>${t(d, da)}</p></div>`).join('')}</div>` },
    { label: ['How it connects', 'كيف يرتبط'], panel: `<div class="tp one"><div><h3>${t('Same ledger, no seams.', 'الدفتر نفسه، بلا فواصل.')}</h3><p class="lead">${o.connectP}</p>${connects}</div></div>` },
    { label: ['FAQ', 'أسئلة'], panel: faqList(o.faq) },
  ], `${o.name} in depth`);
  return `
<section class="field phero" aria-labelledby="ph">${fieldTrace}
  <div class="wrap hero-grid">
    <div>
      <div class="crumbs"><a href="../index.html" translate="no">SALISCO</a> <span aria-hidden="true">/</span> <a href="../index.html#family">${t('Products', 'المنتجات')}</a></div>
      <div class="eyebrow">${o.eyebrow}</div>
      <h1 id="ph" dir="ltr" translate="no">${o.name}</h1>
      <p class="lede">${o.lede}</p>
      <div class="ctas">${o.ctas}</div>
      <div class="statusline">${o.status}</div>
    </div>
    <div class="hero-mock">${bez(o.mock)}</div>
  </div>
</section>

<section class="wrap" aria-labelledby="depth-h">
  <div class="sec-head"><div class="eyebrow">${t('In depth', 'بالتفصيل')}</div><h2 id="depth-h">${o.depthH}</h2></div>
  ${body}
</section>

${o.proof ? `<section class="wrap" id="proof" aria-labelledby="proof-h"><div class="sec-head"><div class="eyebrow">${t('Results from SALIS AUTO deployments', 'نتائج من تشغيل SALIS AUTO')}</div><h2 id="proof-h">${t('Numbers carry their baseline or they do not appear.', 'الأرقام تحمل أساس قياسها أو لا تظهر.')}</h2></div>${proofCards}</section>` : ''}

<section class="wrap" aria-labelledby="fam2-h">
  <div class="sec-head"><div class="eyebrow">${t('The rest of the family', 'بقية العائلة')}</div><h2 id="fam2-h">${t('Four lines, one backbone.', 'أربعة خطوط، أساس واحد.')}</h2></div>
  ${roadmap('../')}
</section>

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
  ctas: `<a class="btn on-dark" href="${DEMO}">${t('Book a 20-minute demo', 'احجز عرضاً لعشرين دقيقة')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="https://salisauto.app" dir="ltr">salisauto.app<span class="arr" aria-hidden="true">→</span></a>`,
  status: t('<b>Status: shipping.</b> Workshops sign in to it today under the product name SALIS AUTO.', '<b>الحالة: متاح.</b> تسجّل الورش الدخول إليه اليوم باسم المنتج SALIS AUTO.'),
  mock: mockGarage,
  depthH: t('Thirteen domains on one record of the job.', 'ثلاثة عشر مجالاً على سجل واحد للعمل.'),
  whatH: t('Check-in to invoice, on one job card.', 'من الاستقبال إلى الفاتورة، على بطاقة عمل واحدة.'),
  facts: [
    ['Check-in with photos and customer lookup, a multi-point inspection with severity, and an itemised estimate with VAT sent to the customer’s phone for an SMS-verified signature.', 'استقبال بالصور والبحث عن العميل، فحص متعدد النقاط بدرجات الخطورة، وعرض سعر مفصّل بالضريبة يُرسل إلى هاتف العميل لتوقيع موثّق برسالة نصية.'],
    ['Bay board, technician assignment, parts consumption from stock, quality control sign-off, delivery with e-signature.', 'لوحة الخلجان، إسناد الفنيين، صرف القطع من المخزون، توقيع مراقبة الجودة، والتسليم بتوقيع إلكتروني.'],
    ['ZATCA Phase 2 e-invoice generated by the same transaction that posts the sale: QR, hash chain, seven-year retention.', 'فاتورة إلكترونية للمرحلة الثانية تولدها المعاملة نفسها التي ترحّل البيع: رمز الاستجابة، سلسلة التجزئة، وحفظ لسبع سنوات.'],
    ['Accounting, payroll, CRM and HR on the same ledger. Every mutation writes its audit row in the same transaction.', 'المحاسبة والرواتب وإدارة العملاء والموارد البشرية على الدفتر نفسه. كل تعديل يكتب سطر تدقيقه في المعاملة نفسها.'],
    ['Arabic and English as first-class renderings, fourteen roles, multi-branch from the first branch.', 'العربية والإنجليزية كواجهتين أصليتين، أربعة عشر دوراً، وتعدد الفروع من الفرع الأول.'],
  ],
  shipsH: t('What a workshop can use today.', 'ما تستطيع الورشة استخدامه اليوم.'),
  ships: [
    ['Check-in, inspection, estimate, repair, quality control, delivery, on one job card.', 'الاستقبال والفحص وعرض السعر والإصلاح ومراقبة الجودة والتسليم، على بطاقة عمل واحدة.', 'live'],
    ['ZATCA Phase 2 e-invoice with QR and hash chain; cancel-and-reissue for corrections.', 'فاتورة إلكترونية للمرحلة الثانية برمز الاستجابة وسلسلة التجزئة، والتصحيح بالإلغاء وإعادة الإصدار.', 'live'],
    ['Accounting, payroll, CRM, HR, reports, technician and supplier portals, customer app.', 'المحاسبة والرواتب وإدارة العملاء والموارد البشرية والتقارير وبوابتا الفني والمورّد وتطبيق العميل.', 'live'],
    ['SMS-verified estimate approval: needs an SMS provider connected at deployment.', 'اعتماد عرض السعر برمز رسالة نصية: يحتاج إلى مزوّد رسائل مربوط عند النشر.', 'cfg'],
    ['AI assistant, smart scheduling and agents: need an AI API connected at deployment.', 'المساعد الذكي والجدولة الذكية والوكلاء: تحتاج إلى واجهة ذكاء اصطناعي مربوطة عند النشر.', 'cfg'],
    ['Credit and debit notes.', 'الإشعارات الدائنة والمدينة.', 'plan'],
  ],
  roles: [
    ['Workshop owner', 'صاحب الورشة', 'Revenue, VAT and stock reconcile without a bookkeeper’s rework.', 'الإيراد والضريبة والمخزون تتطابق دون إعادة عمل من المحاسب.'],
    ['Service advisor', 'مستشار الخدمة', 'Speed at the counter, and language a customer can be shown directly.', 'سرعة عند الكاونتر، ولغة يمكن عرضها للعميل مباشرة.'],
    ['Technician', 'الفني', 'Short instructions on a phone, in Arabic, with one hand.', 'تعليمات قصيرة على الهاتف، بالعربية، بيد واحدة.'],
    ['Accountant', 'المحاسب', 'ZATCA correctness and an audit trail that answers who changed this.', 'صحة الامتثال للهيئة وسجل تدقيق يجيب عن سؤال من غيّر هذا.'],
  ],
  connectP: t('Garage is the record the other lines write to. Nothing is exported between them.', 'الورشة هي السجل الذي تكتب فيه الخطوط الأخرى. لا شيء يُصدَّر بينها.'),
  connects: [
    ['SALIS Spare Parts', 'spare-parts.html', 'in', 'Parts consumed on a job card leave stock and land on the invoice as the same line.', 'القطع المصروفة على بطاقة العمل تخرج من المخزون وتظهر في الفاتورة كالبند نفسه.'],
    ['SALIS Fleet', 'fleet.html', 'in', 'A fleet vehicle checks in with its contract terms already applied; its job cards feed utilisation.', 'تُستقبل مركبة الأسطول وشروط عقدها مطبقة سلفاً، وبطاقات عملها تغذي نسبة الاستخدام.'],
    ['SALIS Insurance', 'insurance.html', 'plan', 'The signed estimate becomes the claim document. Planned.', 'عرض السعر الموقّع يصبح مستند المطالبة. مخطط.'],
  ],
  faq: [
    ['Is SALIS Garage the same thing as SALIS AUTO?', 'هل SALIS Garage هو SALIS AUTO نفسه؟', 'Yes. Garage is the line; SALIS AUTO is the product name a workshop signs in to.', 'نعم. الورشة هي الخط، وSALIS AUTO هو اسم المنتج الذي تسجّل الورشة الدخول إليه.'],
    ['Can I start with one branch?', 'هل يمكنني البدء بفرع واحد؟', 'Yes. Add branches later; roles and approval ceilings carry over.', 'نعم. أضف الفروع لاحقاً، وتنتقل الأدوار وسقوف الاعتماد معها.'],
    ['Is my data separate from other workshops?', 'هل بياناتي منفصلة عن الورش الأخرى؟', 'Each workshop is isolated at the database level. Access is by role, and every change records who made it and when.', 'كل ورشة معزولة على مستوى قاعدة البيانات. الوصول بحسب الدور، وكل تغيير يسجّل من قام به ومتى.'],
  ],
  proof: true,
  endH: t('See it on your own workshop’s numbers.', 'شاهده على أرقام ورشتك.'),
  endP: t('A 20-minute demo, in Arabic or English, on a job card from your floor.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.'),
  endCtas: `<a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="https://salisauto.app">${t('Visit SALIS AUTO', 'زُر SALIS AUTO')}<span class="arr" aria-hidden="true">→</span></a>`,
});

const parts = productPage({
  name: 'SALIS Spare Parts',
  eyebrow: t('Supplier network · in SALIS AUTO today', 'شبكة الموردين · داخل SALIS AUTO اليوم'),
  lede: t('The parts side of the workshop as one system: catalogue, price comparison, purchase orders, automatic reorder below minimum stock, and a portal where suppliers publish and confirm.', 'جانب القطع في الورشة كنظام واحد: الكتالوج، مقارنة الأسعار، أوامر الشراء، إعادة الطلب تلقائياً عند انخفاض المخزون عن حده، وبوابة ينشر فيها الموردون ويؤكدون.'),
  ctas: `<a class="btn on-dark" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="garage.html">${t('It ships inside Garage', 'يعمل داخل الورشة')}<span class="arr" aria-hidden="true">→</span></a>`,
  status: t('<b>Status: in SALIS AUTO today.</b> Available to every SALIS AUTO workshop. Access for buyers outside the workshop is planned and not yet available.', '<b>الحالة: داخل SALIS AUTO اليوم.</b> متاح لكل ورشة على SALIS AUTO. الوصول لمشترين من خارج الورشة مخطط وغير متاح بعد.'),
  mock: mockParts,
  depthH: t('Stock that reorders itself, with a person still approving.', 'مخزون يعيد طلب نفسه، ومع ذلك يعتمده شخص.'),
  whatH: t('From minimum stock to a confirmed delivery.', 'من الحد الأدنى للمخزون إلى تسليم مؤكد.'),
  facts: [
    ['Every part has an opening quantity; everything after that is a movement with an idempotency key, so a retried request never double-counts.', 'لكل قطعة كمية افتتاحية، وكل ما يليها حركة بمفتاح تكرار، فلا يُحتسب طلب معاد مرتين.'],
    ['When stock drops below its minimum, a purchase request is drafted against the preferred supplier and waits for approval within the role’s ceiling.', 'حين ينخفض المخزون عن حده، تُصاغ طلبية شراء للمورّد المفضل وتنتظر الاعتماد ضمن سقف الدور.'],
    ['Suppliers publish catalogues, prices and delivery times in their own portal; the workshop compares before it orders.', 'ينشر الموردون الكتالوجات والأسعار ومدد التوصيل في بوابتهم، وتقارن الورشة قبل الطلب.'],
    ['Parts consumed on a job card leave stock and land on the invoice as the same line, priced in SAR to the halala.', 'القطع المصروفة على بطاقة العمل تخرج من المخزون وتظهر في الفاتورة كالبند نفسه، مسعّرة بالريال حتى الهللة.'],
  ],
  shipsH: t('What a SALIS AUTO workshop has today.', 'ما تملكه ورشة SALIS AUTO اليوم.'),
  ships: [
    ['Supplier catalogue and the supplier portal.', 'كتالوج الموردين وبوابة الموردين.', 'in'],
    ['Price comparison across suppliers before the order is placed.', 'مقارنة الأسعار بين الموردين قبل وضع الطلب.', 'in'],
    ['Purchase orders with approval ceilings by role.', 'أوامر الشراء بسقوف اعتماد بحسب الدور.', 'in'],
    ['Automatic reorder below minimum stock, with the order drafted for approval.', 'إعادة الطلب تلقائياً تحت الحد الأدنى، مع صياغة الطلب للاعتماد.', 'in'],
    ['Access for buyers outside the workshop.', 'الوصول لمشترين من خارج الورشة.', 'plan'],
  ],
  roles: [
    ['Parts manager', 'مدير القطع', 'Sees what is below minimum, what is on order, and what is arriving, without a spreadsheet.', 'يرى ما هو تحت الحد، وما هو مطلوب، وما هو في الطريق، دون جدول.'],
    ['Purchasing', 'المشتريات', 'Approves drafted orders within a ceiling; anything above routes to the next role.', 'يعتمد الأوامر المصاغة ضمن سقف، وما فوقه يُحال إلى الدور التالي.'],
    ['Supplier', 'المورّد', 'Publishes once, confirms orders, tracks delivery, gets paid against a ZATCA invoice.', 'ينشر مرة، يؤكد الطلبات، يتابع التسليم، ويُسدد له مقابل فاتورة إلكترونية.'],
    ['Accountant', 'المحاسب', 'Stock value and cost of parts sold reconcile to the ledger by construction.', 'قيمة المخزون وتكلفة القطع المباعة تتطابق مع الدفتر بحكم البناء.'],
  ],
  connectP: t('Spare Parts is a view on the same stock the job cards consume.', 'قطع الغيار نافذة على المخزون نفسه الذي تستهلكه بطاقات العمل.'),
  connects: [
    ['SALIS Garage', 'garage.html', 'live', 'A part requested from a job card arrives against that card and lands on its invoice.', 'القطعة المطلوبة من بطاقة العمل تصل مقابل تلك البطاقة وتظهر في فاتورتها.'],
    ['SALIS Fleet', 'fleet.html', 'in', 'Parts for contract vehicles are priced by the contract, visible on the order.', 'قطع مركبات العقد مسعّرة بحسب العقد، وظاهرة على الطلب.'],
    ['SALIS Insurance', 'insurance.html', 'plan', 'Approved claim lines reserve parts before the repair starts. Planned.', 'بنود المطالبة المعتمدة تحجز القطع قبل بدء الإصلاح. مخطط.'],
  ],
  faq: [
    ['Do suppliers need a SALIS AUTO account?', 'هل يحتاج الموردون إلى حساب SALIS AUTO؟', 'They use the supplier portal, a separate sign-in tied to your workshop.', 'يستخدمون بوابة الموردين، وهي تسجيل دخول منفصل مرتبط بورشتك.'],
    ['Can a retried order be counted twice?', 'هل يمكن أن يُحتسب طلب معاد مرتين؟', 'No. Every movement carries an idempotency key; a retry returns the same movement.', 'لا. كل حركة تحمل مفتاح تكرار، والإعادة تعيد الحركة نفسها.'],
    ['Who approves a drafted order?', 'من يعتمد الطلب المصاغ؟', 'The role whose ceiling covers the amount. Above it, the order routes to the next role.', 'الدور الذي يغطي سقفه المبلغ. وما فوقه يُحال الطلب إلى الدور التالي.'],
  ],
  proof: false,
  endH: t('See reorder run on your own stock list.', 'شاهد إعادة الطلب تعمل على قائمة مخزونك.'),
  endP: t('A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.'),
  endCtas: `<a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="../index.html#family">${t('Back to the family', 'العودة إلى العائلة')}<span class="arr" aria-hidden="true">→</span></a>`,
});

const fleet = productPage({
  name: 'SALIS Fleet',
  eyebrow: t('Fleet accounts · in SALIS AUTO today', 'حسابات الأساطيل · داخل SALIS AUTO اليوم'),
  lede: t('Fleet accounts across branches: vehicles under contract, SLA tracking, cost per vehicle and utilisation, computed from the job cards the workshop already writes.', 'حسابات الأساطيل عبر الفروع: المركبات تحت العقد، متابعة اتفاقيات مستوى الخدمة، التكلفة لكل مركبة ونسبة الاستخدام، محسوبة من بطاقات العمل التي تكتبها الورشة أصلاً.'),
  ctas: `<a class="btn on-dark" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="garage.html">${t('It ships inside Garage', 'يعمل داخل الورشة')}<span class="arr" aria-hidden="true">→</span></a>`,
  status: t('<b>Status: in SALIS AUTO today.</b> A standalone product for fleet managers who do not run a workshop is planned and not yet available.', '<b>الحالة: داخل SALIS AUTO اليوم.</b> منتج مستقل لمديري الأساطيل الذين لا يديرون ورشة مخطط وغير متاح بعد.'),
  mock: mockFleet,
  depthH: t('Utilisation without an export.', 'نسبة الاستخدام دون تصدير.'),
  whatH: t('Contract, vehicle, job card, invoice: one chain.', 'العقد والمركبة وبطاقة العمل والفاتورة: سلسلة واحدة.'),
  facts: [
    ['A fleet account groups vehicles under a contract with its own pricing, approval ceiling and SLA.', 'حساب الأسطول يجمع المركبات تحت عقد له تسعيره وسقف اعتماده واتفاقية مستوى خدمته.'],
    ['Utilisation is days in service over days under contract, per vehicle and per branch, from job-card timestamps.', 'الاستخدام هو أيام الخدمة على أيام العقد، لكل مركبة ولكل فرع، من أختام وقت بطاقات العمل.'],
    ['Cost per vehicle and per kilometre from the invoices already posted, in SAR to the halala.', 'التكلفة لكل مركبة ولكل كيلومتر من الفواتير المرحّلة أصلاً، بالريال حتى الهللة.'],
    ['Preventive maintenance scheduled by interval; the appointment lands on the bay board like any other job.', 'الصيانة الوقائية تُجدول بالفترة، ويظهر الموعد على لوحة الخلجان كأي عمل آخر.'],
  ],
  shipsH: t('What a SALIS AUTO workshop has today.', 'ما تملكه ورشة SALIS AUTO اليوم.'),
  ships: [
    ['Fleet accounts and contracts with their own pricing, ceiling and SLA.', 'حسابات الأساطيل والعقود بتسعيرها وسقفها واتفاقية مستوى خدمتها.', 'in'],
    ['Utilisation and cost per vehicle, per branch, from job cards and invoices.', 'نسبة الاستخدام والتكلفة لكل مركبة ولكل فرع، من بطاقات العمل والفواتير.', 'in'],
    ['One consolidated ZATCA-compliant invoice per contract period, itemised per vehicle.', 'فاتورة موحدة متوافقة مع الهيئة لكل فترة عقد، مفصّلة لكل مركبة.', 'in'],
    ['Preventive maintenance by interval on the bay board.', 'الصيانة الوقائية بالفترة على لوحة الخلجان.', 'in'],
    ['A standalone product for fleet managers who do not run a workshop.', 'منتج مستقل لمديري الأساطيل الذين لا يديرون ورشة.', 'plan'],
  ],
  roles: [
    ['Fleet manager', 'مدير الأسطول', 'Utilisation and cost per vehicle across branches, without a spreadsheet export.', 'الاستخدام والتكلفة لكل مركبة عبر الفروع، دون تصدير إلى جدول.'],
    ['Workshop owner', 'صاحب الورشة', 'Contract revenue tracked against SLA, so a breach is visible before the customer says so.', 'إيراد العقد يُتابع مقابل اتفاقية مستوى الخدمة، فيُرى الإخلال قبل أن يقوله العميل.'],
    ['Service advisor', 'مستشار الخدمة', 'A fleet vehicle checks in with its contract terms already applied.', 'تُستقبل مركبة الأسطول وشروط عقدها مطبقة سلفاً.'],
    ['Accountant', 'المحاسب', 'One consolidated invoice per contract period, itemised per vehicle, ZATCA-compliant.', 'فاتورة موحدة لكل فترة عقد، مفصّلة لكل مركبة، متوافقة مع الهيئة.'],
  ],
  connectP: t('Fleet reads the job cards and invoices the workshop already writes.', 'الأساطيل تقرأ بطاقات العمل والفواتير التي تكتبها الورشة أصلاً.'),
  connects: [
    ['SALIS Garage', 'garage.html', 'live', 'Job-card timestamps are the utilisation figure; nothing is entered twice.', 'أختام وقت بطاقات العمل هي رقم الاستخدام، ولا يُدخل شيء مرتين.'],
    ['SALIS Spare Parts', 'spare-parts.html', 'in', 'Parts for contract vehicles are priced by the contract on the order and the invoice.', 'قطع مركبات العقد مسعّرة بحسب العقد على الطلب وعلى الفاتورة.'],
    ['SALIS Insurance', 'insurance.html', 'plan', 'Fleet claims under one contract, on the same records. Planned.', 'مطالبات الأسطول تحت عقد واحد، على السجلات نفسها. مخطط.'],
  ],
  faq: [
    ['Where do the utilisation figures come from?', 'من أين تأتي أرقام الاستخدام؟', 'From job-card timestamps: days in service over days under contract, per vehicle and per branch.', 'من أختام وقت بطاقات العمل: أيام الخدمة على أيام العقد، لكل مركبة ولكل فرع.'],
    ['Can the fleet see its own account?', 'هل يستطيع الأسطول رؤية حسابه؟', 'The customer app shows each vehicle’s jobs and invoices. A fleet-manager view of its own is planned.', 'يعرض تطبيق العميل أعمال كل مركبة وفواتيرها. نافذة خاصة بمدير الأسطول مخططة.'],
    ['Is the utilisation gain guaranteed?', 'هل زيادة الاستخدام مضمونة؟', 'No figure is guaranteed. The press kit records a 30% utilisation gain across deployments against each fleet’s prior contract period; ask for the baseline in the demo.', 'لا رقم مضمون. يسجل الملف الصحفي زيادة في الاستخدام بنسبة ٣٠٪ عبر عمليات التشغيل مقارنة بفترة العقد السابقة لكل أسطول، واطلب الأساس في العرض.'],
  ],
  proof: false,
  endH: t('See your contract vehicles on one board.', 'شاهد مركبات عقودك على لوحة واحدة.'),
  endP: t('A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.'),
  endCtas: `<a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="../index.html#family">${t('Back to the family', 'العودة إلى العائلة')}<span class="arr" aria-hidden="true">→</span></a>`,
});

const insurance = productPage({
  name: 'SALIS Insurance',
  eyebrow: t('Claims between workshops and insurers · planned', 'المطالبات بين الورش وشركات التأمين · مخطط'),
  lede: t('Claims and approvals on the estimate and invoice records that already exist in SALIS Garage. The insurer sees the same estimate the customer signed; the invoice splits between insurer and customer with a ZATCA e-invoice for each.', 'المطالبات والموافقات على سجلات عروض الأسعار والفواتير الموجودة أصلاً في SALIS Garage. ترى شركة التأمين عرض السعر نفسه الذي وقّعه العميل، وتنقسم الفاتورة بين شركة التأمين والعميل بفاتورة إلكترونية لكل طرف.'),
  ctas: `<a class="btn on-dark" href="../contact.html">${t('Ask about the plan', 'اسأل عن الخطة')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="garage.html">${t('See what ships today', 'اطّلع على المتاح اليوم')}<span class="arr" aria-hidden="true">→</span></a>`,
  status: t('<b>Status: planned. Not available.</b> No date is promised on this page.', '<b>الحالة: مخطط. غير متاح.</b> لا يُوعد بتاريخ في هذه الصفحة.'),
  mock: mockInsurance,
  depthH: t('The intent, stated plainly.', 'النية، مذكورة بوضوح.'),
  whatH: t('One document, three parties.', 'مستند واحد، ثلاثة أطراف.'),
  facts: [
    ['A claim opens on an existing estimate, so the insurer, the workshop and the customer are looking at one document.', 'تُفتح المطالبة على عرض سعر موجود، فتنظر شركة التأمين والورشة والعميل إلى مستند واحد.'],
    ['Approvals, partial approvals and rejections are recorded as audit rows on the same job card.', 'تُسجَّل الموافقات والموافقات الجزئية والرفض كسطور تدقيق على بطاقة العمل نفسها.'],
    ['On approval the job card moves to repair; on delivery the invoice splits by the approved amount.', 'عند الموافقة تنتقل بطاقة العمل إلى الإصلاح، وعند التسليم تنقسم الفاتورة بحسب المبلغ المعتمد.'],
    ['Nothing in this line is available today. It appears here so the family is described completely and honestly.', 'لا شيء في هذا الخط متاح اليوم. يظهر هنا لتوصف العائلة كاملة وبصدق.'],
  ],
  shipsH: t('Nothing ships today. This is the plan.', 'لا شيء متاح اليوم. هذه هي الخطة.'),
  ships: [
    ['Claim opened on the signed estimate.', 'مطالبة تُفتح على عرض السعر الموقّع.', 'plan'],
    ['Insurer approval, partial approval and rejection as audit rows on the job card.', 'موافقة شركة التأمين والموافقة الجزئية والرفض كسطور تدقيق على بطاقة العمل.', 'plan'],
    ['Invoice split between insurer and customer, a ZATCA e-invoice for each.', 'فاتورة مقسّمة بين شركة التأمين والعميل، بفاتورة إلكترونية لكل طرف.', 'plan'],
  ],
  roles: [
    ['Insurer', 'شركة التأمين', 'One signed estimate per claim, with photos from check-in and the inspection record.', 'عرض سعر موقّع واحد لكل مطالبة، مع صور الاستقبال وسجل الفحص.'],
    ['Workshop owner', 'صاحب الورشة', 'Approval status visible on the bay board, not in an email thread.', 'حالة الموافقة ظاهرة على لوحة الخلجان، لا في سلسلة بريد.'],
    ['Customer', 'العميل', 'Sees what the insurer covers and what remains, before the repair starts.', 'يرى ما تغطيه شركة التأمين وما يتبقى، قبل بدء الإصلاح.'],
    ['Accountant', 'المحاسب', 'Two invoices, two payers, one job card, one audit trail.', 'فاتورتان، ودافعان، وبطاقة عمل واحدة، وسجل تدقيق واحد.'],
  ],
  connectP: t('Insurance would sit on records the other lines already write. That is why it is planned as a line, not a separate product.', 'التأمين سيقوم على سجلات تكتبها الخطوط الأخرى أصلاً. لهذا يُخطط له خطاً لا منتجاً منفصلاً.'),
  connects: [
    ['SALIS Garage', 'garage.html', 'live', 'The signed estimate is the claim document; the job card is the repair record.', 'عرض السعر الموقّع هو مستند المطالبة، وبطاقة العمل هي سجل الإصلاح.'],
    ['SALIS Spare Parts', 'spare-parts.html', 'in', 'Approved lines reserve parts before the repair starts.', 'البنود المعتمدة تحجز القطع قبل بدء الإصلاح.'],
    ['SALIS Fleet', 'fleet.html', 'in', 'Fleet claims under one contract, itemised per vehicle.', 'مطالبات الأسطول تحت عقد واحد، مفصّلة لكل مركبة.'],
  ],
  faq: [
    ['When will it be available?', 'متى سيكون متاحاً؟', 'No date is promised on this page. The status line changes on the day it changes.', 'لا يُوعد بتاريخ في هذه الصفحة. يتغير سطر الحالة في اليوم الذي يتغير فيه.'],
    ['Can an insurer help shape it?', 'هل تستطيع شركة تأمين المساهمة في تشكيله؟', 'Yes. Insurers and workshops who want to shape the line are the first people we want to hear from. Write to SALISCO.', 'نعم. شركات التأمين والورش الراغبة في تشكيل الخط هم أول من نريد سماعهم. راسل ساليسكو.'],
    ['Will it change how invoices work today?', 'هل سيغير طريقة عمل الفواتير اليوم؟', 'Existing invoices do not change. A claim would add a split invoice with a ZATCA e-invoice for each payer.', 'الفواتير الحالية لا تتغير. ستضيف المطالبة فاتورة مقسّمة بفاتورة إلكترونية لكل دافع.'],
  ],
  proof: false,
  endH: t('Interested in the insurance line?', 'مهتم بخط التأمين؟'),
  endP: t('Write to SALISCO. Insurers and workshops who want to shape it are the first people we want to hear from.', 'راسل ساليسكو. شركات التأمين والورش الراغبة في تشكيل هذا الخط هم أول من نريد سماعهم.'),
  endCtas: `<a class="btn" href="mailto:info@salisco.com">${t('Email SALISCO', 'راسل ساليسكو')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="../index.html#family">${t('Back to the family', 'العودة إلى العائلة')}<span class="arr" aria-hidden="true">→</span></a>`,
});

/* ---------------------------------------------------------------- about, contact, 404 */
const assumptionCards = [
  ['Arabic first', 'العربية أولاً', 'Copy is written for Arabic and rendered right-to-left; English sits beside it. Length differences are a layout problem to solve, never a reason to abbreviate Arabic.', 'يُكتب النص بالعربية ويُعرض من اليمين إلى اليسار، والإنجليزية بجانبه. فروق الطول مشكلة تخطيط تُحل، لا سبباً لاختصار العربية.', mockArabic],
  ['ZATCA in the core', 'الهيئة في النواة', 'Phase 2 e-invoicing with QR and hash chain is generated by the same transaction that posts the sale. Compliance is not a module.', 'الفوترة الإلكترونية للمرحلة الثانية برمز الاستجابة وسلسلة التجزئة تولدها المعاملة نفسها التي ترحّل البيع. الامتثال ليس وحدة إضافية.', mockZatca],
  ['SAR to the halala', 'الريال حتى الهللة', 'Money is stored as integer halalas. Totals reconcile because rounding happens once, at the edge.', 'تُخزَّن المبالغ بالهللة كأعداد صحيحة. المجاميع تتطابق لأن التقريب يحدث مرة واحدة، عند الحافة.', mockSar],
  ['One audit row per change', 'سطر تدقيق لكل تغيير', 'Actor, before, after and request id, written in the same transaction as the change. The promise of traceability is in the schema.', 'الفاعل والقيمة قبل وبعد ورقم الطلب، تُكتب في المعاملة نفسها مع التغيير. وعد التتبع في بنية البيانات.', mockAudit],
];

const about = `
<section class="field phero" aria-labelledby="ah">${fieldTrace}
  <div class="wrap">
    <div class="eyebrow">${t('About', 'عن ساليسكو')}</div>
    <h1 id="ah">${t('SALISCO builds the software Saudi operations run on.', 'ساليسكو تبني البرمجيات التي تعمل عليها العمليات السعودية.')}</h1>
    <p class="lede">${t('A product-family company in Riyadh. One engineering backbone, four product lines, one rule: the product is judged on whether it survives a workshop floor at 09:40 with a queue behind the counter.', 'شركة عائلة منتجات في الرياض. أساس هندسي واحد، أربعة خطوط منتجات، وقاعدة واحدة: يُحكم على المنتج بما إذا كان يصمد على أرض ورشة في التاسعة والأربعين صباحاً وخلف الكاونتر طابور.')}</p>
  </div>
</section>

<section class="wrap stack" aria-labelledby="as-h">
  <div class="sec-head"><div class="eyebrow">${t('The four assumptions', 'الافتراضات الأربعة')}</div><h2 id="as-h">${t('Every product starts from the same place.', 'كل منتج يبدأ من المكان نفسه.')}</h2></div>
  <div class="cards">
${assumptionCards.map(([en, ar, den, dar, mock], i) => `    <article class="card bezel" data-i="${i}"><div class="core"><div class="txt"><span class="eyebrow">${t(`Assumption ${i + 1} of 4`, `الافتراض ${['١', '٢', '٣', '٤'][i]} من ٤`)}</span><h3>${t(en, ar)}</h3><p>${t(den, dar)}</p></div><div class="cmock" aria-hidden="true">${mock}</div></div></article>`).join('\n')}
  </div>
</section>

<section class="band" aria-labelledby="story-h"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">${t('The family', 'العائلة')}</div><h2 id="story-h">${t('Four lines, because a workshop is four businesses at once.', 'أربعة خطوط، لأن الورشة أربع أعمال في آن واحد.')}</h2></div>
  ${whyDeck}
</div></section>

<section class="wrap" aria-labelledby="where-h">
  <div class="sec-head"><div class="eyebrow">${t('Where', 'أين')}</div><h2 id="where-h">${t('Riyadh, Kingdom of Saudi Arabia.', 'الرياض، المملكة العربية السعودية.')}</h2></div>
  <ul class="facts">
    <li>${t('Built in Riyadh for the Saudi market. The first product, SALIS AUTO, serves workshops from a single bay to multi-branch fleet operations.', 'تُبنى في الرياض للسوق السعودي. المنتج الأول، SALIS AUTO، يخدم الورش من خليج واحد إلى عمليات أساطيل متعددة الفروع.')}</li>
    <li>${t('Hiring in Riyadh, on site: product design (Arabic-first), backend engineering (PostgreSQL), implementation (workshops). Roles are listed on the SALIS AUTO careers page.', 'التوظيف في الرياض حضورياً: تصميم المنتج (العربية أولاً)، هندسة الخلفية (PostgreSQL)، التطبيق (الورش). الوظائف مدرجة في صفحة الوظائف في SALIS AUTO.')} <a href="https://salisauto.app/public-portal/careers">${t('See open roles', 'اطّلع على الوظائف')}</a></li>
    <li>${t('Confirmed by the owner on 4 September 2026: the name SALISCO, its Arabic form ساليسكو, the domain salisco.com, and the four product lines.', 'أكده المالك في ٤ سبتمبر ٢٠٢٦: اسم SALISCO وصيغته العربية ساليسكو والنطاق salisco.com وخطوط المنتجات الأربعة.')}</li>
  </ul>
  <div class="note">${t('Honest note. The address info@salisco.com is still a proposal, and the @salisco handles are not yet reserved.', 'ملاحظة صريحة. العنوان info@salisco.com ما يزال مقترحاً، ومعرّفات @salisco لم تُحجز بعد.')}</div>
</section>

<section class="wrap" aria-labelledby="road2-h">
  <div class="sec-head"><div class="eyebrow">${t('Status, line by line', 'الحالة سطراً بسطر')}</div><h2 id="road2-h">${t('What ships, what runs inside, what is planned.', 'ما هو متاح، وما يعمل داخله، وما هو مخطط.')}</h2></div>
  ${roadmap()}
</section>

<section class="wrap cta-end" aria-label="Next step">
  <h2>${t('See the shipping product on your own numbers.', 'شاهد المنتج المتاح على أرقامك.')}</h2>
  <p>${t('A 20-minute SALIS AUTO demo, in Arabic or English, on a job card from your floor.', 'عرض SALIS AUTO لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}</p>
  <div class="ctas"><a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost" href="contact.html">${t('Contact SALISCO', 'تواصل مع ساليسكو')}<span class="arr" aria-hidden="true">→</span></a></div>
</section>`;

const contact = `
<section class="field phero" aria-labelledby="ch">${fieldTrace}
  <div class="wrap">
    <div class="eyebrow">${t('Contact', 'تواصل')}</div>
    <h1 id="ch">${t('Write, or book the demo.', 'راسلنا، أو احجز العرض.')}</h1>
    <p class="lede">${t('No form on this page. An email reaches a person; the demo link opens the SALIS AUTO booking page, which is the fastest way to see the shipping product.', 'لا نموذج في هذه الصفحة. البريد يصل إلى شخص، ورابط العرض يفتح صفحة الحجز في SALIS AUTO، وهي أسرع طريقة لرؤية المنتج المتاح.')}</p>
  </div>
</section>
<section class="wrap" aria-label="Contact channels">
  <div class="channels">
    <a class="channel bezel" href="mailto:info@salisco.com"><span class="core"><span class="k">${t('Email', 'البريد')}</span><b dir="ltr">info@salisco.com</b><span>${t('Company matters, partnerships, press, the insurance line.', 'شؤون الشركة، الشراكات، الإعلام، خط التأمين.')}<span class="prop">${t('address proposed', 'العنوان مقترح')}</span></span></span></a>
    <a class="channel bezel" href="${DEMO}"><span class="core"><span class="k">${t('Demo', 'العرض التوضيحي')}</span><b>${t('Book a 20-minute SALIS AUTO demo', 'احجز عرض SALIS AUTO لعشرين دقيقة')}</b><span>${t('In Arabic or English, on a job card from your floor.', 'بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}</span></span></a>
    <a class="channel bezel" href="mailto:info@salisauto.app"><span class="core"><span class="k">${t('Product support', 'دعم المنتج')}</span><b dir="ltr">info@salisauto.app</b><span>${t('Existing SALIS AUTO workshops: support lives with the product.', 'ورش SALIS AUTO الحالية: الدعم مع المنتج.')}</span></span></a>
  </div>
  <div class="sec-head" style="margin-top:72px"><div class="eyebrow">${t('Accounts', 'الحسابات')}</div><h2>${t('SALISCO on four platforms, one handle.', 'ساليسكو على أربع منصات بمعرّف واحد.')}</h2><p>${t('SALISCO speaks as the company: releases across the family, hiring, results. Product detail stays on each product’s own accounts. The handle must be reserved on every platform before these go live.', 'ساليسكو تتحدث بصفة الشركة: الإصدارات عبر العائلة، والتوظيف، والنتائج. تفاصيل المنتج تبقى على حسابات كل منتج. يجب حجز المعرّف على كل منصة قبل الإطلاق.')}</p></div>
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
</section>
<section class="wrap" aria-labelledby="road3-h">
  <div class="sec-head"><div class="eyebrow">${t('Before you write', 'قبل أن تراسل')}</div><h2 id="road3-h">${t('Where each line stands today.', 'أين يقف كل خط اليوم.')}</h2></div>
  ${roadmap()}
</section>`;

const lost = `
<section class="field lost" aria-labelledby="lh">${fieldTrace}
  <div class="wrap">
    <div class="eyebrow">404</div>
    <div class="code" dir="ltr" aria-hidden="true">404</div>
    <h1 id="lh">${t('That page is not here.', 'هذه الصفحة ليست هنا.')}</h1>
    <p class="lede">${t('The address may have changed, or it never existed on salisco.com. The four product lines, the company page and contact are one click away.', 'ربما تغيّر العنوان، أو لم يوجد أصلاً على salisco.com. خطوط المنتجات الأربعة وصفحة الشركة وصفحة التواصل على بعد نقرة.')}</p>
    <div class="ctas"><a class="btn on-dark" href="index.html">${t('Go to the home page', 'اذهب إلى الصفحة الرئيسية')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="index.html#family">${t('See the four lines', 'اطّلع على الخطوط الأربعة')}<span class="arr" aria-hidden="true">→</span></a><a class="btn ghost-dark" href="contact.html">${t('Contact SALISCO', 'تواصل مع ساليسكو')}<span class="arr" aria-hidden="true">→</span></a></div>
  </div>
</section>`;

const BODIES = { home, garage, parts, fleet, insurance, about, contact, lost };

/* ---------------------------------------------------------------- write */
for (const page of PAGES) {
  tabSeq = 0;
  const body = BODIES[page.key];
  const html = head(page) + '\n<body>' + header(page) + `\n<main id="main">${body}\n</main>` + footer(page) + `\n<script src="${rel(page.path)}assets/site.js"></script>\n</body>\n</html>\n`;
  const out = join(ROOT, page.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', page.path, html.length);
}

const today = '2026-09-05';
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
