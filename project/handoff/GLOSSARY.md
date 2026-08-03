# Glossary — SALIS AUTO

Domain terms the UI uses. Skim before you start writing, and share with Claude Code so it doesn't re-invent names.

- **Job / Job Card** — one repair engagement for a vehicle. The system-of-record for the workshop loop. In UI: `JobCards`, `JobDetail`, `JobCardDetail` (alias).
- **Estimate** — draft cost breakdown the customer signs off on before repair. See `Estimates`, `EstimateDetail`, `CustomerApproval`.
- **Invoice** — the final billable document. ZATCA e-invoicing rules apply. `Invoices`, `InvoiceDetail`, `InvoiceCreate`, `InvoicePreview`.
- **RFQ** — Request For Quote. Sent by a garage to spare-parts suppliers via `PartsNetwork`. Suppliers respond with quotes.
- **PO** — Purchase Order. Created when a quote is accepted, or standalone in `PurchaseOrder`.
- **OBD** — On-Board Diagnostics. Vehicle's diagnostic port used to read live sensors + DTCs. See `OBDDiagnostics`.
- **DTC** — Diagnostic Trouble Code. Standard 5-char codes (P0301 = "Cylinder 1 misfire"). Dictionary in `gms-data.js` under `DTC_CODES`.
- **VIN** — 17-char vehicle serial. Primary key for a vehicle across systems.
- **ZATCA** — Saudi Zakat, Tax and Customs Authority. Governs e-invoicing (VAT 15%, mandatory QR, hash chain).
- **CR / VAT number** — Commercial Registration and VAT registration IDs for a Saudi business. Required on invoices.
- **Mada** — Saudi domestic debit card scheme.
- **STC Pay** — Saudi mobile wallet.
- **SAR** — Saudi Riyal. All amounts.
- **Fleet** — a customer that operates many vehicles under one contract (rental agencies, corporates). See `FleetManagement`, `FleetContract`.
- **Kiosk** — the in-branch self-check-in tablet at reception. `KioskCheckIn`.
- **Approval line** — one step in an approval chain (submitter → approver → …). See `APPROVAL_LINES`.
- **SoD** — Segregation of Duties. Rules preventing the same person from creating and approving. See `SOD`.
- **RBAC** — Role-Based Access Control. See RBAC.md.
- **Tenant / org** — one garage business. Data isolation boundary. Users belong to exactly one tenant (except platform admins).
- **Branch** — a physical location under a tenant. Users may be scoped to a branch.
- **Technician** — floor mechanic. Uses `TechnicianPortal`.
- **Advisor** — service advisor. Front-of-house, deals with customers, creates estimates.
- **Storekeeper / parts** — inventory role. Manages stock, RFQs, receiving.
- **QC** — Quality Control inspector. Signs off before delivery.
- **PartsNetwork** vs **PartsSupplyNetwork** — the first is the B2B marketplace UX (garage-side and supplier-side); the second is the admin surface on the main shell that lets a super-admin manage the network.
- **TSB** — Technical Service Bulletin. OEM-issued fix guides. Appear in `TechnicianKB`.
- **Torque spec** — required tightening force for a fastener. In `TechnicianKB`.
- **e-signature** — customer's signed approval, captured on canvas, stored as a PNG blob referenced by the estimate. `CustomerApproval`.
