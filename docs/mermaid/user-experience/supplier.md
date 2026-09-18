# Supplier — User Experience Journey

The Supplier is an external B2B user with a narrow, transactional relationship to SALIS AUTO: receive and confirm purchase orders, ship goods, submit invoices, and get paid — all scoped strictly to their own POs and payments, with zero approval authority (SAR 0 ceiling) and no visibility into workshop operations. Their satisfaction depends on the portal being predictable and fast to act on, since delays on their end directly affect their performance rating and future business.

```mermaid
journey
    title Supplier — Purchase Order to Payment Cycle
    section Order Intake
      Log in to Supplier Portal: 4: Supplier
      Receive notification of new PO: 4: Supplier
      Review PO line items and delivery date: 4: Supplier
      Confirm order or reject with shortage note: 4: Supplier
    section Fulfillment
      Prepare shipment: 4: Supplier
      Update shipment date and tracking number: 3: Supplier
      Uncertain if workshop has seen tracking update: 2: Supplier
    section Delivery
      Ship goods to workshop: 4: Supplier
      Track delivery status to Delivered: 4: Supplier
      Handle reported quantity discrepancy: 2: Supplier
      Arrange supplementary delivery if needed: 3: Supplier
    section Invoicing & Payment
      Submit invoice against fulfilled PO: 4: Supplier
      Wait through Under Review status: 3: Supplier
      Invoice approved for payment: 5: Supplier
      Payment processed and visible in history: 5: Supplier
    section Ongoing Relationship
      Respond to new quote request: 4: Supplier
      Update catalog pricing and availability: 4: Supplier
      Check performance rating impact: 3: Supplier
```

## Journey Detail

| Stage | Touchpoint/Screen | Pain Point | Opportunity/Mitigation |
|---|---|---|---|
| Order confirmation | `/supplier-portal/orders` | No visible SLA for how quickly the supplier must confirm; quote requests "may have a deadline" per the guide but this isn't consistently surfaced | Show a countdown or due-by timestamp directly on pending POs and quote requests |
| Delivery updates | Update Delivery form | Supplier updates tracking info but has no confirmation that the Procurement Agent/Storekeeper actually saw it | Add a read-receipt or acknowledgment indicator once the workshop views the delivery update |
| Delivery discrepancy | Quantity mismatch handling | Discrepancy is reported *to* the supplier after the fact, putting them in a reactive, rating-at-risk position with limited context on what specifically was short | Include photos/line-level detail from the Storekeeper's receiving record in the discrepancy notification |
| Invoice review | Invoice status tracking | "Under Review" can sit indefinitely with no visible timeline, mirroring the internal Estimate Approval Timeout issue (common-issues.md #18 pattern) | Show expected review turnaround and escalate stale reviews automatically |
| Performance rating | Supplier profile | Rating factors (timeliness, quality, pricing, response time) are transparent in the guide, but not clearly exposed as a live, actionable score inside the portal itself | Surface a real-time rating breakdown so suppliers can self-correct before it affects future PO allocation |
| Scope restriction | General navigation | Supplier correctly cannot see workshop operations or customer data — a clean, appropriately narrow experience | Maintain strict scope; ensure error states (e.g., attempting to access a restricted route) read as "not applicable" rather than a broken link |
