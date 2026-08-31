# SALIS AUTO -- Train-the-Trainer Guide

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-TRN-012                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document provides certified trainers with the tools, techniques, and checklists needed to deliver SALIS AUTO training courses effectively. It covers demo environment setup, bilingual delivery strategies, session pacing, common participant questions, proctoring guidelines, and a comprehensive facilitator checklist.

---

## 2. Trainer Qualifications

### 2.1 Eligibility Requirements

| Requirement                      | Detail                                      |
|----------------------------------|---------------------------------------------|
| Platform Certification           | Gold tier (90%+ on all course assessments)  |
| Role Experience                  | Minimum 6 months in the relevant role       |
| Facilitation Training            | Completed internal facilitator program      |
| Language Proficiency             | Fluent in English and Arabic                |
| Recertification                  | Annual renewal via refresher assessment     |

### 2.2 Trainer Roles

| Role               | Responsibility                                          |
|--------------------|---------------------------------------------------------|
| Lead Trainer       | Delivers ILT sessions; manages classroom dynamics       |
| Lab Facilitator    | Assists during hands-on labs; troubleshoots demo issues  |
| LMS Administrator  | Manages course enrollment, progress tracking, reporting  |
| Proctor            | Administers assessments; enforces exam integrity        |

---

## 3. Demo Environment Setup

### 3.1 Environment Overview

The training demo environment is a sandboxed copy of the production system with pre-loaded data. It resets nightly at 02:00 AST.

### 3.2 Demo Accounts

All demo accounts use password: `Demo@1234`

| Role         | Name                | Email                   | Scope    | SAR Limit  |
|--------------|---------------------|-------------------------|----------|------------|
| Owner/CEO    | Abdullah Al-Salis   | owner@salisauto.sa      | All      | Unlimited  |
| Super Admin  | Platform Admin      | admin@salisauto.com     | Platform | Unlimited  |
| Branch Manager| Faisal Al-Harbi    | manager@salisauto.sa    | Branch   | 50,000     |
| Service Advisor| Noura Al-Qahtani  | advisor@salisauto.sa    | Branch   | 5,000      |
| Technician   | Saeed Al-Zahrani    | tech@salisauto.sa       | Own      | 0          |
| QC Inspector | Majed Al-Otaibi     | qc@salisauto.sa         | Branch   | 0          |
| Storekeeper  | Yousef Al-Ghamdi    | parts@salisauto.sa      | Branch   | 10,000     |
| Accountant   | Hessa Al-Mutairi    | finance@salisauto.sa    | All      | 25,000     |
| HR Manager   | Reem Al-Dossari     | hr@salisauto.sa         | All      | 15,000     |
| Receptionist | Lama Al-Shehri      | frontdesk@salisauto.sa  | Branch   | 0          |
| Call Center  | Turki Al-Anazi      | calls@salisauto.sa      | All      | 0          |
| Procurement  | Bandar Al-Subaie    | procurement@salisauto.sa| All      | 20,000     |
| Supplier     | Al-Jazira Parts Co. | supplier@aljazira.sa    | External | 0          |
| Customer     | Khalid Al-Amri      | khalid@example.sa       | Self     | 0          |

### 3.3 Pre-Session Setup Checklist

| # | Task                                              | Timing         |
|---|---------------------------------------------------|----------------|
| 1 | Verify demo environment is online and responsive  | Day before      |
| 2 | Log in to each demo account to confirm access     | Day before      |
| 3 | Verify pre-loaded demo data (job cards, invoices)  | Day before      |
| 4 | Test projector/screen sharing with demo environment| 1 hour before  |
| 5 | Prepare browser tabs for multi-role demonstrations | 30 min before  |
| 6 | Distribute participant workbooks (print or digital)| Session start  |
| 7 | Confirm bilingual keyboard and input method setup  | 30 min before  |
| 8 | Test QR code scanning on mobile devices            | 30 min before  |
| 9 | Set up backup internet connection                  | Day before      |
| 10| Request ad-hoc environment reset if needed         | As required     |

### 3.4 Demo Data Scenarios

The demo environment includes these pre-loaded scenarios for hands-on labs:

| Scenario                          | Purpose                                |
|-----------------------------------|----------------------------------------|
| 5 open job cards at various stages| Workshop lifecycle demonstration       |
| 3 pending estimates (< 5K, 10K, 60K SAR) | Approval hierarchy demonstration |
| 2 completed jobs with invoices    | ZATCA compliance demonstration         |
| 10 inventory items (mixed stock)  | Parts management demonstration         |
| 3 pending POs                     | Procurement SOD demonstration          |
| 5 customer records with history   | CRM and registry demonstration         |
| 2 pending leave requests          | HR management demonstration            |

