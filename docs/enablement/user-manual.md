# User Manual — Index / دليل المستخدم — الفهرس

| Field | Value |
|---|---|
| Document ID | SA-ENB-002 |
| Order | The sidebar journey in `app/src/data/nav-journey.ts` |
| Companion | `docs/knowledge-base/reference/screen-catalog.md` (every screen), `docs/knowledge-base/troubleshooting/` (deeper fixes) |
| Rule | Only screens whose registry state is rendering without the `MOCK_ONLY` flag are documented as working. The rest are listed in the appendix of the relevant part as preview. |

Per screen: purpose in one sentence, who uses it, the fields that matter, actions with their exact labels, what the system does after, and the errors you may see with the exact message and the fix. English then Arabic, under 150 words per language.

| Part | Groups | File |
|---|---|---|
| 1 | Today · Front Desk | `manual/01-today-front-desk.md` |
| 2 | Workshop | `manual/02-workshop.md` |
| 3 | Parts · Billing | `manual/03-parts-billing.md` |
| 4 | Accounting · Reports · Growth | `manual/04-accounting-reports-growth.md` |
| 5 | People · Portals · AI Platform · Administration · Account | `manual/05-people-portals-ai-admin.md` |

## Preview screens (render, do not persist or compute) / شاشات المعاينة

Listed once here so every part can point at it. These render their layout with fixture data; actions on them do not write anything.

| Group | Screen | Route |
|---|---|---|
| Today | Notifications | `/notification-center` |
| Parts | Parts Network, Parts Supply Network | `/parts-network`, `/parts-supply-network` |
| Accounting | Financial Statements, Financial Reports | `/financial-statements`, `/financial-reports` |
| Reports | Insurance Reports, Loan Reports | `/insurance-reports`, `/loan-reports` |
| Portals | Procurement Portal, Call Center, Call Logs | `/procurement-portal`, `/call-center`, `/call-center/logs` |
| AI Platform | AI Assistant, Prompt Library, Knowledge Base, Workflow Builder, Model Settings, AI Analytics | `/aiassistant`, `/prompt-library`, `/knowledge-base`, `/workflow-builder`, `/model-settings`, `/aianalytics` |
| Administration | Organizations, Users & Teams, Roles & Permissions, Templates, Automation Rules, Audit Log, Backup & Export, Advanced Settings, Subscription, Global Search, Super Admin | see part 5 |
| Account | Settings, Profile | `/settings`, `/profile` |

الشاشات أعلاه تعرض تخطيطها ببيانات ثابتة؛ الإجراءات فيها لا تكتب شيئاً. تُذكر مرة هنا لتشير إليها كل الأجزاء.
