# Manual Part 4 — Accounting · Reports · Growth / المحاسبة · التقارير · النمو

Index: `../user-manual.md`. Preview screens: Financial Statements, Financial Reports, Insurance Reports, Loan Reports. Long-form: `docs/knowledge-base/how-to/generate-reports.md`, `docs/knowledge-base/library/financial-reporting-guide.md`, `docs/knowledge-base/library/zatca-compliance-checklist.md`.

## English

### Accounting → Chart of Accounts · `/chart-of-accounts` and Journal Entries · `/journal-entries`
**Purpose.** The ledger the invoices post into.
**Who.** Accountant, owner.
**Fields.** Account code, name, type, balance; journals from invoices and payroll.
**Actions.** Read; add an account; open a journal. Journals from invoices and payroll are created by the system, not typed.
**After.** A posted journal is immutable; corrections are a reversing entry.
**Errors.** None specific; an empty journal list means nothing has been issued or posted in the period.

### Accounting → Expenses · `/expenses` and Bank Reconciliation · `/bank-reconciliation`
**Purpose.** Costs outside invoices, and matching the bank statement to receipts.
**Actions.** Record an expense; match a statement line to a receipt.
**After.** Matched receipts stop being pending.
**Errors.** A receipt that cannot be matched stays pending; check the amount and date on the statement line.

### Accounting → Tax Management · `/tax-management`
**Purpose.** "VAT (ZATCA) configuration and output tax."
**Who.** Accountant, owner.
**Fields.** **VAT configuration**: **Standard rate (ZATCA)** "Applied to standard-rated supplies", "The rate the server applies to every invoice it prices". **Output VAT by invoice**: **Taxable sales** "Net of discount, the VAT base", **Output VAT** "On the discounted net", "Rounded once, half-up, at the last halala". **Input VAT**: **Not modelled**.
**Actions.** Set a date range; **Search invoices** ("Invoice or customer"); export.
**After.** Nothing is written; the screen reads issued invoices in range. "A rate change is a configuration change (§A37), applied server-side to new invoices."
**Errors.** "No issued invoices match these filters." "No output VAT in range." "Computing the return…" is the loading state.

### Reports → Reports, Reports & Analytics, Executive Dashboard, Operational Reports, Inventory Reports, Sales Reports, Custom Reports, BI Dashboard
**Purpose.** Read the business by period.
**Who.** Owner, manager (operational, inventory), accountant (sales), fields are redacted per role.
**Actions.** Pick a period and a branch; export.
**After.** Nothing is written.
**Rule for quoting.** A number leaves a report with its period and its comparison, or it does not leave.

### Growth → Lead Pipeline, Opportunities, Campaigns, Customer Segments, CRM Tasks, Email Marketing, SMS Campaigns, WhatsApp Campaigns, CRM Calendar
**Purpose.** Leads (عميل محتمل) to customers, and the campaigns that reach them.
**Who.** Manager, front desk, call centre.
**Actions.** Add a lead; move it through the pipeline; create a campaign; schedule a task.
**After.** A converted lead becomes a customer in the registry. SMS, email and WhatsApp campaigns send only when the provider is connected (KB `setup-integrations.md` §SMS, §Email).
**Errors.** Provider not connected: the campaign is saved but not sent; the status says so.

## العربية

### المحاسبة ← دليل الحسابات وقيود اليومية
**الغرض.** الدفتر الذي ترحَّل إليه الفواتير. **من.** المحاسب، المالك. **الإجراءات.** قراءة؛ إضافة حساب؛ فتح قيد. قيود الفواتير والرواتب ينشئها النظام لا تُكتب يدوياً. **بعدها.** القيد المرحَّل لا يُعدَّل؛ التصحيح قيد عكسي.

### المحاسبة ← المصروفات والتسوية البنكية
**الغرض.** التكاليف خارج الفواتير، ومطابقة كشف البنك بسندات القبض. **بعدها.** السند المطابَق لا يبقى معلقاً. **الأخطاء.** سند لا يُطابَق يبقى معلقاً؛ تحقق من المبلغ والتاريخ في سطر الكشف.

### المحاسبة ← إدارة الضرائب
**الغرض.** «إعداد ضريبة القيمة المضافة (الهيئة) وضريبة المخرجات». **الحقول.** **إعداد الضريبة**: **المعدل القياسي (الهيئة)** «يُطبَّق على التوريدات الخاضعة للمعدل القياسي». **ضريبة المخرجات بحسب الفاتورة**: **المبيعات الخاضعة** «صافي الخصم، وعاء الضريبة»، **ضريبة المخرجات** «على الصافي بعد الخصم»، «تُقرَّب مرة واحدة عند آخر هللة». **ضريبة المدخلات**: **غير مُنمذجة**. **الإجراءات.** تحديد فترة؛ **البحث في الفواتير**؛ التصدير. **بعدها.** لا يُكتب شيء؛ الشاشة تقرأ الفواتير الصادرة في الفترة. «تغيير المعدل تغيير إعداد يُطبَّق في الخادم على الفواتير الجديدة». **الأخطاء.** «لا فواتير صادرة تطابق هذه المرشحات». «لا ضريبة مخرجات في الفترة».

### التقارير
**الغرض.** قراءة المنشأة بحسب الفترة. **من.** المالك، المدير، المحاسب؛ الحقول تُحجب بحسب الدور. **الإجراءات.** اختيار فترة وفرع؛ التصدير. **قاعدة الاقتباس.** الرقم يخرج من التقرير مع فترته ومقارنته، أو لا يخرج.

### النمو
**الغرض.** من العميل المحتمل إلى العميل، والحملات التي تصله. **الإجراءات.** إضافة عميل محتمل؛ تحريكه في خط السير؛ إنشاء حملة؛ جدولة مهمة. **بعدها.** العميل المحتمل المحوَّل يصبح عميلاً في السجل. حملات الرسائل والبريد وواتساب تُرسل فقط عند ربط المزوّد. **الأخطاء.** المزوّد غير متصل: تُحفظ الحملة ولا تُرسل، والحالة تقول ذلك.
