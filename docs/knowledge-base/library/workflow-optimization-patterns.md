# SALIS AUTO -- Workflow Optimization Patterns

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-012                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

SALIS AUTO provides a configurable workflow engine that adapts to different workshop sizes, specializations, and operational philosophies. While the default workflow (Check-In, Inspection, Estimate, Repair, QC, Delivery) covers the standard automotive service lifecycle, workshops can customize stage transitions, approval chains, automation rules, and notification behavior to match their specific needs.

This document presents advanced workflow customization patterns that have been validated across diverse workshop environments in Saudi Arabia. Each pattern includes rationale, configuration guidance, and expected outcomes.

---

## 2. Custom Stage Transitions

### 2.1 Default Workflow Stages

The standard SALIS AUTO workflow consists of six core stages:

| Stage       | Order | Purpose                                    | Mandatory |
|-------------|-------|--------------------------------------------|-----------|
| Check-In    | 1     | Vehicle reception and customer intake       | Yes       |
| Inspection  | 2     | Technical assessment and diagnosis          | Yes       |
| Estimate    | 3     | Cost estimation and customer approval       | Yes       |
| Repair      | 4     | Service execution                           | Yes       |
| QC          | 5     | Quality verification                        | Yes       |
| Delivery    | 6     | Vehicle handover and payment                | Yes       |

### 2.2 Adding Custom Stages

Workshops may insert custom stages between the core stages. The following are validated custom stage patterns:

#### 2.2.1 Pre-Wash Stage (Between Check-In and Inspection)

| Configuration      | Value                                                    |
|--------------------|----------------------------------------------------------|
| Stage Name (EN)    | Pre-Wash                                                 |
| Stage Name (AR)    | غسيل أولي                                                 |
| Position           | After Check-In, Before Inspection                        |
| Auto-Assignment    | Wash bay technician (by specialty tag)                   |
| Time Allocation    | 30-45 minutes                                            |
| Skip Condition     | Emergency/breakdown jobs bypass this stage               |
| Checklist Items    | Exterior wash, engine bay rinse, interior vacuum (optional) |

**Rationale:** Pre-washing vehicles before inspection ensures technicians work on clean surfaces, prevents dirt from masking issues during inspection, and presents a professional image. Particularly important in Saudi Arabia where desert dust accumulation is significant.

**Expected Outcome:** 15% improvement in inspection accuracy, 20% reduction in technician re-clean time during repair.

#### 2.2.2 Parts-Hold Stage (Between Estimate Approval and Repair)

| Configuration      | Value                                                    |
|--------------------|----------------------------------------------------------|
| Stage Name (EN)    | Parts Hold                                                |
| Stage Name (AR)    | انتظار القطع                                                |
| Position           | After Estimate (approved), Before Repair                 |
| Trigger             | Automatically entered when required parts are not in stock |
| Auto-Exit          | Moves to Repair when all parts are received              |
| Notification       | Customer notified of delay with estimated parts arrival  |
| Timeout Alert      | Manager alerted if in Parts-Hold > 48 hours              |

**Rationale:** Prevents repair bays from being occupied by vehicles waiting for parts, improving bay utilization. Provides clear visibility into parts-related delays and enables proactive customer communication.

**Expected Outcome:** 25% improvement in bay utilization, 30% reduction in customer complaints about unexplained delays.

#### 2.2.3 Customer Approval Hold (Between Estimate and Repair)

| Configuration      | Value                                                    |
|--------------------|----------------------------------------------------------|
| Stage Name (EN)    | Awaiting Approval                                         |
| Stage Name (AR)    | بانتظار الموافقة                                           |
| Position           | After Estimate, Before Repair or Parts-Hold              |
| Trigger             | Automatically entered when estimate is sent to customer  |
| Auto-Exit          | Customer approves via portal, SMS link, or in-person     |
| Reminder           | Auto-reminder to customer after 24 hours, 48 hours       |
| Timeout            | Manager alerted if no response after 72 hours            |

#### 2.2.4 Final Wash Stage (Between QC and Delivery)

| Configuration      | Value                                                    |
|--------------------|----------------------------------------------------------|
| Stage Name (EN)    | Final Wash                                                |
| Stage Name (AR)    | غسيل نهائي                                                 |
| Position           | After QC Pass, Before Delivery                           |
| Scope              | Exterior wash, interior wipe-down, air freshener         |
| Time Allocation    | 20-30 minutes                                            |
| Skip Condition     | Customer-declined (documented), express service          |

