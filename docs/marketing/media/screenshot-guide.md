# Product screenshot guide (SA-MKT-022)

Screenshots are the raw material for every other asset. Capture them once, correctly, from the demo environment, and never from a customer tenant.

## Environment

- Demo tenant only, seeded with the demo workshop (Riyadh Main and two branches), demo customers, and the demo plates `RUH 4821`, `RUH 1157`, `RUH 9930`, `RUH 2204`.
- Sign in as the demo owner for dashboards and reports, the demo advisor for check-in and estimates, the demo technician for the portal, the demo customer for the customer app.
- Clock set so timestamps read as a working day, for example 04 Sep 2026 · 09:40. Never a weekend.
- Browser: Chrome, no extensions, 100 % zoom, default fonts, cursor hidden.

## Routes worth capturing

Confirm each route in `app/src/data/generated/master-registry.ts` before capture; names below are the intent, not a contract.

| Intent | Route | Viewport | Notes |
|---|---|---|---|
| Landing hero | `/public-portal/landing` | 1440 and 390 | Signed out; both languages |
| Bay board | `/job-cards` | 1440 and 390 | Four rows, one in orange "Awaiting parts"; at 390 the card layout, not a table |
| Job card detail | `/job-detail?id=<demo>` | 1440 | Stage rail and audit trail visible |
| Estimate | `/estimates` and the detail | 1440 and 390 | Lines, VAT 15 %, total in SAR; the customer-side approval at 390 |
| Invoice with QR | `/invoices` detail or `/invoice-preview` | 1440 | QR readable; demo VAT number |
| Customer app | `/customer-app` | 390 only | Arabic UI first; stage dots and approval |
| Technician portal | `/technician-portal` | 390 only | Current job, checklist, parts request |
| Owner dashboard | `/dashboard` | 1440 | Real figures from demo data, no invented totals |
| Parts and reorder | `/inventory` | 1440 | A part under minimum with its drafted purchase request |
| Fleet account | `/fleet` | 1440 | Utilisation bars, cost per vehicle |
| Kiosk check-in | `/kiosk-check-in` | 1440 landscape | Queue number screen |

## Matrix

Every route in the table above is captured in four combinations at each listed viewport: light EN, light AR, dark EN, dark AR. Arabic captures must show `html[dir="rtl"]`; check the chevrons mirror and plates stay left-to-right.

## Redaction and truth

- Demo data only. If anything that looks like a real name, phone, plate or VAT number appears, stop and fix the seed, do not blur.
- No invented KPI totals on dashboards: the dashboard shows what the demo data computes.
- No feature that is not shipped. Insurance screens, if any exist, are not captured for marketing.
- No browser chrome, no OS taskbar, no notifications.

## Capture and export

- Playwright at deviceScaleFactor 2, full-page for landing and detail pages, viewport-only for boards and phones.
- Phone captures at 390×844 inside the phone frame from the social kit when used in posts; raw capture stored without the frame.
- PNG, sRGB. Names: `salis-auto_all_shot_<route-slug>_<w>_<theme>_<lang>_v01.png`, for example `salis-auto_all_shot_job-cards_1440_light_ar_v01.png`.
- Store under `docs/marketing/media/shots/` (not committed until reviewed) with a `manifest.csv`: file, route, viewport, theme, language, seed version, date.

## Refresh rule

Screenshots expire with the UI. Recapture the full matrix after any public-page or shell change on the `ux/page-upgrade` branch, and before any print run.

---

# دليل لقطات الشاشة من المنتج

لقطات الشاشة هي المادة الخام لكل أصل آخر. تُلتقط مرة واحدة، صحيحة، من بيئة العرض، ولا تُلتقط أبداً من حساب عميل.

## البيئة

- حساب العرض التجريبي فقط، مزوَّد بورشة العرض (الرياض الرئيسي وفرعين)، وعملاء تجريبيين، واللوحات التجريبية `RUH 4821` و`RUH 1157` و`RUH 9930` و`RUH 2204`.
- تسجيل الدخول بحساب المالك التجريبي للوحات والتقارير، والمستشار للاستقبال وعروض الأسعار، والفني للبوابة، والعميل لتطبيق العميل.
- الساعة مضبوطة على يوم عمل، مثل ٠٤ سبتمبر ٢٠٢٦ · ٠٩:٤٠. لا عطلة نهاية أسبوع أبداً.
- المتصفح: Chrome بلا إضافات، تكبير ١٠٠٪، الخطوط الافتراضية، المؤشر مخفي.

## المسارات الجديرة بالالتقاط

تُؤكَّد المسارات في `app/src/data/generated/master-registry.ts` قبل الالتقاط. الجدول الإنجليزي أعلاه هو المرجع: الصفحة الرئيسية، لوحة الخلجان، تفاصيل بطاقة العمل، عرض السعر، الفاتورة برمز الاستجابة، تطبيق العميل، بوابة الفني، لوحة المالك، القطع وإعادة الطلب، حساب الأسطول، كشك الاستقبال.

## المصفوفة

كل مسار يُلتقط بأربع تركيبات لكل عرض شاشة: فاتح إنجليزي، فاتح عربي، داكن إنجليزي، داكن عربي. اللقطات العربية يجب أن تُظهر `html[dir="rtl"]`؛ تأكد أن الأسهم تنعكس وأن اللوحات تبقى من اليسار إلى اليمين.

## الحجب والصدق

- بيانات تجريبية فقط. إن ظهر ما يشبه اسماً أو هاتفاً أو لوحة أو رقماً ضريبياً حقيقياً، توقف وأصلح البذرة؛ لا تطمس.
- لا إجماليات مخترعة في اللوحات: اللوحة تعرض ما تحسبه البيانات التجريبية.
- لا ميزة غير مطروحة. شاشات التأمين، إن وُجدت، لا تُلتقط للتسويق.
- لا إطار متصفح، لا شريط مهام، لا إشعارات.

## الالتقاط والتصدير

- Playwright بمعامل مقياس ٢، صفحة كاملة للرئيسية وصفحات التفاصيل، وحدود الشاشة فقط للوحات والهواتف.
- لقطات الهاتف على ٣٩٠×٨٤٤ داخل إطار الهاتف من عدة التواصل عند الاستخدام في المنشورات؛ اللقطة الخام تُحفظ بلا إطار.
- PNG، sRGB. الأسماء: `salis-auto_all_shot_<المسار>_<العرض>_<السمة>_<اللغة>_v01.png`.
- تُحفظ تحت `docs/marketing/media/shots/` (لا تُودع قبل المراجعة) مع `manifest.csv`.

## قاعدة التحديث

تنتهي صلاحية اللقطات مع تغيّر الواجهة. تُعاد المصفوفة كاملة بعد أي تغيير في الصفحات العامة أو الهيكل على فرع `ux/page-upgrade`، وقبل أي طباعة.
