# SALIS AUTO -- Demo Script

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MKT-006                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Demo Overview

### 1.1 Purpose

This document provides a structured 45-minute demonstration script for the SALIS AUTO platform. The demo follows a narrative arc that walks the prospect through a complete workshop lifecycle -- from the owner's strategic view down to individual job execution, customer interaction, financial compliance, and analytics.

### 1.2 Demo Parameters

| Parameter              | Value                                              |
|------------------------|----------------------------------------------------|
| Duration               | 45 minutes (35 min demo + 10 min Q&A)              |
| Format                 | Live platform walkthrough                          |
| Environment            | Demo tenant with pre-loaded data                   |
| Audience               | Workshop owners, operations managers, finance leads |
| Password (all accounts)| Demo@1234                                          |

### 1.3 Pre-Demo Checklist

| #  | Task                                                        | Status |
|----|-------------------------------------------------------------|--------|
| 1  | Verify demo environment is accessible and data is current   | [ ]    |
| 2  | Test all demo account logins                                | [ ]    |
| 3  | Prepare two browser profiles (one EN, one AR)               | [ ]    |
| 4  | Clear browser cache and close unnecessary tabs              | [ ]    |
| 5  | Prepare a test mobile device for Customer App               | [ ]    |
| 6  | Review prospect's specific pain points from discovery call  | [ ]    |
| 7  | Queue prospect-relevant talking points per scene            | [ ]    |

---

## 2. Demo Flow Summary

| Scene | Title                     | Duration | Account                  | Route               |
|-------|---------------------------|----------|--------------------------|----------------------|
| 1     | Owner Dashboard           | 5 min    | owner@salisauto.sa       | /dashboard           |
| 2     | Advisor Check-In          | 5 min    | advisor@salisauto.sa     | /checkin             |
| 3     | Estimate & Approval       | 5 min    | advisor@salisauto.sa     | /estimates           |
| 4     | Manager Approval          | 5 min    | manager@salisauto.sa     | /jobcards/:id        |
| 5     | Customer E-Signature      | 5 min    | Customer device           | SMS → OTP → Sign    |
| 6     | ZATCA Invoice             | 5 min    | finance@salisauto.sa     | /invoices/create     |
| 7     | Reports & AI              | 5 min    | owner@salisauto.sa       | /reports             |
| 8     | Arabic RTL + Admin        | 5 min    | owner@salisauto.sa       | /admin               |

---

## 3. Scene 1: Owner Dashboard

### 3.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | owner@salisauto.sa / Demo@1234                         |
| Route           | /dashboard                                             |
| Role            | Abdullah Al-Salis (Owner)                              |
| Duration        | 5 minutes                                              |

### 3.2 Script

**Opening narrative**: "Let me show you what running your workshop looks like with SALIS AUTO. We will start where your day starts -- the owner dashboard."

**Walkthrough steps**:

1. Log in as Abdullah Al-Salis (owner@salisauto.sa)
2. Point out the role-specific dashboard -- this is what the owner sees, different from what a technician or advisor sees
3. Highlight the KPI summary cards:
   - Today's revenue (SAR)
   - Jobs in progress
   - Bay utilization percentage
   - Open estimates pending approval
4. Show the branch selector -- demonstrate switching between branches to show multi-branch visibility
5. Scroll to the revenue trend chart -- point out daily/weekly/monthly toggle
6. Show the active jobs pipeline visualization (Check-In → Inspection → Estimate → Repair → QC → Delivery)

**Key talking point**: "Right now, how long does it take you to get this level of visibility across your branches? With SALIS AUTO, this is your first screen every morning."

### 3.3 Transition

"Now let us see what happens when a customer arrives at your workshop."

---

## 4. Scene 2: Advisor Check-In

### 4.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | advisor@salisauto.sa / Demo@1234                       |
| Route           | /checkin                                               |
| Role            | Noura Al-Qahtani (Service Advisor)                     |
| Duration        | 5 minutes                                              |

### 4.2 Script

**Narrative**: "A customer drives in. Your service advisor, Noura, handles the check-in digitally."

**Walkthrough steps**:

1. Switch to advisor account (advisor@salisauto.sa)
2. Navigate to /checkin
3. Start a new check-in:
   - Enter or scan vehicle plate number
   - Show how the system auto-populates returning customer and vehicle data
   - Demonstrate the vehicle condition capture (photo upload points)
   - Record customer complaint / reason for visit
   - Note mileage reading
4. Show the customer information panel with service history from previous visits
5. Submit the check-in and show how the job card is automatically created
6. Point out the status change to "Checked In" in the workflow pipeline

**Key talking point**: "No paper forms, no re-entering customer data. The vehicle history is right there. Your advisor looks professional and the customer feels recognized."

### 4.3 Transition

"The vehicle has been checked in. Now the inspection reveals what work is needed, and Noura prepares an estimate."

---

## 5. Scene 3: Estimate & Approval

### 5.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | advisor@salisauto.sa / Demo@1234                       |
| Route           | /estimates                                             |
| Role            | Noura Al-Qahtani (Service Advisor)                     |
| Duration        | 5 minutes                                              |

