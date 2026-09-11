# Accountant Journey

The Accountant manages SALIS AUTO's financial backbone: chart of accounts, journal entries, invoices, payments, and ZATCA-compliant reporting, with an organization-wide scope and a SAR 25,000 approval ceiling. A key control is that the person who *posts* a journal entry cannot be the same person who *approves* it (segregation of duties).

## Primary Scenario: Daily Financial Operations

```mermaid
flowchart TD
    Login["Login"] --> Dash["Dashboard\nApproval Ceiling: SAR 25,000"]
    Dash --> Invoices["Invoices\n15% VAT, ZATCA Phase 2 e-invoice"]
    Dash --> Payments["Payments"]
    Dash --> Journals["Journals\nSOD: poster != approver"]
    Dash --> Reports["Reports\nTrial Balance | P&L | Month-End Close"]

    Journals --> DrCr["Enter Dr / Cr lines"]
    DrCr --> Balance{"Debits = Credits?"}
    Balance -->|No| Fix["Blocked -- fix imbalanced entry"]
    Fix --> DrCr
    Balance -->|Yes| Post["Post Entry"]

    Reports --> TrialBalance["Trial Balance"]
    Reports --> PL["P&L Statement"]
    Reports --> MonthEnd["Month-End Close"]
```

## Sub-Scenario: Invoice & Payment Cycle

```mermaid
flowchart TD
    Create["Create Invoice\n(from job card or standalone)"] --> Lines["Add line items\nParts | Labour | Fees"]
    Lines --> ServerCalc["Server calculates subtotal + 15% VAT"]
    ServerCalc --> Draft["Save as Draft"]
    Draft --> Issue["Issue Invoice\nQR code + hash chain generated"]
    Issue --> CustomerPays["Customer pays\n(Card / Bank Transfer / Cash)"]
    CustomerPays --> Record["Record Payment + generate Receipt"]
    Record --> PaidCheck{"Paid in full?"}
    PaidCheck -->|Yes| Paid["Status: Paid"]
    PaidCheck -->|No| Partial["Status: Partially Paid / Issued\n(await remaining balance)"]
```

## Sub-Scenario: Estimate / PO Approval Ceiling

```mermaid
flowchart TD
    Amount["Estimate or PO amount routed to Accountant"] --> Ceiling{"Within SAR 25,000?"}
    Ceiling -->|Yes| Approve["Accountant Approves"]
    Ceiling -->|No| EscalateMgr["Escalate to Branch Manager (up to SAR 50,000)\nor Owner (unlimited)"]
```

**ZATCA compliance**: every issued invoice automatically generates seller/buyer VAT numbers, a QR code, and a tamper-evident hash chain (`hashSelf` linked to `hashPrev`) -- VAT is always computed server-side at 15%, never trusted from the browser.
