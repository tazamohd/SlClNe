# Onboarding Flows

Diagrams for the three onboarding paths in SALIS AUTO: a garage owner applying to run their workshop on the platform, a customer self-signing-up for the Customer App, and a supplier applying for the Supplier Portal.

Source: [`docs/user-documentation/workflows/onboarding-flows.md`](../../user-documentation/workflows/onboarding-flows.md)

---

## Path A: Garage Onboarding

```mermaid
flowchart TD
    A1["Garage owner visits marketing site,<br/>opens application page"] --> A2["Fill application:<br/>garage name, owner, email, phone, location,<br/>bays, services, trade license, VAT registration"]
    A2 --> A3["Submit via POST /public/garage-applications"]
    A3 --> A4["Super Admin reviews in applications queue"]
    A4 --> A5{"Approve?"}
    A5 -->|"Reject"| A6["Enter reason — applicant notified by email"]
    A5 -->|"Approve"| A7["System auto-creates:<br/>Organization + Owner account + Seed branch"]
    A7 --> A8["Owner receives email:<br/>login credentials + platform link"]
    A8 --> A9["Owner first login — forced password change"]
    A9 --> A10["Onboarding Wizard launches"]
    A10 --> A11["Add branches (name, address, hours, bays)"]
    A11 --> A12["Create users across the 14 available roles"]
    A12 --> A13["Optionally import sample data"]
    A13 --> A14["Configure settings: logo, hours, VAT, pricing"]
    A14 --> A15(["Wizard complete — Dashboard,<br/>organization fully operational"])
```

---

## Path B: Customer Signup

```mermaid
flowchart TD
    B1["Customer scans garage QR code<br/>or opens direct signup link"] --> B2["Fill registration form:<br/>name, phone, email (optional), password"]
    B2 --> B3["6-digit OTP sent via SMS"]
    B3 --> B4["Customer enters code in CodeInput"]
    B4 --> B5{"OTP valid?"}
    B5 -->|"3 failed attempts"| B6["Verification temporarily locked"]
    B5 -->|"Expired"| B7["Resend code (after countdown)"]
    B7 --> B4
    B5 -->|"Yes"| B8["Account activated"]
    B8 --> B9(["Customer App home —<br/>scoped to signup garage only"])
    B9 --> B10["Add first vehicle"]
    B9 --> B11["Book first appointment"]
```

---

## Path C: Supplier Onboarding

```mermaid
flowchart TD
    C1["Supplier submits application:<br/>company info, license, VAT, categories, regions"] --> C2["Appears in pending supplier applications queue"]
    C2 --> C3["Super Admin or garage Owner reviews:<br/>legitimacy, category/region fit, reputation"]
    C3 --> C4{"Approve?"}
    C4 -->|"Reject"| C5["Enter reason — supplier notified"]
    C4 -->|"Approve"| C6["System creates supplier account (role: supplier)"]
    C6 --> C7["Supplier receives credentials +<br/>Supplier Portal link"]
    C7 --> C8["Supplier logs in to Supplier Portal"]
    C8 --> C9["Complete company profile"]
    C8 --> C10["Upload product catalog"]
    C8 --> C11["Set order/quote notification preferences"]
```

---

## Actor Interaction: Garage Application Review (Path A)

```mermaid
sequenceDiagram
    actor Owner as Garage Owner
    participant Site as Marketing Site
    actor Admin as Super Admin
    participant Sys as System

    Owner->>Site: Submit garage application
    Site->>Admin: Appears in applications queue
    Admin->>Admin: Review business details, license, service area

    alt Rejected
        Admin->>Sys: Reject with reason
        Sys-->>Owner: Notified by email
    else Approved
        Admin->>Sys: Approve
        Sys->>Sys: Create Organization + Owner account + Seed branch
        Sys-->>Owner: Email credentials + platform link
        Owner->>Sys: First login, forced password change
        Sys->>Owner: Launch Onboarding Wizard
        Owner->>Sys: Add branches, create users, configure settings
        Sys-->>Owner: Organization operational — Dashboard
    end
```

---

## Related Flows

Post-onboarding, additional users/customers/suppliers are added through the administrative interface rather than self-service application — see [How To: Manage Users & Roles](how-to-manage-users-roles.md) for the ongoing user-creation flow.
