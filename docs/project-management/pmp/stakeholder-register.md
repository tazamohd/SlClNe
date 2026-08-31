# SALIS AUTO -- Stakeholder Register

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-006                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document identifies all stakeholders of the SALIS AUTO platform, classifies them by influence and interest, and defines engagement strategies for each. It covers the 14 platform roles plus external stakeholders relevant to project success.

---

## 2. Stakeholder Identification

### 2.1 Internal Platform Roles

| ID   | Stakeholder        | Description                                                    | Domain Touchpoints                        |
|------|--------------------|----------------------------------------------------------------|-------------------------------------------|
| S-01 | Owner/CEO          | Workshop chain owner; executive sponsor; unlimited approval    | All 13 domains, Reports & Analytics       |
| S-02 | Super Admin        | Platform administrator; manages tenants, roles, system config  | Administration, Authentication, All       |
| S-03 | Branch Manager     | Manages one branch; SAR 50K approval limit                     | Workshop, Finance, Parts, HR, Reports     |
| S-04 | Service Advisor    | Front-desk liaison; creates jobs, estimates; SAR 5K limit       | Workshop, Registry, Finance, CRM          |
| S-05 | Technician         | Performs repairs; logs time; requests parts                     | Workshop, Parts (requests only)           |
| S-06 | QC Inspector       | Quality gate between repair and delivery                       | Workshop (QC step)                        |
| S-07 | Storekeeper        | Manages parts inventory; SAR 10K approval limit                | Parts & Inventory                         |
| S-08 | Accountant         | Financial records, reconciliation; SAR 25K approval limit       | Finance, Accounting                       |
| S-09 | HR Manager         | Employee records, attendance, leave; SAR 15K approval limit     | Team & HR                                 |
| S-10 | Receptionist       | Customer intake, appointment scheduling                         | Registry, Workshop (check-in), Call Center|
| S-11 | Call Center Agent   | Phone/ticket support, escalation                               | Call Center, Registry, Workshop           |
| S-12 | Procurement Agent   | Supplier management, POs; SAR 20K approval limit              | Parts & Inventory, Finance                |
| S-13 | Supplier           | External: responds to POs, submits invoices                    | Supplier Portal                           |
| S-14 | Customer           | External: tracks repairs, approves estimates, rates service     | Customer Portal                           |

### 2.2 External Stakeholders

| ID   | Stakeholder               | Description                                              | Relevance                             |
|------|---------------------------|----------------------------------------------------------|---------------------------------------|
| S-15 | ZATCA                     | Saudi tax authority; regulates e-invoicing               | Finance: Phase 2 compliance mandatory |
| S-16 | Development Team           | Engineers building the platform                          | All domains                           |
| S-17 | QA Team                    | Testers ensuring quality                                 | All domains                           |
| S-18 | UX/UI Design Team          | Interface and experience designers                       | All domains (especially RTL/i18n)     |
| S-19 | SMS/Notification Provider  | Twilio or equivalent for OTP, SMS, WhatsApp              | Authentication, Notifications         |
| S-20 | Hosting Providers          | GitHub Pages, Vercel, Netlify                            | Deployment                            |
| S-21 | Saudi Workshop Association | Industry body; potential pilot partner                   | Adoption, requirements validation     |

---

## 3. Influence/Interest Grid

### 3.1 Classification Matrix

```
                        INTEREST
                 Low              High
            +------------+------------+
    High    |  S-15      |  S-01      |
            |  (ZATCA)   |  (Owner)   |
 INFLUENCE  |            |  S-02      |
            |            |  (Super    |
            |            |   Admin)   |
            |            |  S-16      |
            |            |  (Dev Team)|
            +------------+------------+
    Low     |  S-13      |  S-03      |
            |  (Supplier)|  (Manager) |
            |  S-19      |  S-04      |
            |  (SMS Prov)|  (Advisor) |
            |  S-20      |  S-08      |
            |  (Hosting) |  (Account.)|
            |            |  S-14      |
            |            |  (Customer)|
            +------------+------------+
```

### 3.2 Quadrant Strategies

| Quadrant               | Stakeholders                    | Strategy                                |
|------------------------|---------------------------------|-----------------------------------------|
| High Power, High Interest | S-01, S-02, S-16           | Manage closely; regular engagement      |
| High Power, Low Interest  | S-15 (ZATCA)               | Keep satisfied; compliance updates      |
| Low Power, High Interest  | S-03--S-12, S-14, S-17--18 | Keep informed; address concerns         |
| Low Power, Low Interest   | S-13, S-19, S-20           | Monitor; periodic updates               |

---

## 4. Engagement Strategy per Stakeholder

### S-01: Owner/CEO

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | Executive Sponsor, final decision authority                 |
| Key interests          | ROI, multi-branch visibility, competitive advantage         |
| Engagement level       | Leading                                                      |
| Communication method   | Monthly steering committee, weekly email summary             |
| Approval authority     | Unlimited (budget, scope, schedule)                         |
| Risk                   | Disengagement due to competing business priorities          |
| Mitigation             | Keep updates concise and KPI-focused; escalate early        |

### S-02: Super Admin

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | Platform champion; configuration authority                  |
| Key interests          | System reliability, tenant management, security             |
| Engagement level       | Leading                                                      |
| Communication method   | Sprint demos, direct Slack channel                          |
| Approval authority     | Technical configuration decisions                           |
| Risk                   | Over-customization requests that increase complexity        |
| Mitigation             | Guide toward configurable defaults over custom code         |

