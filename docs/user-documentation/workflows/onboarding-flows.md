# Onboarding Flows

This document describes the three onboarding paths in SALIS AUTO: how a new garage joins the platform, how a customer signs up, and how a supplier gets approved. Each path ends with the new user accessing their dedicated interface.

> **Status key**: 🟢 **Live** — the route/screen described exists and works today. 🟡 **Planned** — the schema exists (`server/src/db/schema.ts`'s `garage_applications` / `supplier_applications` tables) but no route reads or writes it yet; the section describes the intended shape, not current behaviour. Checked against the codebase 2026-09.

---

## Overview

| Path | Who | Entry Point | Result | Status |
|---|---|---|---|---|
| Path A | Garage owner | Marketing page application | Full organization with branches, users, and operational access | 🟡 Planned (see note in Path A) |
| Path B | Customer | QR code, signup link, or added by garage staff | Customer App with vehicles, appointments, and service tracking | 🟢 Live |
| Path C | Supplier | Supplier application form | Supplier Portal with catalog, orders, and invoicing | 🟡 Planned — see [Portals domain doc](../../21_DOMAIN_DOCUMENTATION/PORTALS.md) |
| Path D | Garage employee (technician, procurement, and other internal roles) | Added by the garage's own owner/manager | Operational access scoped to their role | 🟢 Live |

---

## Path A: Garage Onboarding 🟡 Planned

This is the path for an existing automotive workshop that wants to use SALIS AUTO as their management platform.

> **Not live yet.** `server/src/db/schema.ts` defines a `garage_applications` table for exactly this queue, but no route reads or writes it — there is no `POST /public/garage-applications`, no applications queue in the Super Admin console, and no automatic organization-creation-on-approval. The only way an organization exists today is `POST /auth/register` (`app/src/screens/auth/Register.tsx`): a person fills in their own name, email and password and gets a brand-new organization with themselves as its `owner`, immediately — no application, no review, no separate credential email. Steps 1-2 below describe the intended review flow. Whatever the Onboarding Wizard (steps 4-5) actually does today is outside what this pass verified — treat it as unconfirmed until someone checks it against the code.

### Step 1: Submit Application

**Who**: The garage owner

**Where**: Public marketing page

1. The garage owner visits the SALIS AUTO marketing website.
2. Navigates to the signup or application page.
3. Fills in the application form:

| Field | Description |
|---|---|
| Garage name | Official business name (EN/AR) |
| Owner name | Full name of the business owner |
| Email | Owner's email address (becomes their login) |
| Phone | Contact phone number |
| Location | City, district, full address |
| Number of bays | Workshop capacity |
| Services offered | Types of services (maintenance, repair, bodywork, etc.) |
| Trade license | Upload of business license document |
| VAT registration | ZATCA VAT registration number |

4. Submits the application via `POST /public/garage-applications`.
5. Receives a confirmation screen or email acknowledging receipt.

### Step 2: Platform Admin Review

**Who**: Super Admin (platform administrator)

**Where**: Super Admin portal (`/super-admin`)

1. The Super Admin sees the pending application in the applications queue.
2. Opens the application to review:
   - Business details and documents
   - License validity
   - Service area and capacity
3. Decision:
   - **Approve**: Proceed to organization creation.
   - **Reject**: Enter a reason. The applicant is notified by email.

### Step 3: Organization Creation (Automatic)

When the Super Admin approves:

1. The system automatically creates:
   - **Organization**: A new tenant in the multi-tenant platform.
   - **Owner user account**: Using the email from the application.
   - **Seed branch**: An initial branch based on the application's location.
2. The owner receives an email with:
   - Login credentials (email and temporary password)
   - Link to the platform
   - Instructions for first login

### Step 4: Owner First Login

**Who**: The new garage owner

1. The owner opens the login page and signs in with the emailed credentials.
2. They are prompted to change their password on first login.
3. The **Onboarding Wizard** launches, guiding them through initial setup.

### Step 5: Onboarding Wizard

**Screen**: Onboarding (`/onboarding`)

The wizard walks the owner through essential configuration:

#### Add Branches

1. Enter branch details: name (EN/AR), address, phone, operating hours.
2. Set the number of service bays and their types.
3. Add additional branches if the business has multiple locations.

#### Create Users

1. Add staff members with their roles:
   - Branch Manager(s)
   - Service Advisors
   - Technicians
   - Receptionists
   - Accountant
   - Storekeeper
   - Others as needed

2. For each user, enter:
   - Full name
   - Email (login credential)
   - Phone
   - Role (selected from the 14 available roles)
   - Assigned branch

3. Users receive their login credentials by email.

#### Import Sample Data

Optionally import sample data to explore the platform:

- Sample customers and vehicles
- Sample job cards at various stages
- Sample inventory items
- Sample invoices

This helps the owner and staff understand how the system works before entering real data.

#### Configure Settings

Quick access to essential settings:

- Organization logo and branding
- Working hours and holidays
- VAT configuration (seller VAT number)
- Default service types and pricing

### Step 6: Operational

After completing the wizard, the owner lands on the Dashboard and the organization is fully operational. Staff can log in, customers can be registered, and job cards can be created.

---

## Path B: Customer Signup 🟢 Live

This is the path for a vehicle owner who wants to use the Customer App to book services, track repairs, and manage their vehicles. This is one of two live ways a customer gets a login — see "Inviting Customers" under Post-Onboarding below for the other.

### Step 1: Entry Point

**Who**: The customer

**Where**: Two ways to reach the signup page:

| Entry | How |
|---|---|
| QR code | Scan a QR code displayed at the garage (reception desk, waiting area, or on business cards) |
| Direct link | Follow a URL shared by the garage (e.g., `/garage/:slug/signup`) |

The QR code and link are specific to the garage, so the customer is associated with that workshop from the start.

### Step 2: Registration Form

The customer fills in:

| Field | Description | Required |
|---|---|---|
| Full name | First and last name | Yes |
| Phone number | Saudi mobile number (+966) | Yes |
| Email | Email address | Optional |
| Password | Account password | Yes |

### Step 3: OTP Verification

1. After submitting the registration form, a **6-digit OTP** is sent to the customer's phone via SMS.
2. The verification screen shows the **CodeInput** component -- six individual digit boxes.
3. The customer enters the code received by SMS.
4. The system verifies the code.
5. On success, the account is activated.

**OTP screen details**:

- The code expires after a set time (shown with a countdown).
- A "Resend code" button becomes available after the timer expires.
- Three failed attempts may temporarily lock the verification.

### Step 4: Customer App Access

After successful verification, the customer lands on the **Customer App** (`/customer-app/home`):

- The Home screen shows a welcome message with quick actions.
- The Garage tab is empty -- the customer adds their first vehicle.
- The Bookings tab is available for scheduling their first appointment.

The customer sees only data related to the garage they signed up with:

- Vehicles serviced at that garage
- Appointments at that garage
- Invoices from that garage

### First-Time Actions

1. **Add a vehicle**: Go to Garage > Add Vehicle. Enter plate number, make, model, year.
2. **Book a service**: Go to Bookings > Book Appointment. Select the vehicle, service type, date, and time.

See [Customer App Guide](../portals/customer-app-guide.md) for full details.

---

## Path C: Supplier Onboarding 🟡 Planned

This is the path for a parts supplier who wants to receive purchase orders from SALIS AUTO workshops.

> **Not live yet.** `server/src/db/schema.ts` defines a `supplier_applications` table matching the fields below, but — like `garage_applications` — nothing reads or writes it: no `POST /public/supplier-applications`, no review queue, no account creation on approval. There is currently **no way for a `supplier`-role account to be created at all**. What exists today is unrelated and more limited: a garage's own Procurement Agent can add a row to that garage's private supplier/vendor list (`Inventory > Suppliers`) for purchase-order purposes — this does not create a login, a Supplier Portal account, or anything the supplier company itself can sign into. Building the supplier company as its own account holder (its own login, its own staff, usable across more than one garage, with a real garage↔supplier messaging channel) is planned as a separate, larger piece of work, kept isolated from the live paths in this document until it ships — see [Supplier Tenancy Design (SYS-ARCH-006)](../../system/architecture/supplier-tenancy-design.md) for the proposed architecture.

### Step 1: Submit Application

**Who**: The supplier company

**Where**: Supplier application page (accessed from the marketing site or by invitation from a garage)

The supplier fills in:

| Field | Description |
|---|---|
| Company name | Official business name (EN/AR) |
| Contact person | Name of the primary contact |
| Email | Company email (becomes login) |
| Phone | Contact phone number |
| Address | Company address |
| Trade license | Business license document |
| VAT registration | ZATCA VAT registration number |
| Categories | Types of parts supplied (Engine, Brakes, Electrical, Body, Tires, etc.) |
| Regions | Saudi regions they serve (Central, Western, Eastern, etc.) |

### Step 2: Admin / Owner Review

**Who**: Super Admin or garage Owner

1. The application appears in the pending supplier applications queue.
2. The reviewer checks:
   - Business legitimacy (trade license, VAT registration)
   - Categories and regions match the garage's needs
   - Company reputation and references
3. Decision:
   - **Approve**: Proceed to account creation.
   - **Reject**: Enter a reason. The supplier is notified.

### Step 3: Account Creation

When approved:

1. The system creates a supplier user account with the `supplier` role.
2. The supplier receives an email with:
   - Login credentials
   - Link to the Supplier Portal
   - Getting started instructions

### Step 4: Supplier Portal Access

After login, the supplier lands on the **Supplier Portal** (`/supplier-portal`):

- The dashboard shows zero orders initially.
- The catalog section is empty -- the supplier uploads their product catalog.
- Account settings are pre-filled from the application.

### First-Time Actions

1. **Complete profile**: Review and update company information in Account Settings.
2. **Upload catalog**: Add products with part numbers, descriptions, prices, and availability.
3. **Set notifications**: Configure how they want to be alerted about new orders and quote requests.

See [Supplier Portal Guide](../portals/supplier-portal-guide.md) for full details.

---

## Role Scoping After Onboarding

Each onboarding path results in a specific role with defined scope:

| Path | Role | Scope | What They See |
|---|---|---|---|
| A (Garage) | Owner | All | Everything in their organization |
| B (Customer) | Customer | Self | Only their own vehicles, appointments, invoices |
| C (Supplier) 🟡 Planned | Supplier | External | Only their own orders, catalog, invoices |
| D (Staff) | Varies | Branch or All | Per-role module access |

### Data Isolation

- **Customer data** is scoped to the garage they signed up with. A customer who visits multiple garages on the platform has separate accounts.
- **Supplier data** would be scoped to their own transactions once Path C ships — describes the intended isolation, not a live account type.
- **Staff data** is scoped by role: branch-scoped roles see only their branch; all-scoped roles see the entire organization.

---

## Path D: Garage Employee Accounts 🟢 Live

This is how a technician, procurement agent, or any other internal staff role (manager, advisor, QC, parts, accountant, HR, front desk, call centre) gets a login — treated as a garage employee, the same way Path A's owner is, rather than as a self-service signup. There is no public application form for this path; only someone who already holds `admin:c` (today: `owner`, `superadmin`, or the `test` account — the permission matrix gives `manager` view-only on `admin`) can create one.

### Step 1: Add Staff

1. Owner navigates to **Admin > Users & Teams** (`/users-teams`) and clicks **Add Staff**.
2. Fills in name, email, and role (one of the ten internal roles above — not `owner`, `superadmin`, `supplier`, `customer`, or `test`, each of which has its own path).
3. Chooses how the account gets its first credential:
   - **Create now**: the account is active immediately with a generated password, shown once in the dialog for the owner to relay directly. Nothing is emailed.
   - **Email an invite**: the account is created `pending`; an email with a set-your-password link is sent, and the account activates when that link is used.
4. Saves — `POST /admin/staff` (`server/src/auth/routes.ts`).

### Step 2: First Login

- **Direct**: the new hire signs in with the password they were handed.
- **Invited**: the new hire follows the emailed link to `/invite-acceptance?token=...`, sets their password, and is redirected to sign in.

---

## Post-Onboarding: Adding More Users

After the initial onboarding, additional users are added through the administrative interface:

### Adding Staff

See Path D above — this *is* the "adding staff" flow, not a separate one; there is no other route to a technician, procurement, or other internal-role account.

### Inviting Customers (Path B alternative) 🟢 Live

Instead of self-signup, staff can grant an existing customer record a login:

1. Service Advisor, Front Desk, Call Centre or Manager navigates to **CRM > Customers** and adds or opens a customer record — this uses the ordinary customer collection, not a special onboarding form.
2. Opens the customer and clicks **Grant Portal Access**.
3. Requires an email on file for that customer — the invite is an email link (`POST /customers/:id/portal-access`, `server/src/auth/service.ts`'s `grantCustomerPortalAccess`), not an SMS. A customer with no email keeps the phone-OTP self-signup path (Path B above) open to them instead.
4. The customer receives the invite email and sets their password at `/invite-acceptance?token=...`, the same acceptance screen Path D uses.

This does not replace or change the public self-signup OTP flow in Path B — it is a second, independent way to reach the same `users`/`customers` tables.

### Inviting Suppliers (Path C alternative) 🟡 Planned

Not live — see the note under Path C. Today, **Inventory > Suppliers > Add Supplier** creates a row in the garage's own vendor list for purchasing purposes only; it does not create a login, and the supplier company cannot sign into anything as a result of it.

---

## Troubleshooting Onboarding

| Issue | Path | Resolution |
|---|---|---|
| Did not receive credentials email | A, C | Check spam folder; contact Super Admin to resend |
| OTP code not received | B | Verify phone number; check SMS delivery; use "Resend code" |
| Application rejected | A, C | Review the rejection reason and resubmit with corrections |
| Cannot find the QR code / link | B | Ask the garage for their customer signup URL |
| Onboarding wizard skipped accidentally | A | Navigate to Settings to complete configuration |
| Staff member cannot log in | A | Verify their account is Active in Users & Teams |

---

## Related Guides

- [Getting Started](../guides/getting-started.md) -- first login and interface navigation
- [Owner & Super Admin Guide](../guides/owner-superadmin-guide.md) -- managing the platform
- [Customer App Guide](../portals/customer-app-guide.md) -- customer's interface
- [Supplier Portal Guide](../portals/supplier-portal-guide.md) -- supplier's interface
- [Technician Portal Guide](../portals/technician-portal-guide.md) -- technician's interface
