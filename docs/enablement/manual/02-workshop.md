# Manual Part 2 — Workshop / الورشة

Index: `../user-manual.md`. The workshop screens all write to one record, the job card, through six stages: Check-In, Inspection, Estimate, Repair, QC, Delivery. A stage gates the next.

## English

### Workshop → Job Cards · `/job-cards`
**Purpose.** Every job on the branch, by stage.
**Who.** Advisor, manager, technician (own jobs), owner.
**Fields.** Job number, customer, vehicle, stage, **Assigned Technician**, **Last Updated**.
**Actions.** **New Job Card**; search "customers, vehicles, parts"; stage filters; **Clear filters**. Opening a row shows the detail with **Workshop stages**, **Share link**, **Cancel job**.
**After.** A new card starts at Check-In; **Link copied** confirms a share.
**Errors.** "No job cards at this stage match the filters." / "No matching job cards" (adjust the filter). "Hidden for your role" on a field means the role cannot see it. "Delete Job Card?" asks for confirmation; "Delete failed" means the server refused, retry with the request id.

### Job card → Check-In
**Purpose.** Open the record at the counter.
**Fields.** **Customer Information** (**Name**, **Phone**, **Email**, **Total Visits**); **Vehicle Information** (**Plate**, **Make & Model**, **Odometer Reading**, **Fuel Level**); **Check-In Details** (**Reported Issues**, **Exterior Condition**, **Personal Belongings**).
**Actions.** **Complete Check-In**. The form saves as you type: **Draft saved**.
**After.** Stage moves to Inspection; the card appears on the bay board.
**Errors.** "Photo capture needs file storage, which this build has no endpoint for." (skip photos until storage is configured).

