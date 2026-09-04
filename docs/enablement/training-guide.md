# First-Week Training Plan / خطة تدريب الأسبوع الأول

| Field | Value |
|---|---|
| Document ID | SA-ENB-001 |
| Companion to | `docs/training/*-course.md` (modules, labs, quizzes) and `docs/training/train-the-trainer.md` (delivery) |
| Sessions | 30–60 minutes, one per half-day, on the demo environment described in `program-overview.md` §5 |
| Pass rule | A session is passed when the trainee completes the three tasks unaided and the check holds |

Each session: objective, screens as the sidebar shows them (Group → Item), three tasks the trainee completes, the check, trainer's notes, and the how-to that carries the media block. Saudi working week: Sunday to Thursday.

## English

### Owner / GM · `owner-ceo-course.md`

| Day | Session | Objective | Screens | Three tasks | Check | Trainer's notes |
|---|---|---|---|---|---|---|
| Sun | Read the day (45 min) · Module 1 | Read the bay board and the four KPI tiles | Today → Dashboard | Find the job in **Awaiting parts**; open it with **View All**; filter **Job Status** | Names the stage of every bay without help | Owners try to edit from the dashboard; it reads, the job card writes. How-to 19. |
| Mon | Approve what only you can (45 min) · Module 2 | Use the ceiling and the approval inbox | Today → Approval Inbox; Workshop → Estimates | Open **Awaiting me**; approve one estimate; read **Above limit** on one raised by a manager | Explains why one estimate says **You raised this** | The owner has no ceiling; the trap is approving their own estimate. How-to 04. |
| Tue | Money in (45 min) · Module 2 | Follow an invoice to a receipt | Billing → Invoices, Payments, Receipts | Open an issued invoice; **Raise receipt**; find it under Receipts | States that a receipt stays pending until money clears | Payments need the live API; in demo, read the copy on screen. How-to 10. |
| Wed | The VAT view (30 min) · Module 3 | Read the output VAT the server charged | Accounting → Tax Management | Set a date range; read **Output VAT**; search one invoice | Explains "rounded once, half-up, at the last halala" | Input VAT is **Not modelled**; say so before they ask. How-to 14. |
| Thu | Branches and people (45 min) · Module 3 | See the organisation shape | Administration → Branches; People → HR & Payroll | Search branches; open **Open payroll**; read **Draft — not yet posted** | Knows which screens are preview | Users & Teams and Roles & Permissions are preview screens; the ceilings are fixed per role. How-to 15, 16, 17. |

### Branch manager · `manager-course.md`

| Day | Session | Objective | Screens | Three tasks | Check | Trainer's notes |
|---|---|---|---|---|---|---|
| Sun | Bay board and team (45 min) · Module 2 | Run the morning from the dashboard | Today → Dashboard; Workshop → Technician Schedule | Read **Team today**; **Assign Job** to a technician; return to the board | Every bay has a name | Assign from the schedule, not from the job card; the card only shows **Assigned Technician**. How-to 06. |
| Mon | Estimate to approval (60 min) · Module 4 | Clear the approval inbox within the ceiling | Today → Approval Inbox | Approve one under `SAR 50,000`; escalate one above; reject one with a reason | Can say what **Above my limit** means | The escalation path is "escalate to a manager"; for a manager that means the owner. How-to 04. |
| Tue | QC gate (45 min) · Module 2 | Enforce segregation of duties | Workshop → Job Cards → QC | **Send to Quality Check**; attempt **Approve QC** as the same technician; sign as QC | Reads the **Audit trail** aloud | The conflict message is exact: "The technician who performed the repair cannot pass its quality check." How-to 12. |
| Wed | Parts under minimum (45 min) · Module 2 | Watch a reorder become a purchase order | Parts → Inventory; Purchase Orders | Open **Low Stock Items**; **Create Purchase Order**; **Add Item** from the alert list | Order total is previewed, VAT on the total | Suppliers come from the directory; no free-typed names. How-to 08. |
| Thu | Reports (30 min) · Module 5 | Read operational and workshop reports | Reports → Operational Reports; Workshop → Workshop Reports | Pick a period; read throughput; export | Names the baseline for any number quoted | Financial Statements and Financial Reports are preview. KB how-to `generate-reports.md`. |