### S-03: Branch Manager

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | Operational requirements source; branch-level UAT           |
| Key interests          | Staff productivity, branch P&L, job throughput              |
| Engagement level       | Supportive                                                   |
| Communication method   | Biweekly demo, UAT sessions                                |
| Approval authority     | SAR 50,000                                                  |
| Risk                   | Resistance to process change from manual workflows          |
| Mitigation             | Early pilot; show time-savings data; champion program       |

### S-04: Service Advisor

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | Primary daily user; heaviest screen interaction             |
| Key interests          | Speed of job creation, estimate accuracy, customer comm     |
| Engagement level       | Supportive                                                   |
| Communication method   | Sprint demos, usability testing sessions                    |
| Approval authority     | SAR 5,000                                                   |
| Risk                   | Poor UX leads to workarounds and data quality issues        |
| Mitigation             | Service advisor persona drives UX decisions; field testing  |

### S-05: Technician

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | End user; repair execution and time logging                 |
| Key interests          | Simple mobile interface, clear job assignments              |
| Engagement level       | Neutral to Supportive                                       |
| Communication method   | Training sessions, feedback forms                           |
| Risk                   | Low tech literacy; mobile browser limitations               |
| Mitigation             | Mobile-first design for technician views; Arabic-primary UI |

### S-06: QC Inspector

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | Quality gatekeeper; validates repair before delivery        |
| Key interests          | Clear checklist, photo evidence, reject/approve workflow    |
| Engagement level       | Supportive                                                   |
| Communication method   | Sprint demos, checklist co-design sessions                  |
| Risk                   | Inconsistent QC criteria across branches                    |
| Mitigation             | Configurable QC templates per service type                  |

### S-07 through S-12: Operational Roles

| ID   | Role               | Key Interest                | Engagement     | Communication          |
|------|--------------------|----------------------------|----------------|------------------------|
| S-07 | Storekeeper        | Accurate stock, easy PO     | Supportive     | Sprint demos, training |
| S-08 | Accountant         | ZATCA compliance, accuracy  | Supportive     | Finance sprint demos   |
| S-09 | HR Manager         | Employee data, leave mgmt   | Neutral        | HR module demos        |
| S-10 | Receptionist       | Fast check-in, scheduling   | Supportive     | Usability testing      |
| S-11 | Call Center Agent   | Ticket speed, customer info | Neutral        | Module demos           |
| S-12 | Procurement Agent   | Supplier management, POs   | Supportive     | Inventory sprint demos |

### S-13: Supplier (External)

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | External portal user; PO response, invoice submission       |
| Key interests          | Easy PO acknowledgment, timely payment                      |
| Engagement level       | Resistant to Neutral                                        |
| Communication method   | Portal onboarding guide, email support                      |
| Risk                   | Low adoption of supplier portal                             |
| Mitigation             | Minimize required actions; email notification of new POs    |

### S-14: Customer (External)

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | External portal user; estimate approval, repair tracking    |
| Key interests          | Transparency, trust, convenience                            |
| Engagement level       | Supportive                                                   |
| Communication method   | In-app notifications, SMS, WhatsApp updates                 |
| Risk                   | OTP + e-signature flow too complex; drop-off                |
| Mitigation             | 6-step flow tested with real customers; progressive disclosure |

### S-15: ZATCA

| Attribute              | Detail                                                      |
|------------------------|-------------------------------------------------------------|
| Role in project        | Regulatory authority; certification gatekeeper              |
| Key interests          | Compliance with Phase 2 e-invoicing specifications          |
| Engagement level       | Monitor                                                      |
| Communication method   | Official ZATCA developer portal; certification submissions  |
| Risk                   | Specification changes or delayed certification              |
| Mitigation             | Adapter-pattern isolation; early sandbox testing            |

---

## 5. RACI for Key Decisions

| Decision                          | Owner/CEO | Super Admin | Branch Mgr | PM   | Tech Lead | PO   |
|-----------------------------------|-----------|-------------|------------|------|-----------|------|
| Scope change > 13 SP              | A         | C           | C          | R    | C         | C    |
| Tech stack change                 | I         | C           | I          | A    | R         | C    |
| RBAC role/permission modification | A         | R           | C          | I    | C         | C    |
| Go-live decision                  | A         | C           | C          | R    | C         | C    |
| ZATCA certification submission    | I         | I           | I          | A    | R         | I    |
| New branch onboarding             | A         | R           | C          | I    | C         | I    |
| Sprint priority changes           | I         | I           | C          | C    | C         | A/R  |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

---

## 6. Stakeholder Review Schedule

| Review Activity                    | Frequency  | Participants                  |
|------------------------------------|------------|-------------------------------|
| Stakeholder engagement assessment  | Monthly    | PM, PO                       |
| Influence/interest grid update     | Quarterly  | PM, PO, Sponsor              |
| Satisfaction survey                | Per sprint | All active stakeholders       |
| Escalation review                  | As needed  | PM, relevant stakeholder      |

---

## 7. References

- [Project Charter](project-charter.md)
- [Communication Plan](communication-plan.md)
- [Scope Statement](scope-statement.md)
