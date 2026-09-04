# SALIS AUTO — Technician Knowledge Base and Library

| Field | Value |
|---|---|
| Document ID | SA-REQ-KBL-001 |
| Version | 0.1 — recommendation for the owner's decision |
| Date | 2026-09-04 |
| Scope | The technician knowledge base, the auto library, the news feed, and how they connect to job cards, OBD and the AI assistant |
| Depends on | `/technician-kb`, `/knowledge-base`, `/obddiagnostics`, `/oemintegrations`, `/diagnostic-report` (all IMPLEMENTED in the registry), `docs/knowledge-base/`, `docs/training/` |

## 1. Recommendation in ten lines

1. Build the library as **four shelves** with different ownership: OEM service information (licensed, never copied), the workshop's own knowledge (owned, the real asset), public and regulatory data (free, cited), and a news and season feed (aggregated, summarised, attributed).
2. **Do not bundle "all vehicle manuals and wiring diagrams."** They are copyrighted OEM material. Nobody can ship them without a licence, and a workshop that scrapes them exposes itself. Integrate licensed sources by deep link and API instead, per seat, and store only metadata.
3. The differentiator is shelf two: **every closed job card can become a procedure.** Symptom, diagnosis, fix, parts, time, photos, reviewed by a senior technician, in Arabic first. This is what no aggregator has for the Saudi fleet mix.
4. Anchor everything to the **vehicle**: VIN decode gives make, model, year, engine; the job card then shows what applies to this car, from all four shelves, in one panel.
5. The **DTC library** starts with the public SAE J2012 generic codes today; manufacturer-specific codes come with the licensed aggregator.
6. **Recalls and regulations** come from Saudi sources: the Ministry of Commerce recall portal, SASO standards, the periodic inspection rules, and ZATCA for the fiscal side.
7. **Season advisories** are their own content type: Saudi heat, sand, Hajj and Umrah traffic, the northern winter. This is the "weather in vehicles" the owner asked for, made operational: what to check, when, and why.
8. **News** is an aggregator with AI summaries and links, never full text. Arabic and English sources, tagged by vehicles, service, technology, OBD and diagnostics, EV, and Saudi regulation.
9. The **AI assistant answers with citations** only from shelves the workshop is licensed for or owns. No citation, no answer.
10. Ship in four phases. Phase 1 needs no licence money and can start now.

## 2. What exists today

| Where | What | State |
|---|---|---|
| App `/technician-kb` | Technician knowledge base screen, linked from OBD diagnostics | Implemented |
| App `/knowledge-base` | AI Platform knowledge base (documents, search) | Implemented |
| App `/obddiagnostics`, `/diagnostics-obd-hub`, `/diagnostic-report` | OBD reading, hub, and the report a customer can be shown | Implemented |
| App `/oemintegrations` | OEM integration settings | Implemented |
| `docs/knowledge-base/` | 6 how-tos, 14 library guides, 10 references, 4 troubleshooting docs, all about the platform itself, not about vehicles | Approved, English |
| `docs/training/` | 13 role courses including `technician-course.md`, assessments, certification | Approved, English |
| `docs/enablement/`, `docs/marketing/media/` | Media-ready training, manual, how-tos, video and shorts scripts | Being written 2026-09-04 |

The gap is precise: the platform documents itself well and documents vehicles not at all. The technician screen exists; the shelves behind it do not.

## 3. The four shelves

### Shelf A — OEM service information (licensed)

What technicians actually ask for: repair procedures, torque specs, wiring diagrams, component locations, TSBs, labour times, maintenance schedules.

| Route | Sources relevant to the Saudi fleet | How we integrate |
|---|---|---|
| OEM technical portals | Toyota and Lexus TIS, Hyundai and Kia GSW, Nissan, Ford PTS, GM ACDelco, Honda, Mercedes XENTRY WIS, BMW AOS, Stellantis, and the Chinese brands now growing in the Kingdom: Geely, Chery, Changan, MG, BYD | Deep link from the job card with the VIN pre-filled where the portal accepts it; the workshop holds its own OEM subscription; we store nothing but the link and the access log |
| Multi-brand aggregators | Autodata, HaynesPro, ALLDATA, Mitchell 1 ProDemand, Identifix Direct-Hit | One aggregator integrated through its API, per-seat licence passed through in Professional and Enterprise tiers; content rendered inside SALIS AUTO under the licence terms, never cached beyond what the contract allows |
| Parts data | TecDoc (aftermarket catalogue, applicability by vehicle) | Feeds Spare Parts: the right part for this VIN, cross-references, then the supplier network |

