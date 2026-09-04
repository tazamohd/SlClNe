# SALIS AUTO — Enablement Index / فهرس التمكين

| Field | Value |
|---|---|
| Document ID | SA-ENB-000 |
| Date | 2026-09-04 |
| Ground truth | `app/src/data/nav-journey.ts` (sidebar order), `app/src/data/generated/master-registry.ts` (screen state), `app/src/screens/**` (exact labels) |
| Voice | `docs/brand-guidelines.md` §2 |

This is the single index over three layers. **`docs/training/`** holds the role courses (modules, labs, quizzes). **`docs/knowledge-base/`** holds how-tos, the library, references and troubleshooting. **`docs/enablement/`** (this folder) is the media-ready layer on top: the first-week plan per role, the screen-by-screen manual with exact labels, the task guides with media blocks, and the glossary. Nothing here rewrites a course; it links to the module and adds what a camera needs.

## English

### Layer 1 · Role courses (`docs/training/`)

| Course | Modules | First-week plan |
|---|---|---|
| `program-overview.md` | Tracks, delivery, demo environment, rollout | — |
| `owner-ceo-course.md` | Dashboard & KPIs · Approvals & controls · Reports | `training-guide.md` §Owner |
| `manager-course.md` | Branch setup · Workshop operations · Team · Approvals · Reports | `training-guide.md` §Manager |
| `service-advisor-course.md` | Reception & check-in · Inspection · Estimates & approvals · Job management · Appointments | `training-guide.md` §Service advisor |
| `technician-course.md` | Job assignment · Repair workflow · Parts requests · Documentation & handoff | `training-guide.md` §Technician |
| `qc-inspector-course.md` | QC checklist · Pass/fail · QC reporting | `training-guide.md` §QC |
| `finance-course.md` | Chart of accounts · Invoicing & ZATCA · Payments · Parts inventory · Procurement · Reporting | `training-guide.md` §Accountant |
| `admin-course.md` | Platform admin · RBAC · System configuration · Security & audit | `training-guide.md` §Administrator |
| `support-staff-course.md` | Front desk · Call centre · HR · CRM · Communication | `training-guide.md` §Front desk |
| `supplier-course.md`, `customer-course.md` | External portals | how-to 05, 24 |
| `assessment-bank.md`, `certification-framework.md`, `train-the-trainer.md` | Assessment and delivery | Trainer's notes in `training-guide.md` |

No course exists for the **fleet manager**; the first-week plan in `training-guide.md` §Fleet manager stands alone until one is written.

### Layer 2 · Knowledge base (`docs/knowledge-base/`)

| Folder | Use |
|---|---|
| `how-to/` | Six long-form guides: branches, workflows, reports, inventory, users and roles, integrations. Each has a media companion in `enablement/how-to/` that adds the exact-label check and the media block. |
| `library/` | Practice articles (SOPs, QC standards, ZATCA checklist, market guide). Source for long-form video and carousels. |
| `reference/` | Screen catalog, RBAC matrix, data dictionary, FAQ, glossary, configuration. |
| `troubleshooting/` | Common issues, error codes, integration and performance issues. |

### Layer 3 · Media-ready (`docs/enablement/`)

| File | One line | Converts to |
|---|---|---|
| `training-guide.md` | First week per role, day by day: session, objective, screens (Group → Item), three tasks, pass check, trainer's notes, link to the course module | Video course (one session = one 6–10 min video); day cards as carousels |
| `user-manual.md` + `manual/01…05` | Per screen in sidebar order: purpose, who, fields, exact buttons, what happens after, errors and fixes; appendix of preview screens | Help-centre articles; one screen = one photo set |
| `how-to/01…24` | One task each: goal, role, time, steps with exact labels, done-when, if-it-fails, **Media block** (short + photo set) | Shorts 20–30 s (T5 story, A5 reel cover), photo sets, one carousel per task |
| `glossary.md` | House terms, ZATCA vocabulary in official Arabic, roles and ceilings | Caption cards, subtitle glossary |

### How a document becomes media

| Media | Source | Rule |
|---|---|---|
| Short (20–30 s) | Media block of a how-to | One task, one short. On-screen text carries the message with the sound off. |
| Photo set | Photo set list of a how-to; per-screen entries in the manual | 1440 desktop or 390 phone, in the post's language. Demo records only. |
| Video (6–10 min) | One session of the first-week plan, with the course module as the script | Objective first, three tasks on screen, pass check as the last frame. |
| Carousel (7 slides) | Steps of a how-to, one per slide, T7 cover | Steps are one action each; no rewriting. |

### Rules for every conversion
- Every number carries its baseline or is cut. No invented figures.
- No customer names, plates or faces without written consent. Demo records only.
- Palette law: no green, red, yellow, purple, pink or teal in any frame.
- No exclamation marks, no emoji; buttons are verb + object.
- Arabic is written for Arabic; an Arabic short uses the Arabic beats.
- A screen marked preview in the manual's appendix is never shown as working.

## العربية

فهرس واحد لثلاث طبقات. **`docs/training/`** دورات الأدوار (وحدات، تطبيق عملي، اختبارات). **`docs/knowledge-base/`** أدلة الإجراءات والمكتبة والمراجع وحل المشكلات. **`docs/enablement/`** (هذا المجلد) الطبقة الجاهزة للوسائط فوقهما: خطة الأسبوع الأول لكل دور، دليل الشاشات بنص الأزرار، أدلة المهام مع كتل الوسائط، والمسرد. لا شيء هنا يعيد كتابة دورة؛ بل يربط بالوحدة ويضيف ما تحتاجه الكاميرا.

| الملف | سطر واحد | يتحول إلى |
|---|---|---|
| `training-guide.md` | الأسبوع الأول لكل دور يوماً بيوم: الجلسة، الهدف، الشاشات (المجموعة ← العنصر)، ثلاث مهام، اختبار الاجتياز، ملاحظات المدرب، رابط وحدة الدورة | دورة فيديو (كل جلسة فيديو من 6 إلى 10 دقائق)؛ بطاقات الأيام منشورات متعددة الشرائح |
| `user-manual.md` + `manual/01…05` | لكل شاشة بترتيب الشريط الجانبي: الغرض، من، الحقول، الأزرار بنصها، ما يحدث بعدها، الأخطاء وحلولها؛ ملحق شاشات المعاينة | مقالات مركز المساعدة؛ كل شاشة مجموعة صور |
| `how-to/01…24` | مهمة واحدة: الهدف، الدور، الوقت، الخطوات بنص الأزرار، متى تكتمل، إن فشلت، **كتلة الوسائط** (مقطع قصير + مجموعة صور) | مقاطع 20–30 ث (T5 وA5)، مجموعات صور، منشور متعدد الشرائح لكل مهمة |
| `glossary.md` | المصطلحات المعتمدة، مفردات الهيئة بصيغتها الرسمية، الأدوار وحدود الاعتماد | بطاقات تعليق، مسرد الترجمة |

قواعد كل تحويل: الرقم يحمل أساس قياسه أو يُحذف؛ لا أسماء عملاء ولا لوحات ولا وجوه دون إذن كتابي؛ لا أخضر ولا أحمر ولا أصفر ولا بنفسجي ولا وردي ولا أزرق مخضر؛ لا علامات تعجب ولا رموز تعبيرية؛ العربية تُكتب للعربية؛ وشاشة المعاينة لا تُعرض أبداً كأنها تعمل.

لا توجد دورة لمدير الأسطول؛ خطة الأسبوع الأول له في `training-guide.md` تقف وحدها حتى تُكتب.