### 2.3 Stage Transition Rules

| Rule Type                   | Description                                             | Example                              |
|-----------------------------|---------------------------------------------------------|--------------------------------------|
| Sequential                  | Must pass through stages in order                       | Default behavior                     |
| Skip-Allowed                | Certain stages can be skipped with authorization        | Pre-Wash skip for emergencies        |
| Conditional Branch          | Different paths based on job type                       | Express oil change skips Inspection  |
| Parallel                    | Multiple stages can be active simultaneously            | Parts ordering while repair begins   |
| Return Loop                 | Ability to return to a previous stage                   | QC fail returns to Repair            |

---

## 3. Approval Chain Configuration

### 3.1 SAR Threshold-Based Approvals

SALIS AUTO supports configurable approval chains based on estimated job value:

| Threshold Range (SAR) | Approval Required From        | Auto-Approve Eligible | Response SLA |
|------------------------|-------------------------------|:---------------------:|--------------|
| 0 - 500                | Service Advisor               | Yes (configurable)    | Immediate    |
| 501 - 2,000            | Service Advisor               | No                    | 30 minutes   |
| 2,001 - 5,000          | Branch Manager                | No                    | 1 hour       |
| 5,001 - 15,000         | Branch Manager                | No                    | 2 hours      |
| 15,001 - 50,000        | Operations Director           | No                    | 4 hours      |
| 50,001+                | Organization Owner            | No                    | 8 hours      |

### 3.2 Approval Chain by Operation Type

Beyond value-based approvals, specific operations require role-based approval regardless of value:

| Operation                       | Approval Required From          | SOD Pair                  |
|---------------------------------|---------------------------------|---------------------------|
| Purchase Order Creation         | Procurement Manager             | Raise PO / Approve PO    |
| Purchase Order Approval         | Finance Manager or Owner        | Raise PO / Approve PO    |
| Supplier Payment                | Finance Manager                 | Create Supplier / Approve Payment |
| Journal Entry Posting           | Senior Accountant               | Post Journal / Approve Journal |
| Journal Entry Approval          | Finance Manager                 | Post Journal / Approve Journal |
| Inventory Adjustment            | Inventory Manager               | Issue Stock / Adjust Count |
| Customer Credit Note            | Branch Manager                  | N/A                       |
| Customer Discount > 10%         | Branch Manager                  | N/A                       |
| Customer Discount > 25%         | Organization Owner              | N/A                       |
| Write-Off                       | Organization Owner              | N/A                       |

### 3.3 Configuring Approval Escalation

When an approver does not respond within the SLA:

1. **First Escalation (SLA + 50%):** Reminder notification to the original approver
2. **Second Escalation (SLA + 100%):** Notification to the next-level approver
3. **Third Escalation (SLA + 200%):** Alert to Organization Owner with pending approval count
4. **Auto-Approval (optional):** Configurable auto-approval after defined timeout (disabled by default for security)

---

## 4. Automation Rule Design

### 4.1 Auto-Assignment Rules

#### 4.1.1 Technician Auto-Assignment by Specialty

| Specialty Tag        | Service Types Auto-Assigned                              | Fallback Rule              |
|----------------------|----------------------------------------------------------|----------------------------|
| Engine               | Engine diagnostics, timing belt, head gasket             | Senior technician on shift |
| Brakes               | Brake service, ABS diagnostics                           | Any available technician   |
| Electrical           | Electrical diagnostics, battery, alternator              | Senior technician on shift |
| AC/HVAC              | AC recharge, compressor, evaporator                      | Any available technician   |
| Transmission         | Transmission service, CVT, gearbox                       | Senior technician only     |
| General              | Oil change, filters, fluids, tires                       | Any available technician   |
| Body/Paint           | Dent repair, paint, body panel                           | Body shop technician only  |

#### 4.1.2 Assignment Algorithm Options

| Algorithm             | Description                                              | Best For                   |
|-----------------------|----------------------------------------------------------|----------------------------|
| Round Robin           | Distributes jobs equally among qualified technicians     | Equal workload distribution |
| Least Loaded          | Assigns to technician with fewest active jobs            | Minimizing wait times      |
| Best Match            | Assigns based on specialty match + past performance      | Quality optimization       |
| Priority Queue        | VIP/Fleet customers assigned to top-rated technicians    | Customer segmentation      |
| Manual with Suggest   | System suggests, supervisor confirms assignment          | Complex workshops          |

