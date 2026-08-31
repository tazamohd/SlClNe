# SALIS AUTO -- Quality Control Standards

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-008                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

Quality Control (QC) in SALIS AUTO is a mandatory checkpoint in the workshop lifecycle that ensures every vehicle leaving the facility meets defined service standards. The QC stage sits between Repair completion and Delivery, serving as the final gate before customer handoff. This document defines multi-point inspection protocols by service type, enforcement rationale for Separation of Duties (SOD), common failure patterns, and photo evidence requirements.

All QC activities are recorded in the platform with timestamps, inspector identity, and outcome classification. QC records are immutable once finalized and feed into technician performance analytics and customer satisfaction dashboards.

---

## 2. Multi-Point Inspection Protocols

### 2.1 Oil Change Service -- 12-Point Inspection

| Point | Inspection Item                        | Pass Criteria                                    |
|-------|----------------------------------------|--------------------------------------------------|
| 1     | Oil level                              | Between MIN and MAX on dipstick                  |
| 2     | Oil filter installation                | Hand-tight plus 3/4 turn, no leaks               |
| 3     | Drain plug torque                      | Torqued to manufacturer spec (typically 25-35 Nm) |
| 4     | Oil type verification                  | Matches vehicle specification in job card         |
| 5     | Oil quantity verification              | Within 0.1L of manufacturer specification         |
| 6     | Under-vehicle leak check               | No drips after 2-minute idle                      |
| 7     | Oil pressure warning light             | Off after engine start                            |
| 8     | Oil life monitor reset                 | Reset to 100% or next service interval            |
| 9     | Service sticker applied                | Next service date and mileage recorded            |
| 10    | Engine bay cleanliness                 | No spilled oil on engine or surrounding parts     |
| 11    | Fluid top-up check                     | Coolant, washer, brake fluid levels normal        |
| 12    | Test drive (if applicable)             | No unusual engine noise, oil pressure stable      |

### 2.2 Brake Service -- 18-Point Inspection

| Point | Inspection Item                        | Pass Criteria                                    |
|-------|----------------------------------------|--------------------------------------------------|
| 1     | Pad thickness (front)                  | Minimum 3mm remaining after service              |
| 2     | Pad thickness (rear)                   | Minimum 3mm remaining after service              |
| 3     | Rotor surface condition                | No scoring deeper than 0.5mm, within thickness spec |
| 4     | Rotor runout measurement               | Less than 0.05mm lateral runout                  |
| 5     | Caliper slide pin operation            | Smooth movement, properly lubricated             |
| 6     | Brake line inspection                  | No cracks, bulges, or leaks                      |
| 7     | Brake fluid level                      | Between MIN and MAX marks                        |
| 8     | Brake fluid condition                  | Moisture content below 3% (test strip)           |
| 9     | Wheel torque verification              | All lugs torqued to manufacturer spec            |
| 10    | ABS sensor clearance                   | Sensor properly seated, no debris                |
| 11    | Parking brake operation                | Holds vehicle on 15-degree incline               |
| 12    | Brake pedal feel                       | Firm pedal, no spongy feel, no excessive travel  |
| 13    | Brake warning light                    | Off after engine start and pedal pump            |
| 14    | ABS warning light                      | Off after engine start                           |
| 15    | Noise check (road test)                | No squealing, grinding, or pulsation             |
| 16    | Stopping distance (road test)          | Straight-line stop, no pulling                   |
| 17    | Hardware installation                  | Anti-rattle clips, shims properly installed      |
| 18    | Wheel alignment (visual)               | No visible camber or toe issues post-service     |

### 2.3 Full Service -- 35-Point Inspection

The full service inspection encompasses all oil change and brake checks plus additional systems:

| Point Range | System                    | Key Checks                                        |
|-------------|---------------------------|---------------------------------------------------|
| 1-12        | Engine and Lubrication     | All 12-point oil change checks                   |
| 13-18       | Braking System             | Abbreviated brake checks (6 critical points)     |
| 19-21       | Cooling System             | Coolant level, hose condition, thermostat operation |
| 22-24       | Electrical System          | Battery voltage (12.4V+), alternator output, lights |
| 25-27       | Steering and Suspension    | Power steering fluid, tie rod play, shock absorbers |
| 28-30       | Transmission               | Fluid level/color, shift quality, linkage         |
| 31-32       | HVAC System                | AC output temperature, cabin filter condition     |
| 33          | Tire Condition             | Tread depth (min 1.6mm), pressure, rotation       |
| 34          | Wiper and Washer           | Blade condition, washer fluid level and spray     |
| 35          | Road Test Summary          | Overall vehicle operation and drivability         |

---

## 3. Separation of Duties (SOD) Enforcement

### 3.1 Core Principle

The SOD pair **Perform Repair / Pass QC** is one of the five critical SOD pairs enforced by SALIS AUTO. A technician who performed any repair work on a job card is system-blocked from approving the QC inspection for that same job card.

