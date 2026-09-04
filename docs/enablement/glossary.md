# Glossary / المسرد

Source of the house terms: the header of `app/src/data/ar-overrides.ts`. ZATCA vocabulary follows the authority's own Arabic. The general product glossary is `docs/knowledge-base/reference/glossary.md`; this file adds only the house terms, the official Arabic, and the role ceilings a caption or subtitle needs. Product names, plates, SKUs and units stay Latin in Arabic text and are isolated with `dir="ltr"` when rendered as HTML.

## House terms / المصطلحات المعتمدة

| English | العربية | Where it appears | Note |
|---|---|---|---|
| Bay | خليج | Dashboard, job cards, technician portal | Never «مساحة» in product UI; «خليج» is the house term and the plural is «خلجان». |
| Bay board | لوحة الخلجان | Dashboard, hero mocks | |
| Job card | بطاقة عمل | Everywhere | The one record the whole lifecycle writes to. |
| Estimate | عرض سعر | Workshop, approval inbox | Not «تقدير». |
| Customer approval | اعتماد العميل | Customer approval screen | Signed from the customer's phone after a one-time code. |
| Approval ceiling / limit | حد الاعتماد | Approval inbox, estimates | Per role: Branch Manager `SAR 50,000`, Accountant `SAR 25,000`, Procurement Agent `SAR 20,000`, HR Manager `SAR 15,000`, Storekeeper `SAR 10,000`, Service Advisor `SAR 5,000`; owner has no ceiling; technician, QC, receptionist, call centre, supplier and customer cannot approve. |
| Segregation of duties | الفصل بين المهام | QC, estimates, approval inbox | The person who did a step cannot approve it. |
| Posting (ledger) | ترحيل | Payroll, journals | A posted run cannot be edited. |
| Receipt | سند قبض | Billing → Receipts | Raised against an invoice; stays pending until the money clears. |
| Requisition | طلب شراء | Parts, purchase orders | |
| Purchase order | أمر شراء | Parts → Purchase Orders | Lines carry quantity and agreed unit cost; VAT is added on the order total. |
| Reorder point | حد إعادة الطلب | Inventory, automated reordering | Stock at or below it triggers a request. |
| Reservation | حجز مخزون | Inventory | Parts held for a job card. |
| Lead | عميل محتمل | Growth | |
| Delivery | التسليم | Workshop stage 6 | Invoice, e-signature, vehicle release. |
| Quality control (QC) | مراقبة الجودة | Workshop stage 5 | A second technician signs. |
| Audit trail | سجل التدقيق | Job card detail, QC, estimates | Who did what, before and after, with the request id. |
| Request id | معرّف الطلب | Error states | Quote it when reporting a problem. |
| Halala | هللة | Money everywhere | Amounts are stored to the halala and rounded once. |

## ZATCA vocabulary / مفردات الهيئة

| English | العربية الرسمية | Note |
|---|---|---|
| ZATCA | هيئة الزكاة والضريبة والجمارك | Never machine-translated. Short form in UI: «الهيئة». |
| E-invoicing | الفوترة الإلكترونية | |
| Phase 2 (integration phase) | المرحلة الثانية (مرحلة الربط والتكامل) | |
| Fatoora platform | منصة فاتورة | Reporting to it is configured per deployment. |
| Simplified tax invoice | فاتورة ضريبية مبسطة | Issued to consumers. |
| Standard tax invoice | فاتورة ضريبية | Issued between VAT-registered parties. |
| VAT (15%) | ضريبة القيمة المضافة (١٥٪) | Computed on the server at the ZATCA rate. |
| VAT number | الرقم الضريبي | |
| QR code (TLV) | رمز الاستجابة السريعة | Seller name, VAT number, timestamp, total with VAT, VAT amount. |
| Hash chain | سلسلة التجزئة | Each invoice links to the one before it. |
| UBL 2.1 XML | XML بمعيار UBL 2.1 | |
| Credit note / debit note | إشعار دائن / إشعار مدين | Not available in the product today; see how-to 11. |
| Immutable after issue | غير قابل للتعديل بعد الإصدار | «Invoice issued … can no longer be edited.» |
| Seven-year retention | حفظ لسبع سنوات | |

## Roles / الأدوار

| Role id | English label | العربية | Ceiling |
|---|---|---|---|
| owner | Owner / CEO | المالك / الرئيس التنفيذي | none |
| manager | Branch Manager | مدير الفرع | `SAR 50,000` |
| advisor | Service Advisor | مستشار الخدمة | `SAR 5,000` |
| technician | Technician | الفني | cannot approve |
| qc | QC Inspector | مفتش الجودة | cannot approve |
| parts | Storekeeper | أمين المستودع | `SAR 10,000` |
| accountant | Accountant | المحاسب | `SAR 25,000` |
| hr | HR Manager | مدير الموارد البشرية | `SAR 15,000` |
| frontdesk | Receptionist | موظف الاستقبال | cannot approve |
| callcenter | Call Center Agent | موظف مركز الاتصال | cannot approve |
| procurement | Procurement Agent | مسؤول المشتريات | `SAR 20,000` |
| supplier | Supplier | المورّد | cannot approve |
| customer | Customer | العميل | cannot approve |
| superadmin | Super Admin | المشرف العام | none |