### 4.2 Auto-Notification Rules

#### 4.2.1 Customer Notification Triggers

| Trigger Event                    | Notification Channel     | Default Message (EN)                              | Delay    |
|----------------------------------|--------------------------|---------------------------------------------------|----------|
| Vehicle Checked In               | SMS + In-App             | "Your vehicle [plate] has been checked in at [branch]" | Immediate |
| Inspection Complete              | SMS + In-App             | "Inspection of [plate] is complete. View findings..." | Immediate |
| Estimate Ready                   | SMS + Email + In-App     | "Your estimate for [plate] is ready for review"    | Immediate |
| Estimate Reminder                | SMS                      | "Reminder: Your estimate for [plate] is awaiting approval" | 24 hours |
| Repair Started                   | In-App                   | "Repair work has begun on [plate]"                 | Immediate |
| Repair 75% Complete              | SMS + In-App             | "Work on [plate] is nearly complete"               | Immediate |
| QC Passed                        | SMS + In-App             | "[plate] has passed quality check. Ready for pickup" | Immediate |
| Ready for Delivery               | SMS + Email + In-App     | "[plate] is ready! Visit [branch] to collect"      | Immediate |
| Invoice Generated                | Email + In-App           | "Your invoice for [plate] service is available"    | Immediate |

#### 4.2.2 Internal Notification Triggers

| Trigger Event                    | Recipients               | Channel                    |
|----------------------------------|--------------------------|----------------------------|
| New job card created             | Assigned Service Advisor | In-App                     |
| Parts request submitted          | Parts Specialist         | In-App + Sound Alert       |
| Approval required                | Approver role            | In-App + SMS (if urgent)   |
| QC failure                       | Original Technician + Supervisor | In-App + Sound Alert |
| Bay idle > 30 minutes            | Supervisor               | In-App                     |
| Customer complaint received      | Branch Manager           | In-App + Email             |
| Inventory reorder point reached  | Parts Manager            | In-App + Email             |

### 4.3 Automation Rule Configuration Structure

Each automation rule in SALIS AUTO follows a standard structure:

| Component     | Description                                              | Example                         |
|---------------|----------------------------------------------------------|---------------------------------|
| Trigger       | Event that initiates the rule                            | Job card stage change to QC     |
| Condition     | Criteria that must be met                                | Service type = "Full Service"   |
| Action        | What the system does                                     | Send SMS to customer            |
| Schedule      | When the action executes                                 | Immediately / After delay       |
| Scope         | Which branches/teams the rule applies to                 | All branches / Specific branch  |
| Priority      | Rule execution order when multiple rules match           | 1 (highest) to 10 (lowest)     |
| Active        | Whether the rule is currently enabled                    | Yes / No                        |

---

## 5. Notification Tuning

### 5.1 Alert Fatigue Prevention

Excessive notifications reduce their effectiveness. The following strategies help maintain notification relevance:

| Strategy                     | Implementation                                          |
|------------------------------|---------------------------------------------------------|
| Batching                     | Group non-urgent notifications into periodic digests (every 2 hours) |
| Priority Filtering           | Allow users to set notification priority threshold (Critical/High/Medium/Low) |
| Quiet Hours                  | No non-critical notifications outside working hours     |
| Role-Based Defaults          | Pre-configured notification sets per role               |
| Acknowledgment Required      | Critical alerts require explicit dismissal              |
| Smart Suppression            | Suppress repeat notifications for the same issue within cooldown window |
| Channel Preference           | Users choose preferred channel per notification type    |

### 5.2 Recommended Notification Profiles

| Role               | In-App | SMS    | Email  | Sound Alert | Recommended Volume |
|--------------------|--------|--------|--------|-------------|-------------------|
| Organization Owner | Critical only | Critical | Daily digest | None | Low (5-10/day) |
| Branch Manager     | All    | Critical + High | Daily digest | Critical | Medium (15-25/day) |
| Service Advisor    | All    | Customer-related | None | New job card | Medium (20-30/day) |
| Technician         | Assignment + QC | None | None | Assignment | Low (5-15/day) |
| Parts Specialist   | Parts requests | Stockout | Reorder | Parts request | Medium (10-20/day) |
| Cashier            | Payment-related | None | None | Payment ready | Low (5-15/day) |

---

## 6. Batch Operations for High-Volume Workshops

### 6.1 Available Batch Operations