### 3.2 Rationale

| Reason                          | Explanation                                                    |
|---------------------------------|----------------------------------------------------------------|
| Objectivity                     | Self-review introduces confirmation bias                       |
| Error Detection                 | Fresh eyes catch mistakes the original technician overlooks    |
| Accountability                  | Clear separation of responsibility for repair vs verification  |
| Liability Protection            | Workshop liability reduced when independent verification exists |
| Customer Trust                  | Customers expect independent quality checks                    |
| Insurance Requirements          | Many fleet and insurance contracts require independent QC      |
| Regulatory Alignment            | Aligns with SASO workshop certification standards              |

### 3.3 System Enforcement Mechanism

1. When a QC inspector opens a job card for inspection, the system checks the repair activity log
2. If the inspector's user ID matches any technician assignment on that job card, the QC form is blocked
3. The system displays: "SOD Conflict: You performed repair work on this job card and cannot conduct QC"
4. A supervisor override is available but requires documented justification and creates an audit trail entry
5. All SOD override events are flagged in the monthly compliance report

### 3.4 Small Workshop Accommodation

Workshops with fewer than three technicians may apply for a SOD waiver through the Branch Manager role. The waiver requires:

- Written justification uploaded to the system
- Approval from the organization owner
- Quarterly review of waiver necessity
- Enhanced photo evidence requirements (double the standard photo count)

---

## 4. Common QC Failures and Prevention

### 4.1 Top 10 QC Failure Categories

| Rank | Failure Category              | Frequency | Root Cause                              | Prevention Strategy                       |
|------|-------------------------------|-----------|------------------------------------------|-------------------------------------------|
| 1    | Incomplete service items      | 22%       | Rushed work, missed checklist items      | Mandatory checklist completion in app      |
| 2    | Torque specification errors   | 18%       | Wrong torque wrench, no calibration      | Digital torque wrench integration          |
| 3    | Fluid level discrepancies     | 15%       | Overfill or underfill                    | Graduated pour containers                 |
| 4    | Missing service stickers      | 12%       | Forgotten post-service step             | System prompt at job card completion       |
| 5    | Cleanliness issues            | 10%       | No final cleanup step                   | Cleanliness as mandatory checklist item    |
| 6    | Part number mismatch          | 8%        | Wrong part pulled from inventory         | Barcode scanning at installation           |
| 7    | Warning light not cleared     | 6%        | No OBD-II scan post-service             | Mandatory scan at QC stage                 |
| 8    | Road test not performed       | 4%        | Time pressure                           | Road test sign-off required for full service |
| 9    | Photo evidence missing        | 3%        | Forgotten during service                | Photo prompts at each service stage        |
| 10   | Incorrect documentation       | 2%        | Typos, wrong mileage entry              | Auto-populated fields where possible       |

### 4.2 Prevention Framework

The SALIS AUTO platform enforces prevention through:

1. **Pre-Service Validation** -- System validates parts against vehicle specifications before work begins
2. **In-Service Prompts** -- Mobile app prompts technicians at each critical step
3. **Post-Service Checklist** -- Mandatory digital checklist before marking repair complete
4. **QC Gate** -- Independent verification before delivery authorization

---

## 5. Photo Evidence Requirements

### 5.1 Photo Categories

| Category       | When Captured       | Purpose                                   | Minimum Count |
|----------------|---------------------|-------------------------------------------|---------------|
| Before         | At Check-In         | Document pre-existing condition            | 4 per vehicle |
| During         | During Repair       | Evidence of work performed                 | 2 per service item |
| After          | Post-Repair, Pre-QC | Final condition documentation              | 4 per vehicle |
| QC Findings    | During QC           | Document any issues found during QC        | 1 per finding |

### 5.2 Photo Quality Standards

- Minimum resolution: 1280x960 pixels
- Adequate lighting -- no dark or blurry images
- Clear focus on the component or area being documented
- Date and time metadata preserved (no screenshots of photos)
- Vehicle identification visible in at least one photo per set (license plate or VIN tag)

### 5.3 Mandatory Photo Points by Service Type

**Oil Change:**
- Engine bay before service
- Old oil filter removed
- New oil filter installed
- Oil level on dipstick after service

**Brake Service:**
- Each wheel area before removal
- Old pads/rotors with measurement tool visible
- New components installed
- Torque wrench reading on wheel lugs

**Full Service:**
- All oil change and brake photos
- Battery test results screen
- Tire tread depth gauge readings
- AC vent temperature reading

### 5.4 Photo Storage and Retention

All QC photos are stored within the SALIS AUTO platform linked to the job card. Retention period is 24 months from service date. Photos are accessible to customers through the customer portal for warranty and dispute resolution purposes.

---

## 6. Pass/Fail Criteria by Service Type

