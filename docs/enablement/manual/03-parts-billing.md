# Manual Part 3 — Parts · Billing / القطع · الفوترة

Index: `../user-manual.md`. Preview screens for these groups: Parts Network, Parts Supply Network. Long-form: `docs/knowledge-base/how-to/manage-inventory.md`.

## English

### Parts → Inventory · `/inventory`
**Purpose.** Stock by part, with its ledger of movements.
**Who.** Storekeeper, procurement, manager.
**Fields.** **Total SKUs**, **Total Value**, **Low Stock Items**, **Out of Stock**; per part **On Hand / Available**, **Unit Cost**, reorder point.
**Actions.** Add a part (its opening quantity is the first movement); **Open Ledger** on a part to record a movement; reserve stock for a job card.
**After.** "Stock reserved" / "Reservation released"; every movement is a ledger line; nothing is edited in place.
**Errors.** "No parts tracked yet — Add parts to start tracking stock." "Choose the part first. Its ledger opens with every movement the API can record." Stock movements need an idempotency key of 8–128 characters on the API; the screen supplies it.

### Parts → Purchase Orders (from Inventory) · `/purchase-orders`
**Purpose.** Order from a supplier in the directory.
**Who.** Storekeeper (`SAR 10,000` ceiling), procurement (`SAR 20,000`), manager.
**Fields.** Supplier ("Choose a supplier..."), **Order Date**, **Order Items** (quantity, agreed unit cost), **Approval & Receiving**.
**Actions.** **Create Purchase Order**; **Add Item** from the catalogue or "directly from the stock alert list"; **Add Supplier** if missing; **Back to Inventory**.
**After.** "A preview — the server computes the order total and re-checks it against the ceiling." VAT is added on the order total. Receiving marks lines **Fully received** and posts the stock movement.
**Errors.** "No suppliers yet — add one to reference it on the order." "Not from the catalogue" (a free-typed line; add the part first). "Nothing below reorder level — Every part is at or above its reorder point."

### Parts → Automated Reordering · `/automated-reordering`
**Purpose.** Rules that draft a purchase request when stock is **Below Minimum**.
**Fields.** **Active Rules**, **Reorder Qty**, **Orders Triggered**, **Total Parts**.
**After.** A drafted request waits for approval in the inbox of the role with the ceiling.

### Billing → Invoices · `/invoices`
**Purpose.** Issue ZATCA invoices, mostly from delivered job cards.
**Who.** Accountant, advisor (raise), owner.
**Fields.** **Bill To**, **Job card**, **Line Items**, **Invoice Summary**, notes ("Payment instructions, warranty terms...").
**Actions.** **New Invoice** → **From job card** ("Choose a job card to import its lines") or **Add Line**; **Save draft**; **Issue invoice**; **Open the invoice**. Issued invoices can be cancelled, not edited.
**After.** **Draft saved** ("Number assigned on save"); **Invoice issued — It is now open for payment and can no longer be edited.**; **Invoice cancelled**. Pricing: "Priced by the server from the lines above, at the ZATCA rate."
**Errors.** "Saved, not issued" (draft state, not an error). "Lines imported from" a job with demo data: "the sample job carries the design's lines; other jobs start from their service." "No actions" on a cancelled or fully settled invoice.

### Billing → Payments · `/payments` and Receipts · `/receipts`
**Purpose.** Money against invoices.
**Who.** Accountant, owner.
**Fields.** **SAR received today**, **SAR received in the last 7 days**, **Payments received**, **Payment Method**, **Due Date**, **Balance due**.
**Actions.** **Raise receipt** ("Choose an invoice", **Amount received**, "Select a method"); **New Receipt**; **New Invoice**.
**After.** **Receipt raised — It stays pending until the money clears.** **Payment recorded — The receipt has been raised against this invoice.** Balance shown "as the server reports it after this payment".
**Errors.** "Writes need the API. Set VITE_API_URL to record a real payment." (demo build). "Every invoice is settled or cancelled. There is nothing to receipt." "Paid invoices only — part payments need the API." "Some payments carry no date and are not counted."

## العربية

