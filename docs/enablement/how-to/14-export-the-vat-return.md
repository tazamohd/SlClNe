# 14 · Export the VAT return / تصدير إقرار ضريبة القيمة المضافة

**Goal.** Read and export the output VAT the server charged on every issued invoice in the period.
**Role.** Accountant, owner. **Time.** 3 minutes.
**Before you start.** Invoices for the period are issued (how-to 09). Input VAT is **Not modelled** in the product; the return's input side comes from your expense records elsewhere.

**Steps**
1. Accounting → Tax Management. The header reads "VAT (ZATCA) configuration and output tax".
2. Read **VAT configuration**: **Standard rate (ZATCA)**, "Applied to standard-rated supplies". "A rate change is a configuration change (§A37), applied server-side to new invoices."
3. Set the date range. The screen reads "Computing the return…" then lists **Output VAT by invoice**: **Taxable sales** ("Net of discount, the VAT base") and **Output VAT** ("On the discounted net", "Rounded once, half-up, at the last halala"). The count reads "issued invoices in range".
4. **Search invoices** by "Invoice or customer" to check a line.
5. Export. The file carries every invoice id so any line traces back to its job card.

**Done when.** The export total equals the **Output VAT** shown for the range.
**If it fails.** "No issued invoices match these filters." / "No output VAT in range.": widen the range or check that invoices were issued, not left as drafts. Input VAT: **Not modelled**; do not look for it here.

**Media block**
- Short, T5. Hook: "The VAT return, from the invoice table." Beats: 1 "Pick the period" / 2 "Output VAT by invoice, rounded once" / 3 "Export with every invoice id." VO: "The accountant traces any line back to its job card. No spreadsheet beside the system." CTA: **Book a demo**.
- Photo set: Tax Management header with the rate (1440, en); **Output VAT by invoice** list (1440, ar); export dialog (1440, en).

---

**الهدف.** قراءة وتصدير ضريبة المخرجات التي احتسبها الخادم على كل فاتورة صادرة في الفترة.
**الدور.** المحاسب، المالك. **الوقت.** ٣ دقائق.
**قبل البدء.** فواتير الفترة صادرة. ضريبة المدخلات **غير مُنمذجة** في المنتج؛ جانب المدخلات يأتي من سجلات المصروفات لديك.

**الخطوات**
1. المحاسبة ← إدارة الضرائب.
2. اقرأ **إعداد الضريبة**: **المعدل القياسي (الهيئة)**. «تغيير المعدل تغيير إعداد يُطبَّق في الخادم على الفواتير الجديدة».
3. حدد الفترة. تقرأ الشاشة «يُحتسب الإقرار…» ثم تدرج **ضريبة المخرجات بحسب الفاتورة**: **المبيعات الخاضعة** و**ضريبة المخرجات** «تُقرَّب مرة واحدة عند آخر هللة».
4. **ابحث في الفواتير** بالفاتورة أو العميل للتحقق من سطر.
5. صدّر. يحمل الملف رقم كل فاتورة ليتتبع أي سطر إلى بطاقة عمله.

**تكتمل حين** يساوي إجمالي الملف **ضريبة المخرجات** المعروضة للفترة.
**إن فشلت.** «لا فواتير صادرة تطابق هذه المرشحات» / «لا ضريبة مخرجات في الفترة»: وسّع الفترة أو تحقق من أن الفواتير صادرة لا مسودات.

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «الإقرار، من جدول الفواتير». اللقطات: ١ «اختر الفترة» / ٢ «ضريبة المخرجات بحسب الفاتورة، تُقرَّب مرة» / ٣ «صدّر مع رقم كل فاتورة». التعليق: «يتتبع المحاسب أي سطر إلى بطاقة عمله. لا جدول بجانب النظام». الطلب: **احجز عرضاً**.
- مجموعة الصور: رأس إدارة الضرائب مع المعدل؛ قائمة ضريبة المخرجات؛ حوار التصدير.