### Service advisor · `service-advisor-course.md`

| Day | Session | Objective | Screens | Three tasks | Check | Trainer's notes |
|---|---|---|---|---|---|---|
| Sun | Check-in (45 min) · Module 1 | Open a job card from the counter | Workshop → Job Cards → **New Job Card** | Fill **Plate**, **Make & Model**, **Odometer Reading**; describe **Reported Issues**; **Complete Check-In** | **Draft saved** appears before completion | Photo capture has no storage endpoint in this build; skip it. How-to 01. |
| Mon | Inspection and estimate (60 min) · Modules 2–3 | Turn findings into a priced estimate | Job card → Inspection; Estimate | Mark **Pass** / **Fail** per check; **Submit Inspection**; add **Parts** and **Labor** lines | **Grand Total** shows VAT (15%) | An advisor's ceiling is `SAR 5,000`; above it the estimate goes for sign-off. How-to 02, 03. |
| Tue | Customer approval (45 min) · Module 3 | Get the signature from the phone | Estimate → **Send to Customer**; Workshop → Customer Approval | Send; open the **Secure link**; enter the **One-time code**; read **Signed and authorised** | Knows SMS is **Not connected** in demo | Never approve on the customer's behalf. How-to 04, 05. |
| Wed | Appointments and kiosk (45 min) · Module 5 | Take a booking and a self check-in | Front Desk → Appointments; Kiosk Check-In | Book; run **Self Check-In** with a plate; read **Your number** | Kiosk resets on its own after idle | Kiosk shows **Demo mode**; wait times only come from the server. How-to 22. |
| Thu | Delivery (45 min) · Module 4 | Close the job and hand over | Job card → Delivery; Signature | Complete the **Delivery Checklist**; **Confirm Signature**; **Print Delivery Note** | Totals show only once invoiced | Invoice first, then deliver. How-to 12. |

### Technician · `technician-course.md`

| Day | Session | Objective | Screens | Three tasks | Check | Trainer's notes |
|---|---|---|---|---|---|---|
| Sun | Your portal (30 min) · Module 1 | Find today's work on a phone | Portals → Technician Portal | Read **Current Job**; **Open Job**; read **Up Next** | Finds the bay without asking | Phone at 390 px; one hand. How-to 19. |
| Mon | Time clock (30 min) · Module 1 | Clock in and out | Technician Portal → Time Clock | **Clock In**; read **Elapsed**; **Clock In/Out** at the end | Status reads **On Shift** then **Off Shift** | Break time shows as **Break Used**. How-to 23. |
| Tue | Parts from the job (45 min) · Module 3 | Request parts without leaving the card | Technician Portal → job → **Request parts** | Request; **Add photo**; read the reservation note | Storekeeper sees the request | Photo needs the storage endpoint; note it. How-to 07. |
| Wed | Hand to QC (45 min) · Module 4 | Finish the repair correctly | Job card → **Send to Quality Check** | Send; try **Approve QC**; read the conflict | Repeats the segregation rule | The technician never passes their own QC. How-to 12. |
| Thu | Knowledge base (30 min) · Module 2 | Look up a procedure | Workshop → Technician Knowledge Base | Search; open; return to the job | Finds a guide in under a minute | Portal guides are static reference. |

### QC inspector · `qc-inspector-course.md`
One day is enough: Sun **QC Checklist** (Module 1), Mon **Pass/fail** with **Return to Repair** (Module 2), Tue **Audit trail** reading (Module 3). How-to 12 carries the media block.

### Accountant · `finance-course.md`

