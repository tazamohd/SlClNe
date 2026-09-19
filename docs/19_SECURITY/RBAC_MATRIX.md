<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - packages/contract/src/rbac.ts
-->

# RBAC matrix

**Status:** GENERATED · **Source of truth:** `packages/contract/src/rbac.ts` · **Sources as of:** 2026-09-19

30 modules × 15 roles = 450 cells, of which 223 carry at least one grant.

## Grant alphabet

**Six letters, and `x` is export — not delete.**

| Letter | Action |
| --- | --- |
| `v` | view |
| `c` | create |
| `e` | edit |
| `d` | delete |
| `a` | approve |
| `x` | export |

This is not a naming quibble. A router that checked `x` on `DELETE` under the five-letter reading granted delete to every role holding view-plus-export — accountant on the audit log, job cards, estimates and inventory; technician and customer on their portals. Roughly twenty cells, live until it was caught.

## Matrix

| Module | owner | superadmin | manager | advisor | technician | qc | parts | accountant | hr | frontdesk | callcenter | procurement | supplier | customer | test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dashboard | vx | vx | vx | v | v | v | v | vx | v | v | v | v | · | · | vcedax |
| jobcards | vcedax | v | vcedax | vcea | ve | va | v | vx | · | vc | v | · | · | v | vcedax |
| appointments | vcedax | v | vcedax | vced | v | · | · | · | · | vced | vced | · | · | vc | vcedax |
| estimates | vcedax | v | vceax | vce | v | · | v | vx | · | v | v | · | · | v | vcedax |
| customers | vcedax | v | vcedx | vce | v | · | · | vx | · | vce | vce | · | · | · | vcedax |
| vehicles | vcedax | v | vcedx | vce | v | v | · | v | · | vce | v | · | · | v | vcedax |
| inventory | vcedax | v | vcedax | v | v | · | vcedax | vx | · | · | · | vcex | · | · | vcedax |
| procurement | vcedax | v | vcax | · | · | · | vc | vax | · | · | · | vcedax | v | · | vcedax |
| invoices | vcedax | v | vceax | vc | · | · | · | vcedax | · | vc | v | · | · | v | vcedax |
| payments | vcedax | v | vcax | vc | · | · | · | vcedax | · | vc | · | · | · | · | vcedax |
| accounting | vax | v | vx | · | · | · | · | vcedax | · | · | · | · | · | · | vcedax |
| hr | vcedax | v | vx | · | · | · | · | vx | vcedax | · | · | · | · | · | vcedax |
| technicians | vcedax | v | vcedax | v | v | v | · | · | vcedx | v | · | · | · | · | vcedax |
| crm | vcedax | v | vcedx | vce | · | · | · | · | · | · | vced | · | · | · | vcedax |
| callcenter | vx | v | vx | v | · | · | · | · | · | v | vcedx | · | · | · | vcedax |
| reports | vx | vx | vx | v | · | v | vx | vx | vx | · | · | vx | · | · | vcedax |
| approvals | vax | vx | vax | va | · | · | va | vax | va | · | · | vax | · | · | vcedax |
| kiosk | v | v | v | v | · | · | · | · | · | vcex | v | · | · | · | vcedax |
| execreports | vx | vx | vx | · | · | · | · | vx | · | · | · | · | · | · | vcedax |
| portaltech | v | v | v | v | vx | vx | · | · | · | · | · | · | · | · | vcedax |
| portalcustomer | v | v | v | v | · | · | · | · | · | v | v | · | · | vx | vcedax |
| portalsupplier | v | v | v | · | · | · | v | · | · | · | · | v | vx | · | vcedax |
| portalprocure | v | v | v | · | · | · | v | v | · | · | · | vx | · | · | vcedax |
| ai | vcedax | vcedax | vce | v | · | · | · | v | · | · | · | · | · | · | vcedax |
| aiadmin | vcedax | vcedax | · | · | · | · | · | · | · | · | · | · | · | · | vcedax |
| admin | vcedax | vcedax | v | · | · | · | · | · | · | · | · | · | · | · | vcedax |
| settings | vcedax | vcedax | ve | · | · | · | · | · | · | · | · | · | · | · | vcedax |
| superadmin | vcedax | vcedax | · | · | · | · | · | · | · | · | · | · | · | · | vcedax |
| audit | vx | vx | vx | · | · | · | · | vx | · | · | · | · | · | · | vcedax |
| network | vcedax | v | vcedx | · | · | · | vced | · | · | · | · | vcedax | vce | · | vcedax |

## Roles: data scope and approval ceiling

The grant says *which module*. The scope says *which rows*, and it is enforced by row-level security rather than by this table.

| Role | Data scope | Approval ceiling |
| --- | --- | --- |
| owner | all | unlimited |
| superadmin | platform | unlimited |
| manager | branch | SAR 50,000 (5,000,000 halalas) |
| advisor | branch | SAR 5,000 (500,000 halalas) |
| technician | own | may not approve |
| qc | branch | may not approve |
| parts | branch | SAR 10,000 (1,000,000 halalas) |
| accountant | all | SAR 25,000 (2,500,000 halalas) |
| hr | all | SAR 15,000 (1,500,000 halalas) |
| frontdesk | branch | may not approve |
| callcenter | all | may not approve |
| procurement | all | SAR 20,000 (2,000,000 halalas) |
| supplier | external | may not approve |
| customer | self | may not approve |
| test | all | unlimited |

## Segregation of duties

| Duty A | Duty B | Risk |
| --- | --- | --- |
| Raise purchase order | Approve purchase order | high |
| Create supplier | Approve supplier payment | high |
| Post journal entry | Approve journal entry | high |
| Perform repair | Pass quality check | high |
| Issue stock | Adjust stock count | medium |
| Create employee | Approve payroll run | medium |

## Field-level redaction

| Field | Arabic | Hidden from |
| --- | --- | --- |
| Part cost / margin | تكلفة القطعة / الهامش | advisor, technician, qc, frontdesk, callcenter, customer, supplier |
| Labour cost rate | تكلفة أجر العمل | technician, qc, frontdesk, callcenter, customer, supplier |
| Employee salary | راتب الموظف | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |
| Supplier purchase price | سعر الشراء من المورد | advisor, technician, qc, frontdesk, callcenter, customer |
| Customer contact details | بيانات اتصال العميل | technician, qc, supplier |
| Bank account details | بيانات الحساب البنكي | advisor, technician, qc, parts, frontdesk, callcenter, hr, procurement, supplier, customer |
| Branch P&L | أرباح وخسائر الفرع | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |
| Inspection internal notes | ملاحظات الفحص الداخلية | customer, supplier |
