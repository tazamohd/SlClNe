# Manual Part 5 — People · Portals · AI Platform · Administration · Account / الأشخاص · البوابات · منصة الذكاء الاصطناعي · الإدارة · الحساب

Index: `../user-manual.md`. Preview screens in these groups are many; they are listed in the appendix below and in `../user-manual.md`. Long-form: `docs/knowledge-base/how-to/manage-users-roles.md`, `configure-branches.md`, `setup-integrations.md`.

## English

### People → HR & Payroll · `/hrpayroll` and Payroll Management
**Purpose.** "People, payroll and leave at a glance"; monthly runs and their lines.
**Who.** HR manager (`SAR 15,000` ceiling), accountant, owner.
**Fields.** **Net pay** ("computed on the server as gross + allowances − deductions"), **Period (YYYY-MM)**, run state **Draft — not yet posted**, **Leave awaiting a decision**.
**Actions.** **Open payroll**; **New payroll run** / **New draft run**; **Add payroll line** ("Select an employee"); post; **Review all** leave.
**After.** **Draft run created**; **Line added**; **Payroll run posted**. A posted run cannot be edited; corrections are a reversal, also on the audit trail.
**Errors.** "Add at least one line before posting." "Cannot post this run." "No employees are loaded to line up." "Connect a live API to create a run." "Could not create the run" / "Could not add the line" / "Posting failed" (retry with the request id).

### Portals → Technician Portal · `/technician-portal`
**Purpose.** The technician's phone: today's work, time clock, parts.
**Fields.** **Current Job**, **Up Next**, **On shift**, **Jobs Today**, **Hours Logged**; time clock **Clock In**, **Clock In/Out**, **Elapsed**, **Break Used**, status **On Shift** / **Off Shift**.
**Actions.** **Open Job**; **Request parts**; **Add photo**.
**After.** A parts request reaches the storekeeper; clock punches appear in the history with **Date**, **Time**, **Action**.
**Errors.** "No jobs assigned to you — Jobs appear here as soon as the workshop assigns one to you." "Nothing scheduled today."

### Portals → Customer Portal · `/customer-portal` and the customer app
**Purpose.** The customer's own view: **My Vehicles**, **My Bookings**, **My Orders**, **My Garage**.
**Actions.** **Book Service**; **Approve estimate**; **Add Vehicle** ("Enter a plate like ABC 1234."); **Download or share** an invoice.
**After.** Approval signs the estimate after the one-time code; **In Service** and **Ready for Delivery** track the job.
**Errors.** "Enter the make and model." (required field). Finance and claims tiles ("Apply for Finance", "File a Claim", "No active finance") belong to planned lines and lead to the team, not to a flow.

### Portals → Supplier Portal · `/supplier-portal`
**Purpose.** "Manage your purchase orders."
**Fields.** **Order #**, **Total (SAR)**, status.
**Actions.** Search orders; open an order; confirm it.
**Errors.** "No orders found" / "No orders match the current filters."

### Administration → Branches · `/branches`
**Purpose.** The locations of the organisation.
**Who.** Owner, super admin (create and edit), manager (view).
**Fields.** Name, city, main branch, status, **Monthly Revenue**.
**Actions.** **Add Branch**; **Search branches**.
**After.** New branch is selectable on users and job cards.
**Errors.** "No branches found" / "No branches match the current search."

### Administration → Integrations · `/integrations` and System Integrations
**Purpose.** ZATCA reporting, payments, SMS, email, OBD.
**Actions.** Connect a provider with its credentials; read status.
**After.** SMS-dependent features (customer approval code, campaigns) become live.
**Errors.** "Not connected" on dependent screens until configured.

### Account → language and theme
**Purpose.** Every user switches from the top bar.
**Actions.** **Switch language** (English ⇄ العربية; the document flips to RTL) and **Toggle theme**.
**After.** The choice persists on the device.

### Preview screens in these groups
Notifications; Procurement Portal; Call Center and Call Logs; AI Assistant ("Connect the API" is its state today), Prompt Library, Knowledge Base, Workflow Builder, Model Settings, AI Analytics; Organizations, Users & Teams (**Invite User**, **Create Team** are not wired), Roles & Permissions (**Permission Matrix**, **Approval limit**, **Data scope** are read-only), Templates, Automation Rules, Audit Log, Backup & Export, Advanced Settings, Subscription, Global Search, Super Admin; Settings (**Workshop Profile**, **Reset demo data** works in the demo only), Profile.

## العربية