### 6.1 Pass Criteria

A job card passes QC when:

1. All inspection points for the service type receive a "Pass" or "N/A" status
2. All mandatory photos are uploaded and meet quality standards
3. Road test (where required) is completed and documented
4. No safety-critical findings are unresolved
5. Service sticker and customer documentation are prepared
6. OBD-II scan shows no active fault codes related to service performed

### 6.2 Conditional Pass

A conditional pass is permitted when:

- Non-safety cosmetic issues exist (minor cleanliness, label placement)
- Customer-declined items are documented with signed waiver
- Pre-existing conditions are photographed and noted

### 6.3 Fail Criteria

A job card fails QC when any of the following exist:

| Failure Type              | Examples                                              | Action Required          |
|---------------------------|-------------------------------------------------------|--------------------------|
| Safety Critical           | Loose wheel lugs, brake fluid leak, steering play     | Immediate rework         |
| Service Incomplete        | Missing service items from the estimate               | Return to technician     |
| Specification Mismatch    | Wrong oil grade, incorrect part installed              | Part replacement         |
| Documentation Gap         | Missing photos, incomplete checklist                  | Documentation completion |
| Cleanliness Failure       | Oil spills, fingerprints on interior                  | Cleanup required         |

---

## 7. QC Rejection Workflow and Rework Tracking

### 7.1 Rejection Process

1. QC inspector identifies failure and selects failure category in the system
2. Inspector adds description, selects severity (Critical / Major / Minor), and attaches photos
3. System creates a rework task linked to the original job card
4. Original technician receives notification with rework details
5. Job card status reverts from "QC" to "Rework" stage
6. Rework timer starts (tracked separately from original repair time)

### 7.2 Rework Tracking Metrics

| Metric                        | Definition                                          | Target      |
|-------------------------------|-----------------------------------------------------|-------------|
| First Pass Yield (FPY)        | Jobs passing QC on first attempt                    | > 92%       |
| Rework Rate                   | Jobs requiring rework / Total jobs                  | < 8%        |
| Average Rework Time           | Mean time to complete rework                        | < 30 min    |
| Repeat Rework Rate            | Jobs requiring more than one rework cycle           | < 2%        |
| Technician Rework Index       | Individual technician rework rate vs workshop avg   | < 1.2x      |

### 7.3 Escalation Procedures

- **First Rework:** Standard return to technician
- **Second Rework:** Supervisor notification, technician counseling
- **Third Rework:** Branch Manager involvement, skill assessment review
- **Chronic Pattern:** Training plan creation, potential reassignment

### 7.4 Rework Cost Tracking

All rework labor and parts costs are tracked against the original job card but flagged as rework costs. These costs are not billed to the customer and are attributed to the responsible technician for performance evaluation purposes. Monthly rework cost reports feed into the branch P&L analysis.

---

## 8. QC Role Permissions and Access

| Permission                     | QC Inspector | Senior Inspector | QC Manager |
|--------------------------------|:------------:|:----------------:|:----------:|
| Conduct QC inspection          | Yes          | Yes              | Yes        |
| Approve conditional pass       | No           | Yes              | Yes        |
| Override SOD restriction       | No           | No               | Yes        |
| View rework analytics          | Own branch   | Own branch       | All        |
| Modify QC checklist templates  | No           | No               | Yes        |
| Export QC reports               | No           | Yes              | Yes        |
| Configure pass/fail thresholds | No           | No               | Yes        |

---

## 9. Integration with Other Modules

- **Job Card Management:** QC stage is a mandatory transition in the job card workflow; see [Getting Started Guide](../../user-documentation/guides/getting-started.md)
- **Inventory:** Failed parts trigger return-to-vendor workflows
- **Customer Communication:** QC completion triggers automated customer notification
- **Invoicing:** Invoice generation is blocked until QC pass
- **Analytics:** QC metrics feed into branch and technician performance dashboards
- **Compliance:** QC records are included in regulatory audit packages; see [Compliance Requirements](../../requirements/non-functional/compliance.md)

---

## 10. Continuous Improvement

QC data is reviewed monthly by branch management and quarterly at the organization level. Key review activities include:

1. Analysis of failure trends by category and technician
2. Checklist template updates based on emerging failure patterns
3. Training needs identification from rework analytics
4. Benchmark comparison across branches within the organization
5. Customer complaint correlation with QC findings
6. Photo evidence quality audits

---

## 11. Document References

- [Data Dictionary](../reference/data-dictionary.md) -- Field definitions for QC-related data entities
- [Security Architecture](../../system/security/security-architecture.md) -- Access control for QC functions
- [Getting Started Guide](../../user-documentation/guides/getting-started.md) -- Platform navigation basics
- [Compliance Requirements](../../requirements/non-functional/compliance.md) -- Regulatory requirements for QC records

---

*End of Document -- SA-KB-LIB-008*
