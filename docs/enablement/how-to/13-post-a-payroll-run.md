# 13 · Post a payroll run / ترحيل دورة الرواتب

**Goal.** Create the month's run, add a line per employee, post it once.
**Role.** HR manager (ceiling `SAR 15,000`) or accountant. **Time.** 15 minutes for a small team.
**Before you start.** Employees exist in People → HR & Payroll. The live API is connected ("Connect a live API to create a run" otherwise).

**Steps**
1. People → HR & Payroll → **Open payroll**. The screen reads "Monthly payroll runs and their lines".
2. **New payroll run** / **New draft run**; set **Period (YYYY-MM)**. The screen reads **Draft run created** and the run shows **Draft — not yet posted**.
3. **Add payroll line** → "Select an employee" → gross, allowances, deductions → **Add line**. The screen reads **Line added**. **Net pay** "is computed on the server as gross + allowances − deductions."
4. Repeat for each employee. "Add a line per employee, then post."
5. Post. The screen reads **Payroll run posted**. The run is locked.

**Done when.** The run no longer reads **Draft — not yet posted** and the journal appears under Accounting → Journal Entries.
**If it fails.** "Add at least one line before posting." "Cannot post this run." (a line is invalid; open it). "No employees are loaded to line up." (add staff first). "Could not create the run" / "Could not add the line" / "Posting failed" / "Something went wrong. Nothing was saved." (retry; quote the request id). A posted run cannot be edited; corrections go through a reversal, which is also on the audit trail.

**Media block**
- Short, T5. Hook: "Post once. It is locked." Beats: 1 "One line per employee" / 2 "Net pay computed on the server" / 3 "Posted. Same audit trail as every invoice." VO: "GOSI, allowances and deductions post to the ledger the invoices use." CTA: **Book a demo**.
- Photo set: **Open payroll** tile (1440, en); a draft run with three lines (1440, ar); **Payroll run posted** (1440, en).

---

**الهدف.** إنشاء دورة الشهر، إضافة بند لكل موظف، والترحيل مرة واحدة.
**الدور.** مدير الموارد البشرية (حد `SAR 15,000`) أو المحاسب. **الوقت.** ١٥ دقيقة لفريق صغير.
**قبل البدء.** الموظفون موجودون؛ الواجهة الحية متصلة («اربط واجهة حية لإنشاء دورة» وإلا).

**الخطوات**
1. الأشخاص ← الموارد البشرية والرواتب ← **فتح الرواتب**.
2. **دورة رواتب جديدة**؛ حدد **الفترة (YYYY-MM)**. تقرأ الشاشة **أُنشئت مسودة الدورة** وتعرض الدورة **مسودة — لم تُرحَّل بعد**.
3. **إضافة بند رواتب** ← «اختر موظفاً» ← الإجمالي والبدلات والخصومات ← **إضافة البند**. تقرأ الشاشة **أُضيف البند**. **صافي الراتب** «يُحسب في الخادم».
4. كرر لكل موظف.
5. رحّل. تقرأ الشاشة **رُحّلت دورة الرواتب**. تُقفل الدورة.

**تكتمل حين** لا تقرأ الدورة **مسودة** ويظهر القيد تحت المحاسبة ← قيود اليومية.
**إن فشلت.** «أضف بنداً واحداً على الأقل قبل الترحيل». «لا يمكن ترحيل هذه الدورة». «لا موظفين محمَّلين». «فشل الترحيل» / «حدث خطأ. لم يُحفظ شيء»: أعد المحاولة واذكر معرّف الطلب. الدورة المرحَّلة لا تُعدَّل؛ التصحيح قيد عكسي مسجَّل في سجل التدقيق.

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «رحّل مرة. تُقفل». اللقطات: ١ «بند لكل موظف» / ٢ «صافي الراتب يُحسب في الخادم» / ٣ «رُحّلت. سجل التدقيق نفسه ككل فاتورة». التعليق: «التأمينات والبدلات والخصومات تُرحَّل إلى الدفتر الذي تستخدمه الفواتير». الطلب: **احجز عرضاً**.
- مجموعة الصور: بطاقة فتح الرواتب؛ مسودة بثلاثة بنود؛ رُحّلت الدورة.
