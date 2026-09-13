# Service Advisor — User Experience Journey

The Service Advisor is the human face of the workshop: the only workshop role with direct, sustained customer contact, spanning check-in through delivery. Their experience is shaped by juggling two audiences at once — the customer who wants clarity and speed, and the internal workflow (inspection handoff, estimate approval, QC gate) that determines what they can actually promise.

```mermaid
journey
    title Service Advisor — Customer-Facing Workshop Cycle
    section Check-In
      Greet customer at vehicle drop-off: 5: Advisor
      Record odometer, fuel level, belongings: 4: Advisor
      Log reported issues from customer: 4: Advisor
      Hand off to technician for inspection: 4: Advisor
    section Estimate Creation
      Receive inspection findings from technician: 4: Advisor
      Build parts and labour estimate: 4: Advisor
      Approve within SAR 5,000 ceiling: 5: Advisor
      Submit larger estimate to Manager for approval: 3: Advisor
      Wait for Manager/Owner approval on big-ticket job: 2: Advisor
    section Customer Communication
      Send estimate via SMS with e-signature link: 4: Advisor
      Wait for customer OTP and signature: 3: Advisor
      Field customer phone call asking about delay: 2: Advisor
      Confirm customer-approved items proceed to repair: 5: Advisor
    section Monitoring Repair & QC
      Track repair progress via WorkflowStepper: 4: Advisor
      Send customer stage-update notifications: 4: Advisor
      Notice job returned from QC to Repair: 2: Advisor
      Re-notify customer of delay after QC fail: 2: Advisor
    section Delivery
      Complete Delivery Checklist: 4: Advisor
      Hand over vehicle and collect signature: 5: Advisor
      Close job card to Invoiced status: 5: Advisor
```

## Journey Detail

| Stage | Touchpoint/Screen | Pain Point | Opportunity/Mitigation |
|---|---|---|---|
| Check-In | `/workshop-checkin` | Manual entry of odometer/fuel/belongings under customer's eye adds pressure to be fast and accurate | Kiosk/tablet check-in with large touch targets already supported (44px targets per accessibility.md §9.1) |
| Estimate submission | `/workshop-estimate` | Advisor cannot approve their own estimate (SOD) — must route even routine estimates they authored to another approver if over ceiling | Clear ceiling indicator shown before submission (already documented) avoids surprise rejections |
| Customer e-signature wait | SMS approval link | No visibility into whether customer has even opened the link; advisor cannot act until customer responds, and often takes the resulting phone call | Add a "link opened / not yet opened" status on the advisor's estimate view so advisors know when to proactively call |
| Stage monitoring | Job Cards / WorkflowStepper | A QC "Return to Repair" silently adds rework time; advisor must manually notice and re-inform the customer, which can feel like breaking a promise | Auto-flag advisor's queue when a job regresses a stage, with a suggested customer message template |
| Delivery | `/workshop-delivery` | Delivery Checklist requires all six items before completion — a single missing item (e.g., Invoice Attached) blocks handover at the counter with the customer waiting | Pre-flight checklist visibility earlier in the QC stage so gaps are caught before the customer arrives |