### Job card → Inspection
**Purpose.** Multi-point findings with severity.
**Fields.** Each check: **Pass**, **Fail**, **N/A**; counter "checks recorded".
**Actions.** **Submit Inspection**.
**After.** Findings feed the estimate ("What we found" on the customer's screen).
**Errors.** "Incomplete inspection" (every check needs a value).

### Job card → Estimate · Workshop → Estimates · `/estimates`
**Purpose.** Price the work: **Parts** lines (**Quantity**, **Unit Price**) and **Labor** lines (**Hours**, **Rate**); **Subtotal**, **VAT (15%)**, **Grand Total**.
**Who.** Advisor raises; approver signs within a ceiling.
**Actions.** **Approve Estimate** (within your **Limit**) or **Send to Customer**.
**After.** "Sent to the approval inbox for sign-off." when above the ceiling; **Estimate approved** / **Estimate rejected** on decision; the detail shows **Raised by** and **Approved by** and the audit trail.
**Errors.** "Above your approval limit". "Your role cannot approve estimates — this will be sent for sign-off." "Segregation-of-duties conflict" (the raiser cannot approve). "Line items load from the API. Connect a live server to see them." (demo).

### Workshop → Customer Approval · `/customer-approval`
**Purpose.** The customer authorises the work from their phone.
**Fields.** **Summary**, **What we found**, **Labour**, **Linked estimate approval**; **One-time code verification**.
**Actions.** The customer opens the **Secure link**, enters the **One-time code** ("Code sent to" the phone), signs: **Captured e-signature** → **Signed and authorised**.
**After.** The estimate is authorised and the job moves to Repair.
**Errors.** "The code did not match." (re-enter). "SMS not connected" / "Not connected" (the SMS provider is not configured in this build; the advisor reads the code from the screen). "Nothing to approve".

### Workshop → Technicians · `/technicians` and Technician Schedule · `/technician-schedule`
**Purpose.** Who is on which bay, and assignment.
**Actions.** **Assign Job** from the schedule.
**After.** The job card shows **Assigned Technician**; the technician's portal shows it under **Current Job** or **Up Next**.
**Errors.** "No jobs scheduled today". On the card: "No technician assigned yet — Assign one from the technician schedule."

### Job card → QC
**Purpose.** A second person checks the repair.
**Fields.** **QC Checklist**, **Work Summary**, **Assigned Technician**, **Audit trail** ("Who did what on this job card, and any duties held by one person"), **Signed in as**.
**Actions.** Technician: **Send to Quality Check**. Inspector: **Approve QC** or **Return to Repair**.
**After.** Approved cards are ready for Delivery; returned cards go back to Repair with the note.
**Errors.** "The technician who performed the repair cannot pass its quality check." and "Ask a QC inspector or the branch manager to sign off." (segregation of duties). "Incomplete checklist". "This job card is not at a stage quality control can act on."

### Job card → Delivery and Signature
**Purpose.** Hand the vehicle back with the invoice.
**Fields.** **Delivery Checklist**, **Final Odometer**, **Invoice Summary** (**Subtotal**, **VAT (15%)**, **Grand Total**); signature pad **Sign Below** / **Tap to sign** with the statement "I authorize the work described above and accept the total amount."
**Actions.** **Complete Delivery**; **Confirm Signature**; **Clear**; **Print Delivery Note**.
**After.** **Signature captured**; the card closes; **Ready for Delivery** on the customer app.
**Errors.** "Not invoiced yet — Totals appear once this job card is invoiced." (issue the invoice first). "Incomplete checklist".

### Workshop → OBD Diagnostics, Diagnostic Report, OEM Diagnostic Software, Technician Knowledge Base, Workshop Reports
Reference and reporting screens. OBD and OEM need a paired device or a licensed tool (see KB `setup-integrations.md` §OBD). Knowledge Base is searchable reading. Workshop Reports read throughput by period; quote the period with any number.

## العربية

### الورشة ← بطاقات العمل
**الغرض.** كل أعمال الفرع بحسب المرحلة. **الحقول.** رقم العمل، العميل، المركبة، المرحلة، **الفني المسنَد**، **آخر تحديث**. **الإجراءات.** **بطاقة عمل جديدة**؛ البحث؛ مرشحات المراحل؛ **مسح المرشحات**. فتح الصف يعرض **مراحل الورشة**، **مشاركة الرابط**، **إلغاء العمل**. **الأخطاء.** «لا بطاقات عمل في هذه المرحلة تطابق المرشحات». «مخفي لدورك». «فشل الحذف»: رفض الخادم، أعد المحاولة مع معرّف الطلب.

### بطاقة العمل ← الاستقبال
**الحقول.** معلومات العميل (**الاسم**، **الهاتف**، **البريد**)؛ معلومات المركبة (**اللوحة**، **الصنع والطراز**، **قراءة العداد**، **مستوى الوقود**)؛ تفاصيل الاستقبال (**المشكلات المبلَّغة**، **الحالة الخارجية**، **المتعلقات الشخصية**). **الإجراءات.** **إكمال الاستقبال**؛ النموذج يحفظ أثناء الكتابة: **حُفظت المسودة**. **بعدها.** تنتقل المرحلة إلى الفحص وتظهر البطاقة على لوحة الخلجان. **الأخطاء.** «التقاط الصور يحتاج تخزين ملفات لا يوفره هذا الإصدار».

### بطاقة العمل ← الفحص
**الحقول.** لكل بند: **اجتياز**، **إخفاق**، **لا ينطبق**. **الإجراءات.** **تقديم الفحص**. **بعدها.** تغذي النتائج عرض السعر («ما وجدناه» على شاشة العميل). **الأخطاء.** «فحص غير مكتمل».

### بطاقة العمل ← عرض السعر · الورشة ← عروض الأسعار
**الغرض.** تسعير العمل: بنود **القطع** (**الكمية**، **سعر الوحدة**) وبنود **الأجرة** (**الساعات**، **المعدل**)؛ **المجموع الفرعي**، **ضريبة القيمة المضافة (١٥٪)**، **الإجمالي**. **الإجراءات.** **اعتماد عرض السعر** ضمن **حدك** أو **إرسال إلى العميل**. **بعدها.** «أُرسل إلى صندوق الاعتمادات للتوقيع» فوق الحد؛ **اعتُمد العرض** / **رُفض العرض**؛ التفاصيل تعرض **رفعه** و**اعتمده** وسجل التدقيق. **الأخطاء.** «فوق حد اعتمادك». «دورك لا يمكنه اعتماد عروض الأسعار؛ سيُرسل للتوقيع». «تعارض في الفصل بين المهام». «البنود تُحمَّل من الواجهة؛ اربط خادماً حياً».

### الورشة ← اعتماد العميل
**الغرض.** يعتمد العميل العمل من هاتفه. **الإجراءات.** يفتح **الرابط الآمن**، يدخل **الرمز لمرة واحدة**، يوقّع: **التُقط التوقيع الإلكتروني** ← **موقَّع ومعتمَد**. **بعدها.** يُعتمد العرض وينتقل العمل إلى الإصلاح. **الأخطاء.** «الرمز غير مطابق». «الرسائل النصية غير متصلة» (مزوّد الرسائل غير مهيأ في هذا الإصدار؛ يقرأ المستشار الرمز من الشاشة). «لا شيء للاعتماد».

### الورشة ← الفنيون وجدول الفنيين
**الإجراءات.** **إسناد عمل** من الجدول. **بعدها.** تعرض البطاقة **الفني المسنَد** وتظهر في بوابة الفني تحت **العمل الحالي** أو **التالي**. **الأخطاء.** «لا فني مسنَد بعد؛ أسند واحداً من جدول الفنيين».

### بطاقة العمل ← مراقبة الجودة
**الحقول.** **قائمة فحص الجودة**، **ملخص العمل**، **الفني المسنَد**، **سجل التدقيق**، **مسجَّل الدخول بوصفك**. **الإجراءات.** الفني: **إرسال إلى فحص الجودة**. المفتش: **اعتماد الجودة** أو **الإرجاع إلى الإصلاح**. **الأخطاء.** «الفني الذي نفذ الإصلاح لا يمكنه اجتياز فحصه» و«اطلب من مفتش جودة أو مدير الفرع التوقيع». «قائمة غير مكتملة». «بطاقة العمل ليست في مرحلة تسمح لمراقبة الجودة بالتصرف».

### بطاقة العمل ← التسليم والتوقيع
**الحقول.** **قائمة التسليم**، **العداد النهائي**، **ملخص الفاتورة**؛ لوحة التوقيع **وقّع أدناه** / **انقر للتوقيع** مع عبارة الإقرار. **الإجراءات.** **إكمال التسليم**؛ **تأكيد التوقيع**؛ **مسح**؛ **طباعة إشعار التسليم**. **بعدها.** **التُقط التوقيع**؛ تُغلق البطاقة؛ **جاهزة للتسليم** في تطبيق العميل. **الأخطاء.** «لم تُفوتر بعد؛ تظهر الإجماليات بعد فوترة بطاقة العمل» (أصدر الفاتورة أولاً).

### الورشة ← التشخيص والتقارير وقاعدة المعرفة
شاشات مرجعية وتقارير. OBD وبرامج الشركات المصنّعة تحتاج جهازاً مقترناً أو أداة مرخصة. قاعدة المعرفة قراءة قابلة للبحث. تقارير الورشة تقرأ الإنتاجية بحسب الفترة؛ اذكر الفترة مع أي رقم.