### الأشخاص ← الموارد البشرية والرواتب وإدارة الرواتب
**الغرض.** «الأشخاص والرواتب والإجازات في لمحة»؛ الدورات الشهرية وبنودها. **من.** مدير الموارد البشرية (حد `SAR 15,000`)، المحاسب، المالك. **الحقول.** **صافي الراتب** («يُحسب في الخادم: الإجمالي + البدلات − الخصومات»)، **الفترة (YYYY-MM)**، الحالة **مسودة — لم تُرحَّل بعد**. **الإجراءات.** **فتح الرواتب**؛ **دورة رواتب جديدة**؛ **إضافة بند رواتب**؛ الترحيل. **بعدها.** **أُنشئت مسودة الدورة**؛ **أُضيف البند**؛ **رُحّلت دورة الرواتب**. الدورة المرحَّلة لا تُعدَّل؛ التصحيح قيد عكسي مسجَّل في سجل التدقيق. **الأخطاء.** «أضف بنداً واحداً على الأقل قبل الترحيل». «لا يمكن ترحيل هذه الدورة». «لا موظفين محمَّلين». «اربط واجهة حية لإنشاء دورة». «فشل الترحيل».

### البوابات ← بوابة الفني
**الغرض.** هاتف الفني: عمل اليوم، ساعة الدوام، القطع. **الحقول.** **العمل الحالي**، **التالي**، **على رأس العمل**؛ الساعة: **تسجيل الدخول**، **تسجيل الدخول/الخروج**، **المنقضي**، **الاستراحة المستخدمة**. **الإجراءات.** **فتح العمل**؛ **طلب قطع**؛ **إضافة صورة**. **الأخطاء.** «لا أعمال مسنَدة إليك؛ تظهر هنا فور إسناد الورشة عملاً إليك».

### البوابات ← بوابة العميل وتطبيق العميل
**الغرض.** رؤية العميل: **مركباتي**، **حجوزاتي**، **طلباتي**. **الإجراءات.** **حجز خدمة**؛ **اعتماد عرض السعر**؛ **إضافة مركبة** («أدخل لوحة مثل ABC 1234»)؛ **تنزيل أو مشاركة** الفاتورة. **بعدها.** الاعتماد يوقّع العرض بعد الرمز لمرة واحدة. بطاقات التمويل والمطالبات تخص خطوطاً مخططة وتقود إلى الفريق لا إلى إجراء.

### البوابات ← بوابة المورّد
**الغرض.** «إدارة أوامر الشراء». **الحقول.** **رقم الأمر**، **الإجمالي (SAR)**، الحالة. **الإجراءات.** البحث؛ فتح أمر؛ تأكيده.

### الإدارة ← الفروع
**الغرض.** مواقع المنشأة. **من.** المالك والمشرف العام (إنشاء وتعديل)، المدير (عرض). **الإجراءات.** **إضافة فرع**؛ **البحث في الفروع**. **بعدها.** الفرع الجديد قابل للاختيار في المستخدمين وبطاقات العمل.

### الإدارة ← التكاملات
**الغرض.** إبلاغ الهيئة، المدفوعات، الرسائل، البريد، OBD. **بعدها.** تصبح الميزات المعتمدة على الرسائل حية. **الأخطاء.** «غير متصل» على الشاشات المعتمدة حتى الإعداد.

### الحساب ← اللغة والمظهر
**الإجراءات.** **تبديل اللغة** (ينقلب المستند إلى اليمين) و**تبديل المظهر** من الشريط العلوي. **بعدها.** يبقى الاختيار على الجهاز.

### شاشات المعاينة في هذه المجموعات
الإشعارات؛ بوابة المشتريات؛ مركز الاتصال وسجلاته؛ المساعد الذكي («اربط الواجهة» حالته اليوم) ومكتبة الأوامر وقاعدة المعرفة ومنشئ سير العمل وإعدادات النماذج وتحليلات الذكاء الاصطناعي؛ المنشآت، المستخدمون والفرق (**دعوة مستخدم** و**إنشاء فريق** غير موصولين)، الأدوار والصلاحيات (**مصفوفة الصلاحيات** و**حد الاعتماد** و**نطاق البيانات** للقراءة فقط)، القوالب، قواعد الأتمتة، سجل التدقيق، النسخ الاحتياطي، الإعدادات المتقدمة، الاشتراك، البحث الشامل، المشرف العام؛ الإعدادات (**ملف الورشة**؛ **إعادة ضبط بيانات العرض** يعمل في العرض التجريبي فقط)، الملف الشخصي.