| Operation                    | Description                                              | Access Level     |
|------------------------------|----------------------------------------------------------|------------------|
| Batch Check-In               | Check in multiple vehicles simultaneously (fleet arrivals) | Service Advisor  |
| Batch Assignment             | Assign multiple jobs to technicians at once              | Supervisor       |
| Batch Status Update          | Move multiple job cards to the next stage                | Supervisor       |
| Batch Invoice Generation     | Generate invoices for multiple completed jobs            | Cashier/Finance  |
| Batch SMS Notification       | Send notifications to multiple customers                 | Service Advisor  |
| Batch Payment Recording      | Record payments for multiple invoices                    | Cashier          |
| Batch Parts Request          | Request parts for multiple job cards in one order        | Parts Specialist |

### 6.2 Fleet Service Workflow

For workshops servicing corporate fleets, a specialized workflow is available:

1. **Fleet Check-In:** Upload fleet vehicle list (CSV or API integration), batch-create job cards
2. **Template Application:** Apply standard service template to all vehicles in the fleet
3. **Bay Scheduling:** Auto-schedule vehicles across available bays based on capacity
4. **Progress Tracking:** Fleet dashboard shows completion percentage across all vehicles
5. **Fleet Invoice:** Single consolidated invoice or per-vehicle invoicing (configurable)
6. **Fleet Reporting:** Aggregate service report for the fleet manager

---

## 7. Template-Based Job Creation

### 7.1 Service Templates

| Template Type           | Description                                              | Typical Use                    |
|-------------------------|----------------------------------------------------------|--------------------------------|
| Quick Service           | Pre-defined service with fixed parts and labor           | Oil change, tire rotation      |
| Inspection Package      | Multi-point inspection checklist                         | Pre-purchase, annual inspection |
| Maintenance Package     | Bundled services at package price                        | 30K/60K/90K km service         |
| Seasonal Package        | Season-specific service bundle                           | Summer AC package, winter check |
| Vehicle-Specific        | Template tied to specific make/model/year                | Toyota Camry 60K service       |
| Custom Template         | Workshop-created for repeat service patterns             | Fleet standard service          |

### 7.2 Template Configuration Elements

| Element               | Description                                              | Example                        |
|-----------------------|----------------------------------------------------------|--------------------------------|
| Service Items         | List of services included                                | Oil change, filter, fluid check |
| Parts List            | Required parts with OEM and aftermarket options          | Oil filter OEM 90915-YZZD4     |
| Labor Time            | Estimated labor hours                                    | 1.5 hours                     |
| Price (Fixed/Dynamic) | Fixed package price or calculated from components        | SAR 350 fixed                  |
| Checklist             | Inspection or completion checklist                       | 12-point oil change checklist  |
| Applicable Vehicles   | Vehicle make/model/year compatibility                    | All Toyota sedans 2018+        |
| Validity Period       | Template active dates                                    | Year-round or seasonal         |
| Discount Rules        | Built-in discounts or promotions                         | 10% fleet discount             |

### 7.3 Template Management

- Templates are created and maintained by Branch Managers or Service Managers
- Organization-level templates cascade to all branches (can be overridden locally)
- Template versioning tracks changes over time
- Inactive templates are archived, not deleted, to preserve historical job card references
- Templates can be cloned and modified for quick creation of variants

---

## 8. Workflow Performance Metrics

| Metric                           | Definition                                    | Target                         |
|----------------------------------|-----------------------------------------------|--------------------------------|
| Average Stage Duration           | Mean time spent in each workflow stage         | Varies by stage                |
| Bottleneck Identification        | Stage with longest average duration            | Reduce by 20% quarterly       |
| Stage Skip Rate                  | Frequency of stage skips (where allowed)       | < 10% of jobs                  |
| Automation Trigger Rate          | Percentage of actions handled by automation    | > 60% for notifications       |
| Template Utilization             | Jobs created from templates vs manual          | > 70% for routine services     |
| Approval Response Time           | Time from approval request to decision         | Within defined SLA             |

---

## 9. Document References

- [Getting Started Guide](../../user-documentation/guides/getting-started.md) -- Basic workflow setup
- [Data Dictionary](../reference/data-dictionary.md) -- Workflow entity field definitions
- [Security Architecture](../../system/security/security-architecture.md) -- Approval chain security model
- [Compliance Requirements](../../requirements/non-functional/compliance.md) -- Workflow compliance requirements

---

*End of Document -- SA-KB-LIB-012*
