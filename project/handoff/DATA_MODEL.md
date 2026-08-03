# Data Model — SALIS AUTO

Entities extracted from `gms-data.js` (36 mock tables) plus platform-scope tables Claude Code needs to add.

Use these as **DB schema hints, not verbatim shapes** — the mock data drops a few production fields (audit stamps, soft-delete, tenant id) that every real row needs.

## Universal fields on every table

Every row must carry:

- `id` — ULID (26 chars)
- `org_id` — FK to `organizations` (RLS anchor)
- `branch_id` — FK to `branches` (nullable for org-scoped rows)
- `created_at`, `updated_at` — timestamps
- `created_by`, `updated_by` — FK to `users`
- `deleted_at` — soft delete
- Optimistic-concurrency `version` int

RLS policies use `org_id` and `branch_id` — see RBAC.md §data-scope enforcement.

## Auth & Tenancy

### `ROLES` — to be designed

No mock data yet — Claude Code decides the shape. See notes in relevant screens.

### `organizations` — to be designed

No mock data yet — Claude Code decides the shape. See notes in relevant screens.

### `branches` — to be designed

No mock data yet — Claude Code decides the shape. See notes in relevant screens.

### `tenants` — to be designed

No mock data yet — Claude Code decides the shape. See notes in relevant screens.

### `user_sessions` — to be designed

No mock data yet — Claude Code decides the shape. See notes in relevant screens.

## Workshop core

### `JOBS`  (6 fields in mock)

Fields: `id`, `cust`, `veh`, `svc`, `st`, `pr`

**Note:** Central workshop entity. FK to CUSTOMERS, VEHICLES, TECHS. Status enum (`checkin`,`inspection`,`estimate`,`repair`,`qc`,`delivery`,`invoiced`,`closed`).

<details><summary>First-row sample</summary>

```js
{id:"A3F8B2C1",cust:"Ahmed Al-Rashid",veh:"Toyota Camry 2022",svc:"maintenance",st:"in_progress",pr:"medium"}
```

</details>

### `ESTIMATES`  (5 fields in mock)

Fields: `id`, `cust`, `veh`, `amount`, `status`

**Note:** Linked to a JOB; approved estimates become invoice lines. Uses APPROVAL_LINES workflow when total > role approval ceiling.

<details><summary>First-row sample</summary>

```js
{id:"EST-0231",cust:"Ahmed Al-Rashid",veh:"Toyota Camry 2022",amount:"SAR 1,250",status:"draft"}
```

</details>

### `APPOINTMENTS`  (9 fields in mock)

Fields: `time`, `cust`, `veh`, `plate`, `svc`, `status`, `bay`, `tech`, `mins`

<details><summary>First-row sample</summary>

```js
{time:"9:00 AM", cust:"Ahmed Al-Rashid",     veh:"Toyota Camry 2022",  plate:"RUH 4821",svc:"Maintenance",status:"confirmed",bay:"Bay 1",tech:"Saeed Al-Zahrani",mins:90}
```

</details>

### `INVOICES`  (5 fields in mock)

Fields: `id`, `cust`, `amount`, `due`, `status`

**Note:** ZATCA-compliant. Fields required beyond sample: `sellerVatNumber`, `buyerVatNumber`, `qrCode` (base64 TLV), `hashChain` (prev hash).

<details><summary>First-row sample</summary>

```js
{id:"INV-2026-0142",cust:"Ahmed Al-Rashid",amount:"SAR 1,840",due:"Jul 28, 2026",status:"unpaid"}
```

</details>

### `INVOICE_LINES`  (6 fields in mock)

Fields: `desc`, `ar`, `kind`, `qty`, `unit`, `part`

**Note:** Store `netAmount` per line, compute vat + gross at invoice level.

<details><summary>First-row sample</summary>

```js
{desc:"Brake pads — front (genuine)", ar:"فحمات فرامل أمامية (أصلية)", kind:"part",  qty:1, unit:420, part:"BP-TC-2101"}
```

</details>

### `INVOICE_PAYMENTS`  (5 fields in mock)

Fields: `date`, `method`, `ar_method`, `ref`, `amount`

<details><summary>First-row sample</summary>

```js
{date:"22 Jul 2026", method:"Mada",        ar_method:"مدى",           ref:"TXN-884201", amount:500}
```

</details>

### `RECEIPTS`  (7 fields in mock)

Fields: `id`, `date`, `customer`, `invoice`, `method`, `amount`, `status`

<details><summary>First-row sample</summary>

```js
{id:"RCP-2026-0311",date:"Jul 21, 2026",customer:"Ahmed Al-Rashid",invoice:"INV-2026-0142",method:"Mada",amount:"SAR 1,840",status:"cleared"}
```

</details>

## Customers & Vehicles