---

## 4. Bilingual Delivery Guidelines

### 4.1 Language Strategy

| Audience        | Primary Language | Support Language | Interface    |
|-----------------|-----------------|------------------|--------------|
| Internal staff  | Arabic          | English          | AR (RTL)     |
| Technical roles | English         | Arabic           | EN (LTR)     |
| Executives      | Participant choice | Other          | Mixed        |
| External users  | Participant choice | Other          | Mixed        |

### 4.2 Best Practices

1. **Lead in the primary language** -- deliver core explanations in the audience's dominant language
2. **Show both interfaces** -- demonstrate key screens in both EN and AR to build familiarity
3. **Use consistent terminology** -- maintain a bilingual glossary for platform-specific terms
4. **Provide bilingual handouts** -- participant workbooks should have EN on the left page, AR on the right
5. **Label demos clearly** -- announce which language the interface is in before each demonstration
6. **Accommodate code-switching** -- allow participants to ask questions in either language
7. **RTL awareness** -- demonstrate how the interface mirrors in Arabic, including navigation, tables, and forms

### 4.3 Key Bilingual Terms

| English Term      | Arabic Term           | Context            |
|-------------------|-----------------------|--------------------|
| Job Card          | بطاقة العمل           | Workshop           |
| Estimate          | التقدير               | Finance            |
| Invoice           | الفاتورة              | Finance/ZATCA      |
| Check-In          | تسجيل الدخول          | Workshop           |
| Quality Control   | مراقبة الجودة          | QC                 |
| Purchase Order    | أمر الشراء            | Procurement        |
| Dashboard         | لوحة التحكم           | Navigation         |
| Approval          | الموافقة              | Workflow           |

---

## 5. Session Pacing Guide

### 5.1 General Pacing Rules

| Activity Type     | Recommended Duration | Notes                          |
|-------------------|--------------------|--------------------------------|
| Concept lecture   | 15-25 min max      | Break into 15-min chunks       |
| Hands-on lab      | 20-30 min          | Allow extra time for slow learners|
| Quiz/Assessment   | 10-15 min          | Self-paced within time limit   |
| Break             | 10-15 min          | Every 90 minutes minimum       |
| Q&A               | 10-15 min          | After each module              |

### 5.2 Track-Specific Pacing

| Track       | Total Duration | Sessions    | Daily Pace           |
|-------------|---------------|-------------|----------------------|
| Executive   | 4-8h per role | 1-2 days    | 4h/day (mornings)    |
| Operations  | 4-8h per role | 1-2 days    | Split shifts         |
| Back-Office | 8-10h combined| 2-3 days    | 4h/day (afternoons)  |
| External    | 2-3h per role | 1 session   | Evening or self-paced|

### 5.3 Handling Delays

- If a lab takes longer than planned, reduce the subsequent lecture by the same amount
- Never skip hands-on labs -- they are the primary learning vehicle
- Use the "parking lot" technique for off-topic questions -- note them and address at the end
- If the demo environment is slow, switch to screenshots while the environment recovers

---

## 6. Common Questions and Answers

### 6.1 General Platform Questions

| Question                                        | Answer                                                    |
|-------------------------------------------------|-----------------------------------------------------------|
| Can I use the platform on my phone?             | Yes, the interface is responsive. Tablets are recommended for technicians in the workshop. |
| What browser is recommended?                    | Chrome or Edge (latest version). Safari is supported but Chrome is preferred. |
| What happens if I forget my password?           | Use the "Forgot Password" link on the login page, or contact your Super Admin. |
| Can I work in both English and Arabic?           | Yes, switch languages instantly via the language toggle. All data is stored bilingually. |
| How is my data protected?                        | Role-based access (RBAC), SOD controls, encrypted storage, 7-year audit trail. |

### 6.2 Role-Specific Questions

| Question                                        | Answer                                                    |
|-------------------------------------------------|-----------------------------------------------------------|
| Why can't I approve this estimate? (Advisor)    | Your approval limit is 5,000 SAR. Estimates above this escalate to the manager (50K) or owner (unlimited). |
| Why am I blocked from passing QC? (Technician)  | SOD rule: the person who repairs cannot pass QC on the same job. A different QC inspector must review. |
| Can I see other branches' data? (Manager)       | No, the manager role has branch scope. Only all-scope roles (owner, accountant, HR) can see cross-branch data. |
| How do I handle a ZATCA error? (Accountant)     | Check the ZATCA compliance panel. Common issues: missing VAT number, incorrect QR format, broken hash chain. Contact Super Admin if unresolved. |

---