### القطع ← المخزون
**الغرض.** المخزون لكل قطعة مع دفتر حركاتها. **من.** أمين المستودع، المشتريات، المدير. **الحقول.** **إجمالي الأصناف**، **إجمالي القيمة**، **أصناف منخفضة**، **نفد المخزون**؛ لكل قطعة **المتوفر / المتاح**، **تكلفة الوحدة**، حد إعادة الطلب. **الإجراءات.** إضافة قطعة (كميتها الافتتاحية أول حركة)؛ **فتح الدفتر** لتسجيل حركة؛ حجز مخزون لبطاقة عمل. **بعدها.** «حُجز المخزون» / «أُلغي الحجز»؛ كل حركة سطر في الدفتر ولا يُعدَّل شيء في مكانه. **الأخطاء.** «لا قطع متتبَّعة بعد؛ أضف قطعاً لبدء التتبع». «اختر القطعة أولاً».

### القطع ← أوامر الشراء
**الغرض.** الطلب من مورّد في الدليل. **من.** أمين المستودع (حد `SAR 10,000`)، المشتريات (`SAR 20,000`)، المدير. **الحقول.** المورّد، **تاريخ الأمر**، **بنود الأمر** (الكمية، تكلفة الوحدة المتفق عليها)، **الاعتماد والاستلام**. **الإجراءات.** **إنشاء أمر شراء**؛ **إضافة بند** من الكتالوج أو من قائمة تنبيهات المخزون؛ **إضافة مورّد**. **بعدها.** «معاينة؛ يحسب الخادم إجمالي الأمر ويعيد التحقق منه مقابل الحد». تُضاف الضريبة على إجمالي الأمر. الاستلام يعلّم البنود **مستلَم بالكامل** ويرحّل حركة المخزون. **الأخطاء.** «لا موردين بعد؛ أضف واحداً». «ليس من الكتالوج». «لا شيء دون حد إعادة الطلب».

### القطع ← إعادة الطلب التلقائية
**الغرض.** قواعد تصوغ طلب شراء عند انخفاض المخزون **دون الحد الأدنى**. **الحقول.** **القواعد النشطة**، **كمية إعادة الطلب**، **الأوامر المُطلقة**. **بعدها.** ينتظر الطلب الاعتماد في صندوق الدور صاحب الحد.

### الفوترة ← الفواتير
**الغرض.** إصدار فواتير الهيئة، غالباً من بطاقات العمل المسلَّمة. **الحقول.** **الفاتورة إلى**، **بطاقة العمل**، **البنود**، **ملخص الفاتورة**، ملاحظات. **الإجراءات.** **فاتورة جديدة** ← **من بطاقة العمل** أو **إضافة بند**؛ **حفظ المسودة**؛ **إصدار الفاتورة**؛ **فتح الفاتورة**. الفاتورة الصادرة تُلغى ولا تُعدَّل. **بعدها.** **حُفظت المسودة** («يُعيَّن الرقم عند الحفظ»)؛ **صدرت الفاتورة؛ هي الآن مفتوحة للدفع ولا يمكن تعديلها**؛ **أُلغيت الفاتورة**. التسعير: «يسعّرها الخادم من البنود أعلاه بمعدل الهيئة». **الأخطاء.** «محفوظة، غير صادرة» (حالة مسودة). «لا إجراءات» على فاتورة ملغاة أو مسدَّدة.

### الفوترة ← المدفوعات وسندات القبض
**الغرض.** الأموال مقابل الفواتير. **الحقول.** **ريال مستلَم اليوم**، **في آخر ٧ أيام**، **طريقة الدفع**، **تاريخ الاستحقاق**، **الرصيد المستحق**. **الإجراءات.** **إصدار سند قبض** (اختر فاتورة، **المبلغ المستلَم**، اختر طريقة)؛ **سند جديد**؛ **فاتورة جديدة**. **بعدها.** **صدر السند؛ يبقى معلقاً حتى تصل الأموال**. **سُجّلت الدفعة**. **الأخطاء.** «الكتابة تحتاج الواجهة. اضبط VITE_API_URL لتسجيل دفعة حقيقية» (إصدار تجريبي). «كل الفواتير مسدَّدة أو ملغاة؛ لا شيء لإصدار سند». «الفواتير المسدَّدة فقط؛ الدفعات الجزئية تحتاج الواجهة».