| Day | Session | Objective | Screens | Three tasks | Check | Trainer's notes |
|---|---|---|---|---|---|---|
| Sun | Invoice from a job card (60 min) · Module 2 | Issue a ZATCA invoice | Billing → Invoices → **New Invoice** | **From job card**; **Save draft**; **Issue invoice** | Reads "can no longer be edited" | Number is assigned on save; the server prices it. How-to 09. |
| Mon | Payments and receipts (45 min) · Module 3 | Record money against an invoice | Billing → Payments; Receipts | **Raise receipt**; select **Payment Method**; read **Balance due** | Receipt is pending until cleared | Writes need the API; demo shows the exact copy. How-to 10. |
| Tue | Corrections (30 min) · Module 2 | Handle a wrong invoice | Invoice → actions | Cancel a draft; read **Not issued** vs **Invoice cancelled** | Knows credit notes are not available today | See how-to 11 before promising a credit note. |
| Wed | VAT return (45 min) · Module 6 | Export the period | Accounting → Tax Management | Range; **Output VAT by invoice**; export | Names the rate as **Standard rate (ZATCA)** | Input VAT is not modelled. How-to 14. |
| Thu | Payroll (45 min) · support-staff-course Module 3 | Post a run | People → HR & Payroll → **Open payroll** | **New payroll run**; **Add payroll line**; post | Reads **Payroll run posted** | A posted run cannot be edited; corrections are a reversal. How-to 13. |

### Fleet manager · no course yet

| Day | Session | Objective | Screens | Three tasks | Check | Trainer's notes |
|---|---|---|---|---|---|---|
| Sun | Fleet accounts (45 min) | Read contract vehicles | Front Desk → Fleet Management | Open a contract; read **Contract Status**; find vehicles under it | Names due and overdue vehicles | Fleet runs inside Garage today. How-to 18. |
| Mon | Contract renewal (30 min) | Renew and read the audit row | Fleet Contract → **Renew Contract** | Renew; read the trail; return | Explains what changed | Write a fleet course after this week; note gaps. |
| Tue | Reports (30 min) | Utilisation and cost per vehicle | Reports → Operational Reports | Filter by fleet account; export | Quotes a number with its period | |

### Front desk · `support-staff-course.md` Module 1
Sun **Appointments** and **Customers → Add Customer**; Mon **Vehicles → Add New Vehicle**; Tue **Kiosk Check-In** (how-to 22); Wed language and theme for the counter tablet (how-to 21).

### Administrator · `admin-course.md`
Sun **Branches → Add Branch** (how-to 15, KB `configure-branches.md`); Mon **Integrations** (KB `setup-integrations.md`); Tue Users, roles and ceilings, stated as preview (how-to 16, 17); Wed **Settings** workshop profile (how-to 21).

## العربية

كل جلسة: الهدف، الشاشات كما يعرضها الشريط الجانبي (المجموعة ← العنصر)، ثلاث مهام يكملها المتدرب، اختبار الاجتياز، ملاحظات المدرب، ودليل المهمة الذي يحمل كتلة الوسائط. أسبوع العمل من الأحد إلى الخميس. الدورات الكاملة في `docs/training/`.

### المالك / المدير العام

| اليوم | الجلسة | الهدف | الشاشات | المهام الثلاث | الاجتياز | ملاحظات المدرب |
|---|---|---|---|---|---|---|
| الأحد | قراءة اليوم (45 د) | قراءة لوحة الخلجان ومؤشرات الأداء الأربعة | اليوم ← لوحة التحكم | إيجاد العمل الذي حالته **بانتظار القطع**؛ فتحه عبر **عرض الكل**؛ تصفية **حالة العمل** | يسمّي مرحلة كل خليج دون مساعدة | يحاول الملاك التعديل من لوحة التحكم؛ هي تقرأ وبطاقة العمل تكتب. دليل 19. |
| الاثنين | اعتماد ما لا يعتمده غيرك (45 د) | حد الاعتماد وصندوق الاعتمادات | اليوم ← صندوق الاعتمادات؛ الورشة ← عروض الأسعار | فتح **بانتظاري**؛ اعتماد عرض؛ قراءة **فوق الحد** على عرض رفعه مدير | يشرح لماذا يقول عرض **أنت من رفعه** | لا حد للمالك؛ الفخ أن يعتمد عرضه هو. دليل 04. |
| الثلاثاء | الأموال الواردة (45 د) | من الفاتورة إلى سند القبض | الفوترة ← الفواتير، المدفوعات، سندات القبض | فتح فاتورة صادرة؛ **إصدار سند قبض**؛ إيجاده | يذكر أن السند يبقى معلقاً حتى تصل الأموال | المدفوعات تحتاج الواجهة الحية؛ في العرض التجريبي اقرأ النص على الشاشة. دليل 10. |
| الأربعاء | ضريبة القيمة المضافة (30 د) | قراءة ضريبة المخرجات التي احتسبها الخادم | المحاسبة ← إدارة الضرائب | تحديد فترة؛ قراءة **ضريبة المخرجات**؛ البحث عن فاتورة | يشرح «تُقرَّب مرة واحدة عند آخر هللة» | ضريبة المدخلات **غير مُنمذجة**؛ قلها قبل أن يسألوا. دليل 14. |
| الخميس | الفروع والناس (45 د) | شكل المنشأة | الإدارة ← الفروع؛ الأشخاص ← الموارد البشرية والرواتب | البحث في الفروع؛ **فتح الرواتب**؛ قراءة **مسودة — لم تُرحَّل بعد** | يعرف أي الشاشات معاينة | المستخدمون والفرق، والأدوار والصلاحيات شاشات معاينة؛ الحدود ثابتة لكل دور. أدلة 15، 16، 17. |

