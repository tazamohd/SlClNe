# Manual Part 1 — Today · Front Desk / اليوم · الاستقبال

Index: `../user-manual.md`. Preview screens for these groups: Notifications.

## English

### Today → Dashboard · `/dashboard`
**Purpose.** The morning read: bay board, pipeline, and four tiles.
**Who.** Owner, branch manager, service advisor.
**Fields.** **Active Jobs**, **Invoiced Revenue**, **Open Invoices**, **Stock Health** (parts above reorder point); **Job pipeline** by stage; **Latest Job Cards**; **Team today** (owner and manager).
**Actions.** **New Job Card** opens the check-in form. **Add Vehicle** opens the vehicle form. **Check in a vehicle** appears when there are no jobs. **View All** opens Job Cards filtered to the stage.
**After.** Nothing is written from this screen; every tile reads from job cards, invoices and parts.
**Errors.** "Revenue trend needs dated invoices" and "Period filters need dated records — available on the live API": the demo fixtures carry no dates; connect the live API.

### Today → Approval Inbox · `/approval-inbox`
**Purpose.** Everything waiting on your signature.
**Who.** Any role with a ceiling: owner (none), branch manager `SAR 50,000`, accountant `SAR 25,000`, procurement `SAR 20,000`, HR `SAR 15,000`, storekeeper `SAR 10,000`, advisor `SAR 5,000`.
**Fields.** **Awaiting me**, **Above my limit**, **My ceiling**; each row shows the estimate, the amount and who raised it.
**Actions.** Approve, reject with a reason, or escalate.
**After.** The estimate changes state and the audit trail records the approver. Above the ceiling the row reads **Above limit** and the action is "escalate to a manager".
**Errors.** "You raised this — it needs a different approver." (segregation of duties: ask another approver). "Your role cannot approve estimates." (no ceiling on this role). "Approval failed" / "Something went wrong. Nothing was saved." (retry; quote the request id).

### Front Desk → Appointments · `/appointments` and Appointment Calendar · `/appointment-calendar`
**Purpose.** Book and see visits by day.
**Who.** Receptionist, service advisor, manager.
**Fields.** Customer, vehicle, service, date and time, bay.
**Actions.** New appointment from the list; the calendar shows the same bookings by day.
**After.** The appointment appears on the calendar and, on the day, on the technician's **Up Next**.
**Errors.** Empty state "No jobs scheduled today" on the technician side means nothing is booked for that bay.

### Front Desk → Kiosk Check-In · `/kiosk-check-in`
**Purpose.** A customer checks in alone on a counter tablet.
**Who.** Customer, with the receptionist nearby.
**Fields.** **Identify Yourself** by **Phone Number** or **License Plate**; **Select Your Vehicle**; **Select Service** ("What brings you in today?").
**Actions.** **Find My Vehicle** → **Confirm Check-In** → **Check-In Complete** with **Your number**. **New Check-In** resets. **Switch language** is on screen.
**After.** A job card opens at check-in; the screen shows "Your service advisor will be with you shortly" and "Screen resets in" a countdown.
**Errors.** **Demo mode** chip: in-memory only. **Estimated Wait Time** comes only from the server; without it the screen says the advisor will call you.

### Front Desk → Customers · `/customers` and Vehicles · `/vehicles`
**Purpose.** The registry every job card references.
**Who.** Receptionist, advisor.
**Fields.** Customers: **Customer type**, phone, **Vehicles Count**, **Last Visit**, **Total Spent**. Vehicles: plate, make and model, **Last Service**, **All makes** filter.
**Actions.** **Add Customer**; **Add New Vehicle**; search.
**After.** The record is available in check-in and the customer app.
**Errors.** "This record has no id, so it cannot be deleted." (a fixture row; real records carry ids). "That phone is already in use." on duplicates.

### Front Desk → Fleet Management · `/fleet-management`
**Purpose.** Contract vehicles and their status per account.
**Who.** Fleet manager, branch manager, accountant.
**Fields.** Contract, vehicles under it, **Contract Status**.
**Actions.** Open a contract; **Renew Contract**.
**After.** Renewal writes an audit row; contract invoices issue like any other sale.
**Errors.** None specific; an empty contract list means no fleet accounts on this branch.

### Front Desk → Customer Feedback · `/customer-feedback`
**Purpose.** What customers said after delivery.
**Who.** Manager, advisor. **Actions.** Read and filter. **After.** Nothing is written here.

