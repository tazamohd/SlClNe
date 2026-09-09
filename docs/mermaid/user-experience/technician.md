# Technician — User Experience Journey

The Technician's relationship with SALIS AUTO is a tool-for-the-hands-dirty-workday: a focused, tablet-friendly Technician Portal scoped to only their own assigned jobs, used to accept work, log inspections and repairs, request parts, and hand off to QC. Their satisfaction hinges on how little friction stands between "I finished the work" and "the system reflects that" — every extra tap on a greasy-gloved tablet is a small tax on an already physical job.

```mermaid
journey
    title Technician — Assigned Job Workflow
    section Start of Shift
      Clock in on Time Clock: 5: Technician
      Log in to Technician Portal: 5: Technician
      Review My Jobs queue by priority: 4: Technician
    section Accepting & Inspecting
      Accept next job: 4: Technician
      View job details and customer-redacted info: 4: Technician
      Perform multi-point inspection checklist: 3: Technician
      Blocked from submitting until all 22 items verdicted: 2: Technician
    section Repair & Parts
      Wait for estimate approval before repair starts: 2: Technician
      Perform approved repair work: 4: Technician
      Request part with SAR 0 approval ceiling: 3: Technician
      Wait on Storekeeper to issue requested part: 2: Technician
      Log time and photo-document work: 4: Technician
    section Handoff to QC
      Mark repair complete: 4: Technician
      Hand off to QC inspector (cannot self-certify): 4: Technician
      Move to next job in queue: 5: Technician
    section End of Shift
      Review completed jobs count: 4: Technician
      Clock out: 5: Technician
```

## Journey Detail

| Stage | Touchpoint/Screen | Pain Point | Opportunity/Mitigation |
|---|---|---|---|
| Job queue | Technician Portal Dashboard | Own-scope only (by design) — cannot see teammates' queues to offer help during a lull | Acceptable scope restriction; a "need a hand" broadcast to the Manager could route slack capacity |
| Inspection checklist | `/workshop-inspection` | Cannot submit a half-complete inspection (22 items); on a real vehicle with limited access, one unreachable item blocks the whole submission | Allow a justified "unable to inspect" verdict distinct from N/A, so genuine access issues don't block the gate |
| Waiting for estimate approval | Repair stage gate | Technician is idle once inspection is submitted until Advisor/Manager approves the estimate and (if required) the customer signs — no ETA shown | Show technician-facing status ("awaiting customer signature") so they can reprioritize to another job instead of waiting |
| Parts request | Technician Portal → Parts | SAR 0 ceiling means every part, however small, requires Storekeeper action; requests can sit "Pending" with no visible queue position | Show estimated fulfillment time or Storekeeper queue depth on the request status |
| Customer contact fields | Job Detail | Phone/email redacted for technicians (security rule) — occasionally technicians want to call about vehicle access and cannot | Document this rule visibly in the UI (not just the guide) so it reads as "by design" rather than a bug |
| QC handoff | Repair → QC transition | Technician has no visibility once handed to QC — cannot see if/why a job bounces back until reassigned | Read-only status ping back to the technician on QC pass/fail for closed-loop feedback |
