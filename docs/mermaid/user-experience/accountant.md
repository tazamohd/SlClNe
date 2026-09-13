# Accountant — User Experience Journey

The Accountant's relationship with SALIS AUTO is one of precision and compliance: chart of accounts, journal entries that must balance to the halala, ZATCA-compliant e-invoicing with a cryptographic hash chain, and a SAR 25,000 approval ceiling. Their satisfaction comes from the system doing the compliance-heavy lifting (VAT, QR codes, hash chains) automatically and correctly, and dips whenever a manual step or validation error interrupts an otherwise routine close.

```mermaid
journey
    title Accountant — Financial Operations Cycle
    section Daily Bookkeeping
      Log in and land on Dashboard: 5: Accountant
      Review new expenses and categorize: 4: Accountant
      Create balanced journal entry: 4: Accountant
      Hit imbalanced entry, must correct debits/credits: 2: Accountant
    section Invoicing
      Create invoice from completed job card: 4: Accountant
      System auto-calculates 15% VAT: 5: Accountant
      Verify ZATCA fields (VAT number, hash chain): 3: Accountant
      Hit ZATCA validation failure on missing field: 2: Accountant
      Issue invoice with QR code generated: 5: Accountant
    section Payments
      Record customer payment (card/bank/cash): 5: Accountant
      Generate receipt automatically: 5: Accountant
      Track partial payment balance: 4: Accountant
    section Approvals
      Review purchase order within SAR 25K ceiling: 4: Accountant
      Approve or escalate above ceiling: 4: Accountant
      Review supplier invoice for discrepancy: 3: Accountant
    section Period Close
      Run Trial Balance and reconcile: 4: Accountant
      Generate P&L and Balance Sheet: 4: Accountant
      Complete month-end close: 4: Accountant
```

## Journey Detail

| Stage | Touchpoint/Screen | Pain Point | Opportunity/Mitigation |
|---|---|---|---|
| Journal Entries | `/journal-entries` | System correctly blocks imbalanced entries, but the block can feel abrupt without inline guidance on which side is short | Show the running debit/credit delta live as lines are added, not just at save-time |
| Invoice ZATCA compliance | `/invoices` | ZATCA validation failures (missing `vatNumber`, `sellerVatNumber`, or broken `hashPrev`/`hashSelf` chain) block invoice issuance (common-issues.md #15) | Pre-flight ZATCA readiness check on org settings, surfaced before the accountant starts building the invoice |
| Segregation of duties | Journal posting | "SOD: post != approve" — the person posting a journal entry cannot also approve it, which is correct but can stall small orgs with few finance staff | Document the minimum-staffing implication clearly in onboarding for small tenants |
| Approval ceiling | Purchase order / expense approval | SAR 25,000 ceiling means larger POs route elsewhere, adding a coordination step mid-workflow | Ceiling shown up front (already implemented per common-issues.md #7) reduces surprise; keep this pattern |
| Reports & Close | Trial Balance, P&L, Balance Sheet | CSV export capped at 50,000 rows; large multi-branch orgs may hit this during month-end close | Add row-count warning and support incremental/paginated export for month-end reporting |