### `CUSTOMERS`  (5 fields in mock)

Fields: `name`, `phone`, `vehicles`, `spent`, `last`

**Note:** Split individuals from fleet accounts via `type` enum. Fleet customers link to FLEETS.

<details><summary>First-row sample</summary>

```js
{name:"Ahmed Al-Rashid",phone:"+966 55 210 4471",vehicles:2,spent:"SAR 12,840",last:"2 weeks ago"}
```

</details>

### `VEHICLES`  (6 fields in mock)

Fields: `plate`, `make`, `owner`, `mileage`, `last`, `status`

**Note:** VIN unique per tenant. Attach service history, insurance, docs (files).

<details><summary>First-row sample</summary>

```js
{plate:"RUH 4821",make:"Toyota Camry 2022",owner:"Ahmed Al-Rashid",mileage:"42,180 km",last:"2 weeks ago",status:"active"}
```

</details>

### `FLEETS`  (4 fields in mock)

Fields: `name`, `vehicles`, `active`, `contract`

<details><summary>First-row sample</summary>

```js
{name:"Riyadh Logistics Co.",vehicles:24,active:6,contract:"active"}
```

</details>

## Inventory & Parts

### `PARTS`  (5 fields in mock)

Fields: `name`, `sku`, `stock`, `reorder`, `price`

<details><summary>First-row sample</summary>

```js
{name:"Oil Filter (Toyota)",sku:"OF-TY-118",stock:142,reorder:40,price:"SAR 45"}
```

</details>

### `PurchaseOrders` — to be designed

No mock data yet — Claude Code decides the shape. See notes in relevant screens.

## Team

### `TECHS`  (4 fields in mock)

Fields: `name`, `specialty`, `jobs`, `rating`

<details><summary>First-row sample</summary>

```js
{name:"Yousef Al-Otaibi",specialty:"Engine & Diagnostics",jobs:5,rating:"4.9"}
```

</details>

### `DEPARTMENTS`  (6 fields in mock)

Fields: `name`, `head`, `headcount`, `costCenter`, `branch`, `icon`

<details><summary>First-row sample</summary>

```js
{name:"Workshop Operations",head:"Ahmed Al-Rashid",headcount:14,costCenter:"CC-100",branch:"Riyadh Main",icon:"Wrench"}
```

</details>

## CRM & Marketing

### `LEADS`  (7 fields in mock)

Fields: `name`, `company`, `value`, `source`, `stage`, `date`, `score`

**Note:** CRM funnel entry. `stage` enum drives the Kanban pipeline in `LeadPipeline.dc.html`.

<details><summary>First-row sample</summary>

```js
{name:"Tariq Al-Dosari",company:"AutoFleet Solutions",value:"SAR 45,000",source:"Website",stage:"new",date:"Jul 20, 2026",score:82}
```

</details>

### `OPPORTUNITIES`  (7 fields in mock)

Fields: `name`, `company`, `value`, `stage`, `prob`, `close`, `owner`

<details><summary>First-row sample</summary>

```js
{name:"Fleet Maintenance Contract",company:"AutoFleet Solutions",value:"SAR 450,000",stage:"Proposal",prob:"60%",close:"Aug 15, 2026",owner:"Khalid Al-Amri"}
```

</details>

### `CAMPAIGNS`  (9 fields in mock)

Fields: `name`, `type`, `status`, `reach`, `opens`, `clicks`, `conversions`, `budget`, `spent`

**Note:** Channel-specific: email / sms / whatsapp. Store `channel` + `templateId`.

<details><summary>First-row sample</summary>

```js
{name:"Summer Service Offer",type:"email",status:"running",reach:2450,opens:1840,clicks:612,conversions:89,budget:"SAR 5,000",spent:"SAR 3,200"}
```

</details>

### `SEGMENTS`  (4 fields in mock)

Fields: `name`, `count`, `rules`, `lastUpdated`

<details><summary>First-row sample</summary>

```js
{name:"High-Value Customers",count:124,rules:"Total Spent > SAR 10,000",lastUpdated:"Jul 20, 2026"}
```

</details>

### `CRM_TASKS`  (6 fields in mock)

Fields: `title`, `assigned`, `due`, `priority`, `status`, `type`

<details><summary>First-row sample</summary>

```js
{title:"Follow up with Tariq Al-Dosari",assigned:"Khalid Al-Amri",due:"Jul 23, 2026",priority:"high",status:"todo",type:"call"}
```

</details>

## Accounting

### `ACCOUNTS_COA`  (5 fields in mock)

Fields: `code`, `name`, `type`, `balance`, `children`

**Note:** Chart of accounts with parent id for the tree.

<details><summary>First-row sample</summary>

```js
{code:"1000",name:"Cash & Bank",type:"Assets",balance:"SAR 842,500",children:3}
```

