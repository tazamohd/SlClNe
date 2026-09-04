# 16 · Add a user and assign a role / إضافة مستخدم وإسناد دور

Long-form: `docs/knowledge-base/how-to/manage-users-roles.md`. This file is the media companion.

**Status today.** Administration → Users & Teams and Roles & Permissions are **preview screens**: they render with fixture data and **Invite User** / **Create Team** do not write. Users are provisioned by the administrator outside the app (see the deployment notes). Do not film "Invite User" as a working flow. The KB describes creating and editing users as if the screen persisted; see "corrections needed".

**Goal.** Understand what a role gives a person, and where to see it.
**Role.** Owner, super admin. **Time.** 5 minutes.

**Steps**
1. Administration → Roles & Permissions → **Select a role**. Read **Modules visible**, **Approval limit**, **Data scope**, **Fields hidden from this role** ("This role can see every field." for the owner). The **Permission Matrix** is read-only.
2. Administration → Users & Teams. Read the list (**Last Login**, role, branch); **Search users** works on the fixture list.
3. To provision a real user, hand the name, role id and branch to the administrator. The fourteen roles and their ceilings are in `../glossary.md`.
4. When the user signs in, they land on the role's home (README §4) and the sidebar is filtered to what the role can open.

**Done when.** The user signs in and sees only the groups their role can open; a technician never sees "Accounting".
**If it fails.** "No users found" / "No users match the current search.": clear the search. The invite button gives no feedback: expected on the preview screen.

**Media block**
- Short, T5. Hook: "A role is a ceiling, a scope and a list of screens." Beats: 1 "Fourteen roles" / 2 "Approval limit per role" / 3 "Fields hidden, not just screens." VO: "A technician never sees the word Accounting. That is the product, not a setting." CTA: **Book a demo**. Do not show **Invite User**.
- Photo set: Roles & Permissions with a role selected (1440, en); **Fields hidden from this role** (1440, ar); a technician's sidebar without Accounting (390, ar).

---

**الحالة اليوم.** الإدارة ← المستخدمون والفرق، والأدوار والصلاحيات **شاشتا معاينة**: تُعرضان ببيانات ثابتة و**دعوة مستخدم** / **إنشاء فريق** لا يكتبان. يوفّر المسؤول المستخدمين خارج التطبيق. لا تصوّر «دعوة مستخدم» كإجراء يعمل.

**الهدف.** فهم ما يمنحه الدور للشخص وأين تراه.
**الدور.** المالك، المشرف العام. **الوقت.** ٥ دقائق.

**الخطوات**
1. الإدارة ← الأدوار والصلاحيات ← **اختر دوراً**. اقرأ **الوحدات المرئية** و**حد الاعتماد** و**نطاق البيانات** و**الحقول المخفية عن هذا الدور**. **مصفوفة الصلاحيات** للقراءة فقط.
2. الإدارة ← المستخدمون والفرق. اقرأ القائمة (**آخر تسجيل دخول**، الدور، الفرع).
3. لتوفير مستخدم حقيقي، سلّم الاسم ومعرّف الدور والفرع إلى المسؤول. الأدوار الأربعة عشر وحدودها في المسرد.
4. عند تسجيل الدخول يصل المستخدم إلى صفحة دوره ويُصفّى الشريط الجانبي إلى ما يفتحه دوره.

**تكتمل حين** يرى المستخدم مجموعات دوره فقط؛ الفني لا يرى «المحاسبة» أبداً.
**إن فشلت.** «لا مستخدمون»: امسح البحث. زر الدعوة بلا استجابة: متوقع في شاشة المعاينة.

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «الدور حد ونطاق وقائمة شاشات». اللقطات: ١ «أربعة عشر دوراً» / ٢ «حد اعتماد لكل دور» / ٣ «حقول مخفية، لا شاشات فقط». التعليق: «الفني لا يرى كلمة المحاسبة أبداً. هذا هو المنتج لا إعداداً». الطلب: **احجز عرضاً**. لا تعرض **دعوة مستخدم**.
- مجموعة الصور: الأدوار والصلاحيات مع دور مختار؛ الحقول المخفية؛ شريط الفني الجانبي بلا المحاسبة (390).
