// SALIS AUTO site generator. `node build.mjs` writes every page from the copy below.
// Same system as sites/salisco: one header, one footer, one stylesheet, one script;
// pages differ only in <main>. Every string exists in both languages.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://salisauto.app';
const APP = 'https://app.salisauto.app';
const DEMO = `${APP}/public-portal/book-demo`;
const SIGNIN = `${APP}/login`;
const FAMILY = 'https://salisco.com';

const t = (en, ar) => `<span lang="en">${en}</span><span lang="ar">${ar}</span>`;
/** Relative prefix back to the site root for a page path such as resources/media/x.html. */
const baseOf = (path) => '../'.repeat((path.match(/\//g) || []).length);
let B = '';

/* ---------------------------------------------------------------- pages */
const PAGES = [
  { path: 'index.html', key: 'home', title: ['SALIS AUTO', 'SALIS AUTO'],
    desc: ['Workshop management, Saudi standard. One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in and one audit trail.',
           'إدارة ورش السيارات بمعيار سعودي. منصة واحدة تدير الورشة من الاستقبال إلى الفاتورة، بالعربية والإنجليزية، مع فوترة إلكترونية متوافقة مع الهيئة وسجل تدقيق واحد.'] },
  { path: 'lifecycle.html', key: 'lifecycle', title: ['The workshop lifecycle', 'دورة الورشة'],
    desc: ['Six stages on one job card: check-in, inspection, estimate, repair, quality control, delivery. Each stage gates the next.',
           'ست مراحل على بطاقة عمل واحدة: الاستقبال، الفحص، عرض السعر، الإصلاح، مراقبة الجودة، التسليم. كل مرحلة تشترط سابقتها.'] },
  { path: 'features.html', key: 'features', title: ['Thirteen domains', 'ثلاثة عشر مجالاً'],
    desc: ['Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, HR and portals on one record of the job.',
           'الورشة، السجل، المالية، المحاسبة، إدارة العملاء، الإدارة، المصادقة، الذكاء الاصطناعي، القطع، مركز الاتصال، التقارير، الموارد البشرية، والبوابات على سجل واحد للعمل.'] },
  { path: 'zatca.html', key: 'zatca', title: ['ZATCA Phase 2', 'المرحلة الثانية من الفوترة الإلكترونية'],
    desc: ['How SALIS AUTO issues ZATCA Phase 2 e-invoices: QR, hash chain, UBL 2.1 XML, immutable after issue, seven-year retention.',
           'كيف يصدر SALIS AUTO فواتير المرحلة الثانية: رمز الاستجابة، سلسلة التجزئة، XML بمعيار UBL 2.1، غير قابلة للتعديل بعد الإصدار، وحفظ لسبع سنوات.'] },
  { path: 'spare-parts.html', key: 'parts', title: ['Spare Parts', 'قطع الغيار'],
    desc: ['Supplier catalogue, price comparison, purchase orders, automatic reorder and the supplier portal, inside SALIS AUTO today.',
           'كتالوج الموردين، مقارنة الأسعار، أوامر الشراء، إعادة الطلب التلقائية، وبوابة الموردين، داخل SALIS AUTO اليوم.'] },
  { path: 'fleet.html', key: 'fleet', title: ['Fleet', 'الأساطيل'],
    desc: ['Fleet accounts across branches: vehicles under contract, SLA tracking, cost per vehicle and utilisation, inside SALIS AUTO today.',
           'حسابات الأساطيل عبر الفروع: المركبات تحت العقد، اتفاقيات مستوى الخدمة، التكلفة لكل مركبة، ونسبة الاستخدام، داخل SALIS AUTO اليوم.'] },
  { path: 'customer-app.html', key: 'customer', title: ['Customer app', 'تطبيق العملاء'],
    desc: ['The customer watches the job move, approves the estimate from their phone with an SMS-verified signature, and keeps every invoice.',
           'يتابع العميل انتقال العمل، ويعتمد عرض السعر من هاتفه بتوقيع موثّق برسالة نصية، ويحتفظ بكل فاتورة.'] },
  { path: 'portals.html', key: 'portals', title: ['Technician and supplier portals', 'بوابتا الفني والمورّد'],
    desc: ['A phone-first portal for technicians and a self-service portal for suppliers, on the same job cards and orders the workshop writes.',
           'بوابة للفنيين مبنية للهاتف أولاً وبوابة خدمة ذاتية للموردين، على بطاقات العمل والطلبات نفسها التي تكتبها الورشة.'] },
  { path: 'pricing.html', key: 'pricing', title: ['Pricing', 'الأسعار'],
    desc: ['Starter, Professional and Enterprise. Monthly or annual, in SAR, with the modules each tier includes stated line by line.',
           'البداية، الاحترافية، والمؤسسات. شهرياً أو سنوياً، بالريال، مع الوحدات التي تشملها كل خطة سطراً بسطر.'] },
  { path: 'about.html', key: 'about', title: ['About SALIS AUTO', 'عن SALIS AUTO'],
    desc: ['Built in Riyadh for Saudi workshops. SALIS Garage, one of four SALISCO product lines on one backbone.',
           'مبني في الرياض للورش السعودية. SALIS Garage، واحد من أربعة خطوط منتجات ساليسكو على أساس واحد.'] },
  { path: 'contact.html', key: 'contact', title: ['Contact SALIS AUTO', 'تواصل مع SALIS AUTO'],
    desc: ['Email, the demo booking page, sign-in, and the SALIS AUTO accounts on LinkedIn, X, Instagram and YouTube.',
           'البريد، صفحة حجز العرض، تسجيل الدخول، وحسابات SALIS AUTO على لينكدإن وإكس وإنستغرام ويوتيوب.'] },
];

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

const logo = () => `<img class="full" src="${B}assets/logo-full-colour.svg" alt="" width="500" height="500"><img class="rev" src="${B}assets/logo-reversed-white.svg" alt="" width="500" height="500"><span dir="ltr" translate="no">SALIS AUTO</span>`;

const PRODUCT_KEYS = ['lifecycle', 'features', 'zatca', 'parts', 'fleet', 'customer', 'portals'];
const PRODUCT_MENU = [
  ['lifecycle.html', 'lifecycle', 'The lifecycle', 'دورة الورشة', 'Check-in to delivery', 'من الاستقبال إلى التسليم'],
  ['features.html', 'features', 'Thirteen domains', 'ثلاثة عشر مجالاً', 'Every module, one record', 'كل الوحدات، سجل واحد'],
  ['zatca.html', 'zatca', 'ZATCA Phase 2', 'الفوترة الإلكترونية', 'QR, hash chain, retention', 'رمز الاستجابة، سلسلة التجزئة، الحفظ'],
  ['spare-parts.html', 'parts', 'Spare Parts', 'قطع الغيار', 'Supplier network and reorder', 'شبكة الموردين وإعادة الطلب'],
  ['fleet.html', 'fleet', 'Fleet', 'الأساطيل', 'Contract vehicles across branches', 'مركبات العقود عبر الفروع'],
  ['customer-app.html', 'customer', 'Customer app', 'تطبيق العملاء', 'Approve from the phone', 'الاعتماد من الهاتف'],
  ['portals.html', 'portals', 'Portals', 'البوابات', 'Technician and supplier', 'الفني والمورّد'],
];

function header(page) {
  B = baseOf(page.path);
  const on = (k) => (page.key === k ? ' aria-current="page"' : '');
  return `
<a class="skip" href="#main">${t('Skip to content', 'انتقل إلى المحتوى')}</a>
<header id="site-header">
  <div class="wrap">
    <a class="logo" href="${B}index.html" aria-label="SALIS AUTO home">${logo()}</a>
    <nav aria-label="Main">
      <ul>
        <li class="has-menu">
          <a href="${B}lifecycle.html"${PRODUCT_KEYS.includes(page.key) ? ' aria-current="true"' : ''}>${t('Product', 'المنتج')}</a>
          <ul class="menu">
            ${PRODUCT_MENU.map(([h, k, en, ar, sen, sar]) => `<li><a href="${B}${h}"${on(k)}><b>${t(en, ar)}</b><span>${t(sen, sar)}</span></a></li>`).join('\n            ')}
          </ul>
        </li>
        <li><a href="${B}pricing.html"${on('pricing')}>${t('Pricing', 'الأسعار')}</a></li>
        <li><a href="${B}about.html"${on('about')}>${t('About', 'عن المنتج')}</a></li>
        <li><a href="${B}contact.html"${on('contact')}>${t('Contact', 'تواصل')}</a></li>
        <li><a href="${B}resources/index.html"${page.key === 'resources' ? ' aria-current="page"' : ''}>${t('Resources', 'المصادر')}</a></li>
      </ul>
    </nav>
    <div class="hdr-actions">
      <button class="lang" type="button" id="langToggle" aria-label="Switch language"><span lang="en">العربية</span><span lang="ar" dir="ltr">English</span></button>
      <a class="signin" href="${SIGNIN}">${t('Sign in', 'تسجيل الدخول')}</a>
      <a class="btn small" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a>
      <button class="burger" type="button" id="menuToggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div id="mobile-menu" class="mobile" hidden>
    ${PRODUCT_MENU.map(([h, , en, ar]) => `<a href="${B}${h}">${t(en, ar)}</a>`).join('\n    ')}
    <a href="${B}pricing.html">${t('Pricing', 'الأسعار')}</a>
    <a href="${B}about.html">${t('About', 'عن المنتج')}</a>
    <a href="${B}contact.html">${t('Contact', 'تواصل')}</a>
    <a href="${B}resources/index.html">${t('Resources', 'المصادر')}</a>
    <a href="${SIGNIN}">${t('Sign in', 'تسجيل الدخول')}</a>
    <a href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a>
  </div>
</header>`;
}

function footer(page) {
  B = baseOf(page.path);
  return `
<footer>
  <div class="wrap">
    <div>
      <a class="logo" href="${B}index.html">${logo()}</a>
      <p class="tag">${t('Workshop management, Saudi standard. SALIS Garage, one of four SALISCO product lines. Riyadh.', 'إدارة ورش السيارات بمعيار سعودي. SALIS Garage، واحد من أربعة خطوط منتجات ساليسكو. الرياض.')}</p>
      <p class="fine"><a href="${APP}/privacy-policy">${t('Privacy', 'الخصوصية')}</a> · <a href="${APP}/terms-conditions">${t('Terms', 'الشروط')}</a> · <a href="${APP}/cookie-policy">${t('Cookies', 'ملفات الارتباط')}</a></p>
    </div>
    <div>
      <span class="k">${t('Product', 'المنتج')}</span>
      <ul>
        ${PRODUCT_MENU.map(([h, , en, ar]) => `<li><a href="${B}${h}">${t(en, ar)}</a></li>`).join('\n        ')}
        <li><a href="${B}pricing.html">${t('Pricing', 'الأسعار')}</a></li>
        <li><a href="${B}resources/index.html">${t('Resources', 'المصادر')}</a></li>
      </ul>
    </div>
    <div>
      <span class="k">${t('The SALIS family', 'عائلة SALIS')}</span>
      <ul>
        <li><a href="${FAMILY}/products/garage.html" dir="ltr">SALIS Garage</a> <em>${t('this product', 'هذا المنتج')}</em></li>
        <li><a href="${FAMILY}/products/spare-parts.html" dir="ltr">SALIS Spare Parts</a> <em>${t('inside', 'داخله')}</em></li>
        <li><a href="${FAMILY}/products/fleet.html" dir="ltr">SALIS Fleet</a> <em>${t('inside', 'داخله')}</em></li>
        <li><a href="${FAMILY}/products/insurance.html" dir="ltr">SALIS Insurance</a> <em>${t('planned', 'مخطط')}</em></li>
        <li><a href="${FAMILY}" dir="ltr">salisco.com</a></li>
      </ul>
    </div>
    <div>
      <span class="k">${t('Contact', 'تواصل')}</span>
      <ul>
        <li><a href="mailto:info@salisauto.app" dir="ltr">info@salisauto.app</a></li>
        <li><a href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a></li>
        <li><a href="${SIGNIN}">${t('Sign in', 'تسجيل الدخول')}</a></li>
        <li><a href="https://www.linkedin.com/company/salisauto" dir="ltr">linkedin.com/company/salisauto</a></li>
        <li><a href="https://x.com/SalisAuto" dir="ltr">@SalisAuto</a> · <a href="https://www.instagram.com/salisauto" dir="ltr">@salisauto</a></li>
        <li><a href="https://www.youtube.com/@salisauto" dir="ltr">youtube.com/@salisauto</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

function head(page) {
  B = baseOf(page.path);
  const url = SITE + '/' + (page.path === 'index.html' ? '' : page.path);
  const jsonld = page.key === 'home' ? `
<script type="application/ld+json">
[{"@context":"https://schema.org","@type":"Organization","name":"SALIS AUTO","url":"${SITE}","email":"info@salisauto.app","logo":"${SITE}/assets/logo-full-colour.svg",
  "address":{"@type":"PostalAddress","addressLocality":"Riyadh","addressCountry":"SA"},"parentOrganization":{"@type":"Organization","name":"SALISCO","url":"${FAMILY}"},
  "sameAs":["https://www.linkedin.com/company/salisauto","https://x.com/SalisAuto","https://www.instagram.com/salisauto","https://www.youtube.com/@salisauto"]},
 {"@context":"https://schema.org","@type":"SoftwareApplication","name":"SALIS AUTO","applicationCategory":"BusinessApplication","operatingSystem":"Web","url":"${APP}",
  "inLanguage":["ar","en"],"description":"Workshop management platform for Saudi automotive workshops: ZATCA Phase 2 e-invoicing, Arabic and English, one audit trail.",
  "offers":[{"@type":"Offer","name":"Starter","price":"999","priceCurrency":"SAR","billingIncrement":"P1M"},{"@type":"Offer","name":"Professional","price":"2499","priceCurrency":"SAR","billingIncrement":"P1M"}]}]
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
<meta property="og:site_name" content="SALIS AUTO">
<meta property="og:title" content="${page.title[0]}">
<meta property="og:description" content="${page.desc[0]}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/logo-full-colour.svg">
<meta property="og:locale" content="en_SA">
<meta property="og:locale:alternate" content="ar_SA">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@SalisAuto">
<meta name="theme-color" content="#0B1F3B">
<link rel="icon" href="${B}assets/logo-reversed-white.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&family=Poppins:wght@500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="${B}assets/site.css">
<script>document.documentElement.className+=' js';document.documentElement.dataset.titleAr=${JSON.stringify(page.title[1])};document.documentElement.dataset.titleEn=${JSON.stringify(page.title[0])};</script>${jsonld}
</head>`;
}

/* ---------------------------------------------------------------- mocks */
const chip = (en, ar, cls = '') => `<span class="st ${cls}">${t(en, ar)}</span>`;
const foot = (en, ar) => `<div class="foot">${t(en, ar)}</div>`;
const ILL = ['Illustrative rows. Figures are examples, not customer data.', 'صفوف توضيحية. الأرقام أمثلة وليست بيانات عملاء.'];

const mockBay = `
<div class="mock" aria-label="Bay board, illustrative">
  <div class="bar"><b>${t('Bay board · Riyadh Main', 'لوحة الخلجان · الرياض الرئيسي')}</b><span class="mono" dir="ltr">04 Sep 2026 · 09:40</span></div>
  <div class="row head"><span>${t('Bay', 'الخليج')}</span><span>${t('Job card', 'بطاقة العمل')}</span><span>${t('Plate', 'اللوحة')}</span><span class="num">${t('Amount', 'المبلغ')}</span><span>${t('Status', 'الحالة')}</span></div>
  <div class="row"><b>1</b><span class="mono" dir="ltr">JC-4F2A</span><span class="mono" dir="ltr">RUH 4821</span><span class="num mono" dir="ltr">SAR 1,245.00</span>${chip('In repair', 'قيد الإصلاح')}</div>
  <div class="row"><b>2</b><span class="mono" dir="ltr">JC-4F2B</span><span class="mono" dir="ltr">RUH 1157</span><span class="num mono" dir="ltr">SAR 380.00</span>${chip('QC', 'فحص الجودة')}</div>
  <div class="row"><b>3</b><span class="mono" dir="ltr">JC-4F2C</span><span class="mono" dir="ltr">RUH 9930</span><span class="num mono" dir="ltr">SAR 2,910.50</span>${chip('Awaiting parts', 'بانتظار القطع', 'o')}</div>
  <div class="row"><b>4</b><span class="mono" dir="ltr">JC-4F2D</span><span class="mono" dir="ltr">RUH 2204</span><span class="num mono" dir="ltr">SAR 640.00</span>${chip('Delivered', 'تم التسليم')}</div>
  ${foot(...ILL)}
</div>`;

const mockCheckin = `
<div class="mock" aria-label="Check-in, illustrative">
  <div class="bar"><b>${t('Check-in', 'الاستقبال')} <span class="mono" dir="ltr">JC-4F2A</span></b><span class="mono" dir="ltr">09:12</span></div>
  <div class="row head"><span>${t('Field', 'الحقل')}</span><span>${t('Value', 'القيمة')}</span></div>
  <div class="row"><span>${t('Plate', 'اللوحة')}</span><span class="mono" dir="ltr">RUH 4821</span></div>
  <div class="row"><span>${t('Vehicle', 'المركبة')}</span><span>${t('Camry 2022 · 48,210 km', 'كامري ٢٠٢٢ · ٤٨٬٢١٠ كم')}</span></div>
  <div class="row"><span>${t('Customer', 'العميل')}</span><span>${t('Found by phone number', 'وُجد برقم الهاتف')}</span></div>
  <div class="row"><span>${t('Photos', 'الصور')}</span><span>${t('6 taken, 1 scratch marked', '٦ صور، خدش واحد محدد')}</span></div>
  <div class="row"><span>${t('Bay', 'الخليج')}</span><span>${t('Bay 1 · Advisor: service desk', 'الخليج ١ · المستشار: مكتب الخدمة')}</span></div>
  ${foot(...ILL)}
</div>`;

const mockInspection = `
<div class="mock" aria-label="Inspection, illustrative">
  <div class="bar"><b>${t('Multi-point inspection', 'فحص متعدد النقاط')} <span class="mono" dir="ltr">JC-4F2A</span></b><span class="mono" dir="ltr">24 / 24</span></div>
  <div class="row head"><span>${t('Item', 'البند')}</span><span>${t('Finding', 'النتيجة')}</span><span>${t('Severity', 'الخطورة')}</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل الفرامل الأمامي')}</span><span>${t('2 mm left', 'بقي ٢ مم')}</span><span class="sev o">${t('Replace', 'استبدال')}</span></div>
  <div class="row"><span>${t('Engine oil', 'زيت المحرك')}</span><span>${t('Due by mileage', 'مستحق بالمسافة')}</span><span class="sev o">${t('Service', 'صيانة')}</span></div>
  <div class="row"><span>${t('Battery', 'البطارية')}</span><span>${t('12.6 V, holds charge', '١٢٫٦ فولت، تحتفظ بالشحن')}</span><span class="sev">${t('OK', 'سليم')}</span></div>
  <div class="row"><span>${t('Tyres', 'الإطارات')}</span><span>${t('5 mm, even wear', '٥ مم، تآكل منتظم')}</span><span class="sev">${t('OK', 'سليم')}</span></div>
  ${foot('Flagged items become estimate lines. Nothing is retyped.', 'البنود المحددة تصبح بنود عرض السعر. لا شيء يُعاد إدخاله.')}
</div>`;

const mockEstimate = `
<div class="mock" aria-label="Estimate, illustrative">
  <div class="bar"><b>${t('Estimate', 'عرض سعر')} <span class="mono" dir="ltr">EST-2041</span></b>${chip('Signed by customer', 'وقّعه العميل')}</div>
  <div class="row head"><span>${t('Line', 'البند')}</span><span class="num">${t('Qty', 'الكمية')}</span><span class="num">${t('Unit', 'الوحدة')}</span><span class="num">${t('Total', 'الإجمالي')}</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><span class="num mono" dir="ltr">1</span><span class="num mono" dir="ltr">SAR 420.00</span><span class="num mono" dir="ltr">SAR 420.00</span></div>
  <div class="row"><span>${t('Labour, brakes', 'أجرة، الفرامل')}</span><span class="num mono" dir="ltr">1.5 h</span><span class="num mono" dir="ltr">SAR 140.00</span><span class="num mono" dir="ltr">SAR 210.00</span></div>
  <div class="row"><span>${t('VAT 15%', 'ضريبة القيمة المضافة ١٥٪')}</span><span></span><span></span><span class="num mono" dir="ltr">SAR 94.50</span></div>
  <div class="row total"><span>${t('Total', 'الإجمالي')}</span><span></span><span></span><b class="num mono" dir="ltr">SAR 724.50</b></div>
  ${foot('Sent to the customer’s phone. Signed with an SMS-verified signature at 11:05.', 'أُرسل إلى هاتف العميل. وُقّع بتوقيع موثّق برسالة نصية في ١١:٠٥.')}
</div>`;

const mockQC = `
<div class="mock" aria-label="Quality control, illustrative">
  <div class="bar"><b>${t('Quality control', 'مراقبة الجودة')} <span class="mono" dir="ltr">JC-4F2A</span></b>${chip('Signed off', 'معتمد')}</div>
  <div class="row head"><span>${t('Check', 'الفحص')}</span><span>${t('Result', 'النتيجة')}</span></div>
  <div class="row"><span>${t('Brake test, 40 km/h', 'اختبار الفرامل، ٤٠ كم/س')}</span><span class="sev">${t('Pass', 'ناجح')}</span></div>
  <div class="row"><span>${t('Torque on wheel nuts', 'عزم صواميل العجلات')}</span><span class="sev">${t('Pass', 'ناجح')}</span></div>
  <div class="row"><span>${t('Road test, 4 km', 'اختبار طريق، ٤ كم')}</span><span class="sev">${t('Pass', 'ناجح')}</span></div>
  <div class="row"><span>${t('Interior clean, no tools left', 'المقصورة نظيفة، لا أدوات متروكة')}</span><span class="sev">${t('Pass', 'ناجح')}</span></div>
  ${foot('Signed by the QC technician, not the one who did the repair.', 'وقّعه فني مراقبة الجودة، لا الفني الذي أجرى الإصلاح.')}
</div>`;

const mockInvoice = `
<div class="mock" aria-label="Invoice with ZATCA QR, illustrative">
  <div class="bar"><b>${t('Tax invoice', 'فاتورة ضريبية')} <span class="mono" dir="ltr">INV-88120</span></b>${chip('Issued · immutable', 'صادرة · غير قابلة للتعديل')}</div>
  <div class="inv">
    <div class="meta">
      <span>${t('Seller VAT', 'الرقم الضريبي للبائع')}</span><code dir="ltr">3001234567890003</code>
      <span>${t('Issued', 'تاريخ الإصدار')}</span><code dir="ltr">2026-09-04T11:42:08+03:00</code>
      <span>${t('Previous invoice hash', 'تجزئة الفاتورة السابقة')}</span><code dir="ltr">9f2c…a71e</code>
      <span>${t('This invoice hash', 'تجزئة هذه الفاتورة')}</span><code dir="ltr">b04d…e9c2</code>
    </div>
    <div class="qr" role="img" aria-label="QR code placeholder drawn for illustration"></div>
  </div>
  <div class="row head"><span>${t('Line', 'البند')}</span><span class="num">${t('Qty', 'الكمية')}</span><span class="num">${t('Unit', 'الوحدة')}</span><span class="num">${t('Total', 'الإجمالي')}</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><span class="num mono" dir="ltr">1</span><span class="num mono" dir="ltr">SAR 420.00</span><span class="num mono" dir="ltr">SAR 420.00</span></div>
  <div class="row"><span>${t('Labour, brakes', 'أجرة، الفرامل')}</span><span class="num mono" dir="ltr">1.5 h</span><span class="num mono" dir="ltr">SAR 140.00</span><span class="num mono" dir="ltr">SAR 210.00</span></div>
  <div class="row total"><span>${t('Total incl. VAT 15%', 'الإجمالي شامل الضريبة ١٥٪')}</span><span></span><span></span><b class="num mono" dir="ltr">SAR 724.50</b></div>
  ${foot('The QR carries seller, VAT number, timestamp, total and VAT in TLV. The hash links this invoice to the one before it.', 'يحمل رمز الاستجابة البائع والرقم الضريبي والوقت والإجمالي والضريبة بترميز TLV. وتربط التجزئة هذه الفاتورة بالتي قبلها.')}
</div>`;

const mockParts = `
<div class="mock" aria-label="Purchase order, illustrative">
  <div class="bar"><b>${t('Purchase order', 'أمر شراء')} <span class="mono" dir="ltr">PO-10421</span></b>${chip('Awaiting approval', 'بانتظار الاعتماد', 'o')}</div>
  <div class="kv"><span>${t('Supplier', 'المورّد')}</span><b>${t('Preferred supplier, Riyadh', 'المورّد المفضل، الرياض')}</b><span>${t('Trigger', 'السبب')}</span><b>${t('Stock below minimum: 4 of 12', 'المخزون تحت الحد: ٤ من ١٢')}</b></div>
  <div class="row head"><span>${t('Part', 'القطعة')}</span><span>${t('Number', 'الرقم')}</span><span class="num">${t('Qty', 'الكمية')}</span><span class="num">${t('Unit', 'الوحدة')}</span><span class="num">${t('Line', 'الإجمالي')}</span></div>
  <div class="row"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><span class="mono" dir="ltr">BP-2210-F</span><span class="num mono" dir="ltr">8</span><span class="num mono" dir="ltr">SAR 145.00</span><span class="num mono" dir="ltr">SAR 1,160.00</span></div>
  <div class="row"><span>${t('Oil filter', 'فلتر زيت')}</span><span class="mono" dir="ltr">OF-0090</span><span class="num mono" dir="ltr">24</span><span class="num mono" dir="ltr">SAR 28.50</span><span class="num mono" dir="ltr">SAR 684.00</span></div>
  <div class="row total"><span>${t('Total incl. VAT 15%', 'الإجمالي شامل الضريبة ١٥٪')}</span><span></span><span></span><span></span><b class="num mono" dir="ltr">SAR 2,120.60</b></div>
  ${foot('Illustrative order. Prices are examples.', 'أمر توضيحي. الأسعار أمثلة.')}
</div>`;

const mockFleet = `
<div class="mock" aria-label="Fleet utilisation, illustrative">
  <div class="bar"><b>${t('Fleet account · Contract 2026-14', 'حساب أسطول · عقد 2026-14')}</b><span class="mono" dir="ltr">31 Aug 2026</span></div>
  <div class="row head"><span>${t('Plate', 'اللوحة')}</span><span>${t('Branch', 'الفرع')}</span><span>${t('Utilisation', 'الاستخدام')}</span><span class="num">${t('Cost / km', 'التكلفة / كم')}</span></div>
  <div class="row"><span class="mono" dir="ltr">RUH 7712</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span><span class="util"><i style="width:82%"></i><em dir="ltr">82%</em></span><span class="num mono" dir="ltr">SAR 0.41</span></div>
  <div class="row"><span class="mono" dir="ltr">DMM 3048</span><span>${t('Dammam', 'الدمام')}</span><span class="util"><i style="width:64%"></i><em dir="ltr">64%</em></span><span class="num mono" dir="ltr">SAR 0.53</span></div>
  <div class="row"><span class="mono" dir="ltr">JED 5521</span><span>${t('Jeddah', 'جدة')}</span><span class="util"><i style="width:37%"></i><em dir="ltr">37%</em></span><span class="num mono" dir="ltr">SAR 0.88</span></div>
  <div class="row"><span class="mono" dir="ltr">RUH 0916</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span><span class="util"><i style="width:91%"></i><em dir="ltr">91%</em></span><span class="num mono" dir="ltr">SAR 0.36</span></div>
  ${foot('Utilisation is days in service over days under contract. Illustrative figures.', 'نسبة الاستخدام هي أيام الخدمة على أيام العقد. أرقام توضيحية.')}
</div>`;

const mockTech = `
<div class="mock" aria-label="Technician portal, illustrative">
  <div class="bar"><b>${t('My jobs · Bay 1', 'أعمالي · الخليج ١')}</b><span class="mono" dir="ltr">${t('On shift · 02:48', 'في الوردية · 02:48')}</span></div>
  <div class="row head"><span>${t('Job card', 'بطاقة العمل')}</span><span>${t('Task', 'المهمة')}</span><span>${t('Status', 'الحالة')}</span></div>
  <div class="row"><span class="mono" dir="ltr">JC-4F2A</span><span>${t('Front brake pads', 'تيل الفرامل الأمامي')}</span>${chip('In progress', 'جارٍ')}</div>
  <div class="row"><span class="mono" dir="ltr">JC-4F2A</span><span>${t('Engine oil and filter', 'زيت المحرك والفلتر')}</span>${chip('Next', 'التالي')}</div>
  <div class="row"><span class="mono" dir="ltr">JC-4F2C</span><span>${t('Waiting: BP-2210-F', 'انتظار: BP-2210-F')}</span>${chip('Parts', 'قطع', 'o')}</div>
  ${foot('Phone-first. Request parts and add a photo from the same screen.', 'مبنية للهاتف أولاً. اطلب القطع وأضف صورة من الشاشة نفسها.')}
</div>`;

const mockSupplier = `
<div class="mock" aria-label="Supplier portal, illustrative">
  <div class="bar"><b>${t('Supplier portal · Orders', 'بوابة المورّد · الطلبات')}</b><span class="mono" dir="ltr">3 ${t('open', 'مفتوحة')}</span></div>
  <div class="row head"><span>${t('Order', 'الطلب')}</span><span>${t('Workshop', 'الورشة')}</span><span>${t('Status', 'الحالة')}</span></div>
  <div class="row"><span class="mono" dir="ltr">PO-10421</span><span>${t('Riyadh Main', 'الرياض الرئيسي')}</span>${chip('Confirm by 16:00', 'أكّد قبل ١٦:٠٠', 'o')}</div>
  <div class="row"><span class="mono" dir="ltr">PO-10418</span><span>${t('Dammam', 'الدمام')}</span>${chip('Dispatched', 'تم الشحن')}</div>
  <div class="row"><span class="mono" dir="ltr">PO-10402</span><span>${t('Jeddah', 'جدة')}</span>${chip('Delivered · invoiced', 'تم التسليم · مفوتر')}</div>
  ${foot('Catalogue, order acknowledgement, invoice submission and payment status, without a phone call.', 'الكتالوج، تأكيد الطلب، تقديم الفاتورة، وحالة الدفع، دون مكالمة هاتفية.')}
</div>`;

const mockPhone = `
<div class="phone" role="img" aria-label="Customer app, illustrative">
  <div class="screen">
    <div class="top"><b>${t('Your Camry · RUH 4821', 'سيارتك كامري · RUH 4821')}</b><span>${t('Riyadh Main · Bay 1', 'الرياض الرئيسي · الخليج ١')}</span></div>
    <div class="body">
      <div class="card">
        <div class="kv2"><span>${t('Stage', 'المرحلة')}</span><b>${t('Estimate ready', 'عرض السعر جاهز')}</b></div>
        <div class="stages"><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i><i></i></div>
        <div class="kv2"><span>${t('Ready by', 'جاهزة بحلول')}</span><b dir="ltr">16:30</b></div>
      </div>
      <div class="card">
        <div class="kv2"><span>${t('Front brake pads', 'تيل فرامل أمامي')}</span><b class="mono" dir="ltr">SAR 420.00</b></div>
        <div class="kv2"><span>${t('Labour, 1.5 h', 'أجرة، ١٫٥ ساعة')}</span><b class="mono" dir="ltr">SAR 210.00</b></div>
        <div class="kv2"><span>${t('VAT 15%', 'الضريبة ١٥٪')}</span><b class="mono" dir="ltr">SAR 94.50</b></div>
        <div class="kv2"><span>${t('Total', 'الإجمالي')}</span><b class="mono" dir="ltr">SAR 724.50</b></div>
        <div class="sig" aria-hidden="true"></div>
      </div>
    </div>
    <div class="cta">${t('Approve estimate', 'اعتمد عرض السعر')}</div>
    <div class="tabs"><span class="on">${t('Tracking', 'المتابعة')}</span><span>${t('Bookings', 'الحجوزات')}</span><span>${t('Garage', 'مركباتي')}</span><span>${t('Invoices', 'الفواتير')}</span></div>
  </div>
</div>`;

/* ---------------------------------------------------------------- blocks */
function proofBand() {
  return `
<section id="proof" class="proof" aria-labelledby="proof-h">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow bright">${t('Results from deployments', 'نتائج من مواقع التشغيل')}</div>
      <h2 id="proof-h">${t('Numbers carry their baseline or they do not appear.', 'الأرقام تحمل أساس قياسها أو لا تظهر.')}</h2>
    </div>
    <div class="grid">
      <div class="cell"><div class="pair" dir="ltr"><span class="from">48 h</span><span class="to" data-count="4" data-from="48" data-unit=" h">4 h</span></div><div class="what">${t('Estimate approval', 'اعتماد عرض السعر')}</div><div class="base">${t('Baseline: paper estimates signed at the counter.', 'الأساس: عروض أسعار ورقية تُوقَّع عند الكاونتر.')}</div></div>
      <div class="cell"><div class="pair" dir="ltr"><span class="from">15 min</span><span class="to" data-count="2" data-from="15" data-unit=" min">2 min</span></div><div class="what">${t('Invoice at the counter', 'الفاتورة عند الكاونتر')}</div><div class="base">${t('Baseline: handwritten invoice copied to a spreadsheet at day’s end.', 'الأساس: فاتورة بخط اليد تُنسخ إلى جدول في نهاية اليوم.')}</div></div>
      <div class="cell"><div class="pair" dir="ltr"><span class="to" data-count="25" data-from="0" data-prefix="+" data-unit="%">+25%</span></div><div class="what">${t('Workshop throughput', 'إنتاجية الورشة')}</div><div class="base">${t('Measured across deployments against each workshop’s prior twelve months.', 'مقاسة عبر مواقع التشغيل مقارنة بالاثني عشر شهراً السابقة لكل ورشة.')}</div></div>
    </div>
  </div>
</section>`;
}

const STAGES = [
  ['lifecycle.html#checkin', 'Check-in', 'الاستقبال', 'Photos, plate, customer lookup', 'صور، لوحة، بحث عن العميل'],
  ['lifecycle.html#inspection', 'Inspection', 'الفحص', 'Multi-point, with severity', 'متعدد النقاط، بدرجات الخطورة'],
  ['lifecycle.html#estimate', 'Estimate', 'عرض السعر', 'Signed from the phone', 'يُوقَّع من الهاتف'],
  ['lifecycle.html#repair', 'Repair', 'الإصلاح', 'Bay board, parts from stock', 'لوحة الخلجان، قطع من المخزون'],
  ['lifecycle.html#qc', 'Quality control', 'مراقبة الجودة', 'A second technician signs', 'يوقّع فني ثانٍ'],
  ['lifecycle.html#delivery', 'Delivery', 'التسليم', 'Invoice, QR, e-signature', 'فاتورة، رمز استجابة، توقيع إلكتروني'],
];
const rail6 = `<div class="rail6" role="list">${STAGES.map(([h, en, ar, sen, sar], i) => `<a role="listitem" href="${h}" data-stage="${i}"><span class="n" dir="ltr">${i + 1}</span><b>${t(en, ar)}</b><span>${t(sen, sar)}</span></a>`).join('')}</div>`;

const ARR = '<i class="arr" aria-hidden="true">&rarr;</i>';
const ctaEnd = (h, ha, p, pa) => `
<section class="wrap cta-end" aria-label="Next step">
  <h2>${t(h, ha)}</h2>
  <p>${t(p, pa)}</p>
  <div class="ctas"><a class="btn" href="${DEMO}">${t('Book a 20-minute demo', 'احجز عرضاً لعشرين دقيقة')}${ARR}</a><a class="btn ghost" href="${B}pricing.html">${t('See pricing', 'اطّلع على الأسعار')}</a></div>
</section>`;

/* ---------------------------------------------------------------- S4: the AI era */
/* Hand-placed landmass polygons (lon, lat), no external map data. Approximate on purpose. */
const MAP = {
  step: 0.9,
  polys: [
    [[34.8,29.3],[37,29.9],[39,32],[41.5,31.3],[44.5,29.2],[47.9,29.9],[48.6,28.5],[49.5,27],[50.2,26.4],[51.6,25.2],[51.2,24.6],[52.6,24.2],[54.4,24.4],[56.2,26.2],[56.5,24.8],[58.6,23.6],[59.8,22.5],[58.8,20.6],[57.8,19],[56.1,17.9],[54,17],[52.2,16.4],[49.4,14.6],[45.2,13],[43.4,12.7],[42.8,14.8],[42.3,16.8],[40.8,19.6],[39.1,22.3],[38.6,24.4],[36.9,26.2],[35.5,28]],
    [[34.5,29.5],[34.9,32.9],[35.9,34.6],[36.5,36.8],[41,37.1],[42.4,37.3],[44.8,37.1],[46.1,35],[47.7,32.4],[48.5,30],[47.9,29.9],[44.5,29.2],[41.5,31.3],[39,32],[37,29.9]],
    [[25,31.6],[31,31.5],[34.2,31.2],[34.9,29.4],[34.2,27.8],[33.5,27],[35,24.5],[36.9,22],[31.5,22],[25,22]],
    [[44.8,37.1],[48.5,38.5],[53,37],[56,37.5],[61.2,36.6],[61,31],[61.6,25.2],[57.3,25.7],[56.3,27.1],[54,26.6],[51.5,27.9],[50,30.2],[48.5,30],[47.7,32.4],[46.1,35]],
  ],
  /* name, lon, lat, ring: 0 Riyadh, 1 Kingdom, 2 Gulf, 3 region */
  cities: [['riyadh',46.7,24.7,0],['jeddah',39.2,21.5,1],['dammam',50.1,26.4,1],['madinah',39.6,24.5,1],['abha',42.5,18.2,1],['kuwait',48,29.4,2],['manama',50.6,26.2,2],['doha',51.5,25.3,2],['abudhabi',54.4,24.5,2],['dubai',55.3,25.2,2],['muscat',58.5,23.6,2],['amman',35.9,31.9,3],['cairo',31.2,30,3],['baghdad',44.4,33.3,3]],
  links: [['riyadh','jeddah'],['riyadh','dammam'],['riyadh','madinah'],['riyadh','abha'],['riyadh','kuwait'],['dammam','manama'],['manama','doha'],['doha','abudhabi'],['abudhabi','dubai'],['dubai','muscat'],['madinah','amman'],['amman','cairo'],['kuwait','baghdad']],
};
function mapSvg() {
  const W = 1000, H = 560, cx = 46, cy = 25.5, k = 24;
  const X = (lon) => W / 2 + (lon - cx) * k, Y = (lat) => H / 2 - (lat - cy) * k;
  const inside = (poly, x, y) => { let r = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; };
  let dots = '';
  for (let lat = 12; lat <= 38; lat += MAP.step) for (let lon = 24; lon <= 62; lon += MAP.step) {
    if (MAP.polys.some((p) => inside(p, lon, lat))) dots += `<circle cx="${X(lon).toFixed(0)}" cy="${Y(lat).toFixed(0)}" r="2.2"/>`;
  }
  const cities = MAP.cities.map(([n, lon, lat, ring]) => ring === 0
    ? `<circle cx="${X(lon).toFixed(0)}" cy="${Y(lat).toFixed(0)}" r="7" fill="#F97316"/><circle cx="${X(lon).toFixed(0)}" cy="${Y(lat).toFixed(0)}" r="14" fill="none" stroke="#F97316" stroke-width="2" opacity=".6"/>`
    : `<circle cx="${X(lon).toFixed(0)}" cy="${Y(lat).toFixed(0)}" r="3.5" fill="${ring === 3 ? '#0BB3FF' : '#0A5ED7'}" opacity=".5"/>`).join('');
  return `<svg class="map-fallback" viewBox="0 0 ${W} ${H}" aria-hidden="true"><g fill="#0A5ED7" opacity=".5">${dots}</g>${cities}</svg>`;
}
const aiCards = [
  ['AI Assistant', 'المساعد الذكي', 'Natural-language questions over the workshop’s own data.', 'أسئلة بلغة طبيعية على بيانات الورشة نفسها.'],
  ['Smart Scheduling', 'الجدولة الذكية', 'Predictive bay allocation and technician scheduling.', 'توزيع تنبؤي للخلجان وجدولة الفنيين.'],
  ['AI Agents', 'الوكلاء الأذكياء', 'Routine administrative tasks run by the system, with the audit row written like any other change.', 'مهام إدارية روتينية ينفذها النظام، مع صف تدقيق يُكتب ككل تغيير آخر.'],
];
const aiSection = `
<section class="ai-era" id="ai" aria-labelledby="ai-h">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow bright">${t('The AI era', 'عصر الذكاء الاصطناعي')}</div>
      <h2 id="ai-h">${t('Reinventing auto service for the AI era.', 'إعادة تعريف خدمة السيارات لعصر الذكاء الاصطناعي.')}</h2>
      <p>${t('Saudi Arabia first, then the Gulf and the region. Less retyping, less waiting, less guessing: the system drafts, schedules and reconciles, and people decide. Built to lead by removing friction, not by adding features.', 'السعودية أولاً، ثم الخليج والمنطقة. إعادة إدخال أقل، وانتظار أقل، وتخمين أقل: النظام يصوغ ويجدول ويطابق، والناس يقررون. بُني ليتصدر بإزالة الاحتكاك لا بإضافة الميزات.')}</p>
    </div>
    <div class="ai-stage" data-driver="#ai">
      ${mapSvg()}
      <div class="scene" data-scene="map" data-driver="#ai" data-map='${JSON.stringify(MAP)}' aria-hidden="true"></div>
      <div class="ai-overlay" aria-hidden="true">
        <div class="fold">
          <div class="paper p1"></div><div class="paper p2"></div><div class="paper p3"></div>
          <div class="slab"><b dir="ltr">JC-4F2A</b><span>${t('One job card', 'بطاقة عمل واحدة')}</span><i></i></div>
        </div>
        <span class="orb-label l1">${t('Assistant', 'المساعد')}</span>
        <span class="orb-label l2">${t('Scheduling', 'الجدولة')}</span>
        <span class="orb-label l3">${t('Agents', 'الوكلاء')}</span>
      </div>
    </div>
    <p class="scene-cap ai-cap">${t('Illustrative. Regions light as the network grows; no customer locations are shown.', 'رسم توضيحي. تضيء المناطق مع نمو الشبكة؛ لا تُعرض مواقع عملاء.')}</p>
    <div class="roles ai-cards">${aiCards.map(([en, ar, den, dar]) => `<div><b>${t(en, ar)}</b><p>${t(den, dar)}</p></div>`).join('')}</div>
    <p class="fine">${t('Requires configuration: the AI features connect to an AI API at deployment. Until it is connected, the assistant shows “Connect the API”.', 'يتطلب إعداداً: تتصل ميزات الذكاء الاصطناعي بواجهة برمجية عند النشر. وحتى يتم الربط، يعرض المساعد «اربط الواجهة البرمجية».')}</p>
  </div>
</section>`;

/* ---------------------------------------------------------------- home */
const DOMAINS = [
  ['Workshop', 'الورشة', ['Job cards', 'بطاقات العمل'], ['Bay board', 'لوحة الخلجان'], ['Inspection', 'الفحص'], ['Technician assignment', 'إسناد الفنيين']],
  ['Registry', 'السجل', ['Vehicles, VIN decoding', 'المركبات، فك رقم الهيكل'], ['Customers', 'العملاء'], ['Service history', 'سجل الخدمة'], ['Fleet accounts', 'حسابات الأساطيل']],
  ['Finance', 'المالية', ['ZATCA Phase 2 e-invoicing', 'الفوترة الإلكترونية للمرحلة الثانية'], ['VAT 15%', 'ضريبة القيمة المضافة ١٥٪'], ['Payments, Mada', 'المدفوعات، مدى'], ['Receivables', 'الذمم المدينة']],
  ['Accounting', 'المحاسبة', ['Chart of accounts', 'دليل الحسابات'], ['Journals from invoices', 'قيود من الفواتير'], ['Statements', 'القوائم المالية'], ['Bank reconciliation', 'التسوية البنكية']],
  ['CRM and marketing', 'إدارة العملاء والتسويق', ['Service reminders', 'تذكيرات الخدمة'], ['Campaigns: SMS, email, WhatsApp', 'حملات: رسائل، بريد، واتساب'], ['Loyalty', 'الولاء'], ['Leads', 'العملاء المحتملون']],
  ['Administration', 'الإدارة', ['Organisation, branch, user', 'المنشأة، الفرع، المستخدم'], ['14 roles, 28 modules', '١٤ دوراً، ٢٨ وحدة'], ['Branch settings', 'إعدادات الفرع'], ['Audit log', 'سجل التدقيق']],
  ['Authentication', 'المصادقة', ['Password policy', 'سياسة كلمات المرور'], ['SMS OTP', 'رمز التحقق برسالة'], ['Session control', 'التحكم في الجلسات']],
  ['AI platform', 'منصة الذكاء الاصطناعي', ['Assistant', 'المساعد'], ['Knowledge base', 'قاعدة المعرفة'], ['Agents', 'الوكلاء'], ['Smart scheduling', 'الجدولة الذكية']],
  ['Parts and inventory', 'القطع والمخزون', ['Stock, minimums', 'المخزون، الحدود الدنيا'], ['Purchase orders', 'أوامر الشراء'], ['Supplier catalogues', 'كتالوجات الموردين'], ['Reservation, valuation', 'الحجز، التقييم']],
  ['Call centre', 'مركز الاتصال', ['Call logging', 'تسجيل المكالمات'], ['Appointments', 'المواعيد'], ['Follow-ups', 'المتابعات']],
  ['Reports and analytics', 'التقارير والتحليلات', ['Role dashboards', 'لوحات بحسب الدور'], ['Custom reports', 'تقارير مخصصة'], ['KPIs, alerts', 'المؤشرات، التنبيهات'], ['Branch comparison', 'مقارنة الفروع']],
  ['Team and HR', 'الفريق والموارد البشرية', ['Employee records, Iqama', 'سجلات الموظفين، الإقامة'], ['Attendance', 'الحضور'], ['Performance', 'الأداء'], ['Shifts', 'الورديات']],
  ['Portals', 'البوابات', ['Customer app', 'تطبيق العملاء'], ['Technician portal', 'بوابة الفني'], ['Supplier portal', 'بوابة المورّد'], ['Fleet manager', 'مدير الأسطول']],
];
const domainsGrid = (compact = false) => `<div class="domains">${DOMAINS.map(([en, ar, ...mods], i) => `<div><span class="k" dir="ltr">${String(i + 1).padStart(2, '0')} / 13</span><b>${t(en, ar)}</b><ul>${mods.slice(0, compact ? 3 : 4).map(([m, ma]) => `<li>${t(m, ma)}</li>`).join('')}</ul></div>`).join('')}
  <div class="wide"><span class="k">${t('The rule', 'القاعدة')}</span><b>${t('One record of the job', 'سجل واحد للعمل')}</b><p>${t('An inspection line becomes an estimate line, becomes a parts reservation, becomes an invoice line, becomes a journal entry. Nothing is exported, reconciled or retyped between domains, and every change writes its audit row in the same transaction.', 'بند الفحص يصبح بند عرض سعر، ثم حجز قطعة، ثم بند فاتورة، ثم قيداً محاسبياً. لا شيء يُصدَّر أو يُطابَق أو يُعاد إدخاله بين المجالات، وكل تغيير يكتب سطر تدقيقه في المعاملة نفسها.')}</p></div>
</div>`;

const home = `
<section class="hero" aria-labelledby="hero-h">
  <div class="scene" data-scene="hero" aria-hidden="true"></div>
  <div class="scrim" aria-hidden="true"></div>
  <svg class="trace anim" viewBox="0 0 400 200" style="width:980px;inset-inline-end:-300px;top:-160px"><use href="#trace"/></svg>
  <svg class="trace anim late" viewBox="0 0 400 200" style="width:700px;inset-inline-start:-260px;bottom:-240px;transform:rotate(180deg)"><use href="#trace"/></svg>
  <div class="wrap hero-grid">
    <div>
      <div class="eyebrow">${t('Built for Saudi workshops', 'مبني للورش السعودية')}</div>
      <h1 id="hero-h">${t('Workshop Management.<br><span class="o">Saudi Standard.</span>', 'إدارة ورش السيارات.<br><span class="o">معيار سعودي.</span>')}</h1>
      <p class="lede">${t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in. Every change is on the audit trail.', 'منصة واحدة تدير الورشة من الاستقبال إلى الفاتورة، بالعربية والإنجليزية، مع فوترة إلكترونية متوافقة مع الهيئة مبنية في الأساس. كل تغيير مسجَّل في سجل التدقيق.')}</p>
      <div class="ctas">
        <a class="btn on-dark" href="${DEMO}">${t('Book a 20-minute demo', 'احجز عرضاً لعشرين دقيقة')}${ARR}</a>
        <a class="btn ghost-dark" href="${B}pricing.html">${t('See pricing', 'اطّلع على الأسعار')}</a>
      </div>
      <div class="statusline">${t('<b>Single bay to multi-branch.</b> Thirteen domains, fourteen roles, SAR to the halala, one audit trail.', '<b>من خليج واحد إلى فروع متعددة.</b> ثلاثة عشر مجالاً، أربعة عشر دوراً، الريال حتى الهللة، وسجل تدقيق واحد.')}</div>
    </div>
    <div class="hero-mock tilt-deep">${mockBay}</div>
  </div>
</section>

<section class="wrap" aria-labelledby="life-h" id="life">
  <div class="sec-head">
    <div class="eyebrow">${t('The lifecycle', 'دورة الورشة')}</div>
    <h2 id="life-h">${t('Six stages. One job card. Each stage gates the next.', 'ست مراحل. بطاقة عمل واحدة. كل مرحلة تشترط سابقتها.')}</h2>
    <p>${t('The vehicle moves from check-in to delivery on one record. The invoice at the end is the sum of what happened, not a list retyped from memory.', 'تنتقل المركبة من الاستقبال إلى التسليم على سجل واحد. والفاتورة في النهاية هي مجموع ما حدث، لا قائمة أُعيد إدخالها من الذاكرة.')}</p>
  </div>
  <div class="rail-wrap"><div class="scene rail-scene" data-scene="rail" data-driver="#life" aria-hidden="true"></div>${rail6}</div>
  <p class="scene-cap">${t('The job card is the only thing that moves. Scroll, and it travels the six stages.', 'بطاقة العمل هي الشيء الوحيد الذي يتحرك. مرّر، وستقطع المراحل الست.')}</p>
  <p style="margin-top:28px"><a class="more" href="${B}lifecycle.html">${t('Walk the six stages', 'تابع المراحل الست')} <span dir="ltr" aria-hidden="true">→</span></a></p>
</section>

${proofBand()}

<section class="wrap" aria-labelledby="dom-h">
  <div class="sec-head">
    <div class="eyebrow">${t('Thirteen domains', 'ثلاثة عشر مجالاً')}</div>
    <h2 id="dom-h">${t('Workshop, parts, finance, CRM, HR and AI on one backbone.', 'الورشة والقطع والمالية وإدارة العملاء والموارد البشرية والذكاء الاصطناعي على أساس واحد.')}</h2>
    <p>${t('No seams to reconcile. Every domain writes to the same ledger and the same audit trail.', 'لا فواصل تحتاج إلى مطابقة. كل مجال يكتب في الدفتر نفسه وسجل التدقيق نفسه.')}</p>
  </div>
  ${domainsGrid(true)}
  <p style="margin-top:24px"><a class="more" href="features.html">${t('Every module under every domain', 'كل الوحدات تحت كل مجال')} <span dir="ltr" aria-hidden="true">→</span></a></p>
</section>

${aiSection}

<section class="wrap" aria-labelledby="who-h">
  <div class="sec-head"><div class="eyebrow">${t('Who it is for', 'لمن هذا المنتج')}</div><h2 id="who-h">${t('Judged on whether it survives the floor at 09:40 with a queue behind the counter.', 'يُحكم عليه بما إذا كان يصمد على أرض الورشة في ٩:٤٠ وخلف الكاونتر طابور.')}</h2></div>
  <div class="roles">
    <div><b>${t('Workshop owner', 'صاحب الورشة')}</b><p>${t('Revenue, VAT and stock reconcile without a bookkeeper redoing the month.', 'الإيراد والضريبة والمخزون تتطابق دون أن يعيد المحاسب الشهر من جديد.')}</p></div>
    <div><b>${t('Service advisor', 'مستشار الخدمة')}</b><p>${t('Speed at the counter, and an estimate the customer signs from their phone in the language they read.', 'سرعة عند الكاونتر، وعرض سعر يوقّعه العميل من هاتفه باللغة التي يقرؤها.')}</p></div>
    <div><b>${t('Technician', 'الفني')}</b><p>${t('Short, unambiguous instructions on a phone, in Arabic, with one hand.', 'تعليمات قصيرة لا لبس فيها على الهاتف، بالعربية، بيد واحدة.')}</p></div>
    <div><b>${t('Accountant', 'المحاسب')}</b><p>${t('ZATCA correctness, and an audit trail that answers who changed this, and when.', 'صحة الامتثال للهيئة، وسجل تدقيق يجيب عن سؤال من غيّر هذا ومتى.')}</p></div>
  </div>
</section>

<section class="wrap" aria-labelledby="q-h">
  <div class="sec-head"><div class="eyebrow">${t('What workshops report', 'ما تقوله الورش')}</div><h2 id="q-h">${t('Quoted by role and region until consent to name is on file.', 'مقتبس بالدور والمنطقة حتى يُحفظ الإذن بذكر الاسم.')}</h2></div>
  <div class="quotes">
    <blockquote><p>${t('Our accountant stopped re-keying invoices. The VAT return reconciled the first month.', 'توقف محاسبنا عن إعادة إدخال الفواتير. وتطابق إقرار ضريبة القيمة المضافة من الشهر الأول.')}</p><footer><b>${t('Workshop owner', 'صاحب ورشة')}</b>${t('Three branches, Eastern Province', 'ثلاثة فروع، المنطقة الشرقية')}</footer></blockquote>
    <blockquote><p>${t('Estimates that took two days on paper are signed from the customer’s phone the same afternoon.', 'عروض الأسعار التي كانت تستغرق يومين على الورق تُوقَّع من هاتف العميل في العصر نفسه.')}</p><footer><b>${t('Operations manager', 'مدير العمليات')}</b>${t('Single-bay workshop, Jeddah', 'ورشة بخليج واحد، جدة')}</footer></blockquote>
    <blockquote><p>${t('Customers watch the job move from the bay to delivery. The phone rings less, and when it does, it is not about status.', 'يتابع العملاء انتقال العمل من الخليج إلى التسليم. يرن الهاتف أقل، وحين يرن لا يكون السؤال عن الحالة.')}</p><footer><b>${t('Service advisor', 'مستشار خدمة')}</b>${t('Fleet accounts, Riyadh', 'حسابات أساطيل، الرياض')}</footer></blockquote>
  </div>
</section>

<section class="wrap" aria-labelledby="faq-h">
  <div class="sec-head"><div class="eyebrow">${t('Questions', 'أسئلة')}</div><h2 id="faq-h">${t('Asked before every demo.', 'تُسأل قبل كل عرض.')}</h2></div>
  <div class="faq">
    <details open><summary>${t('How long does it take to get started?', 'كم يستغرق البدء؟')}</summary><p>${t('Most workshops run their first job card within a day. Onboarding imports your customers, vehicles and parts, and sets up your roles.', 'تُصدر معظم الورش أول بطاقة عمل خلال يوم. يستورد الإعداد عملاءك ومركباتك وقطعك، ويهيّئ الأدوار.')}</p></details>
    <details><summary>${t('Do I need to install anything?', 'هل أحتاج إلى تثبيت أي شيء؟')}</summary><p>${t('No. SALIS AUTO runs in the browser on desktop and phone. There is nothing to install and nothing to update.', 'لا. يعمل SALIS AUTO في المتصفح على الحاسوب والهاتف. لا شيء يُثبَّت ولا شيء يُحدَّث.')}</p></details>
    <details><summary>${t('Is my data isolated from other workshops?', 'هل بياناتي معزولة عن الورش الأخرى؟')}</summary><p>${t('Yes. Each workshop is isolated at the database level, access is by role, and every change records who made it and when.', 'نعم. كل ورشة معزولة على مستوى قاعدة البيانات، والوصول بحسب الدور، وكل تغيير يسجّل من قام به ومتى.')}</p></details>
    <details><summary>${t('Is the e-invoicing really ZATCA Phase 2?', 'هل الفوترة الإلكترونية فعلاً من المرحلة الثانية؟')}</summary><p>${t('Yes. Every issued invoice carries the TLV QR, the hash chain to its predecessor, the UBL 2.1 XML and the seller and buyer VAT numbers, and is immutable after issue. Reporting to the Fatoora platform is configured for each workshop at deployment.', 'نعم. كل فاتورة صادرة تحمل رمز الاستجابة بترميز TLV، وسلسلة التجزئة إلى سابقتها، وملف XML بمعيار UBL 2.1، والرقمين الضريبيين للبائع والمشتري، وتكون غير قابلة للتعديل بعد الإصدار. ويُهيَّأ الإبلاغ لمنصة فاتورة لكل ورشة عند التشغيل.')}</p></details>
    <details><summary>${t('Can I try it before I commit?', 'هل يمكنني تجربته قبل الالتزام؟')}</summary><p>${t('Book a 20-minute demo on your own workshop’s numbers. Plans start at one branch and ten users on Starter, monthly or annual.', 'احجز عرضاً لعشرين دقيقة على أرقام ورشتك. تبدأ الخطط بفرع واحد وعشرة مستخدمين في خطة البداية، شهرياً أو سنوياً.')}</p></details>
  </div>
</section>

${ctaEnd('See it on your own workshop’s numbers.', 'شاهده على أرقام ورشتك.', 'A 20-minute demo, in Arabic or English, on a job card from your floor.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}`;

/* ---------------------------------------------------------------- product pages */
function pageHero(o) {
  return `
<section class="phero" aria-labelledby="ph">
  <svg class="trace anim" viewBox="0 0 400 200" style="width:900px;inset-inline-end:-320px;top:-200px"><use href="#trace"/></svg>
  <div class="wrap${o.mock ? ' hero-grid' : ''}">
    <div>
      <div class="crumbs"><a href="${B}index.html">SALIS AUTO</a> <span aria-hidden="true">/</span> ${t(o.crumb[0], o.crumb[1])}</div>
      <div class="eyebrow">${t(o.eyebrow[0], o.eyebrow[1])}</div>
      <h1 id="ph">${t(o.h1[0], o.h1[1])}</h1>
      <p class="lede">${t(o.lede[0], o.lede[1])}</p>
      <div class="ctas"><a class="btn on-dark" href="${DEMO}">${t('Book a 20-minute demo', 'احجز عرضاً لعشرين دقيقة')}${ARR}</a>${o.cta2 || ''}</div>
      ${o.status ? `<div class="statusline">${t(o.status[0], o.status[1])}</div>` : ''}
    </div>
    ${o.mock ? `<div class="hero-mock tilt-deep">${o.scene ? `<div class="scene" data-scene="${o.scene}" aria-hidden="true"></div>` : ''}${o.mock}</div>` : ''}
  </div>
</section>`;
}
const facts = (items) => `<ul class="facts">${items.map(([en, ar]) => `<li>${t(en, ar)}</li>`).join('')}</ul>`;
const roles = (items) => `<div class="roles">${items.map(([r, ra, d, da]) => `<div><b>${t(r, ra)}</b><p>${t(d, da)}</p></div>`).join('')}</div>`;
const whoSection = (items, h = ['Judged on whether it survives the floor.', 'يُحكم عليه بما إذا كان يصمد على أرض الورشة.']) => `
<section class="wrap" aria-labelledby="who-h">
  <div class="sec-head"><div class="eyebrow">${t('Who it is for', 'لمن هذا')}</div><h2 id="who-h">${t(h[0], h[1])}</h2></div>
  ${roles(items)}
</section>`;

const lifecycle = pageHero({
  crumb: ['The lifecycle', 'دورة الورشة'], eyebrow: ['The lifecycle', 'دورة الورشة'],
  h1: ['Check-in to delivery on <span class="o">one job card.</span>', 'من الاستقبال إلى التسليم على <span class="o">بطاقة عمل واحدة.</span>'],
  lede: ['Six stages, each gated by the one before. A technician cannot start a repair the customer has not approved, and QC is signed by someone other than the technician who did the work.', 'ست مراحل، كل واحدة مشروطة بسابقتها. لا يستطيع الفني بدء إصلاح لم يعتمده العميل، ويوقّع مراقبة الجودة شخص غير الفني الذي أنجز العمل.'],
  mock: mockBay,
}) + `
<section class="wrap" aria-label="The six stages">
  <div class="rail-wrap"><div class="scene rail-scene" data-scene="rail" data-driver="#stages" aria-hidden="true"></div>${rail6}</div>
  <p class="scene-cap">${t('Scroll through the stages below and the job card moves with you.', 'مرّر عبر المراحل أدناه وتتحرك بطاقة العمل معك.')}</p>
</section>
<section class="wrap" aria-label="Stage by stage" style="padding-top:0" id="stages">
  <article class="stage" id="checkin"><div class="stage-text"><div class="stage-n" dir="ltr">01</div><h3>${t('Check-in', 'الاستقبال')}</h3><p>${t('The plate is typed once. The customer is found by phone number or created on the spot. Six photos and a walk-around mark existing damage before the key changes hands.', 'تُكتب اللوحة مرة واحدة. يُعثر على العميل برقم هاتفه أو يُنشأ فوراً. ست صور وجولة حول المركبة تحدد الأضرار القائمة قبل أن ينتقل المفتاح.')}</p><div class="gate">${t('Gate: plate, customer and photos before a bay is assigned.', 'الشرط: اللوحة والعميل والصور قبل إسناد خليج.')}</div></div>${mockCheckin}</article>
  <article class="stage flip" id="inspection"><div class="stage-text"><div class="stage-n" dir="ltr">02</div><h3>${t('Inspection', 'الفحص')}</h3><p>${t('A multi-point checklist with severity on each item. Flagged items become estimate lines automatically, with the photo attached, so nothing is retyped and nothing is forgotten.', 'قائمة فحص متعددة النقاط بدرجة خطورة لكل بند. تصبح البنود المحددة بنود عرض سعر تلقائياً مع الصورة المرفقة، فلا شيء يُعاد إدخاله ولا شيء يُنسى.')}</p><div class="gate">${t('Gate: every checklist item answered.', 'الشرط: الإجابة عن كل بنود القائمة.')}</div></div>${mockInspection}</article>
  <article class="stage" id="estimate"><div class="stage-text"><div class="stage-n" dir="ltr">03</div><h3>${t('Estimate', 'عرض السعر')}</h3><p>${t('Itemised parts and labour with VAT, sent to the customer’s phone. They sign with an SMS-verified signature. The approval is on the job card with its timestamp, and the job moves to Repair on its own.', 'قطع وأجرة مفصّلة بالضريبة، تُرسل إلى هاتف العميل. يوقّع بتوقيع موثّق برسالة نصية. يُسجَّل الاعتماد على بطاقة العمل بوقته، وتنتقل المهمة إلى الإصلاح تلقائياً.')}</p><div class="gate">${t('Gate: customer signature, or the advisor records an approval by phone with the caller’s number.', 'الشرط: توقيع العميل، أو يسجّل المستشار اعتماداً هاتفياً برقم المتصل.')}</div></div>${mockEstimate}</article>
  <article class="stage flip" id="repair"><div class="stage-text"><div class="stage-n" dir="ltr">04</div><h3>${t('Repair', 'الإصلاح')}</h3><p>${t('The bay board shows every bay, its job card, its amount and its status. Parts are consumed from stock against the job card; a part under minimum drafts a purchase request. The technician works from a phone.', 'تعرض لوحة الخلجان كل خليج وبطاقة عمله ومبلغه وحالته. تُصرف القطع من المخزون على بطاقة العمل؛ والقطعة دون الحد الأدنى تصوغ طلب شراء. يعمل الفني من هاتفه.')}</p><div class="gate">${t('Gate: approved estimate lines only. Extra work goes back to the customer as a supplement.', 'الشرط: بنود عرض السعر المعتمدة فقط. أي عمل إضافي يعود إلى العميل كملحق.')}</div></div>${mockBay}</article>
  <article class="stage" id="qc"><div class="stage-text"><div class="stage-n" dir="ltr">05</div><h3>${t('Quality control', 'مراقبة الجودة')}</h3><p>${t('A post-repair checklist signed by a second technician. Brake test, torque, road test, interior. A failed check sends the job back to Repair with the reason on the card.', 'قائمة فحص بعد الإصلاح يوقّعها فني ثانٍ. اختبار الفرامل، العزم، اختبار الطريق، المقصورة. الفحص الفاشل يعيد المهمة إلى الإصلاح مع السبب على البطاقة.')}</p><div class="gate">${t('Gate: the QC signer is not the repair technician. The rule is enforced, not requested.', 'الشرط: موقّع مراقبة الجودة ليس فني الإصلاح. القاعدة مفروضة، لا مطلوبة.')}</div></div>${mockQC}</article>
  <article class="stage flip" id="delivery"><div class="stage-text"><div class="stage-n" dir="ltr">06</div><h3>${t('Delivery', 'التسليم')}</h3><p>${t('The invoice is the sum of the approved lines. It is issued with the ZATCA QR and hash chain, the customer signs on the phone or the counter, and the vehicle is released. The invoice cannot be edited afterwards; corrections are credit or debit notes.', 'الفاتورة هي مجموع البنود المعتمدة. تصدر برمز الهيئة وسلسلة التجزئة، يوقّع العميل على الهاتف أو عند الكاونتر، وتُسلَّم المركبة. لا تُعدَّل الفاتورة بعد ذلك؛ التصحيحات إشعارات دائنة أو مدينة.')}</p><div class="gate">${t('Gate: QC signed and payment recorded or terms agreed.', 'الشرط: توقيع مراقبة الجودة وتسجيل الدفع أو الاتفاق على الأجل.')}</div></div>${mockInvoice}</article>
</section>
${ctaEnd('See the six stages on your own jobs.', 'شاهد المراحل الست على أعمالك أنت.', 'A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.')}`;

const features = pageHero({
  crumb: ['Thirteen domains', 'ثلاثة عشر مجالاً'], eyebrow: ['Thirteen domains', 'ثلاثة عشر مجالاً'],
  h1: ['Every module, <span class="o">one record</span> of the job.', 'كل الوحدات، <span class="o">سجل واحد</span> للعمل.'],
  lede: ['Thirteen domains, fourteen roles, twenty-eight permission modules. The value is not the count. It is that none of them has a seam to reconcile with the others.', 'ثلاثة عشر مجالاً، أربعة عشر دوراً، ثمانٍ وعشرون وحدة صلاحيات. القيمة ليست في العدد، بل في أن أياً منها لا يحتاج إلى مطابقة مع غيره.'],
}) + `
<section class="wrap" aria-label="Domains">
  ${domainsGrid(false)}
</section>
<section class="wrap two" aria-labelledby="diff-h">
  <div class="sec-head"><div class="eyebrow">${t('What is different', 'ما المختلف')}</div><h2 id="diff-h">${t('Built for this market, not translated into it.', 'مبني لهذا السوق، لا مترجم إليه.')}</h2></div>
  ${facts([
    ['Arabic is a first-class rendering, right-to-left, with English beside it. Plates, ids and amounts stay Latin and are isolated so the bidi algorithm never reorders a number.', 'العربية واجهة أصلية من اليمين إلى اليسار، والإنجليزية بجانبها. تبقى اللوحات والأرقام لاتينية ومعزولة فلا تعيد خوارزمية الاتجاه ترتيب رقم.'],
    ['Money is stored as integer halalas. Totals reconcile because rounding happens once.', 'تُخزَّن المبالغ بالهللة كأعداد صحيحة. تتطابق المجاميع لأن التقريب يحدث مرة واحدة.'],
    ['Each workshop is isolated at the database level. Access is by role, per module, per action.', 'كل ورشة معزولة على مستوى قاعدة البيانات. الوصول بحسب الدور، لكل وحدة، ولكل إجراء.'],
    ['Every mutation writes its audit row, with actor, before, after and request id, in the same transaction as the change.', 'كل تعديل يكتب سطر تدقيقه، بالفاعل والقيمة قبل وبعد ورقم الطلب، في المعاملة نفسها مع التغيير.'],
    ['The AI platform answers from the workshop’s own data: today’s revenue, the technician with the most open jobs, the parts due for reorder.', 'تجيب منصة الذكاء الاصطناعي من بيانات الورشة نفسها: إيراد اليوم، الفني الأكثر أعمالاً مفتوحة، القطع المستحقة لإعادة الطلب.'],
  ])}
</section>
<section class="wrap" aria-label="The AI era" style="padding-top:0"><p><a class="more" href="index.html#ai">${t('How the AI platform changes the day', 'كيف تغيّر منصة الذكاء الاصطناعي اليوم')} <span dir="ltr" aria-hidden="true">→</span></a></p></section>
${ctaEnd('See the thirteen domains on one job card.', 'شاهد المجالات الثلاثة عشر على بطاقة عمل واحدة.', 'A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.')}`;

const zatca = pageHero({
  crumb: ['ZATCA Phase 2', 'الفوترة الإلكترونية'], eyebrow: ['هيئة الزكاة والضريبة والجمارك · ZATCA Phase 2', 'هيئة الزكاة والضريبة والجمارك · المرحلة الثانية'],
  h1: ['E-invoicing generated by the <span class="o">same transaction</span> that posts the sale.', 'فوترة إلكترونية تولدها <span class="o">المعاملة نفسها</span> التي ترحّل البيع.'],
  lede: ['Compliance is not a module you switch on. Every issued invoice carries what Phase 2 requires, and it cannot be edited afterwards.', 'الامتثال ليس وحدة تُفعَّل. كل فاتورة صادرة تحمل ما تتطلبه المرحلة الثانية، ولا يمكن تعديلها بعد ذلك.'],
  mock: mockInvoice, scene: 'invoice',
  status: ['<b>Plain statement of scope.</b> Data model, QR, hash chain, XML, immutability and retention are in the product. Reporting to the Fatoora platform is configured for each workshop at deployment.', '<b>بيان صريح للنطاق.</b> نموذج البيانات ورمز الاستجابة وسلسلة التجزئة وملف XML وعدم القابلية للتعديل والحفظ كلها في المنتج. ويُهيَّأ الإبلاغ لمنصة فاتورة لكل ورشة عند التشغيل.'],
}) + `
<section class="wrap two" aria-labelledby="z-h">
  <div class="sec-head"><div class="eyebrow">${t('What every invoice carries', 'ما تحمله كل فاتورة')}</div><h2 id="z-h">${t('In plain language.', 'بلغة واضحة.')}</h2></div>
  ${facts([
    ['A QR code in TLV encoding: seller name, VAT number, timestamp, total with VAT, and the VAT amount. The customer can scan it at the counter.', 'رمز استجابة بترميز TLV: اسم البائع، الرقم الضريبي، الوقت، الإجمالي بالضريبة، ومبلغ الضريبة. يستطيع العميل مسحه عند الكاونتر.'],
    ['A hash that links the invoice to the one before it. Delete or alter one, and the chain breaks visibly. That is the point.', 'تجزئة تربط الفاتورة بالتي قبلها. احذف واحدة أو عدّلها فتنكسر السلسلة على نحو ظاهر. وهذا هو المقصود.'],
    ['XML in the UBL 2.1 form the authority expects, with seller and buyer VAT numbers, and 15% VAT computed on the server, not in the browser.', 'ملف XML بصيغة UBL 2.1 التي تتوقعها الهيئة، بالرقمين الضريبيين للبائع والمشتري، وضريبة ١٥٪ تُحسب على الخادم لا في المتصفح.'],
    ['Immutable after issue. A correction cancels the invoice and issues a new one that references it; the original stays in the chain.', 'غير قابلة للتعديل بعد الإصدار. التصحيح يلغي الفاتورة ويصدر فاتورة جديدة تشير إليها؛ ويبقى الأصل في السلسلة.'],
    ['Seven-year retention in an archive that can prove its own integrity, and an export of up to 50,000 invoices with every ZATCA field for the accountant’s tools.', 'حفظ لسبع سنوات في أرشيف يثبت سلامته بنفسه، وتصدير حتى ٥٠٬٠٠٠ فاتورة بكل حقول الهيئة لأدوات المحاسب.'],
    ['Simplified tax invoices on Starter; standard and simplified invoices on Professional and Enterprise. Credit and debit notes are planned.', 'فواتير ضريبية مبسطة في خطة البداية؛ وفواتير قياسية ومبسطة في الاحترافية والمؤسسات. الإشعارات الدائنة والمدينة مخططة.'],
  ])}
</section>
${whoSection([
  ['Accountant', 'المحاسب', 'The VAT return reconciles from the invoice table, not from a spreadsheet beside it.', 'يتطابق إقرار الضريبة من جدول الفواتير، لا من جدول بجانبه.'],
  ['Owner', 'المالك', 'No invoice can quietly change after the customer left.', 'لا فاتورة تتغير بهدوء بعد مغادرة العميل.'],
  ['Service advisor', 'مستشار الخدمة', 'The invoice issues in the same motion as delivery. Two minutes, not fifteen.', 'تصدر الفاتورة في الحركة نفسها مع التسليم. دقيقتان، لا خمس عشرة.'],
  ['Auditor', 'المدقق', 'Actor, before, after and request id on every change to every fiscal document.', 'الفاعل والقيمة قبل وبعد ورقم الطلب على كل تغيير في كل مستند مالي.'],
], ['Who relies on it.', 'من يعتمد عليه.'])}
${ctaEnd('See an invoice issue with its QR and hash.', 'شاهد فاتورة تصدر برمزها وتجزئتها.', 'A 20-minute demo, in Arabic or English, on your own VAT number.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية، على رقمك الضريبي.')}`;

const parts = pageHero({
  crumb: ['Spare Parts', 'قطع الغيار'], eyebrow: ['SALIS Spare Parts · inside SALIS AUTO today', 'SALIS Spare Parts · داخل SALIS AUTO اليوم'],
  h1: ['Stock under minimum <span class="o">drafts the order.</span>', 'المخزون دون الحد <span class="o">يصوغ الطلب.</span>'],
  lede: ['Supplier catalogues with part-number cross-references, price comparison before the order is placed, purchase orders, receiving, and the supplier’s own portal to confirm and invoice.', 'كتالوجات الموردين بمراجع أرقام القطع، ومقارنة الأسعار قبل إرسال الطلب، وأوامر الشراء، والاستلام، وبوابة المورّد للتأكيد والفوترة.'],
  mock: mockParts,
  status: ['<b>Status.</b> Ships today inside SALIS AUTO for the workshop’s own purchasing. Access for buyers outside the workshop is planned and is described as planned.', '<b>الحالة.</b> يعمل اليوم داخل SALIS AUTO لمشتريات الورشة نفسها. والوصول لمشترين من خارج الورشة مخطط ويوصف بأنه مخطط.'],
}) + `
<section class="wrap two" aria-labelledby="p-h">
  <div class="sec-head"><div class="eyebrow">${t('What it does', 'ما الذي يقوم به')}</div><h2 id="p-h">${t('One order, not three copies of it.', 'طلب واحد، لا ثلاث نسخ منه.')}</h2></div>
  ${facts([
    ['Minimum and maximum levels per part per location. Below minimum, a purchase request is drafted against the preferred supplier and waits for approval.', 'حد أدنى وأقصى لكل قطعة في كل موقع. دون الحد الأدنى، يُصاغ طلب شراء للمورّد المفضل وينتظر الاعتماد.'],
    ['Parts are reserved against job cards when the estimate is approved, so the bay does not open on a part that is not there.', 'تُحجز القطع على بطاقات العمل عند اعتماد عرض السعر، فلا يُفتح الخليج على قطعة غير موجودة.'],
    ['Price comparison across suppliers with lead time, then a purchase order the supplier acknowledges in their portal.', 'مقارنة أسعار عبر الموردين مع مدة التوريد، ثم أمر شراء يؤكده المورّد في بوابته.'],
    ['Barcode and QR scanning in and out of stock from a phone. Movement history per part.', 'مسح الباركود ورمز الاستجابة داخل المخزون وخارجه من الهاتف. وسجل حركات لكل قطعة.'],
    ['FIFO or weighted-average valuation, and cost of goods on every invoice line.', 'تقييم بطريقة الوارد أولاً أو المتوسط المرجّح، وتكلفة البضاعة على كل بند فاتورة.'],
  ])}
</section>
${whoSection([
  ['Parts manager', 'مدير قطع الغيار', 'Stock under minimum drafts the request. The approval is the only manual step.', 'المخزون دون الحد يصوغ الطلب. الاعتماد هو الخطوة اليدوية الوحيدة.'],
  ['Purchaser', 'مسؤول المشتريات', 'Price comparison before the order, not after the invoice.', 'مقارنة الأسعار قبل الطلب، لا بعد الفاتورة.'],
  ['Supplier', 'المورّد', 'A portal to publish the catalogue, confirm orders and submit invoices without phone calls.', 'بوابة لنشر الكتالوج وتأكيد الطلبات وتقديم الفواتير دون مكالمات هاتفية.'],
  ['Technician', 'الفني', 'Request a part from the job card and see when it lands.', 'اطلب قطعة من بطاقة العمل وشاهد متى تصل.'],
])}
${ctaEnd('See reorder run on your own stock list.', 'شاهد إعادة الطلب تعمل على قائمة مخزونك.', 'A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.')}`;

const fleet = pageHero({
  crumb: ['Fleet', 'الأساطيل'], eyebrow: ['SALIS Fleet · inside SALIS AUTO today', 'SALIS Fleet · داخل SALIS AUTO اليوم'],
  h1: ['Every contract vehicle, <span class="o">every branch,</span> one board.', 'كل مركبة عقد، <span class="o">كل فرع،</span> لوحة واحدة.'],
  lede: ['Fleet accounts group the vehicles under a contract, track SLA, and report utilisation and cost per vehicle from the same job cards the workshop already writes.', 'تجمع حسابات الأساطيل المركبات تحت العقد، وتتابع اتفاقيات مستوى الخدمة، وتقدّم نسبة الاستخدام والتكلفة لكل مركبة من بطاقات العمل نفسها التي تكتبها الورشة.'],
  mock: mockFleet,
  status: ['<b>Status.</b> Ships today inside SALIS AUTO. A fleet-manager product of its own is planned.', '<b>الحالة.</b> يعمل اليوم داخل SALIS AUTO. ومنتج مستقل لمديري الأساطيل مخطط.'],
}) + `
<section class="wrap two" aria-labelledby="f-h">
  <div class="sec-head"><div class="eyebrow">${t('What it does', 'ما الذي يقوم به')}</div><h2 id="f-h">${t('From the job cards the workshop already writes.', 'من بطاقات العمل التي تكتبها الورشة أصلاً.')}</h2></div>
  ${facts([
    ['Contract terms per fleet account: covered services, SLA, billing cycle, and the branches that may serve it.', 'شروط العقد لكل حساب أسطول: الخدمات المشمولة، اتفاقية مستوى الخدمة، دورة الفوترة، والفروع التي يجوز لها الخدمة.'],
    ['Preventive maintenance by mileage and time, with the next due date on every vehicle.', 'صيانة وقائية بالمسافة والوقت، مع موعد الاستحقاق التالي على كل مركبة.'],
    ['Utilisation and cost per vehicle and per kilometre, across branches, without a spreadsheet export.', 'نسبة الاستخدام والتكلفة لكل مركبة ولكل كيلومتر، عبر الفروع، دون تصدير إلى جدول.'],
    ['Contract invoices with the same ZATCA e-invoice and audit trail as every other sale.', 'فواتير العقود بالفاتورة الإلكترونية نفسها وسجل التدقيق نفسه ككل عملية بيع أخرى.'],
    ['A fleet-manager portal with vehicle status, maintenance schedule and SLA compliance.', 'بوابة لمدير الأسطول بحالة المركبات وجدول الصيانة والالتزام باتفاقية مستوى الخدمة.'],
  ])}
</section>
${whoSection([
  ['Fleet manager', 'مدير الأسطول', 'Utilisation and cost per vehicle across branches on one board.', 'نسبة الاستخدام والتكلفة لكل مركبة عبر الفروع على لوحة واحدة.'],
  ['Branch manager', 'مدير الفرع', 'Which contract vehicles are due, in the bay, or overdue.', 'أي مركبات العقود مستحقة، أو في الخليج، أو متأخرة.'],
  ['Finance', 'المالية', 'Contract billing on the same ledger as counter sales.', 'فوترة العقود على الدفتر نفسه مع مبيعات الكاونتر.'],
  ['Owner', 'المالك', 'A fleet contract is a customer with rules, not a spreadsheet beside the system.', 'عقد الأسطول عميل له قواعد، لا جدول بجانب النظام.'],
])}
${ctaEnd('See your contract vehicles on one board.', 'شاهد مركبات عقودك على لوحة واحدة.', 'A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.')}`;

const customer = pageHero({
  crumb: ['Customer app', 'تطبيق العملاء'], eyebrow: ['Customer app', 'تطبيق العملاء'],
  h1: ['The customer approves <span class="o">from their phone.</span>', 'يعتمد العميل <span class="o">من هاتفه.</span>'],
  lede: ['A mobile portal for the customer: the job’s stage, the estimate with its lines, an SMS-verified signature, service history and every invoice. The phone rings less, and when it does, it is not about status.', 'بوابة للعميل على الهاتف: مرحلة العمل، وعرض السعر ببنوده، وتوقيع موثّق برسالة نصية، وسجل الخدمة وكل فاتورة. يرن الهاتف أقل، وحين يرن لا يكون السؤال عن الحالة.'],
  mock: mockPhone,
}) + `
<section class="wrap two" aria-labelledby="c-h">
  <div class="sec-head"><div class="eyebrow">${t('What the customer sees', 'ما يراه العميل')}</div><h2 id="c-h">${t('The same job card, from the other side.', 'بطاقة العمل نفسها، من الجهة الأخرى.')}</h2></div>
  ${facts([
    ['Live stage of the job, from check-in to delivery, with the time the vehicle is expected to be ready.', 'مرحلة العمل لحظياً، من الاستقبال إلى التسليم، مع الوقت المتوقع لجاهزية المركبة.'],
    ['The estimate, line by line with VAT, approved with an SMS one-time code and a drawn signature. The approval lands on the job card with its timestamp. Requires configuration: the SMS code needs an SMS provider connected at deployment.', 'عرض السعر بنداً بنداً بالضريبة، يُعتمد برمز تحقق برسالة نصية وتوقيع مرسوم. يُسجَّل الاعتماد على بطاقة العمل بوقته. يتطلب إعداداً: رمز التحقق يحتاج إلى مزوّد رسائل نصية مربوط عند النشر.'],
    ['Service history per vehicle and reminders for the next service, by mileage and by date.', 'سجل الخدمة لكل مركبة وتذكيرات بالخدمة التالية، بالمسافة وبالتاريخ.'],
    ['Every invoice with its QR, downloadable, and the payment status.', 'كل فاتورة برمزها، قابلة للتنزيل، مع حالة الدفع.'],
    ['Direct messages to the service advisor, on the job, not in a separate chat app.', 'رسائل مباشرة إلى مستشار الخدمة، على العمل نفسه، لا في تطبيق دردشة منفصل.'],
  ])}
</section>
${ctaEnd('See an estimate approved from a phone.', 'شاهد عرض سعر يُعتمد من هاتف.', 'A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.')}`;

const portals = pageHero({
  crumb: ['Portals', 'البوابات'], eyebrow: ['Technician and supplier portals', 'بوابتا الفني والمورّد'],
  h1: ['Two more sides of <span class="o">the same record.</span>', 'جهتان أخريان <span class="o">للسجل نفسه.</span>'],
  lede: ['The technician works from a phone with one hand. The supplier confirms orders and submits invoices without a phone call. Both write to the job cards and orders the workshop already has.', 'يعمل الفني من هاتفه بيد واحدة. ويؤكد المورّد الطلبات ويقدّم الفواتير دون مكالمة. كلاهما يكتب في بطاقات العمل والطلبات التي تملكها الورشة أصلاً.'],
  mock: mockTech,
}) + `
<section class="wrap two-col" aria-label="The two portals">
  <div><div class="sec-head"><div class="eyebrow">${t('Technician portal', 'بوابة الفني')}</div><h2>${t('Phone-first, in Arabic, with one hand.', 'مبنية للهاتف أولاً، بالعربية، بيد واحدة.')}</h2></div>${facts([
    ['My jobs, in order, with the current task and the next. Large targets, short labels.', 'أعمالي بالترتيب، مع المهمة الحالية والتالية. أهداف كبيرة وعناوين قصيرة.'],
    ['Clock in and out, time per job card, estimated against actual.', 'تسجيل الحضور والانصراف، والوقت لكل بطاقة عمل، المقدّر مقابل الفعلي.'],
    ['Request a part or add a photo from the job screen. The advisor sees it on the card.', 'اطلب قطعة أو أضف صورة من شاشة العمل. يراها المستشار على البطاقة.'],
    ['Inspection checklists with severity, so flagged items become estimate lines.', 'قوائم فحص بدرجات الخطورة، فتصبح البنود المحددة بنود عرض سعر.'],
  ])}</div>
  <div><div class="sec-head"><div class="eyebrow">${t('Supplier portal', 'بوابة المورّد')}</div><h2>${t('Confirm, dispatch, invoice, get paid.', 'أكّد، اشحن، فوتر، واستلم.')}</h2></div>${mockSupplier}${facts([
    ['Publish and update the catalogue with part numbers and lead times.', 'انشر الكتالوج وحدّثه بأرقام القطع ومدد التوريد.'],
    ['Acknowledge purchase orders by a deadline, mark dispatch, and submit the invoice against the order.', 'أكّد أوامر الشراء قبل الموعد، وسجّل الشحن، وقدّم الفاتورة على الطلب.'],
    ['See payment status without asking.', 'اطّلع على حالة الدفع دون سؤال.'],
  ])}</div>
</section>
${ctaEnd('See the portals on your own job cards.', 'شاهد البوابات على بطاقات عملك.', 'A 20-minute demo, in Arabic or English.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية.')}`;

/* ---------------------------------------------------------------- pricing */
const MODS = [
  ['Workshop: job cards, bays', 'الورشة: بطاقات العمل، الخلجان', 'yes', 'yes', 'yes'],
  ['Registry: vehicles, customers', 'السجل: المركبات، العملاء', 'yes', 'yes', 'yes'],
  ['Finance: invoicing, payments', 'المالية: الفوترة، المدفوعات', 'yes', 'yes', 'yes'],
  ['ZATCA Phase 2 e-invoicing', 'الفوترة الإلكترونية للمرحلة الثانية', 'basic', 'full', 'full'],
  ['Accounting', 'المحاسبة', 'basic', 'full', 'full'],
  ['Parts and inventory', 'القطع والمخزون', 'basic', 'full', 'full'],
  ['Reports and analytics', 'التقارير والتحليلات', 'basic', 'full', 'full'],
  ['Administration and RBAC', 'الإدارة والصلاحيات', 'basic', 'full', 'full'],
  ['CRM and marketing', 'إدارة العملاء والتسويق', 'no', 'yes', 'yes'],
  ['AI platform', 'منصة الذكاء الاصطناعي', 'no', 'yes', 'yes'],
  ['Call centre', 'مركز الاتصال', 'no', 'yes', 'yes'],
  ['Team and HR', 'الفريق والموارد البشرية', 'no', 'yes', 'yes'],
  ['Customer app', 'تطبيق العملاء', 'no', 'yes', 'yes'],
  ['Arabic and English', 'العربية والإنجليزية', 'yes', 'yes', 'yes'],
  ['API access', 'الوصول البرمجي', 'no', 'read', 'full'],
];
const cell = (v) => ({ yes: `<span class="yes">${t('Included', 'مشمول')}</span>`, full: `<span class="yes">${t('Full', 'كامل')}</span>`, basic: `<span class="basic">${t('Basic', 'أساسي')}</span>`, read: `<span class="basic">${t('Read-only', 'قراءة فقط')}</span>`, no: `<span class="no" aria-label="Not included">—</span>` })[v];

const pricing = pageHero({
  crumb: ['Pricing', 'الأسعار'], eyebrow: ['Pricing', 'الأسعار'],
  h1: ['Three tiers. Prices in SAR, <span class="o">stated in full.</span>', 'ثلاث خطط. الأسعار بالريال، <span class="o">مذكورة كاملة.</span>'],
  lede: ['Monthly or annual, with the annual price 15% lower. Every tier includes Arabic and English, the workshop lifecycle, and ZATCA e-invoicing. Prices exclude VAT.', 'شهرياً أو سنوياً، والسعر السنوي أقل بنسبة ١٥٪. كل خطة تشمل العربية والإنجليزية ودورة الورشة والفوترة الإلكترونية. الأسعار لا تشمل ضريبة القيمة المضافة.'],
}) + `
<section class="wrap" aria-label="Tiers">
  <div class="tiers">
    <div class="tier"><span class="cap">${t('Starter', 'البداية')}</span><h3>${t('One branch', 'فرع واحد')}</h3><div class="price" dir="ltr">SAR 999 <small>/ ${t('month', 'شهر')}</small></div><div class="annual" dir="ltr">SAR 10,190 / ${t('year', 'سنة')}</div>
      <ul><li>${t('1 branch, up to 10 users', 'فرع واحد، حتى ١٠ مستخدمين')}</li><li>${t('10 GB for documents and photos', '١٠ غيغابايت للمستندات والصور')}</li><li>${t('Simplified tax invoices', 'فواتير ضريبية مبسطة')}</li><li>${t('Basic accounting, parts and reports', 'محاسبة وقطع وتقارير أساسية')}</li><li>${t('Email support, 24-hour response', 'دعم بالبريد، رد خلال ٢٤ ساعة')}</li><li>${t('99.5% uptime, daily backup, 14-day retention', 'توافر ٩٩٫٥٪، نسخ يومي، حفظ ١٤ يوماً')}</li></ul>
      <a class="btn ghost" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a></div>
    <div class="tier pop"><span class="cap">${t('Professional · most chosen', 'الاحترافية · الأكثر اختياراً')}</span><h3>${t('Up to three branches', 'حتى ثلاثة فروع')}</h3><div class="price" dir="ltr">SAR 2,499 <small>/ ${t('month', 'شهر')}</small></div><div class="annual" dir="ltr">SAR 25,490 / ${t('year', 'سنة')}</div>
      <ul><li>${t('Up to 3 branches, up to 50 users', 'حتى ٣ فروع، حتى ٥٠ مستخدماً')}</li><li>${t('All thirteen domains, full access', 'المجالات الثلاثة عشر كلها، وصول كامل')}</li><li>${t('Standard and simplified invoices, credit and debit notes', 'فواتير قياسية ومبسطة، إشعارات دائنة ومدينة')}</li><li>${t('AI platform and the customer app', 'منصة الذكاء الاصطناعي وتطبيق العملاء')}</li><li>${t('Email and phone support, 4-hour response', 'دعم بالبريد والهاتف، رد خلال ٤ ساعات')}</li><li>${t('99.9% uptime, daily backup, 30-day retention', 'توافر ٩٩٫٩٪، نسخ يومي، حفظ ٣٠ يوماً')}</li></ul>
      <a class="btn" href="${DEMO}">${t('Book a demo', 'احجز عرضاً')}</a></div>
    <div class="tier"><span class="cap">${t('Enterprise', 'المؤسسات')}</span><h3>${t('Four branches and up', 'أربعة فروع فأكثر')}</h3><div class="price">${t('Custom', 'حسب الاتفاق')}</div><div class="annual">${t('Priced per branch. Ask for a quote.', 'تُسعَّر لكل فرع. اطلب عرضاً.')}</div>
      <ul><li>${t('Unlimited branches and users', 'فروع ومستخدمون بلا حد')}</li><li>${t('Full API, custom integrations', 'وصول برمجي كامل، تكاملات مخصصة')}</li><li>${t('Dedicated infrastructure option', 'خيار بنية تحتية مخصصة')}</li><li>${t('Dedicated account manager, 1-hour response', 'مدير حساب مخصص، رد خلال ساعة')}</li><li>${t('99.95% uptime with SLA credits, real-time replication', 'توافر ٩٩٫٩٥٪ مع تعويضات، نسخ لحظي')}</li><li>${t('Scheduled deployment windows', 'نوافذ نشر مجدولة')}</li></ul>
      <a class="btn ghost" href="mailto:info@salisauto.app?subject=Enterprise%20pricing">${t('Ask for a quote', 'اطلب عرض سعر')}</a></div>
  </div>
</section>
<section class="wrap" aria-labelledby="m-h">
  <div class="sec-head"><div class="eyebrow">${t('Modules by tier', 'الوحدات بحسب الخطة')}</div><h2 id="m-h">${t('What each tier includes, line by line.', 'ما تشمله كل خطة، سطراً بسطر.')}</h2></div>
  <div class="tablewrap"><table class="modtable"><thead><tr><th>${t('Module', 'الوحدة')}</th><th>${t('Starter', 'البداية')}</th><th>${t('Professional', 'الاحترافية')}</th><th>${t('Enterprise', 'المؤسسات')}</th></tr></thead><tbody>${MODS.map(([en, ar, a, b, c]) => `<tr><td>${t(en, ar)}</td><td>${cell(a)}</td><td>${cell(b)}</td><td>${cell(c)}</td></tr>`).join('')}</tbody></table></div>
  <div class="note">${t('Basic means: accounting posts invoice journals only; parts is manual stock; reports are five pre-built; ZATCA covers simplified invoices; admin is basic user management. Full adds the chart of accounts and bank reconciliation, automated reorder and supplier catalogues, the report builder, standard invoices with credit and debit notes, and full RBAC with audit logging.', 'أساسي يعني: المحاسبة ترحّل قيود الفواتير فقط؛ القطع مخزون يدوي؛ التقارير خمسة جاهزة؛ الفوترة الإلكترونية تشمل الفواتير المبسطة؛ الإدارة تشمل إدارة المستخدمين الأساسية. كامل يضيف دليل الحسابات والتسوية البنكية، وإعادة الطلب التلقائية وكتالوجات الموردين، ومنشئ التقارير، والفواتير القياسية مع الإشعارات، والصلاحيات الكاملة مع سجل التدقيق.')}</div>
</section>
${ctaEnd('Not sure which tier? Bring your branch count and user list.', 'لست متأكداً من الخطة؟ أحضر عدد فروعك وقائمة مستخدميك.', 'A 20-minute demo ends with a recommendation and a written quote.', 'ينتهي العرض التوضيحي لعشرين دقيقة بتوصية وعرض سعر مكتوب.')}`;

/* ---------------------------------------------------------------- about, contact */
const about = pageHero({
  crumb: ['About', 'عن المنتج'], eyebrow: ['About SALIS AUTO', 'عن SALIS AUTO'],
  h1: ['Built in Riyadh <span class="o">for Saudi workshops.</span>', 'مبني في الرياض <span class="o">للورش السعودية.</span>'],
  lede: ['SALIS AUTO is SALIS Garage, the shipping product of the SALISCO family. Four assumptions from day one: Arabic, ZATCA, the riyal, and an audit trail that answers who changed what.', 'SALIS AUTO هو SALIS Garage، المنتج المتاح من عائلة ساليسكو. أربعة افتراضات من اليوم الأول: العربية، الهيئة، الريال، وسجل تدقيق يجيب عن سؤال من غيّر ماذا.'],
  cta2: `<a class="btn ghost-dark" href="${FAMILY}" dir="ltr">salisco.com</a>`,
}) + `
<section class="wrap" aria-labelledby="as-h">
  <div class="sec-head"><div class="eyebrow">${t('The four assumptions', 'الافتراضات الأربعة')}</div><h2 id="as-h">${t('Not localisation features bolted on late.', 'ليست ميزات تعريب أُضيفت متأخرة.')}</h2></div>
  <div class="assume standalone">
    <div><i></i><b>${t('Arabic first', 'العربية أولاً')}</b><span>${t('Copy is written for Arabic and rendered right-to-left; English sits beside it. Length differences are a layout problem to solve, never a reason to abbreviate Arabic.', 'يُكتب النص بالعربية ويُعرض من اليمين إلى اليسار، والإنجليزية بجانبه. فروق الطول مشكلة تخطيط تُحل، لا سبباً لاختصار العربية.')}</span></div>
    <div><i></i><b>${t('ZATCA in the core', 'الهيئة في النواة')}</b><span>${t('Phase 2 e-invoicing with QR and hash chain is generated by the same transaction that posts the sale. Compliance is not a module.', 'الفوترة الإلكترونية للمرحلة الثانية برمز الاستجابة وسلسلة التجزئة تولدها المعاملة نفسها التي ترحّل البيع. الامتثال ليس وحدة إضافية.')}</span></div>
    <div><i></i><b>${t('SAR to the halala', 'الريال حتى الهللة')}</b><span>${t('Money is stored as integer halalas. Totals reconcile because rounding happens once, at the edge.', 'تُخزَّن المبالغ بالهللة كأعداد صحيحة. المجاميع تتطابق لأن التقريب يحدث مرة واحدة، عند الحافة.')}</span></div>
    <div><i class="o"></i><b>${t('One audit row per change', 'سطر تدقيق لكل تغيير')}</b><span>${t('Actor, before, after and request id, written in the same transaction as the change. The promise of traceability is in the schema.', 'الفاعل والقيمة قبل وبعد ورقم الطلب، تُكتب في المعاملة نفسها مع التغيير. وعد التتبع في بنية البيانات.')}</span></div>
  </div>
</section>
<section class="wrap two" aria-labelledby="fam-h">
  <div class="sec-head"><div class="eyebrow">${t('The family', 'العائلة')}</div><h2 id="fam-h">${t('One of four SALISCO lines.', 'واحد من أربعة خطوط ساليسكو.')}</h2></div>
  ${facts([
    ['SALIS Garage, this product, shipping. Workshops sign in to it today as SALIS AUTO.', 'SALIS Garage، هذا المنتج، متاح. تسجّل الورش الدخول إليه اليوم باسم SALIS AUTO.'],
    ['SALIS Spare Parts and SALIS Fleet run inside it today; each has its own page on this site.', 'SALIS Spare Parts وSALIS Fleet يعملان داخله اليوم؛ ولكل منهما صفحة في هذا الموقع.'],
    ['SALIS Insurance is planned: claims and approvals on the estimate and invoice records that already exist. It is described as planned, nowhere as shipping.', 'SALIS Insurance مخطط: المطالبات والموافقات على سجلات عروض الأسعار والفواتير الموجودة. يوصف بأنه مخطط، لا متاح.'],
    ['The family site is salisco.com. Product detail stays here.', 'موقع العائلة هو salisco.com. وتفاصيل المنتج تبقى هنا.'],
  ])}
</section>
<section class="wrap" aria-labelledby="mark-h">
  <div class="sec-head"><div class="eyebrow">${t('The mark', 'العلامة')}</div><h2 id="mark-h">${t('The Arabic wordmark is a draft.', 'الشعار العربي مسودة.')}</h2><p>${t('The Latin wordmark is custom lettering. The Arabic form below is typeset in Noto Sans Arabic and fitted to the same box. It is shown as a draft and is not used on this site until a type designer has redrawn it.', 'الشعار اللاتيني حروف مرسومة خصيصاً. الصيغة العربية أدناه مصفوفة بخط Noto Sans Arabic ومضبوطة على الإطار نفسه. تُعرض كمسودة ولا تُستخدم في هذا الموقع حتى يعيد مصمم خطوط رسمها.')}</p></div>
  <div class="arabic-drafts"><div style="background:#FFFFFF"><img src="assets/logo-arabic-full-colour.svg" alt="Arabic wordmark draft, full colour on white" loading="lazy"></div><div style="background:#0B1F3B"><img src="assets/logo-arabic-reversed-white.svg" alt="Arabic wordmark draft, reversed on navy" loading="lazy"></div></div>
</section>
${ctaEnd('See it on your own workshop’s numbers.', 'شاهده على أرقام ورشتك.', 'A 20-minute demo, in Arabic or English, on a job card from your floor.', 'عرض توضيحي لعشرين دقيقة، بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}`;

const contact = pageHero({
  crumb: ['Contact', 'تواصل'], eyebrow: ['Contact', 'تواصل'],
  h1: ['Write, book the demo, <span class="o">or sign in.</span>', 'راسلنا، احجز العرض، <span class="o">أو سجّل الدخول.</span>'],
  lede: ['No form on this page. An email reaches a person, the demo link opens the booking page inside the product, and sign-in takes existing workshops straight to work.', 'لا نموذج في هذه الصفحة. البريد يصل إلى شخص، ورابط العرض يفتح صفحة الحجز داخل المنتج، وتسجيل الدخول يأخذ الورش الحالية إلى العمل مباشرة.'],
  cta2: `<a class="btn ghost-dark" href="${SIGNIN}">${t('Sign in', 'تسجيل الدخول')}</a>`,
}) + `
<section class="wrap" aria-label="Contact channels">
  <div class="channels">
    <a class="channel" href="mailto:info@salisauto.app"><span class="k">${t('Email', 'البريد')}</span><b dir="ltr">info@salisauto.app</b><span>${t('Sales, support for existing workshops, partnerships, press.', 'المبيعات، دعم الورش الحالية، الشراكات، الإعلام.')}</span></a>
    <a class="channel" href="${DEMO}"><span class="k">${t('Demo', 'العرض التوضيحي')}</span><b>${t('Book a 20-minute demo', 'احجز عرضاً لعشرين دقيقة')}</b><span>${t('In Arabic or English, on a job card from your floor.', 'بالعربية أو الإنجليزية، على بطاقة عمل من ورشتك.')}</span></a>
    <a class="channel" href="${SIGNIN}"><span class="k">${t('Existing workshops', 'الورش الحالية')}</span><b>${t('Sign in', 'تسجيل الدخول')}</b><span dir="ltr">app.salisauto.app</span></a>
  </div>
  <div class="sec-head" style="margin-top:56px"><div class="eyebrow">${t('Accounts', 'الحسابات')}</div><h2>${t('SALIS AUTO on four platforms.', 'SALIS AUTO على أربع منصات.')}</h2><p>${t('Releases, proof points with their baselines, tips from the floor, and open roles. Post in both languages.', 'الإصدارات، والأرقام مع أساس قياسها، ونصائح من أرض الورشة، والوظائف المتاحة. نُنشر باللغتين.')}</p></div>
  <div class="tablewrap">
    <table>
      <thead><tr><th>${t('Platform', 'المنصة')}</th><th>${t('Handle', 'المعرّف')}</th><th>${t('What it carries', 'ما تحمله')}</th></tr></thead>
      <tbody>
        <tr><td><b>LinkedIn</b></td><td class="mono"><a href="https://www.linkedin.com/company/salisauto" dir="ltr">linkedin.com/company/salisauto</a></td><td>${t('Industry insight, product releases, hiring. Proof points with baselines.', 'رؤى القطاع، إصدارات المنتج، التوظيف. الأرقام مع أساس قياسها.')}</td></tr>
        <tr><td><b>X</b></td><td class="mono"><a href="https://x.com/SalisAuto" dir="ltr">@SalisAuto</a></td><td>${t('News, short tips, replies within the working day.', 'الأخبار، نصائح قصيرة، ردود خلال يوم العمل.')}</td></tr>
        <tr><td><b>Instagram</b></td><td class="mono"><a href="https://www.instagram.com/salisauto" dir="ltr">@salisauto</a></td><td>${t('Product screens, the workshop floor, customer stories with consent.', 'شاشات المنتج، أرض الورشة، قصص العملاء بإذنهم.')}</td></tr>
        <tr><td><b>YouTube</b></td><td class="mono"><a href="https://www.youtube.com/@salisauto" dir="ltr">youtube.com/@salisauto</a></td><td>${t('Demos, role guides and recorded webinars, in both languages.', 'عروض توضيحية وأدلة الأدوار وندوات مسجلة، باللغتين.')}</td></tr>
      </tbody>
    </table>
  </div>
</section>`;

const BODIES = { home, lifecycle, features, zatca, parts, fleet, customer, portals, pricing, about, contact };

/* ---------------------------------------------------------------- write */
/** Wrap a page body in the shared chrome. `page` needs path, key, title, desc. */
export function renderPage(page, body, { scenes = true } = {}) {
  const b = baseOf(page.path);
  return head(page) + '\n<body>' + traceSymbol + header(page) + `\n<main id="main">${body}\n</main>` + footer(page) +
    `\n<script src="${b}assets/site.js"></script>\n` + (scenes ? `<script src="${b}assets/scenes.js" defer></script>\n` : '') + `</body>\n</html>\n`;
}

export function writePages() {
  for (const page of PAGES) {
    const html = renderPage(page, BODIES[page.key]);
    const out = join(ROOT, page.path);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log('wrote', page.path, html.length);
  }
}

const notFound = () => `
<section class="wrap nf" aria-labelledby="nf-h">
  <div class="eyebrow">${t('Not found', 'غير موجود')}</div>
  <div class="code" dir="ltr">404</div>
  <h1 id="nf-h">${t('That page is not here.', 'هذه الصفحة ليست هنا.')}</h1>
  <p>${t('The address may have changed, or the link was typed by hand. The product pages, pricing and contact are one step away.', 'ربما تغيّر العنوان، أو كُتب الرابط يدوياً. صفحات المنتج والأسعار والتواصل على بُعد خطوة.')}</p>
  <div class="ctas"><a class="btn" href="/">${t('Go to the home page', 'انتقل إلى الصفحة الرئيسية')}${ARR}</a><a class="btn ghost" href="/contact.html">${t('Contact SALIS AUTO', 'تواصل مع SALIS AUTO')}</a></div>
</section>`;

export function writeNotFound() {
  const page = { path: '404.html', key: '404', title: ['Page not found', 'الصفحة غير موجودة'], desc: ['That page is not here.', 'هذه الصفحة ليست هنا.'] };
  writeFileSync(join(ROOT, '404.html'), renderPage(page, notFound(), { scenes: false }));
  console.log('wrote 404.html');
}

export function writeSitemap(extraPaths = []) {
  const today = '2026-09-04';
  const paths = [...PAGES.map((p) => p.path), ...extraPaths];
  writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.map((p) => { const u = SITE + '/' + (p === 'index.html' ? '' : p); return `  <url><loc>${u}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${u}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${u}?lang=ar"/>
  </url>`; }).join('\n')}
</urlset>
`);
  writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log('sitemap, robots written', paths.length, 'urls');
}

export { PAGES, SITE, APP, DEMO, SIGNIN, t, ROOT };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  writePages();
  writeNotFound();
  writeSitemap();
}