Rules: per-seat licensing, access logged on the audit trail, a licence badge on every page that shows licensed content, and a plain statement in the product that OEM content belongs to the OEM.

Decision needed from the owner: which aggregator to pilot (availability and Arabic support in the Middle East differ), and the top ten makes to cover first.

### Shelf B — The workshop's own knowledge (owned)

This is the asset. Every workshop already holds it in technicians' heads and WhatsApp groups.

Knowledge object types:

| Type | Comes from | Contains |
|---|---|---|
| Procedure | A closed job card, drafted by the AI, reviewed by a senior technician | Vehicle applicability, symptom, diagnosis path, fix, parts used, time taken with the estimate it replaced, photos, warnings |
| Known fix | A recurring DTC or complaint on a model | The pattern, the check that confirms it, the fix, how often it recurred here |
| Checklist | Inspection and QC templates | Steps, pass and fail criteria, photos required |
| Time standard | Labour times observed here versus the book | Model, operation, observed median, the book figure it is compared against |
| Model note | Anything a technician wants the next one to know | Free text, Arabic first, with a photo |

Workflow: technician submits from the job card in one tap, the draft carries the job's data, a senior technician approves or edits, the object becomes searchable and attaches itself to future job cards of the same model. Every step writes an audit row like any other change. Reuse is counted so the workshop sees which fixes saved time, against the baseline of the first occurrence.

### Shelf C — Public and regulatory (free, cited)

| Content | Source | Note |
|---|---|---|
| Generic DTC codes P0, B0, C0, U0 | SAE J2012 published definitions | Public; ship in Phase 1 in Arabic and English |
| Manufacturer-specific DTCs P1, B1, C1, U1 | Aggregator licence | Shelf A |
| Recalls | Ministry of Commerce recall portal, manufacturer regional notices | Match by make, model, year; show on the job card when a recall applies |
| Periodic inspection standards | The Kingdom's motor vehicle periodic inspection requirements | The inspection checklist maps to them |
| Tyre, battery and parts standards | SASO | Cited in parts pages |
| EV high-voltage safety | Public standards and OEM safety data sheets | Mandatory reading before EV work; recorded against the technician's profile |
| Fiscal | ZATCA Phase 2 | Already in the product; linked from the invoice |

### Shelf D — News and season advisories (aggregated, attributed)

**News.** An aggregator, not a publisher. RSS and API sources, an AI summary of three lines in Arabic and English with the source named and linked, tags: vehicles, service, technology, OBD and diagnostics, EV, Saudi regulation, parts market. Candidate sources to confirm: regional Arabic motoring and business outlets, Automotive News, SAE, aftermarket and diagnostics trade press, EV outlets, OEM newsrooms. Full text is never copied; the summary is clearly marked as a summary.

**Season advisories.** A content type with a calendar:

| Season | What changes in the car | What the workshop should push |
|---|---|---|
| Summer heat, May to September | Batteries, AC compressors and refrigerant, tyre pressure, coolant | Pre-summer checks in April; AC campaign; battery test on every check-in |
| Sand and dust, spring | Cabin and engine air filters, brake dust, paint | Filter changes; underbody wash |
| Hajj and Umrah traffic | High mileage on fleet and rental vehicles | Fleet pre-season service; brake and tyre inspection |
| Northern winter, December to February | Cold starts, heaters, wiper blades | Winter check for Tabuk, Hail, Al Jouf branches |
| Rain events | Wipers, drainage, floor moisture | Post-rain electrical checks |

Each advisory carries the check, the interval, the reason, and a ready-made customer message in both languages. This is where "weather in vehicles" becomes revenue.

## 4. How it connects in the product

