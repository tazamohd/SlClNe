# SALIS AUTO -- Technician Productivity Tips

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-007                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This guide provides practical, day-to-day tips for technicians using the SALIS AUTO mobile and workshop interfaces. Efficient use of the platform reduces administrative overhead, speeds up job completion, and improves QC pass rates. Technicians who follow these practices typically see 15-25% productivity improvements within the first month. For the complete workshop workflow, see [Job Lifecycle](../../user-documentation/workflows/job-lifecycle.md). For role-specific platform navigation, see [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md).

---

## 2. Efficient Job Card Updates from Mobile

### 2.1 Mobile App Quick Actions

The SALIS AUTO mobile app provides shortcuts for the most common technician actions:

| Action                      | Shortcut Location          | Time Saved vs. Full Nav |
|-----------------------------|---------------------------|------------------------|
| View assigned jobs          | Home screen job list       | Immediate              |
| Start/pause/complete job    | Swipe on job card          | 5-10 seconds           |
| Add labor line              | "+" button on active job   | 10-15 seconds          |
| Request parts               | Parts icon on active job   | 15-20 seconds          |
| Add photo                   | Camera icon on active job  | 5 seconds              |
| Update job notes            | Notes icon on active job   | 10 seconds             |
| Clock in/out                | Home screen timer button   | Immediate              |

### 2.2 Job Card Update Best Practices

**Do update in real time:**
- Mark job as "In Progress" the moment you start working on the vehicle
- Add labor lines as each task is completed, not at the end of the day
- Request parts as soon as you identify the need, not in batches
- Take photos during disassembly when the issue is visible

**Do not batch updates:**
- Entering all updates at end-of-day leads to inaccurate time tracking
- Delayed parts requests cause unnecessary vehicle hold time
- Late status updates mislead service advisors giving customers ETAs

### 2.3 Voice-to-Text for Notes

The mobile app supports voice-to-text input in both English and Arabic. Use it for longer job notes:

1. Tap the notes field on the active job card
2. Tap the microphone icon
3. Speak clearly, describing findings or actions taken
4. Review the transcription for accuracy before saving
5. Correct any misheard technical terms manually

### 2.4 Offline Mode

When working in areas with poor connectivity (underground bays, metal-walled shops):

- The app caches your assigned jobs and inspection checklists for offline use
- Updates made offline sync automatically when connectivity is restored
- Photos taken offline are queued for upload
- Time tracking continues to run accurately offline
- A sync indicator on the home screen shows pending offline changes

---

## 3. Fast Inspection Checklist Completion

### 3.1 Inspection Workflow

The standard multi-point inspection in SALIS AUTO follows a structured flow:

| Zone     | Inspection Area               | Typical Items | Target Time |
|----------|------------------------------|---------------|-------------|
| Exterior | Body panels, glass, lights    | 12 items      | 3 min       |
| Under hood| Fluids, belts, hoses, battery| 10 items      | 5 min       |
| Interior | Controls, AC, seats, dash     | 8 items       | 3 min       |
| Under car| Suspension, exhaust, leaks    | 10 items      | 5 min       |
| Tires    | Tread, pressure, alignment    | 8 items       | 4 min       |
| Brakes   | Pads, rotors, fluid, lines    | 6 items       | 4 min       |
| Road test| Steering, brakes, noise, vibr | 6 items       | 5 min       |
| **Total**|                               | **60 items**  | **29 min**  |

### 3.2 Speed Tips for Inspections

**Follow the physical walk-around order:**
The checklist is organized to match a logical walk-around path. Start at the driver's front corner and move clockwise. Do not skip around the checklist.

**Use the traffic light system efficiently:**
- Green (OK): Single tap -- no notes or photo needed
- Yellow (Attention Soon): Tap + brief note on the concern
- Red (Immediate Attention): Tap + detailed note + mandatory photo

**Pre-populate known conditions:**
If the customer reported a specific issue at check-in (e.g., "AC not cooling"), the system pre-flags the related inspection items. Focus detailed attention on these pre-flagged items first.

**Tablet vs. phone:**
Use a tablet mounted on a portable stand for inspections if available. The larger screen shows more items at once and speeds up tapping.

### 3.3 Common Inspection Mistakes