## 7. Proctoring Guidelines

### 7.1 Assessment Administration

| Rule                                      | Detail                                          |
|-------------------------------------------|-------------------------------------------------|
| Environment                              | Closed-book; no external references              |
| Device                                   | One screen only; no secondary devices            |
| Time limit                               | 45 minutes per 30-question assessment            |
| Passing score                            | 70% (Bronze), 80% (Silver), 90% (Gold)          |
| Retake policy                            | Maximum 3 attempts; 48-hour cooldown between     |
| Accommodation                            | +50% time for non-native language test takers    |

### 7.2 Integrity Measures

1. Randomize question order for each participant
2. Randomize answer option order within each question
3. Monitor for screen sharing or second-device usage
4. Log all assessment attempts with timestamps and scores
5. Flag any assessment completed in under 5 minutes for review

### 7.3 Incident Handling

| Incident                     | Action                                           |
|------------------------------|--------------------------------------------------|
| Technical failure mid-exam   | Pause timer; restart from last saved question    |
| Suspected cheating           | Note the incident; allow completion; review logs  |
| Participant complaint        | Document and escalate to Training Coordinator     |
| Environment outage           | Reschedule within 48 hours; do not use offline backup |

---

## 8. Facilitator Checklist

### 8.1 Pre-Training (1 Week Before)

- [ ] Confirm participant list and roles
- [ ] Send calendar invitations with joining details
- [ ] Distribute pre-reading materials and Platform Fundamentals module link
- [ ] Verify LMS enrollment for all participants
- [ ] Review course materials for any recent platform updates
- [ ] Prepare printed participant workbooks (bilingual)
- [ ] Confirm training room or virtual meeting setup
- [ ] Test demo environment access with all 14 accounts

### 8.2 Day-of-Training (Morning)

- [ ] Arrive 30 minutes early
- [ ] Set up projector/screen sharing
- [ ] Open browser tabs for all demo accounts needed
- [ ] Test audio/video for virtual participants
- [ ] Distribute workbooks and credentials sheet
- [ ] Welcome participants and review agenda
- [ ] Confirm emergency exits and facilities (in-person)
- [ ] Collect signed attendance sheet

### 8.3 During Training

- [ ] Follow the pacing guide (break every 90 minutes)
- [ ] Demonstrate in both EN and AR interfaces
- [ ] Monitor participant progress during labs
- [ ] Use the parking lot for off-topic questions
- [ ] Distribute quiz/assessment at module end
- [ ] Record any platform issues encountered for reporting

### 8.4 Post-Training (Same Day)

- [ ] Collect participant feedback surveys
- [ ] Record assessment scores in the LMS
- [ ] Submit the training completion report to HR (hr@salisauto.sa)
- [ ] File the attendance sheet
- [ ] Report any demo environment issues to Super Admin (admin@salisauto.com)
- [ ] Update the "Lessons Learned" log with any new common questions

### 8.5 Post-Training (Within 1 Week)

- [ ] Issue certificates for passing participants via LMS
- [ ] Send follow-up resources and reference links to participants
- [ ] Schedule remediation sessions for participants who did not pass
- [ ] Submit the trainer feedback form to the Training Coordinator
- [ ] Archive training materials and recordings

---

## 9. Trainer Resources

### 9.1 Reference Documents

- [Program Overview](program-overview.md) (SA-TRN-001)
- [Assessment Bank](assessment-bank.md) (SA-TRN-013)
- [Certification Framework](certification-framework.md) (SA-TRN-014)
- [Getting Started Guide](../user-documentation/guides/getting-started.md)
- [Owner & Super Admin Guide](../user-documentation/guides/owner-superadmin-guide.md)
- [Manager Guide](../user-documentation/guides/manager-guide.md)
- [Workshop Staff Guide](../user-documentation/guides/workshop-staff-guide.md)
- [Finance Staff Guide](../user-documentation/guides/finance-staff-guide.md)
- [Support Staff Guide](../user-documentation/guides/support-staff-guide.md)
- [RBAC Matrix](../knowledge-base/reference/rbac-matrix.md)

### 9.2 Escalation Contacts

| Issue Type            | Contact                                    |
|-----------------------|--------------------------------------------|
| Demo environment      | Super Admin (admin@salisauto.com)          |
| LMS technical issues  | IT Support (support@salisauto.sa)          |
| Training scheduling   | HR Manager (hr@salisauto.sa)               |
| Content updates       | SALIS AUTO PMO                             |
| Participant complaints| Training Coordinator -> HR Manager -> Owner|

---

## 10. Revision History

| Version | Date       | Author           | Changes          |
|---------|------------|------------------|------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release  |