- **Vehicle context panel on the job card**: VIN decoded, then applicable procedures, known fixes, recalls, TSBs from the licensed shelf, DTC history, and the season advisory in force. One panel, four shelves, sources labelled.
- **OBD screen**: a read DTC opens its definition (shelf C), the workshop's known fixes for this model (shelf B), and the licensed procedure (shelf A) in that order.
- **Technician portal on the phone**: procedures and checklists cached for offline reading on the floor; photos captured straight into a draft procedure.
- **AI assistant**: answers cite shelf and document; if the workshop is not licensed for the source, the assistant says what it cannot show and offers the licensed route.
- **Search**: one box over all four shelves, filtered by vehicle, with Arabic and English handled as one index (the AI knowledge base already exists for this).
- **Governance**: KB editor role, senior technician reviewer role, a review SLA of two working days for submitted procedures, a licence register, and quarterly source review.

## 5. Phases

| Phase | Ships | Needs |
|---|---|---|
| 1 · Now | Shelf B workflow from job cards, generic DTC library, recalls feed, season advisories with the customer messages, news aggregator with summaries, the vehicle context panel | Engineering only; no licence spend |
| 2 · Next quarter | Aggregator pilot for one brand set, OEM deep links with VIN, TecDoc applicability into Spare Parts | Owner picks the aggregator and the brands; contract per seat |
| 3 | AI-drafted procedures from closed jobs at scale, time standards from observed data, predictive diagnostics using shelf B | Data from Phase 1 running |
| 4 | Direct OEM API programmes where offered, EV service certification tracking | OEM agreements |

## 6. Rules that do not bend

- No copyrighted manual, diagram or TSB is stored, cached or displayed outside its licence.
- Every displayed item shows its shelf and source.
- News is summarised and attributed, never republished.
- A procedure is not visible to technicians until a reviewer approved it.
- Nothing about a real customer's vehicle leaves the workshop's tenant; procedures are anonymised before any cross-workshop sharing, and sharing is opt-in.

## 7. What the owner decides

1. Top ten makes to cover first.
2. Which aggregator to pilot and the per-seat budget.
3. Whether to pursue OEM programmes now or after Phase 2.
4. News sources to include, in each language.
5. Who owns season advisories: product, or a partner such as a parts supplier.

---

## ملخص بالعربية

**التوصية.** تُبنى المكتبة على أربعة رفوف بملكيات مختلفة: معلومات الصيانة من الشركات المصنّعة (مرخّصة ولا تُنسخ)، ومعرفة الورشة نفسها (مملوكة وهي الأصل الحقيقي)، والبيانات العامة والتنظيمية (مجانية ومُسنَدة)، والأخبار والإرشادات الموسمية (مجمَّعة وملخَّصة ومنسوبة).

**ما لا نفعله.** لا نجمع «كل كتيبات السيارات والمخططات الكهربائية» داخل المنتج؛ فهي محمية بحقوق الشركات المصنّعة. نتكامل معها بالترخيص والروابط المباشرة ولا نخزّن سوى البيانات الوصفية.

**ما يميزنا.** كل بطاقة عمل مغلقة يمكن أن تصبح إجراءً: العرض، التشخيص، الإصلاح، القطع، الوقت، الصور، بمراجعة فني أول، بالعربية أولاً. هذا ما لا يملكه أي مجمّع بيانات لمزيج السيارات في المملكة.

**الربط.** رقم الهيكل يحدد السيارة، فتُعرض في بطاقة العمل الإجراءات والإصلاحات المعروفة والاستدعاءات ورموز الأعطال والإرشاد الموسمي الساري، في لوحة واحدة مع ذكر المصدر.

**الإرشادات الموسمية.** حر الصيف، والغبار، وموسم الحج والعمرة، وشتاء الشمال، والأمطار: لكل موسم الفحص والفاصل الزمني والسبب ورسالة جاهزة للعميل باللغتين.

**الأخبار.** تجميع بملخص من ثلاثة أسطر بالعربية والإنجليزية مع اسم المصدر ورابطه، بلا نسخ للنص الكامل.

**المراحل.** المرحلة الأولى تبدأ الآن دون أي إنفاق على التراخيص. القرارات المطلوبة من المالك: أعلى عشر علامات تجارية، المجمّع المرشّح وميزانيته لكل مقعد، توقيت برامج الشركات المصنّعة، مصادر الأخبار، ومن يملك الإرشادات الموسمية.
