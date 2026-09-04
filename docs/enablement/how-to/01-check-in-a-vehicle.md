# 01 · Check in a vehicle / استقبال مركبة

**Goal.** Open a job card at the counter with the customer, vehicle and reported issues on it.
**Role.** Service advisor, receptionist. **Time.** 3 minutes.
**Before you start.** The customer and vehicle exist in Front Desk → Customers / Vehicles, or you add them from the form.

**Steps**
1. Workshop → Job Cards → **New Job Card**. The check-in form opens with **Customer Information**, **Vehicle Information** and **Check-In Details**.
2. Fill **Name** and **Phone** (or pick the existing customer). **Total Visits** fills itself.
3. Fill **Plate**, **Make & Model**, **Odometer Reading**, **Fuel Level**. The form shows **Draft saved** as you type.
4. Under **Check-In Details**, type the **Reported Issues** ("Describe reported issues..."), mark **Exterior Condition** and **Personal Belongings**.
5. **Complete Check-In**. The card moves to Inspection and appears on the bay board.

**Done when.** The job card shows stage Inspection and the dashboard **Active Jobs** count rose by one.
**If it fails.** "Photo capture needs file storage, which this build has no endpoint for." Skip photos; everything else saves. "That plate is already in use." Pick the existing vehicle instead of adding it again.

**Media block**
- Short (20–30 s), template T5 story. Hook: "Check-in in three fields." Beats: 1 "Plate, model, odometer" / 2 "Reported issues, in the customer's words" / 3 "Complete Check-In. It is on the board." VO: "The job card starts here, and every stage after writes to the same record." CTA: **Book a demo**.
- Photo set: `/job-cards` empty state (1440, en); check-in form half filled with **Draft saved** visible (1440, en and ar); the card on `/dashboard` under Inspection (1440, ar).

---

**الهدف.** فتح بطاقة عمل عند الكاونتر مع العميل والمركبة والمشكلات المبلَّغة.
**الدور.** مستشار الخدمة، الاستقبال. **الوقت.** ٣ دقائق.
**قبل البدء.** العميل والمركبة موجودان في الاستقبال ← العملاء / المركبات، أو تضيفهما من النموذج.

**الخطوات**
1. الورشة ← بطاقات العمل ← **بطاقة عمل جديدة**. يفتح النموذج بأقسام **معلومات العميل** و**معلومات المركبة** و**تفاصيل الاستقبال**.
2. املأ **الاسم** و**الهاتف** أو اختر العميل الموجود.
3. املأ **اللوحة** و**الصنع والطراز** و**قراءة العداد** و**مستوى الوقود**. يعرض النموذج **حُفظت المسودة** أثناء الكتابة.
4. اكتب **المشكلات المبلَّغة** بكلمات العميل، وعلّم **الحالة الخارجية** و**المتعلقات الشخصية**.
5. **إكمال الاستقبال**. تنتقل البطاقة إلى الفحص وتظهر على لوحة الخلجان.

**تكتمل حين** تعرض البطاقة مرحلة الفحص ويرتفع عدد **الأعمال النشطة** بواحد.
**إن فشلت.** «التقاط الصور يحتاج تخزين ملفات لا يوفره هذا الإصدار»: تجاوز الصور. «تلك اللوحة مستخدمة أصلاً»: اختر المركبة الموجودة.

**كتلة الوسائط**
- مقطع قصير (قالب T5). الخطاف: «الاستقبال في ثلاثة حقول». اللقطات: ١ «اللوحة، الطراز، العداد» / ٢ «المشكلات كما قالها العميل» / ٣ «إكمال الاستقبال. صارت على اللوحة». التعليق: «تبدأ بطاقة العمل هنا، وكل مرحلة بعدها تكتب في السجل نفسه». الطلب: **احجز عرضاً**.
- مجموعة الصور: بطاقات العمل فارغة؛ النموذج نصف ممتلئ مع **حُفظت المسودة**؛ البطاقة على لوحة التحكم تحت الفحص (1440، عربي وإنجليزي).