</details>

### `JOURNAL_ENTRIES`  (7 fields in mock)

Fields: `id`, `date`, `ref`, `narration`, `debit`, `credit`, `status`

**Note:** Double-entry — each entry has ≥2 lines summing to zero.

<details><summary>First-row sample</summary>

```js
{id:"JE-2026-0089",date:"Jul 21, 2026",ref:"INV-2026-0142",narration:"Service revenue - Toyota Camry repair",debit:"SAR 1,840",credit:"SAR 1,840",status:"posted"}
```

</details>

### `EXPENSES_DATA`  (6 fields in mock)

Fields: `id`, `date`, `category`, `vendor`, `amount`, `status`

<details><summary>First-row sample</summary>

```js
{id:"EXP-0045",date:"Jul 20, 2026",category:"Office Supplies",vendor:"Jarir Bookstore",amount:"SAR 450",status:"approved"}
```

</details>

## Diagnostics

### `OBD_DEVICES`  (11 fields in mock)

Fields: `id`, `bay`, `vehicle`, `plate`, `status`, `vin`, `rpm`, `coolant`, `voltage`, `load`, `dtc`

**Note:** One row per connected device — VIN, protocol, connection state, live sensor snapshot JSON.

<details><summary>First-row sample</summary>

```js
{id:"OBD-014",bay:"Bay 3",vehicle:"Toyota Camry 2021",plate:"RUH 4821",status:"live",  vin:"JTNBE46K X 73012845",rpm:820, coolant:92, voltage:14.1, load:18, dtc:2}
```

</details>

### `DTC_CODES`  (6 fields in mock)

Fields: `code`, `desc`, `ar`, `severity`, `system`, `freeze`

**Note:** DTC dictionary — code, severity, cluster, symptoms, likely causes.

<details><summary>First-row sample</summary>

```js
{code:"P0301",desc:"Cylinder 1 misfire detected",       ar:"اختلال احتراق في الأسطوانة 1",   severity:"high",  system:"Engine",   freeze:true}
```

</details>

### `DIAG_STAGES`  (11 fields in mock)

Fields: `id`, `role`, `label`, `ar`, `owner`, `ar_owner`, `at`, `act`, `ar_act`, `adds`, `ar_adds`

<details><summary>First-row sample</summary>

```js
{id:"diagnose", role:"technician", label:"Diagnostic check",    ar:"الفحص التشخيصي",   owner:"Saeed Al-Zahrani", ar_owner:"سعيد الزهراني", at:"26 Jul · 09:14", act:"Send to reception",    ar_act:"إرسال للاستقبال",   adds
```

</details>

### `DIAG_FINDINGS`  (7 fields in mock)

Fields: `dtc`, `finding`, `ar`, `system`, `ar_system`, `severity`, `evidence`

<details><summary>First-row sample</summary>

```js
{dtc:"P0301", finding:"Cylinder 1 misfire under load",        ar:"اختلال احتراق الأسطوانة 1 تحت الحمل", system:"Engine",    ar_system:"المحرك",  severity:"critical", evidence:"photo"}
```

</details>

### `DIAG_PARTS`  (7 fields in mock)

Fields: `part`, `desc`, `ar`, `qty`, `price`, `stock`, `eta`

<details><summary>First-row sample</summary>

```js
{part:"BP-TC-2101", desc:"Brake pads — front (genuine)", ar:"فحمات فرامل أمامية (أصلية)", qty:1, price:420, stock:"in",     eta:"—"}
```

</details>

### `DIAG_LABOUR`  (4 fields in mock)

Fields: `task`, `ar`, `hrs`, `rate`

<details><summary>First-row sample</summary>

```js
{task:"Brake pads & rotors — front", ar:"فحمات وأقراص أمامية", hrs:1.5, rate:150}
```

</details>

### `DIAG_COPIES`  (5 fields in mock)

Fields: `to`, `ar`, `icon`, `at`, `state`

<details><summary>First-row sample</summary>

```js
{to:"Reception",      ar:"الاستقبال",     icon:"Bell",       at:"26 Jul · 09:41", state:"sent"}
```

</details>

## Knowledge & AI

### `KB_PROCEDURES`  (12 fields in mock)

Fields: `id`, `title`, `ar`, `cat`, `make`, `mins`, `torque`, `ar_torque`, `steps`, `views`, `tsb`, `media`

**Note:** Repair procedures — steps, torque specs, tools, TSBs, wiring diagrams.

<details><summary>First-row sample</summary>

```js
{id:"TSB-2411",title:"Front brake pad & rotor replacement",ar:"استبدال فحمات وأقراص الفرامل الأمامية",cat:"Brakes",     make:"Toyota Camry 2018-2024",mins:75, torque:"Caliper bolt 34 N·m · Wheel nut 103 N·m",ar_torque:"م
```

