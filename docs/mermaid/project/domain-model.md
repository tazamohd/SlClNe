# Domain Model

The application is organized into 13 functional (bounded-context) domains plus the Authentication domain and the public Website, sharing the tenant-scoped data model. Source: `docs/domains.md`, `docs/architecture.md`.

```mermaid
flowchart TB
    AUTH["Auth\nLogin, OTP, SSO, sessions\n(public routes)"]

    subgraph CORE["Core Service Lifecycle"]
        WORKSHOP["Workshop\nJob cards, check-in, inspection,\nQC, delivery, bays"]
        REGISTRY["Registry\nCustomers, vehicles, fleets,\nappointments"]
    end

    subgraph MONEY["Money"]
        FINANCE["Finance\nInvoices, payments, receipts,\nZATCA e-invoicing"]
        ACCOUNTING["Accounting\nChart of accounts, journal entries,\nexpenses, bank reconciliation"]
    end

    subgraph SUPPLY["Supply"]
        NETWORK["Network / Procurement\nInventory, suppliers,\nrequisitions, purchase orders"]
    end

    subgraph GROWTH["Growth"]
        CRM["CRM & Marketing\nLeads, opportunities, campaigns,\nsegments"]
        CALLCENTER["Call Center\nQueue, call logs"]
        WEBSITE["Public Website\nLanding, pricing, blog\n(unauthenticated)"]
    end

    subgraph PEOPLE["People"]
        HR["Team & HR\nTechnicians, HR, payroll,\ntimesheets"]
    end

    subgraph PLATFORM["Platform"]
        ADMIN["Administration\nUsers, roles, branches,\nsettings, audit log"]
        AI["AI Platform\nAI assistant, knowledge base,\nagents"]
        REPORTS["Reports & Analytics\nExecutive, operational,\nBI dashboards"]
        PORTALS["Portals\nCustomer / Supplier / Technician\napps, Kiosk"]
    end

    AUTH --> REGISTRY
    REGISTRY --> WORKSHOP
    WORKSHOP --> FINANCE
    FINANCE --> ACCOUNTING
    WORKSHOP --> NETWORK
    NETWORK --> ACCOUNTING
    WORKSHOP --> HR
    REGISTRY --> CRM
    CRM --> CALLCENTER
    WEBSITE --> CRM
    WORKSHOP --> AI
    ADMIN --> AUTH
    ADMIN -. "governs RBAC for all domains" .-> CORE
    ADMIN -. governs .-> MONEY
    ADMIN -. governs .-> SUPPLY
    ADMIN -. governs .-> GROWTH
    ADMIN -. governs .-> PEOPLE
    FINANCE --> REPORTS
    WORKSHOP --> REPORTS
    ACCOUNTING --> REPORTS
    REGISTRY --> PORTALS
    WORKSHOP --> PORTALS
    NETWORK --> PORTALS
```

## Domain reference

| # | Domain | RBAC module(s) | Key entities |
|---|--------|-----------------|---------------|
| 1 | Workshop (Operations) | `jobcards`, `appointments`, `estimates`, `checkin`, `inspection`, `qc`, `delivery` | job_cards, appointments, estimates, estimate_lines |
| 2 | Registry (Customers & Vehicles) | `customers`, `vehicles`, `feedback` | customers, vehicles, fleets, services |
| 3 | Finance | `invoices`, `payments` | invoices, invoice_lines, payments, receipts |
| 4 | Accounting | `accounting` | chart_of_accounts, journal_entries, expenses, bank_statements |
| 5 | CRM & Marketing | `crm` | leads, opportunities, campaigns, segments, crm_tasks |
| 6 | Administration | `admin`, `settings`, `integrations` | organizations, branches, users, integrations, audit_log |
| 7 | Authentication | (public) | users, user_sessions, otp_challenges |
| 8 | AI Platform | `ai` | kb_procedures (knowledge base), agents |
| 9 | Parts & Inventory Network | `inventory`, `network`, `procurement` | parts, inventory_movements, suppliers, requisitions, purchase_orders |
| 10 | Call Center | `callcenter` | call queue, call logs |
| 11 | Reports & Analytics | `reports`, `execreports` | saved_reports |
| 12 | Team & HR | `technicians`, `hr` | employees, payroll_runs, timesheets |
| 13 | Portals | `portalcustomer`, `portalsupplier`, `portaltech`, `portalprocure`, `kiosk` | customer/supplier/technician app screens |
| — | Public Website | (ungated) | landing, about, pricing, blog |
