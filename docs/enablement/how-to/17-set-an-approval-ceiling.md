# 17 · Approval ceilings / حدود الاعتماد

**Status today.** Ceilings are **fixed per role** and read-only in the product: Branch Manager `SAR 50,000`, Accountant `SAR 25,000`, Procurement Agent `SAR 20,000`, HR Manager `SAR 15,000`, Storekeeper `SAR 10,000`, Service Advisor `SAR 5,000`; Owner and Super Admin have none; Technician, QC Inspector, Receptionist, Call Center Agent, Supplier and Customer cannot approve. There is no screen that changes a ceiling. `docs/knowledge-base/how-to/customize-workflows.md` §Approval Threshold Configuration describes editable thresholds; see "corrections needed".

**Goal.** Know which ceiling applies to a person and what happens above it.
**Role.** Owner, manager. **Time.** 3 minutes.

**Steps**
1. Administration → Roles & Permissions → **Select a role** → read **Approval limit** (or **No approval rights**).
2. Today → Approval Inbox → read **My ceiling** for the signed-in role.
3. Raise a test estimate above the ceiling (how-to 03): the estimate reads "Above your approval limit" and "Sent to the approval inbox for sign-off."
4. In the inbox of a role whose ceiling is still too low, the row reads **Above my limit** and the action is "escalate to a manager".

**Done when.** You can state the chain for any amount: advisor → manager → owner.
**If it fails.** "Your role cannot approve estimates": the role has no ceiling; that is by design.

**Media block**
- Short, T5. Hook: "Six ceilings. One chain." Beats: 1 "5,000 · 10,000 · 15,000 · 20,000 · 25,000 · 50,000" / 2 "Above it, the inbox" / 3 "The owner has no ceiling, and never approves their own." VO: "Ceilings are part of the role, not a setting someone can quietly raise." CTA: **Book a demo**.
- Photo set: **Approval limit** on Roles & Permissions (1440, en); **My ceiling** in the inbox (1440, ar); "Above your approval limit" on an estimate (1440, en).

---

**الحالة اليوم.** الحدود **ثابتة لكل دور** وللقراءة فقط: مدير الفرع `SAR 50,000`، المحاسب `SAR 25,000`، المشتريات `SAR 20,000`، الموارد البشرية `SAR 15,000`، أمين المستودع `SAR 10,000`، مستشار الخدمة `SAR 5,000`؛ المالك والمشرف العام بلا حد؛ الفني ومفتش الجودة والاستقبال ومركز الاتصال والمورّد والعميل لا يعتمدون. لا شاشة تغيّر الحد.

**الهدف.** معرفة الحد الذي ينطبق على شخص وما يحدث فوقه.
**الدور.** المالك، المدير. **الوقت.** ٣ دقائق.

**الخطوات**
1. الإدارة ← الأدوار والصلاحيات ← **اختر دوراً** ← اقرأ **حد الاعتماد** (أو **بلا صلاحية اعتماد**).
2. اليوم ← صندوق الاعتمادات ← اقرأ **حدي** للدور المسجَّل.
3. ارفع عرضاً تجريبياً فوق الحد (دليل 03): يقرأ العرض «فوق حد اعتمادك» و«أُرسل إلى صندوق الاعتمادات للتوقيع».
4. في صندوق دور حده أدنى من المبلغ يقرأ الصف **فوق حدي** والإجراء «صعّد إلى مدير».

**تكتمل حين** تستطيع ذكر السلسلة لأي مبلغ: المستشار ← المدير ← المالك.
**إن فشلت.** «دورك لا يمكنه اعتماد عروض الأسعار»: الدور بلا حد؛ هذا مقصود.

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «ستة حدود. سلسلة واحدة». اللقطات: ١ «٥٠٠٠ · ١٠٬٠٠٠ · ١٥٬٠٠٠ · ٢٠٬٠٠٠ · ٢٥٬٠٠٠ · ٥٠٬٠٠٠» / ٢ «فوقه، صندوق الاعتمادات» / ٣ «المالك بلا حد، ولا يعتمد عرضه أبداً». التعليق: «الحدود جزء من الدور، لا إعداداً يرفعه أحد بهدوء». الطلب: **احجز عرضاً**.
- مجموعة الصور: حد الاعتماد في الأدوار؛ حدي في الصندوق؛ «فوق حد اعتمادك» على عرض.