| Mistake                          | Impact                        | Prevention                   |
|----------------------------------|-------------------------------|------------------------------|
| Marking all items green quickly  | Missed issues, liability risk | Physically check each item   |
| Skipping road test               | Intermittent issues missed    | Always complete road test    |
| No photos on red items           | Customer disputes, QC rejections| Make photos mandatory habit |
| Wrong vehicle/VIN                | All findings on wrong record  | Verify plate at checklist start|
| Incomplete tire measurements     | Inaccurate tread depth data   | Use depth gauge, all 4 corners|

---

## 4. Photo Documentation Standards

### 4.1 When to Photograph

| Scenario                           | Required | Minimum Photos |
|------------------------------------|----------|----------------|
| Pre-existing damage at check-in    | Yes      | 4 (each side)   |
| Red inspection findings            | Yes      | 1 per finding   |
| Before disassembly of worn parts   | Yes      | 1-2             |
| Removed parts (showing wear/damage)| Yes      | 1               |
| Completed repair (before assembly) | Recommended| 1              |
| Odometer at check-in              | Yes      | 1               |
| Odometer at delivery              | Yes      | 1               |

### 4.2 Photo Quality Standards

| Aspect            | Standard                                        |
|-------------------|-------------------------------------------------|
| Focus             | Sharp and clear -- no blur                      |
| Lighting          | Well-lit; use phone flashlight if under vehicle |
| Distance          | Close enough to see the issue detail            |
| Context           | Include surrounding area for location reference |
| Orientation       | Landscape for wide shots, portrait for tall parts|
| Finger/shadow     | Keep fingers and shadows out of the frame       |
| File size         | App auto-compresses; no manual action needed    |

### 4.3 Photo Angles by Scenario

**Brake pad wear:**
1. Side view showing pad thickness against rotor
2. Top-down view showing pad surface condition

**Tire condition:**
1. Close-up of tread depth with gauge visible
2. Sidewall showing any cracks or bulges
3. Full tire showing uneven wear pattern if present

**Fluid leak:**
1. Overview showing leak location on the vehicle
2. Close-up of the leak source
3. Drip pattern on the ground beneath the vehicle

**Body damage:**
1. Wide shot showing panel and location on vehicle
2. Close-up of the damage
3. Angle shot showing depth of dent or scratch

### 4.4 Photo Labeling

SALIS AUTO automatically tags photos with:

- Job card number
- Timestamp
- Inspection item (if taken during inspection)
- Technician name

Add a manual label when the automatic context is insufficient. For example, label "LF brake pad -- inner" to distinguish from "LF brake pad -- outer."

---

## 5. Time Tracking Discipline

### 5.1 Why Accurate Time Tracking Matters

| Impact Area              | How Time Data Is Used                          |
|--------------------------|-----------------------------------------------|
| Customer billing         | Labor charges calculated from tracked time     |
| Technician productivity  | Efficiency ratio = billed hours / clocked hours|
| Job estimation           | Historical actuals improve future estimates    |
| Bay scheduling           | Realistic time blocks prevent overbooking      |
| Payroll (if applicable)  | Overtime calculation, performance bonuses      |

### 5.2 Time Tracking Rules

| Rule                               | Details                                  |
|------------------------------------|------------------------------------------|
| Clock into the job, not the day    | Start the job timer when you begin work  |
| Pause for interruptions            | Pause if waiting for parts, instructions |
| Do not run multiple job timers     | Only one active job at a time            |
| Clock out before leaving the bay   | Stop the timer when you physically stop  |
| Breaks are separate                | Prayer and meal breaks should pause all timers |
| End of day                         | All job timers must be stopped before shift end |

### 5.3 Productivity Metrics

| Metric              | Formula                                     | Target   |
|---------------------|---------------------------------------------|----------|
| Productive hours    | Total job time / Total clocked hours         | 80%+     |
| Efficiency ratio    | Estimated time / Actual time                 | 95-110%  |
| Billed hours ratio  | Billed hours / Productive hours              | 85%+     |
| Jobs per day        | Total jobs completed / Working days          | 4-6      |

### 5.4 Common Time Tracking Errors

| Error                            | Problem It Causes                  | Fix                          |
|----------------------------------|------------------------------------|------------------------------|
| Forgot to start timer            | Zero time on job, billing issue    | Start immediately on arrival |
| Timer running during parts wait  | Inflated labor time                | Pause for non-work time      |
| Multiple jobs running            | Split time, inaccurate data        | Stop one before starting next|
| Timer left running overnight     | Massive labor hours logged         | Set end-of-shift reminders   |
| Rounding to nearest hour         | Inaccurate data for estimates      | Let the system track exactly |

---

## 6. Parts Request Workflow Shortcuts