### 5.2 Script

**Narrative**: "After inspection, Noura builds the estimate. This is where we go from hours to minutes."

**Walkthrough steps**:

1. Navigate to /estimates
2. Open the estimate for the job card just created (or use a pre-existing demo estimate)
3. Demonstrate adding line items:
   - Parts from the catalog (show part search with pricing)
   - Labor items with predefined rates
   - Show VAT 15% auto-calculation on each line
4. Show the estimate total in SAR with VAT breakdown
5. Demonstrate the "Send for Approval" action
6. Explain that this triggers a notification to the customer via the Customer App
7. Show the estimate status changing to "Pending Customer Approval"

**Key talking point**: "This estimate used to take your advisor 30 minutes to type up and 48 hours to get approved. With SALIS AUTO, the estimate is built in 5 minutes and the customer gets it on their phone immediately."

### 5.3 Transition

"The estimate needs manager review before it goes to the customer. Let us switch to the manager's view."

---

## 6. Scene 4: Manager Approval

### 6.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | manager@salisauto.sa / Demo@1234                       |
| Route           | /jobcards/:id                                          |
| Role            | Faisal Al-Harbi (Branch Manager)                       |
| Duration        | 5 minutes                                              |

### 6.2 Script

**Narrative**: "Faisal, the branch manager, gets a notification that an estimate needs his review."

**Walkthrough steps**:

1. Switch to manager account (manager@salisauto.sa)
2. Show the notification badge or approval queue
3. Open the job card at /jobcards/:id
4. Walk through the manager's view:
   - Customer and vehicle details
   - Inspection findings with photos
   - Estimate line items with parts pricing and labor
   - Profit margin indicators
5. Demonstrate the approval action -- Faisal approves the estimate
6. Show how approval triggers the customer notification
7. Point out the audit trail showing who approved, when, and any modifications

**Key talking point**: "Your manager sees everything in context -- the inspection photos, the pricing, the margins. One tap to approve. No phone calls, no printouts walking between offices."

### 6.3 Transition

"The estimate is approved internally. Now the customer needs to authorize the work. This is where SALIS AUTO's e-signature workflow transforms the customer experience."

---

## 7. Scene 5: Customer E-Signature

### 7.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Device          | Mobile device or second browser tab                    |
| Flow            | SMS → OTP → Canvas Signature                           |
| Duration        | 5 minutes                                              |

### 7.2 Script

**Narrative**: "The customer receives an SMS with a link to review and approve the estimate. Let me show you what they see."

**Walkthrough steps**:

1. Show the SMS notification (use demo simulation)
2. Open the Customer App on a mobile device or mobile-viewport browser:
   - Show the mobile-optimized layout (430px frame with bottom tab bar)
   - Display the estimate with itemized parts and labor
   - Show the SAR total with VAT breakdown
3. Demonstrate the approval flow:
   - Customer taps "Approve Estimate"
   - System sends an OTP to the customer's registered mobile number
   - Enter the OTP for verification
   - Canvas signature pad appears
   - Customer draws their signature on screen
4. Show the signed estimate confirmation with timestamp
5. Switch back to the advisor's screen to show the status update: "Customer Approved"

**Key talking point**: "No more waiting for the customer to come back, no more phone tag. SMS, OTP verification for security, digital signature for legal validity. Your estimate approval goes from 48 hours to 4 hours."

### 7.3 Transition

"The work is authorized, the repair is completed, QC is passed. Now it is time to invoice. Let us look at ZATCA-compliant invoicing."

---

## 8. Scene 6: ZATCA Invoice

### 8.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | finance@salisauto.sa / Demo@1234                       |
| Route           | /invoices/create                                       |
| Role            | Hessa Al-Mutairi (Finance Officer)                     |
| Duration        | 5 minutes                                              |

### 8.2 Script

**Narrative**: "Hessa in finance creates the invoice. This is where ZATCA Phase 2 compliance happens automatically."

**Walkthrough steps**:

1. Switch to finance account (finance@salisauto.sa)
2. Navigate to /invoices/create
3. Show invoice creation from the completed job card:
   - Line items auto-populated from the approved estimate
   - VAT 15% calculated automatically per ZATCA requirements
   - Amounts displayed in SAR (stored as integer halalas for precision)
4. Generate the invoice and highlight ZATCA Phase 2 elements:
   - UBL 2.1 XML generation
   - TLV-encoded QR code on the invoice
   - Sequential hash chain reference
   - Invoice counter and UUID
5. Show the Fatoora portal submission status
6. Demonstrate the invoice PDF with QR code visible
7. Show the 7-year retention indicator in the document archive

**Key talking point**: "Your finance team does not need to understand ZATCA specifications. SALIS AUTO handles the XML, the QR code, the hash chain, and the portal submission. 100% compliant, every time, in 2 minutes instead of 15."

### 8.3 Transition

"Let us go back to the owner's view and see how all of this data turns into business intelligence."

---

## 9. Scene 7: Reports & AI