</details>

### `AI_AGENTS`  (7 fields in mock)

Fields: `name`, `role`, `model`, `status`, `tasks`, `success`, `icon`

<details><summary>First-row sample</summary>

```js
{name:"Service Advisor Bot",role:"Customer Intake",model:"Claude Sonnet 4.5",status:"active",tasks:1284,success:"96%",icon:"Headphones"}
```

</details>

### `CONVERSATIONS`  (5 fields in mock)

Fields: `title`, `user`, `msgs`, `date`, `tokens`

<details><summary>First-row sample</summary>

```js
{title:"Q2 revenue breakdown by branch",user:"Khalid Al-Amri",msgs:14,date:"Jul 24, 2026",tokens:"12.4K"}
```

</details>

## Integrations

### `OEM_TOOLS`  (7 fields in mock)

Fields: `brand`, `tool`, `status`, `vehicles`, `protocol`, `licence`, `expires`

<details><summary>First-row sample</summary>

```js
{brand:"Toyota / Lexus", tool:"Techstream",   status:"connected", vehicles:412, protocol:"J2534 · CAN",   licence:"Active",  expires:"2027-03-14"}
```

</details>

### `SYS_INTEGRATIONS`  (7 fields in mock)

Fields: `name`, `ar`, `cat`, `icon`, `status`, `detail`, `ar_detail`

<details><summary>First-row sample</summary>

```js
{name:"ZATCA E-Invoicing", ar:"الفوترة الإلكترونية (زاتكا)", cat:"Government", icon:"Receipt",      status:"connected", detail:"Phase 2 clearance · 15% VAT · QR", ar_detail:"المرحلة الثانية · ضريبة 15% · رمز QR"}
```

</details>

## RBAC & compliance

### `FIELD_RULES`  (3 fields in mock)

Fields: `field`, `ar`, `hidden`

**Note:** Field-level redaction rules per role.

<details><summary>First-row sample</summary>

```js
{field:"Part cost / margin",      ar:"تكلفة القطعة / الهامش",   hidden:["advisor","technician","qc","frontdesk","callcenter","customer","supplier"]}
```

</details>

### `SOD`  (4 fields in mock)

Fields: `a`, `b`, `ar`, `risk`

**Note:** Segregation-of-duties conflicts (e.g. approver != submitter).

<details><summary>First-row sample</summary>

```js
{a:"Raise purchase order",   b:"Approve purchase order",  ar:["رفع أمر شراء","اعتماد أمر شراء"],       risk:"high"}
```

</details>

### `APPROVAL_LINES`  (9 fields in mock)

Fields: `id`, `item`, `ar`, `qty`, `unit`, `kind`, `urgency`, `note`, `ar_note`

**Note:** Approval chain per action — used by ApprovalInbox and CustomerApproval.

<details><summary>First-row sample</summary>

```js
{id:1,item:"Front brake pads (genuine)",  ar:"فحمات فرامل أمامية (أصلية)",qty:1,unit:420, kind:"part",  urgency:"critical",note:"Below 2mm — unsafe",       ar_note:"أقل من 2 مم — غير آمن"}
```

</details>

## Platform control-plane (new)

Not present in the design's mock data — Claude Code adds these tables and endpoints (see README §6).

### `garage_applications`
`id, legalName, crNumber, vatNumber, contactName, phone, email, city, planRequested, notes, status (pending|approved|rejected|suspended), reviewedBy, reviewedAt, rejectionReason, createdAt`

Approving creates the `organizations` row + owner user, emails credentials.

### `subscription_requests`
`id, orgId, fromPlan, toPlan, direction (upgrade|downgrade|cancel), reason, status (pending|approved|rejected|applied), requestedBy, reviewedBy, reviewedAt, effectiveAt`

Only `direction='upgrade'` requires approval — downgrades and cancellations apply immediately.

### `supplier_applications`
`id, company, crNumber, vatNumber, contactName, phone, email, categories[], regions[], status (pending|approved|rejected), reviewedBy, reviewedAt, createdAt`

### `support_tickets`
`id, orgId, subject, body, priority (low|med|high|urgent), status (open|pending|resolved|closed), assignedTo, createdBy, thread[], createdAt, updatedAt`

### `system_health`
`id, ts, uptimePct, queueDepth, errorRatePct, dbSizeGb, activeSessions, notes` — time-series, one row per interval.

### `otp_challenges`
`id, channel (sms|email), destination, code (hashed), expiresAt, attempts, verifiedAt` — throttle new sends per phone: 60s cooldown, max 5 in 24h.

### `audit_log`
`id, orgId, actorId, actorRole, action, entity, entityId, before (jsonb), after (jsonb), ip, userAgent, ts` — one row per mutating request.