### 6.1 Standard Parts Request Flow

```
Technician identifies need --> Creates request in mobile app
  --> Parts team receives notification --> Picks part from bin
  --> Delivers to bay / tech picks up --> Technician confirms receipt
  --> Part consumed on job card
```

### 6.2 Quick Request Methods

| Method                    | When to Use                         | Steps Required |
|---------------------------|-------------------------------------|----------------|
| Scan part barcode         | Part number known, barcode visible  | 1 (scan)       |
| Search by part number     | Part number known, no barcode       | 2 (type + add) |
| Search by description     | Part number unknown                 | 3 (search + select + add)|
| Search by vehicle + system| General need (e.g., "oil filter for this car")| 3 |
| Request from job estimate | Parts already on the approved estimate| 1 (tap to request)|

### 6.3 Best Practice: Request from Estimate

The fastest method is to request parts directly from the approved estimate:

1. Open the active job card
2. Navigate to the Estimate tab
3. Tap "Request All Parts" or select individual lines
4. Parts team receives the request with exact part numbers and quantities
5. No need to re-enter descriptions or search the catalog

### 6.4 Handling Part Substitutions

When the exact part is unavailable:

1. Check if a compatible alternative is in stock (the system may suggest substitutes)
2. If a substitute is available, add it to the request with a note explaining the substitution
3. The parts manager must approve substitutions for Class A parts
4. Update the job card notes to document the substitution for QC reference
5. Inform the service advisor if the substitute has a different price

### 6.5 Returning Unused Parts

If a requested part is not used:

1. Return it to the parts counter within the same shift
2. Mark the part as "Returned Unused" on the job card
3. The parts team restocks and credits the job card
4. Do not leave uninstalled parts at the bay or in your toolbox

---

## 7. QC Preparation Checklist

### 7.1 Pre-QC Self-Check

Before marking a job as ready for QC, verify every item on this checklist:

| Category           | Check Item                                           |
|--------------------|-----------------------------------------------------|
| Repair Completion  | All approved repair items completed                  |
| Repair Completion  | No leftover parts or tools in the engine bay         |
| Repair Completion  | All fasteners torqued to specification               |
| Fluids             | All fluid levels correct (oil, coolant, brake, PS)   |
| Fluids             | No leaks visible underneath the vehicle              |
| Electrical         | Battery terminals clean and tight                    |
| Electrical         | All lights functional (headlights, brake, turn)      |
| Interior           | Seat, mirror, and steering wheel returned to position|
| Interior           | No grease marks on steering wheel, seats, or panels  |
| Interior           | Floor mats and seat covers replaced                  |
| Exterior           | No new scratches, dents, or damage                   |
| Tires              | Tire pressures set to specification                  |
| Documentation      | All job card labor lines completed with times         |
| Documentation      | Photos uploaded for all red inspection findings       |
| Documentation      | Parts usage matches what was consumed                 |
| Road Test          | Road test completed if required by job type           |

### 7.2 QC Preparation Time

Allow 10-15 minutes for the self-check before flagging the job for QC. This investment pays for itself by avoiding QC rejections, which cost 20-40 minutes of rework and rescheduling on average.

### 7.3 Marking Ready for QC

1. Complete the pre-QC self-check above
2. Tap "Ready for QC" on the job card in the mobile app
3. Park the vehicle in the QC inspection area (not in the bay)
4. Ensure keys are in the vehicle or in the key lockbox
5. The QC inspector receives a notification and the job enters the QC queue

---

## 8. Common QC Rejection Reasons and Prevention

### 8.1 Top Rejection Reasons

| Rank | Rejection Reason                    | Frequency | Root Cause                    |
|------|-------------------------------------|-----------|-------------------------------|
| 1    | Incomplete fluid top-off            | 22%       | Skipping final fluid check    |
| 2    | Fastener not torqued to spec        | 18%       | Rushing, missing torque step  |
| 3    | Grease marks on interior            | 15%       | Not using seat/steering covers|
| 4    | Missing documentation / photos      | 12%       | Batching updates at end       |
| 5    | Warning light still on after repair | 10%       | Not clearing codes post-repair|
| 6    | Tire pressure incorrect             | 8%        | Skipping pressure check       |
| 7    | Road test not completed             | 7%        | Time pressure, end of shift   |
| 8    | New damage to vehicle               | 5%        | Careless handling             |
| 9    | Parts left in engine bay            | 3%        | Poor workspace discipline     |

### 8.2 Prevention Strategies