### 9.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | owner@salisauto.sa / Demo@1234                         |
| Route           | /reports                                               |
| Role            | Abdullah Al-Salis (Owner)                              |
| Duration        | 5 minutes                                              |

### 9.2 Script

**Narrative**: "Abdullah wants to understand his business performance. Reports and the AI Assistant give him answers instantly."

**Walkthrough steps**:

1. Switch back to owner account (owner@salisauto.sa)
2. Navigate to /reports
3. Show the reports dashboard:
   - Revenue by branch (bar chart)
   - Technician productivity rankings
   - Bay utilization heatmap
   - Customer satisfaction trends
4. Demonstrate the custom report builder:
   - Select metrics, date range, branch filter
   - Show export options (PDF, Excel)
5. Open the AI Assistant:
   - Type a natural language query: "What was our total revenue last month?"
   - Show the AI response with data
   - Ask a follow-up: "Which technician completed the most jobs?"
6. Briefly mention Smart Scheduling and predictive analytics capabilities

**Key talking point**: "You do not need to learn report filters or export data to Excel. Ask the AI Assistant in plain language -- English or Arabic -- and get your answer. This is business intelligence that actually gets used."

### 9.3 Transition

"One final thing I want to show you -- this entire platform works in Arabic with full RTL layout."

---

## 10. Scene 8: Arabic RTL Toggle + Admin Multi-Tenant

### 10.1 Setup

| Item            | Value                                                 |
|-----------------|-------------------------------------------------------|
| Login           | owner@salisauto.sa / Demo@1234                         |
| Route           | /admin (or language toggle)                            |
| Role            | Abdullah Al-Salis (Owner)                              |
| Duration        | 5 minutes                                              |

### 10.2 Script

**Narrative**: "SALIS AUTO was built for Saudi Arabia. Let me show you what that really means."

**Walkthrough steps**:

1. Toggle the language to Arabic
2. Show the complete RTL layout transformation:
   - Navigation moves to the right
   - Text flows right-to-left
   - Tables, forms, and buttons all mirror correctly
   - Currency displays in Arabic numerals with SAR
3. Navigate to the admin section:
   - Show multi-tenant organization structure
   - Demonstrate branch configuration (working hours, bay count, labor rates)
   - Show user management with role assignment
   - Display the RBAC permission matrix (28 modules x actions)
4. Switch back to English for Q&A
5. Briefly show the 14 demo accounts available for the prospect to explore independently

**Key talking point**: "This is not a translated English product. Every screen, every form, every report was designed to work natively in Arabic and English. Your team works in whichever language they prefer."

---

## 11. Closing and Q&A

### 11.1 Demo Summary (2 minutes)

Recap the key points aligned to the prospect's stated pain points:

| Pain Point             | SALIS AUTO Solution Shown                          |
|------------------------|-----------------------------------------------------|
| Lack of visibility     | Owner dashboard with real-time multi-branch KPIs   |
| Slow estimate approval | Customer App with SMS → OTP → e-signature          |
| ZATCA compliance       | Automated e-invoicing with QR, hash chain, portal   |
| Paper processes        | Digital job cards, inspections, estimates            |
| No analytics           | Reports dashboard and AI Assistant                  |
| Arabic support         | Full RTL with language toggle                       |

### 11.2 Next Steps

| Step | Action                                               | Timeline        |
|------|------------------------------------------------------|-----------------|
| 1    | Provide demo credentials for prospect self-exploration| Immediately     |
| 2    | Schedule technical deep-dive (if requested)          | Within 1 week   |
| 3    | Deliver customized ROI analysis (SA-MKT-004)         | Within 1 week   |
| 4    | Send pricing proposal (SA-MKT-008)                   | Within 1 week   |
| 5    | Schedule follow-up call                              | Within 2 weeks  |

### 11.3 Q&A Preparation

Common questions and prepared responses:

| Question                                     | Response Key Points                                  |
|----------------------------------------------|------------------------------------------------------|
| "How long does implementation take?"         | 4-8 weeks depending on scope and data migration      |
| "Can we import our existing data?"           | Yes -- customer, vehicle, and financial data migration|
| "What about internet outages?"               | Cloud-based; recommend reliable connection           |
| "Is our data secure?"                        | PostgreSQL RLS, JWT auth, audit logging, KSA hosting |
| "Can we customize workflows?"               | Configurable stages, fields, and approval rules      |
| "What training is included?"                 | Role-based training included in implementation       |

---

## 12. Cross-References

| Document                                           | Relevance                      |
|----------------------------------------------------|--------------------------------|
| SA-MKT-001 (Product Overview)                      | Platform overview for handout  |
| SA-MKT-004 (ROI Calculator)                        | Post-demo ROI analysis         |
| SA-MKT-008 (Pricing Guide)                         | Pricing proposal               |
| `../knowledge-base/reference/rbac-matrix.md`        | RBAC details for Scene 8       |
| `../user-documentation/guides/`                     | Feature guides for deep-dives  |

---

*Demo credentials are for the shared demo environment only. Reset demo data weekly. Do not use demo accounts for prospect-specific configurations -- create a dedicated trial tenant for extended evaluations.*