### مدير الفرع
الأحد: لوحة الخلجان والفريق (**إسناد عمل** من جدول الفنيين؛ دليل 06). الاثنين: من عرض السعر إلى الاعتماد ضمن حد `SAR 50,000` (دليل 04). الثلاثاء: بوابة الجودة والفصل بين المهام (دليل 12). الأربعاء: القطع دون الحد الأدنى وأمر الشراء (دليل 08). الخميس: التقارير التشغيلية وتقارير الورشة؛ القوائم المالية والتقارير المالية معاينة.

### مستشار الخدمة
الأحد: الاستقبال وبطاقة العمل (**إكمال الاستقبال**؛ دليل 01). الاثنين: الفحص وعرض السعر (**تقديم الفحص**، بنود القطع والأجرة؛ حد المستشار `SAR 5,000`؛ دليلا 02، 03). الثلاثاء: اعتماد العميل من هاتفه (**إرسال إلى العميل**، الرمز لمرة واحدة؛ دليلا 04، 05). الأربعاء: المواعيد وكشك الاستقبال الذاتي (دليل 22). الخميس: التسليم والتوقيع بعد الفوترة (دليل 12).

### الفني
الأحد: بوابة الفني على الهاتف (**العمل الحالي**، **فتح العمل**؛ دليل 19). الاثنين: ساعة الدوام (**تسجيل الدخول**، **على رأس العمل**؛ دليل 23). الثلاثاء: طلب القطع من بطاقة العمل (**طلب قطع**؛ دليل 07). الأربعاء: الإرسال إلى مراقبة الجودة وقراءة رسالة التعارض (دليل 12). الخميس: قاعدة معرفة الفنيين.

### مفتش الجودة
يوم واحد يكفي: قائمة الفحص، اجتياز/إخفاق مع **الإرجاع إلى الإصلاح**، وقراءة سجل التدقيق. دليل 12.

### المحاسب
الأحد: فاتورة من بطاقة العمل (**من بطاقة العمل**، **حفظ المسودة**، **إصدار الفاتورة**؛ دليل 09). الاثنين: المدفوعات وسندات القبض (دليل 10). الثلاثاء: التصحيحات، والإشعار الدائن غير متاح اليوم (دليل 11). الأربعاء: إقرار الضريبة من إدارة الضرائب (دليل 14). الخميس: ترحيل دورة الرواتب (دليل 13).

### مدير الأسطول (لا دورة بعد)
الأحد: حسابات الأساطيل وحالة العقد (دليل 18). الاثنين: **تجديد العقد** وقراءة سجل التدقيق. الثلاثاء: التقارير التشغيلية بحسب حساب الأسطول. تُكتب دورة كاملة بعد هذا الأسبوع.

### الاستقبال والمسؤول
الاستقبال: المواعيد، **إضافة عميل**، **إضافة مركبة جديدة**، الكشك (دليل 22)، اللغة والمظهر (دليل 21). المسؤول: **إضافة فرع** (دليل 15)، التكاملات، المستخدمون والأدوار وحدود الاعتماد بوصفها معاينة (دليلا 16، 17)، ملف الورشة في الإعدادات (دليل 21).