**For fluid issues (Rank 1):**
Make the fluid check the very last step before the self-check. Top off after the vehicle has been running for 5 minutes and allowed to settle for 2 minutes.

**For torque issues (Rank 2):**
Use a torque wrench for all critical fasteners. Never tighten "by feel" for wheel nuts, engine mounts, suspension bolts, or brake calipers. Keep a torque specification card at your bay.

**For cleanliness issues (Rank 3):**
Apply disposable seat covers, steering wheel covers, and floor mat protectors before starting any work. Wipe down all touched surfaces with a clean cloth before the self-check.

**For documentation issues (Rank 4):**
Update the job card in real time as described in Section 2. Do not wait until the job is done.

**For warning light issues (Rank 5):**
After any repair that could trigger a warning light (check engine, ABS, airbag, TPMS), connect the diagnostic tool and clear codes. Then start the vehicle and verify the light does not return.

**For tire pressure issues (Rank 6):**
Check and set tire pressures using a calibrated gauge after any work that removes or disturbs wheels. Reference the placard on the driver's door jamb for the correct pressures.

### 8.3 Tracking Your QC Pass Rate

Your personal QC pass rate is visible in the mobile app under My Performance. Target a first-pass rate of 90% or higher. If your rate drops below 85%, review this section and discuss improvement areas with your workshop controller. See [Workshop Efficiency Best Practices](./workshop-efficiency-best-practices.md) for organizational QC targets.

---

## 9. Tool Organization

### 9.1 Bay Organization Standards

| Zone               | Contents                                   |
|--------------------|--------------------------------------------|
| Primary tool chest | Daily-use hand tools, sockets, wrenches    |
| Secondary cart     | Specialized tools, diagnostic equipment    |
| Wall-mounted       | Frequently used power tools, air tools     |
| Floor area         | Jack, jack stands, creeper                 |
| Parts staging      | Pre-picked parts for current job only      |
| Waste area         | Used fluids, used parts, shop rags         |

### 9.2 End-of-Shift Routine

Complete this 5-minute routine before clocking out:

1. Return all tools to their designated locations
2. Clean the bay floor of oil, parts, and debris
3. Dispose of used fluids in the proper waste containers
4. Return unused parts to the parts counter
5. Verify no personal items are left in customer vehicles
6. Wipe down the tool chest surface
7. Ensure the bay area is safe and clear for the next shift

### 9.3 Tool Accountability

- Sign out specialty tools from the tool crib using the SALIS AUTO tool tracking module
- Report lost or damaged tools immediately to the workshop controller
- Do not borrow tools from other technicians' bays without permission
- Request new or replacement tools through the proper procurement channel

### 9.4 Personal Protective Equipment (PPE)

| PPE Item              | When Required                            |
|-----------------------|------------------------------------------|
| Safety glasses        | All work under hood and under vehicle    |
| Gloves                | Fluid handling, chemical exposure        |
| Steel-toe boots       | Always in the workshop                   |
| Hearing protection    | Power tools, impact wrenches             |
| Back support belt     | Heavy lifting (tires, transmissions)     |
| Face shield           | Grinding, welding                        |

---

## 10. Daily Productivity Checklist

A quick-reference checklist for maximizing your daily output:

### 10.1 Start of Shift

- [ ] Clock in on time
- [ ] Review assigned jobs for the day on the mobile app
- [ ] Check bay cleanliness and tool readiness
- [ ] Attend the daily stand-up briefing
- [ ] Verify parts pre-staged for first job (if applicable)

### 10.2 During Each Job

- [ ] Start the job timer before beginning work
- [ ] Follow the estimate sequence for repair steps
- [ ] Request parts immediately when a need is identified
- [ ] Take photos of findings and completed work
- [ ] Update job notes in real time
- [ ] Pause the timer for non-productive time
- [ ] Run the pre-QC self-check before marking ready

### 10.3 End of Shift

- [ ] Stop all active job timers
- [ ] Complete all pending job card updates
- [ ] Add handoff notes for any in-progress jobs
- [ ] Return unused parts and specialty tools
- [ ] Clean and organize the bay
- [ ] Clock out

---

## 11. Related Documents

- [Workshop Efficiency Best Practices](./workshop-efficiency-best-practices.md)
- [Parts Inventory Optimization](./parts-inventory-optimization.md)
- [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../../user-documentation/workflows/job-lifecycle.md)
- [RBAC Matrix](../reference/rbac-matrix.md)

---

*End of Document SA-KB-LIB-007*