## العربية

### اليوم ← لوحة التحكم
**الغرض.** قراءة الصباح: لوحة الخلجان، خط سير الأعمال، وأربع بطاقات.
**من.** المالك، مدير الفرع، مستشار الخدمة.
**الحقول.** الأعمال النشطة، الإيراد المفوتر، الفواتير المفتوحة، صحة المخزون (القطع فوق حد إعادة الطلب)؛ خط السير بحسب المرحلة؛ أحدث بطاقات العمل؛ الفريق اليوم.
**الإجراءات.** **بطاقة عمل جديدة** تفتح نموذج الاستقبال. **إضافة مركبة**. **عرض الكل** يفتح بطاقات العمل مصفّاة بالمرحلة.
**بعدها.** لا يُكتب شيء من هنا؛ كل بطاقة تقرأ من بطاقات العمل والفواتير والقطع.
**الأخطاء.** «اتجاه الإيراد يحتاج فواتير مؤرخة»: بيانات العرض التجريبي بلا تواريخ؛ اربط الواجهة الحية.

### اليوم ← صندوق الاعتمادات
**الغرض.** كل ما ينتظر توقيعك.
**من.** كل دور له حد اعتماد (الحدود في المسرد).
**الحقول.** **بانتظاري**، **فوق حدي**، **حدي**؛ كل صف يعرض العرض والمبلغ ومن رفعه.
**الإجراءات.** اعتماد، رفض مع سبب، أو تصعيد.
**بعدها.** تتغير حالة العرض ويسجل سجل التدقيق المعتمِد. فوق الحد يقرأ الصف **فوق الحد** والإجراء «صعّد إلى مدير».
**الأخطاء.** «أنت من رفع هذا؛ يحتاج معتمِداً آخر» (الفصل بين المهام). «دورك لا يمكنه اعتماد عروض الأسعار». «فشل الاعتماد» / «حدث خطأ. لم يُحفظ شيء» (أعد المحاولة واذكر معرّف الطلب).

### الاستقبال ← المواعيد وتقويم المواعيد
**الغرض.** الحجز ورؤية الزيارات بحسب اليوم. **من.** الاستقبال، المستشار، المدير. **الحقول.** العميل، المركبة، الخدمة، التاريخ والوقت، الخليج. **بعدها.** يظهر الموعد على التقويم وفي **التالي** عند الفني يوم الزيارة.

### الاستقبال ← كشك الاستقبال الذاتي
**الغرض.** يسجّل العميل وصوله وحده على جهاز الكاونتر.
**الحقول.** **عرّف بنفسك** برقم الهاتف أو اللوحة؛ **اختر مركبتك**؛ **اختر الخدمة**.
**الإجراءات.** **ابحث عن مركبتي** ← **تأكيد الاستقبال** ← **اكتمل الاستقبال** مع **رقمك**. **استقبال جديد** يعيد الشاشة. **تبديل اللغة** على الشاشة.
**بعدها.** تُفتح بطاقة عمل عند الاستقبال، وتعرض الشاشة عدّاً تنازلياً لإعادة الضبط.
**الأخطاء.** شارة **وضع العرض التجريبي**: في الذاكرة فقط. **وقت الانتظار المتوقع** يأتي من الخادم فقط.

### الاستقبال ← العملاء والمركبات
**الغرض.** السجل الذي تشير إليه كل بطاقة عمل. **الإجراءات.** **إضافة عميل**؛ **إضافة مركبة جديدة**؛ البحث. **بعدها.** يتاح السجل في الاستقبال وتطبيق العميل. **الأخطاء.** «هذا السجل بلا معرّف فلا يمكن حذفه» (صف تجريبي). «هذا الهاتف مستخدم أصلاً» عند التكرار.

### الاستقبال ← إدارة الأساطيل
**الغرض.** مركبات العقود وحالتها لكل حساب. **من.** مدير الأسطول، مدير الفرع، المحاسب. **الإجراءات.** فتح عقد؛ **تجديد العقد**. **بعدها.** يكتب التجديد صف تدقيق؛ وفواتير العقود تصدر ككل بيع.

### الاستقبال ← ملاحظات العملاء
**الغرض.** ما قاله العملاء بعد التسليم. **الإجراءات.** قراءة وتصفية. لا يُكتب شيء هنا.
